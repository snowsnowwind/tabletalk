"""
User model for authentication and authorization
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CORPORATE = "corporate"
    CUSTOMER = "customer"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(20))
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER)
    is_active = Column(Boolean, default=True)
    
    # User preferences for AI learning
    preferences = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reservations = relationship("Reservation", back_populates="user")
    corporate_events = relationship("CorporateEvent", back_populates="user")
