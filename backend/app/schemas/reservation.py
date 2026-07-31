"""
Reservation schemas
"""
import re

from pydantic import BaseModel, EmailStr, Field, StrictInt, ValidationInfo, field_validator
from typing import Optional
from datetime import date, datetime
from enum import Enum
from zoneinfo import ZoneInfo


class ReservationStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SEATED = "seated"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


def normalize_phone(value: str) -> str:
    normalized = value.strip()
    digits = re.sub(r"\D", "", normalized)
    if not 7 <= len(digits) <= 15 or len(set(digits)) == 1:
        raise ValueError("a valid phone number is required")
    return normalized


# Base schema
class ReservationBase(BaseModel):
    restaurant_id: int
    date: datetime
    time: str
    guests: StrictInt = Field(gt=0)
    occasion: Optional[str] = None
    special_requests: Optional[str] = None

    @field_validator("date")
    @classmethod
    def validate_date(cls, value: datetime, info: ValidationInfo) -> datetime:
        booking_date = (
            info.context.get("booking_date")
            if info.context and info.context.get("booking_date")
            else datetime.now(ZoneInfo("Asia/Hong_Kong")).date()
        )
        if isinstance(booking_date, datetime):
            booking_date = booking_date.date()
        if not isinstance(booking_date, date):
            raise ValueError("booking_date validation context must be a date")
        if value.date() < booking_date:
            raise ValueError("reservation date cannot be in the past")
        return value

    @field_validator("time")
    @classmethod
    def validate_time(cls, value: str) -> str:
        if not re.fullmatch(r"\d{2}:\d{2}", value):
            raise ValueError("time must use HH:MM format")
        datetime.strptime(value, "%H:%M")
        return value


# Create schema
class ReservationCreate(ReservationBase):
    guest_name: Optional[str] = None
    guest_phone: Optional[str] = None
    guest_email: Optional[EmailStr] = None

    @field_validator("guest_name")
    @classmethod
    def normalize_guest_name(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if value else None

    @field_validator("guest_phone")
    @classmethod
    def validate_guest_phone(cls, value: Optional[str]) -> Optional[str]:
        return normalize_phone(value) if value else None


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
