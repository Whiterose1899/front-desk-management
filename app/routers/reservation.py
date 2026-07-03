from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from sqlalchemy.orm import Session
from typing import Annotated
from app.models.reservation import Reservation
from app.schemas.reservation import create_reservation, reservation_response, update_reservation, reservation_history_room
from app.models.room import Room
from app.models.guest import Guests
from utilis.dependencies import get_current_user
from utilis.permissions import manager_or_admin_access, admin_access
from utilis.email import send_reservation_email, cancel_reservation

router = APIRouter(
    prefix="/reservation", 
    tags=["Reservation Management"],
    dependencies=[Depends(get_current_user)]
)
Session_Dep = Annotated[Session, Depends(get_db)]

@router.post("/", response_model = reservation_response)
async def creating_reservation(reservation: create_reservation, db : Session_Dep):
    new_reservation = Reservation(
        room_id = reservation.room_id,
        guest_id = reservation.guest_id,
        check_in = reservation.check_in,
        check_out = reservation.check_out,
        duration = (reservation.check_out-reservation.check_in).days
    )

    room = db.query(Room).filter(Room.id == new_reservation.room_id).first()
    guest = db.query(Guests).filter(Guests.id == new_reservation.guest_id).first()

    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found.")
    if room.availability_status is False:
        raise HTTPException(status_code=403, detail="Room is not available.")
    if reservation.check_in>=reservation.check_out:
        raise HTTPException(status_code=403, detail="You cannot check out before check in.")
    
    reserved_room = db.query(Reservation).filter(Reservation.room_id==reservation.room_id).all()
    for curr in reserved_room:
        overlap = (reservation.check_in<=curr.check_out and reservation.check_out>=curr.check_in)
        if overlap: #type: ignore
            raise HTTPException(status_code=409, detail="Cannot make the reservation ~ Reservation Clash")
    
    room.availability_status=False #type: ignore
    
    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)

    await send_reservation_email(new_reservation, room, guest) # type: ignore

    return{
        "id":new_reservation.id,
        "room_number":room.room_number if room else None,
        "guest_name":f"{guest.first_name} {guest.last_name}" if guest else None,
        "check_in":new_reservation.check_in,
        "check_out":new_reservation.check_out,
        "duration_of_stay":new_reservation.duration
    }

@router.get("/all",response_model=list[reservation_response])
async def fetch_all_reservation(
    db: Session_Dep,
):
    reservation = db.query(Reservation).order_by(Reservation.id.desc()).all()

    if not reservation:
        raise HTTPException(status_code=404, detail="Empty History.")
    result = []
    for r in reservation:
        room = db.query(Room).filter(Room.id==r.room_id).first()
        guest = db.query(Guests).filter(Guests.id == r.guest_id).first()
        result.append({
            "id":r.id,
            "room_number":room.room_number if room else None,
            "guest_name": f"{guest.first_name} {guest.last_name}" if guest else None,
            "check_in": r.check_in, 
            "check_out": r.check_out,
            "duration_of_stay": r.duration
        })
    return result

@router.get("/{room_number}", response_model=list[reservation_history_room])
async def fetch_history_of_room(
    room_number: str, 
    db: Session_Dep,
):
    room = db.query(Room).filter(Room.room_number==room_number).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room Does Not Exist.")
    room_key = room.id if room else None
    room_reservation = db.query(Reservation).filter(Reservation.room_id==room_key).all()
    if not room_reservation:
        raise HTTPException(status_code=404, detail="No Reservation History Available.")
    result = []
    for r in room_reservation:
        guest_key = r.guest_id
        guest = db.query(Guests).filter(Guests.id == guest_key).first()
        if not guest:
            raise HTTPException(status_code=404, detail="Guest Id Error.")
        result.append({
            "room_number": room_number,
            "guest_name": f"{guest.first_name} {guest.last_name}",
            "check_in": r.check_in,
            "check_out": r.check_out,
            "duration": r.duration
        })
    return result

@router.get("/guest/info", response_model=list[reservation_history_room])
async def fetch_history_of_guest(first_name: str, last_name: str, db: Session_Dep):
    guest = db.query(Guests).filter((Guests.first_name==first_name) & (Guests.last_name==last_name)).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest Does Not Exist.")
    guest_key = guest.id
    reservations = db.query(Reservation).filter(Reservation.guest_id==guest_key).all()
    if not reservations:
        raise HTTPException(status_code=404, detail="No Reservations Made.")
    result = []
    for r in reservations:
        room = db.query(Room).filter(Room.id==r.room_id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Room Not Found.")
        result.append({
            "room_number": room.room_number,
            "guest_name": f"{first_name} {last_name}",
            "check_in": r.check_in,
            "check_out": r.check_out,
            "duration": r.duration
        })
    return result

@router.patch("/guest/update", response_model=reservation_response)
async def update_guest_reservation(my_reservation: update_reservation, db: Session_Dep):
    original_reservation = db.query(Reservation).filter(Reservation.id==my_reservation.id).first()
    if not original_reservation:
        raise HTTPException(status_code=404, detail="Reservation Does not exist.")
    updating = my_reservation.model_dump(exclude_unset=True)
    for key, value in updating.items():
        setattr(original_reservation, key, value)

    room = db.query(Room).filter(Room.id==original_reservation.room_id).first()
    guest = db.query(Guests).filter(Guests.id==original_reservation.guest_id).first()
    if not room:
        raise HTTPException(status_code=404,detail="Room Not Found.")
    if not guest:
        raise HTTPException(status_code=404, detail="Guest Does not Exist.")
    
    db.commit()
    db.refresh(original_reservation)

    return {
        "id": original_reservation.id,
        "room_number": room.room_number,
        "guest_name": f"{guest.first_name} {guest.last_name}",
        "check_in": original_reservation.check_in,
        "check_out": original_reservation.check_out,
        "duration_of_stay": original_reservation.duration 
    }

from typing import cast
from datetime import date

@router.delete("/delete/{reservation_id}")
async def delete_reservation(reservation_id:int, db:Session_Dep):
    current_reservation = db.query(Reservation).filter(Reservation.id==reservation_id).first()
    if not current_reservation:
        raise HTTPException(status_code=404, detail="Reservation Does Not Exist.")
    check_in = cast(date,current_reservation.check_in)
    guest = db.query(Guests).filter(Guests.id==current_reservation.guest_id).first()
    room = db.query(Room).filter(Reservation.room_id==Room.id).first()
    room.availability_status=True #type: ignore
    db.delete(current_reservation)
    db.commit()
    await cancel_reservation(guest, check_in)
    return {"message":"Delete Successfull"}

""" 
In version 2, Planning to introduce a new unique identifier for these reservation apart from serial number.
"""