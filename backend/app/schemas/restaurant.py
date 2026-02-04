"""
Restaurant and MenuItem schemas
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# MenuItem schemas
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price: float
    image_url: Optional[str] = None
    is_vegetarian: bool = False
    is_spicy: bool = False
    allergens: List[str] = []


class MenuItemCreate(MenuItemBase):
    restaurant_id: int


class MenuItemResponse(MenuItemBase):
    id: int
    is_available: bool
    order_count: int
    
    class Config:
        from_attributes = True


# Restaurant schemas
class RestaurantBase(BaseModel):
    name: str
    cuisine: str
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    price_level: int = 2
    total_capacity: int = 100


class RestaurantCreate(RestaurantBase):
    images: List[str] = []
    operating_hours: Dict[str, Any] = {}
    features: List[str] = []


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    cuisine: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    rating: Optional[float] = None
    price_level: Optional[int] = None
    images: Optional[List[str]] = None
    operating_hours: Optional[Dict[str, Any]] = None
    features: Optional[List[str]] = None
    total_capacity: Optional[int] = None
    is_active: Optional[bool] = None


class RestaurantResponse(RestaurantBase):
    id: int
    rating: float
    images: List[str]
    operating_hours: Dict[str, Any]
    features: List[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class RestaurantWithMenu(RestaurantResponse):
    menu_items: List[MenuItemResponse] = []
