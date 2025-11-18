from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    master_password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginIn(BaseModel):
    email: EmailStr
    master_password: str


class PasswordEntryCreate(BaseModel):
    title: str
    username: Optional[str] = None
    # encrypted blob base64 (binary) - client must encrypt locally
    encrypted_password: bytes
    url: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None


class PasswordEntryOut(BaseModel):
    id: int
    owner_id: int
    title: str
    username: Optional[str]
    encrypted_password: bytes
    url: Optional[str]
    category: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ShareCreate(BaseModel):
    entry_id: Optional[int]
    to_user_id: int
    encrypted_key_for_recipient: bytes
    encrypted_password: bytes
    permission: Optional[str] = "view"  # 'view' or 'edit'


class ShareOut(BaseModel):
    id: int
    entry_id: Optional[int]
    from_user_id: int
    to_user_id: int
    encrypted_key_for_recipient: bytes
    encrypted_password: bytes
    permission: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
