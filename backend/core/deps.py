from fastapi import Depends,HTTPException,status,Request
from fastapi.security import HTTPBearer 
from sqlalchemy.orm import Session
from db.supabase import get_db
from core.security import decode_access_token
from models.user_model import User


security = HTTPBearer()
COOKIE_NAME = "session"
async def get_current_user(
    req: Request,
    db: Session = Depends(get_db),
) -> User:
    token = req.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing session cookie")

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing 'sub'")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    
    req.state.user = user
    return user



