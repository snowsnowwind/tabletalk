"""
User schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Dict, Any, List
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
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.CUSTOMER


# Update schema
class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None


class DietaryPreferencesUpdate(BaseModel):
    dietary_restrictions: List[str] = Field(default_factory=list, max_length=20)
    allergies: List[str] = Field(default_factory=list, max_length=20)
    notes: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("dietary_restrictions", "allergies")
    @classmethod
    def clean_items(cls, values: List[str]) -> List[str]:
        cleaned = []
        for value in values:
            item = value.strip()
            if not item or item in cleaned:
                continue
            if len(item) > 80:
                raise ValueError("Each dietary item must be 80 characters or fewer")
            cleaned.append(item)
        return cleaned


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
