"""
Corporate Event schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class EventStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# EventFlow schemas
class EventFlowBase(BaseModel):
    step_order: int
    title: str
    description: Optional[str] = None
    start_time: Optional[str] = None
    duration_minutes: int = 30
    step_type: Optional[str] = None
    notes: Optional[str] = None


class EventFlowCreate(EventFlowBase):
    pass


class EventFlowResponse(EventFlowBase):
    id: int
    event_id: int
    ai_suggestions: List[str] = []
    created_at: datetime
    
    class Config:
        from_attributes = True


# CorporateEvent schemas
class CorporateEventBase(BaseModel):
    name: str
    event_type: Optional[str] = None
    description: Optional[str] = None
    date: datetime
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    expected_guests: int
    budget: Optional[float] = None


class CorporateEventCreate(CorporateEventBase):
    restaurant_id: Optional[int] = None
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    venue_preferences: Dict[str, Any] = {}
    dietary_requirements: List[str] = []
    special_requirements: Optional[str] = None


class CorporateEventUpdate(BaseModel):
    name: Optional[str] = None
    event_type: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    expected_guests: Optional[int] = None
    confirmed_guests: Optional[int] = None
    budget: Optional[float] = None
    estimated_cost: Optional[float] = None
    menu_selection: Optional[List[int]] = None
    venue_preferences: Optional[Dict[str, Any]] = None
    special_requirements: Optional[str] = None
    dietary_requirements: Optional[List[str]] = None
    status: Optional[EventStatus] = None


class CorporateEventResponse(CorporateEventBase):
    id: int
    user_id: Optional[int]
    restaurant_id: Optional[int]
    confirmed_guests: int
    estimated_cost: Optional[float]
    menu_selection: List[int]
    venue_preferences: Dict[str, Any]
    contact_name: Optional[str]
    contact_phone: Optional[str]
    contact_email: Optional[str]
    company_name: Optional[str]
    status: EventStatus
    dietary_requirements: List[str]
    special_requirements: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CorporateEventWithFlow(CorporateEventResponse):
    event_flows: List[EventFlowResponse] = []
