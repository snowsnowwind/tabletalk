"""
Corporate Event and Event Flow models
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class EventStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class CorporateEvent(Base):
    __tablename__ = "corporate_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    
    # Event details
    name = Column(String(200), nullable=False)
    event_type = Column(String(50))  # e.g., "annual_dinner", "wedding", "conference"
    description = Column(Text)
    
    # Date and time
    date = Column(DateTime, nullable=False)
    start_time = Column(String(10))
    end_time = Column(String(10))
    
    # Guest info
    expected_guests = Column(Integer, nullable=False)
    confirmed_guests = Column(Integer, default=0)
    
    # Budget
    budget = Column(Float)
    estimated_cost = Column(Float)
    
    # Menu selection (JSON array of menu item IDs or custom menu)
    menu_selection = Column(JSON, default=[])
    
    # Venue preferences
    venue_preferences = Column(JSON, default={})  # e.g., {"private_room": true, "av_equipment": true}
    
    # Contact
    contact_name = Column(String(100))
    contact_phone = Column(String(20))
    contact_email = Column(String(255))
    company_name = Column(String(200))
    
    # Status
    status = Column(Enum(EventStatus), default=EventStatus.DRAFT)
    
    # Special requirements
    special_requirements = Column(Text)
    dietary_requirements = Column(JSON, default=[])
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="corporate_events")
    event_flows = relationship("EventFlow", back_populates="event", order_by="EventFlow.step_order")


class EventFlow(Base):
    __tablename__ = "event_flows"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("corporate_events.id"), nullable=False)
    
    # Flow step details
    step_order = Column(Integer, nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Timing
    start_time = Column(String(10))  # e.g., "18:00"
    duration_minutes = Column(Integer, default=30)
    
    # Step type for visualization
    step_type = Column(String(50))  # e.g., "arrival", "dinner", "speech", "entertainment"
    
    # Notes for staff
    notes = Column(Text)
    
    # AI suggestions
    ai_suggestions = Column(JSON, default=[])
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    event = relationship("CorporateEvent", back_populates="event_flows")
