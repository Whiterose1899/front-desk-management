from pydantic import BaseModel

class Usersignup(BaseModel):
    first_name: str
    last_name: str
    username: str
    role: str
    password: str

    def __repr__(self):
        return f"Usersignup(first_name={self.first_name}, last_name={self.last_name}, username={self.username}, role={self.role})"

class Userlogin(BaseModel):
    username: str
    password: str

    def __repr__(self):
        return f"Userlogin(username={self.username}, password={self.password})"
    
class UserResponse(BaseModel):
    id: int
    role: str
    username: str

    class Config():
        from_attributes = True