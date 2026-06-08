from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, nullable=False)
    room_number = Column(String, nullable=False, unique=True, index=True)
    room_type = Column(String, index = True, nullable=False)
    room_occupancy = Column(Integer, nullable=False, index=True)
    room_price = Column(Integer, nullable=False)
    availability_status = Column(Boolean, default=True, index=True)