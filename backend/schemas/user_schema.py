from pydantic import BaseModel,EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    email:EmailStr
    full_name:str
    password:str
    
class UserResponse(BaseModel):
    id:int
    email:str
    full_name:str
    created_at:datetime
    class Config:
        from_attributes = True
        