from pydantic import BaseModel

class Occupancy_Response(BaseModel):
    total_rooms: int
    occupied_rooms: int
    available_rooms: int
    guests_present: int
    checkins_today: int
    checkouts_today: int
    occupancy_rate: float

class Guest_frequency(BaseModel):
    Guest: str
    No_of_reservations: int

class Most_booked_room(BaseModel):
    Room_Number: str
    Number_of_Reservation: int