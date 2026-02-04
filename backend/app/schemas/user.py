"""
User schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    CORPORATE = "corporate"
    CUSTOMER = "customer"


# Base schema
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None


# Create schema (registration)
class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.CUSTOMER


# Update schema
class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None


# Response schema
class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    preferences: Dict[str, Any] = {}
    created_at: datetime
    
    class Config:
        from_attributes = True


# Login schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Token schema
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None
