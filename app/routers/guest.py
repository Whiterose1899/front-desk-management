from fastapi import APIRouter
from app.schemas.guest import guest_create, guest_response, guest_update
from app.models.guest import Guests
from app.database import get_db
from sqlalchemy.orm import Session
from fastapi import HTTPException, Depends, Query
from typing import Annotated
from utilis.dependencies import get_current_user
from utilis.permissions import manager_or_admin_access, admin_access    

router = APIRouter(
    tags=["Guest"],
    dependencies=[Depends(get_current_user)]
)

@router.post(
    "/guest", 
    response_model=guest_response,
)
async def guest_post(
    guest: guest_create, 
    db: Session = Depends(get_db)
):
    new_guest = Guests(
        first_name = guest.first_name,
        last_name = guest.last_name,
        email_address = guest.email_address,
        phone_number = guest.phone_number 
    )

    check_duplicate = db.query(Guests).filter((Guests.email_address == guest.email_address) | 
                                              (Guests.phone_number == guest.phone_number)).first()
    if check_duplicate is not None:
        raise HTTPException(status_code=409, detail="Duplicated Data.")

    db.add(new_guest)
    db.commit()
    db.refresh(new_guest)

    return new_guest

@router.get("/guest", response_model=list[guest_response])
async def guest_all_fetch(
    db: Session = Depends(get_db),
    user = Depends(admin_access)
):
    my_guest = db.query(Guests).all()
    if my_guest is None:
        raise HTTPException(status_code=404, detail="No Guests Found.")
    return my_guest

@router.get("/guest/{guest_id}", response_model=guest_response)
async def guest_fetch(guest_id: int, db: Session = Depends(get_db), user = Depends(admin_access)):
    the_guest = db.query(Guests).filter(Guests.id == guest_id).first()
    if not the_guest:
        raise HTTPException(status_code=404, detail="Guest Not Found.")
    return the_guest

@router.patch("/guests/", response_model=guest_response)
async def guest_partial_update(guest: guest_update, db: Session = Depends(get_db)):
    guest_details = guest.model_dump(exclude_unset=True)
    updating_guest = db.query(Guests).filter(Guests.id==guest.id).first()
    if not updating_guest:
        raise HTTPException(
            status_code=404,
            detail="Guest Not Found"
        )
    for key, value in guest_details.items():
        setattr(updating_guest, key, value)
    db.commit()
    db.refresh(updating_guest)
    return updating_guest

@router.delete("/guest/delete/{guest_id}")
async def guest_delete(guest_id: int, db: Session = Depends(get_db), user = Depends(admin_access)):
    malicious_guest = db.query(Guests).filter(Guests.id == guest_id).first()
    
    if not malicious_guest:
        raise HTTPException(status_code=404, detail="Guest not found --> Check the ID")
    
    db.delete(malicious_guest)
    db.commit()
    return {"message":"Guest Lost to Wind."}