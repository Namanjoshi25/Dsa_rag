import os
from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from datetime import datetime,timedelta
from dotenv import load_dotenv
from db.supabase import get_db
from models.user_model import User
from schemas.user_schema import UserCreate,UserLogin,UserResponse
from schemas.token import Token
from core.deps import get_current_user

from core.security import (
    verify_passoword,
    get_password_hash,
    create_access_token
)

load_dotenv()
ACCESS_TOKEN_EXPIRY_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRY_MINUTES")


router =APIRouter()

@router.post("/signup",response_model=UserResponse,status_code=status.HTTP_201_CREATED)
async def signup(user_data:UserCreate,db:Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exits"
        )
    
    hashed_password= get_password_hash(user_data.password)
    new_user = User(
        full_name = user_data.full_name,
        email = user_data.email,
        password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login",response_model=Token)
async def login(credentials:UserLogin,db:Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect user or password"
        )
    
    if not verify_passoword(credentials.password,user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect user or password"
        ) 
    
    access_token_expires = timedelta(1440)
    access_token = create_access_token(
        data = {"sub":str(user.id)},
        expires_delta=access_token_expires
    )    
    return {"access_token": access_token, "token_type": "Bearer"}
    

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user information
    """
    return current_user    