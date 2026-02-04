"""
Routers package
"""
from .auth import router as auth_router
from .restaurants import router as restaurants_router
from .reservations import router as reservations_router
from .events import router as events_router
from .ai import router as ai_router

__all__ = [
    "auth_router",
    "restaurants_router", 
    "reservations_router",
    "events_router",
    "ai_router"
]
