from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean
from app.database import Base
from datetime import datetime

class Reservation(Base):
    __tablename__ = "reservation"

    id = Column(Integer, primary_key=True)
    room_id = Column(Integer, ForeignKey("rooms.id") ,nullable=False)
    guest_id = Column(Integer, ForeignKey("guests.id"), nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    duration = Column(Integer, nullable=False)

    checkin_reminder_sent = Column(Boolean, default=False)
    checkout_reminder_sent = Column(Boolean, default=False)