from fastapi import FastAPI
app = FastAPI(description="This application is for Front Desk Management System")

from app.database import Base, engine
from app.models.room import Room
from app.models.guest import Guests
from app.models.reservation import Reservation
from app.models.users import Users
from app.scheduler.scheduler import scheduler

Base.metadata.create_all(bind=engine)

@app.on_event("startup")
async def startup_event():
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()

@app.get("/", tags = ["Home"])
async def home():
    return {"message":"Front Desk Management System"}

from app.routers.analytics import router as analytics_router
app.include_router(analytics_router)

from app.routers.auth import router as auth_router
app.include_router(auth_router)

from app.routers.room import router as room_router
app.include_router(room_router)

from app.routers.guest import router as guest_router
app.include_router(guest_router)

from app.routers.reservation import router as reservation_router
app.include_router(reservation_router)