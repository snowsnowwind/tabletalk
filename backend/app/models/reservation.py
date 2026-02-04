"""
Reservation model
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class ReservationStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SEATED = "seated"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    
    # Booking details
    date = Column(DateTime, nullable=False)
    time = Column(String(10), nullable=False)  # e.g., "19:00"
    guests = Column(Integer, nullable=False)
    
    # Table assignment
    table_number = Column(String(20))
    
    # Occasion and special requests
    occasion = Column(String(100))  # e.g., "birthday", "anniversary", "business"
    special_requests = Column(Text)
    
    # Deposit
    deposit_amount = Column(Float, default=0)
    deposit_paid = Column(Float, default=0)
    
    # Status
    status = Column(Enum(ReservationStatus), default=ReservationStatus.PENDING)
    
    # Confirmation
    confirmation_code = Column(String(20), unique=True)
    
    # Contact info (in case user is not logged in)
    guest_name = Column(String(100))
    guest_phone = Column(String(20))
    guest_email = Column(String(255))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="reservations")
    restaurant = relationship("Restaurant", back_populates="reservations")
