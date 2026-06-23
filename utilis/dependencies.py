from fastapi.security import OAuth2PasswordBearer
from app.config import ALGORITHM, SECRET_KEY
from app.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from jose import jwt

from app.models.users import Users

oauth2_scheme  = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        coded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = coded_token.get("sub")
        if username is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials."
            )
        role = coded_token.get("role")
        current_user = db.query(Users).filter(Users.username == username).first()
        if current_user is None:
            raise HTTPException(
                status_code=401,
                detail="User Does Not Exist."
            )
        return {
            "username": current_user.username,
            "role": current_user.role
        }
    except:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials."
        )
    