from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class guest_create(BaseModel):
    first_name: str
    last_name: str
    email_address: EmailStr
    phone_number: str

class guest_response(BaseModel):
    id: int
    first_name: str
    last_name: str
    email_address: EmailStr
    phone_number: str
    created_at: datetime

    class Config:
        from_attributes = True

class guest_update(BaseModel):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email_address: Optional[EmailStr] = None
    phone_number: Optional[str] = None