from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class Guests(Base):
    __tablename__= "guests"

    id = Column(
        Integer, 
        primary_key=True, 
    )
    first_name = Column(
        String,
        nullable=False, 
        index=True
    )
    last_name = Column(
        String,
        nullable=False
    )
    email_address = Column(
        String, 
        nullable=False,
        unique=True
    )
    phone_number = Column(
        String, 
        nullable=False, 
        unique=True
    )
    created_at = Column(
        DateTime, 
        default=datetime.now
    )