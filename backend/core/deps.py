from fastapi import Depends,HTTPException,status
from fastapi.security import HTTPBearer ,  HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from db.supabase import get_db
from core.security import decode_access_token
from models.user_model import User


security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
)->User:
    token  = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate the credentials."
        )
    user_id = payload.get("sub")
    if user_id is None:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate the credentials."
        )
    user = db.query(User).filter(User.id ==user_id).first()
    if user is None:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate the credentials."
        )
         
    return user          


