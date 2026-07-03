from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.room import Room_create, Room_response, Room_update
from app.models.room import Room
from fastapi import HTTPException
from utilis.dependencies import get_current_user
from utilis.permissions import admin_access, manager_or_admin_access

router = APIRouter(
    tags=["Room"],
    dependencies=[Depends(get_current_user)]
)

@router.post(
    "/room",
    response_model=Room_response,
)
async def room_post(
    room: Room_create,
    db: Session = Depends(get_db)
):

    new_room = Room(
        room_number=room.room_number,
        room_type=room.room_type,
        room_occupancy=room.room_occupancy,
        room_price=room.room_price
    )

    duplicate_check = db.query(Room).filter(Room.room_number==room.room_number).first()
    if duplicate_check:
        raise HTTPException(status_code=409, detail="Duplicate Room.")
    
    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return new_room

@router.get(
    "/room/allrooms",
    response_model=list[Room_response],
)
async def get_all_rooms(db: Session = Depends(get_db)):
    room = db.query(Room).all()
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found.")
    return room

@router.get(
    "/room/{room_num}",
    response_model=Room_response,
)
async def get_the_rooms(
    room_num: str, 
    db: Session = Depends(get_db)
):
    room = db.query(Room).filter(Room.room_number==room_num).first()
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found.")
    return room

@router.get(
    "/room/status/{availability}",
    response_model=list[Room_response],
)
async def room_filtered_by_availability(
    availability: bool, 
    db:Session=Depends(get_db)
):
    room = db.query(Room).filter(Room.availability_status==availability).all()
    if not room:
        raise HTTPException(
            status_code=404,
            detail="No such Rooms Exists."
        )
    return room

@router.patch(
    "/room/update/{room_num}", 
    response_model=Room_response,
)
async def update_room_info(
    room_num:str, 
    room: Room_update, 
    db:Session=Depends(get_db),
    user = Depends(admin_access)
):
    queried_room = db.query(Room).filter(Room.room_number==room_num).first()

    if queried_room is None:
        raise HTTPException(status_code=404, detail="Room Not Found.")

    updated_room = room.model_dump(exclude_unset=True)
    for key, value in updated_room.items():
        setattr(queried_room, key, value)
    db.commit()
    db.refresh(queried_room)
    return queried_room

@router.delete("/room/delete/{room_num}")
async def delete_individual_room(
    room_num: str,
    db: Session = Depends(get_db),
    user = Depends(admin_access)
):
    room = db.query(Room).filter(Room.room_number==room_num).first()
    if room is None:
        raise HTTPException(status_code=404, detail="Room Not Found.")
    db.delete(room)
    db.commit()
    return {"Message":"[OK]"}