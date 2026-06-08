from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, NameEmail
from app.models.reservation import Reservation
from app.models.room import Room
from app.models.guest import Guests
from pydantic import SecretStr
from typing import cast
from fastapi import HTTPException
from datetime import date

from app.config import (
    MAIL_USERNAME,
    MAIL_PASSWORD,
    MAIL_FROM, 
    MAIL_PORT,
    MAIL_SERVER,
    MAIL_STARTTLS, 
    MAIL_SSL_TLS,
    MAIL_USE_CREDENTIALS
)

config = ConnectionConfig(
    MAIL_USERNAME = MAIL_USERNAME,
    MAIL_PASSWORD = SecretStr(MAIL_PASSWORD),
    MAIL_FROM = MAIL_FROM,
    MAIL_PORT = MAIL_PORT,
    MAIL_SERVER = MAIL_SERVER,
    MAIL_STARTTLS = MAIL_STARTTLS,
    MAIL_SSL_TLS = MAIL_SSL_TLS,
    USE_CREDENTIALS = MAIL_USE_CREDENTIALS
)

async def send_reservation_email(reservation: Reservation, room: Room, guest: Guests):
    body = f"""
    Greetings {guest.first_name} {guest.last_name},
    
    This email acknowledges the reservation for your stay at UK Hotels Ltd 
    
    The details are as follows:
    Room Number: {room.room_number},
    Room Type: {room.room_type},
    Check In Time: {reservation.check_in} & Check Out Time: {reservation.check_out}
    For a duration of {reservation.duration} days

    Thank you for choosing us, {guest.first_name}.

    Regards, 
    UK Hotel Ltd.
    """
    message = MessageSchema(
        subject=f"Reservation Confirmation - {guest.last_name}",
        body=body,
        recipients=[cast(NameEmail,guest.email_address)],
        subtype="plain" #type: ignore
    )
    fm = FastMail(config)
    try:
        await fm.send_message(message=message)
    except:
        raise HTTPException(status_code=403, detail="Email has not been sent.")
    
async def cancel_reservation(guest: Guests, check_in: date):
    body = f"""
    Greetings {guest.first_name} {guest.last_name},

    Your reservation with us for {check_in} has been cancelled.

    If not requested by you, contact the administration for the confirmation.

    Regards, 
    UK Team.
    """

    message = MessageSchema(
        subject=f"Cancellation of Reservation on {check_in}",
        body = body,
        recipients=[cast(NameEmail, guest.email_address)],
        subtype = "plain" #type: ignore
    )

    fm = FastMail(config)
    try:
        await fm.send_message(message=message)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Email sending failed: {str(e)}"
        )

async def checkin_reminder_email(reservation: Reservation, guest: Guests, room: Room):
    body = f"""
Greetings {guest.first_name},

This is a reminder email for your stay with us from {reservation.check_in}.

Regards,
UK Team
"""
    message = MessageSchema(
        subject = "Check-in reminder",
        body=body,
        subtype="plain", #type: ignore
        recipients=[cast(NameEmail, guest.email_address)]
    )
    fm = FastMail(config)
    try:
        await fm.send_message(message=message)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Email sending failed: {str(e)}"
        )

async def checkout_reminder_email(reservation: Reservation, guest: Guests, room: Room):
    body = f"""
Greetings {guest.first_name},

This is a reminder email that your stay with us ends on {reservation.check_out}.

Regards,
UK Team
"""
    message = MessageSchema(
        subject = "Check-Out  reminder",
        body=body,
        subtype="plain", #type: ignore
        recipients=[cast(NameEmail, guest.email_address)]
    )
    fm = FastMail(config)
    try:
        await fm.send_message(message=message)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Email sending failed: {str(e)}"
        )