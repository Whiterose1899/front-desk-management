from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import Users
from app.schemas.users import Usersignup, Userlogin, UserResponse
from typing import Annotated
from utilis.auth import hash_password, verify_password
from utilis.dependencies import get_current_user
from utilis.jwt import create_access_token

router = APIRouter(prefix="/auth")
SessionDep = Annotated[Session, Depends(get_db)]

@router.post("/signup", response_model = UserResponse, status_code=201, tags=["Signup"])
async def signup(users: Usersignup, db: SessionDep):
    existing_user = db.query(Users).filter(Users.username == users.username).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists."
        )
    hashed_passkey = hash_password(users.password)
    new_user = Users(
        first_name = users.first_name,
        last_name = users.last_name,
        username = users.username,
        role = users.role,
        hashed_password = hashed_passkey
    )
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating the user: {str(e)}"
        )
    return {
        "id": new_user.id,
        "role": new_user.role,
        "username": new_user.username
    }

@router.post("/login", tags=["Login"])
async def login(db: SessionDep, form_request: OAuth2PasswordRequestForm = Depends()):
    existing_user = (
        db.query(Users)
        .filter(Users.username == form_request.username)
        .first()
    )
    if not existing_user or not verify_password(form_request.password, str(existing_user.hashed_password)):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password."
        )
    token = create_access_token(
        data = {
            "sub": existing_user.username,
            "role": existing_user.role
        }
    )
    return {
        "access_token": token, 
        "token_type": "bearer"
    }

@router.get("/profile", tags=["Profile"])
async def profile(user: dict = Depends(get_current_user)):
    return {
        "username": user["username"],
        "role": user["role"]
    } 