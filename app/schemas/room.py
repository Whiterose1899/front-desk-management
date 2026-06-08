from pydantic import Field, BaseModel
from typing import Optional

class Room_create(BaseModel):
    room_number: str
    room_type: str
    room_occupancy: int
    room_price: int

class Room_response(BaseModel):
    id: int
    room_number: str
    room_type: str
    room_occupancy: int
    room_price: int
    availability_status: bool

    class Config():
        from_attributes = True

class Room_update(BaseModel):
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    room_occupancy: Optional[int] = None
    room_price: Optional[int] = None
    availability_status: Optional[bool] = None