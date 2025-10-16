from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    access_token:str
    token_type:str="Bearer"
    
class TokenDate(BaseModel):
    user_id:Optional[str]=None    