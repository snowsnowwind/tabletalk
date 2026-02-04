"""
Restaurant and MenuItem models
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database import Base


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    cuisine = Column(String(100), nullable=False)
    description = Column(Text)
    address = Column(String(500))
    phone = Column(String(20))
    email = Column(String(255))
    
    # Rating and pricing
    rating = Column(Float, default=4.0)
    price_level = Column(Integer, default=2)  # 1-5
    
    # Images (JSON array of URLs)
    images = Column(JSON, default=[])
    
    # Operating hours (JSON object)
    operating_hours = Column(JSON, default={})
    
    # Features and amenities
    features = Column(JSON, default=[])  # e.g., ["private_room", "parking", "wifi"]
    
    # Capacity
    total_capacity = Column(Integer, default=100)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    menu_items = relationship("MenuItem", back_populates="restaurant")
    reservations = relationship("Reservation", back_populates="restaurant")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    
    name = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(100), nullable=False)  # e.g., "dim_sum", "seafood", "dessert"
    price = Column(Float, nullable=False)
    
    # Image
    image_url = Column(String(500))
    
    # Dietary info
    is_vegetarian = Column(Boolean, default=False)
    is_spicy = Column(Boolean, default=False)
    allergens = Column(JSON, default=[])  # e.g., ["peanuts", "shellfish"]
    
    # Availability
    is_available = Column(Boolean, default=True)
    
    # Popularity for AI recommendations
    order_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="menu_items")
