from pydantic import BaseModel
from typing import Optional
from datetime import date

class create_reservation(BaseModel):
    room_id: int
    guest_id: int
    check_in: date
    check_out: date

class update_reservation(BaseModel):
    id: int
    room_id: Optional[int] = None
    guest_id: Optional[int] = None
    check_in: Optional[date] = None
    check_out: Optional[date] = None

class reservation_response(BaseModel):
    id: int
    room_number: str
    guest_name: str
    check_in: date
    check_out: date
    duration_of_stay: int
    
    class Config:
        from_attributes = True
    
class reservation_history_room(BaseModel):
    room_number: str
    guest_name: str
    check_in: date
    check_out: date
    duration: int

    class Config:
        from_attributes = True