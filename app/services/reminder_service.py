from app.database import get_db
from app.models.guest import Guests
from app.models.room import Room
from app.models.reservation import Reservation
from fastapi import Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
from utilis.email import checkin_reminder_email, checkout_reminder_email
from app.database import SessionLocal

async def check_for_checkin_reminder():
    db = SessionLocal()
    try:
        tomorrow = date.today() + timedelta(days=1)
        booking = db.query(Reservation).filter(
            (Reservation.check_in==tomorrow) & (Reservation.checkin_reminder_sent==False) 
        ).all()
        for book in booking:
            guest = db.query(Guests).filter(Guests.id==book.guest_id).first()
            room = db.query(Room).filter(Room.id==book.room_id).first()
            await checkin_reminder_email(book, guest, room)
            book.checkin_reminder_sent=True # type: ignore
        db.commit()
    finally:
        db.close()
    
async def check_for_checkout_reminder():
    db = SessionLocal()
    try:
        tomorrow = date.today() + timedelta(days=1)
        booking = db.query(Reservation).filter(
            (Reservation.check_out==tomorrow) & (Reservation.checkout_reminder_sent==False) 
        ).all()
        for book in booking:
            guest = db.query(Guests).filter(Guests.id==book.guest_id).first()
            room = db.query(Room).filter(Room.id==book.room_id).first()
            await checkout_reminder_email(book, guest, room)
            book.checkout_reminder_sent=True # type: ignore
        db.commit()
    finally:
        db.close()