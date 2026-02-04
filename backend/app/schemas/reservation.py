"""
Reservation schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class ReservationStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SEATED = "seated"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


# Base schema
class ReservationBase(BaseModel):
    restaurant_id: int
    date: datetime
    time: str
    guests: int
    occasion: Optional[str] = None
    special_requests: Optional[str] = None


# Create schema
class ReservationCreate(ReservationBase):
    guest_name: Optional[str] = None
    guest_phone: Optional[str] = None
    guest_email: Optional[EmailStr] = None


# Update schema
class ReservationUpdate(BaseModel):
    date: Optional[datetime] = None
    time: Optional[str] = None
    guests: Optional[int] = None
    table_number: Optional[str] = None
    occasion: Optional[str] = None
    special_requests: Optional[str] = None
    status: Optional[ReservationStatus] = None


# Response schema
class ReservationResponse(ReservationBase):
    id: int
    user_id: Optional[int]
    table_number: Optional[str]
    deposit_amount: float
    deposit_paid: float
    status: ReservationStatus
    confirmation_code: str
    guest_name: Optional[str]
    guest_phone: Optional[str]
    guest_email: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# For staff dashboard - includes user info
class ReservationWithUser(ReservationResponse):
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    restaurant_name: Optional[str] = None
