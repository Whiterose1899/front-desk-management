from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from app.schemas.analytics import Occupancy_Response, Guest_frequency, Most_booked_room
from sqlalchemy.orm import Session
from app.database import get_db
from typing import Annotated
from datetime import date, timedelta
from app.models.reservation import Reservation
from app.models.guest import Guests
from app.models.room import Room
from utilis.permissions import admin_access
from utilis.dependencies import get_current_user

router = APIRouter(prefix="/analytics", dependencies= [Depends(get_current_user), Depends(admin_access)])

Session_Dep = Annotated[Session, Depends(get_db)]

@router.get("/occupancy", response_model= Occupancy_Response, tags=["Occupancy Stats"])
async def occupancy(db: Session_Dep):
    today = date.today()

    occ_rooms = db.query(Reservation).filter((Reservation.check_in<=today) & (Reservation.check_out>=today)).count()

    tot_rooms = db.query(Room).count()

    available_rooms = db.query(Room).filter(Room.availability_status==True).count() 

    checkins_today = db.query(Reservation).filter(Reservation.check_in==today).count()

    checkouts_today = db.query(Reservation).filter(Reservation.check_out==today).count()

    occupancy_rate = (occ_rooms/tot_rooms)*100

    guests_present = db.query(Reservation.guest_id).filter((Reservation.check_in<=today) & (Reservation.check_out>=today)).group_by(Reservation.guest_id).count()
    
    return {
        "total_rooms": tot_rooms,
        "occupied_rooms": occ_rooms,
        "available_rooms": available_rooms,
        "guests_present": guests_present,
        "checkins_today": checkins_today,
        "checkouts_today": checkouts_today,
        "occupancy_rate": occupancy_rate
    }

@router.get("/most_booked_room", response_model=Most_booked_room, tags=["Most Booked Room"])
async def most_booked_room(db: Session_Dep):
    reserve = db.query(Reservation.room_id, func.count(Reservation.room_id)).group_by(Reservation.room_id).order_by(
        func.count(Reservation.room_id).desc()
    ).first()
    if not reserve:
        raise HTTPException(
            status_code=404, detail="Reservation History --> Empty"
        )
    room = db.query(Room).filter(Room.id==reserve[0]).first()
    return {
        "Room_Number": room.room_number, #type: ignore
        "Number_of_Reservation": reserve[1]
    }

@router.get("/Revenue", tags = ["Revenue Generated"])
async def revenue(db: Session_Dep):
    booking = db.query(Reservation).all()
    revenue = 0
    for book in booking:
        room = db.query(Room).filter(book.room_id==Room.id).first()
        revenue = revenue + (room.room_price*book.duration) #type: ignore
    return {
        "Revenue": revenue
    }

@router.get("/freq_client", response_model=list[Guest_frequency], tags=["Upgrade These Clients"])
async def freq_guests(db: Session_Dep):
    booking = db.query(Reservation.guest_id, func.count(Reservation.guest_id)).group_by(
        Reservation.guest_id).order_by(
            func.count(Reservation.guest_id).desc()).all()
    result = []
    for book in booking:
        guest = db.query(Guests).filter(Guests.id==book[0]).first()
        result.append({
            "Guest": f"{guest.first_name} {guest.last_name}", #type: ignore
            "No_of_reservations": book[1]
        })
    return result