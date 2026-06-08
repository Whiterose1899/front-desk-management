import sqlalchemy as sa
from app.database import Base
from enum import Enum

class Roles_users(str, Enum):
    ADMIN = "Admin"
    MANAGER = "Manager"
    STAFF = "Staff"


class Users(Base):
    __tablename__ = "users"

    id = sa.Column(sa.Integer, primary_key=True)
    first_name = sa.Column(sa.String, nullable=False)
    last_name=sa.Column(sa.String, nullable=False)
    username=sa.Column(sa.String(150),unique=True, nullable=False, index=True)
    role=sa.Column(sa.Enum(Roles_users), nullable=False, index=True)
    hashed_password=sa.Column(sa.String, nullable=False)