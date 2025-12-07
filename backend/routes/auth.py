import os
from fastapi import APIRouter,Depends,HTTPException,status,Response
from sqlalchemy.orm import Session
from datetime import datetime,timedelta
from dotenv import load_dotenv
from db.supabase import get_db
from models.user_model import User
from schemas.user_schema import UserCreate,UserLogin,UserResponse
from schemas.token import Token
from core.deps import get_current_user

from core.security import (
    verify_password,
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


@router.post("/signin", response_model=Token)
async def login(
    credentials: UserLogin,
    response: Response,                     
    db: Session = Depends(get_db),
):
   
    user = db.query(User).filter(User.email == credentials.email).first()

   
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect user or password",
        )

    
    access_token_expires = timedelta(minutes=1440)

    
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires,
    )

    
    response.set_cookie(
    "session", access_token,
    httponly=True,
    samesite="lax",   
    secure=False,     
    path="/",
    max_age=86400,
)

    return {"access_token": access_token, "token_type": "Bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    
    return current_user    

@router.get("/logout",status_code = status.HTTP_200_OK)
async def logout(response: Response):
    response.delete_cookie(
        key="session",  
        path="/",
    )

    return {"message": "Logged out"}