"""
Schemas package
"""
from .user import (
    UserBase, UserCreate, UserUpdate, UserResponse, UserLogin, 
    Token, TokenData, UserRole
)
from .restaurant import (
    RestaurantBase, RestaurantCreate, RestaurantUpdate, RestaurantResponse,
    RestaurantWithMenu, MenuItemBase, MenuItemCreate, MenuItemResponse
)
from .reservation import (
    ReservationBase, ReservationCreate, ReservationUpdate, 
    ReservationResponse, ReservationWithUser, ReservationStatus
)
from .event import (
    CorporateEventBase, CorporateEventCreate, CorporateEventUpdate,
    CorporateEventResponse, CorporateEventWithFlow,
    EventFlowBase, EventFlowCreate, EventFlowResponse, EventStatus
)
from .ai import (
    RecommendationRequest, RecommendationResponse, RestaurantRecommendation,
    MenuRecommendationRequest, MenuRecommendationResponse, MenuItemRecommendation,
    EventOptimizationRequest, EventOptimizationResponse, EventFlowSuggestion,
    ChatRequest, ChatResponse, ChatMessage, PreferenceAnalysis
)

__all__ = [
    # User
    "UserBase", "UserCreate", "UserUpdate", "UserResponse", "UserLogin",
    "Token", "TokenData", "UserRole",
    # Restaurant
    "RestaurantBase", "RestaurantCreate", "RestaurantUpdate", "RestaurantResponse",
    "RestaurantWithMenu", "MenuItemBase", "MenuItemCreate", "MenuItemResponse",
    # Reservation
    "ReservationBase", "ReservationCreate", "ReservationUpdate",
    "ReservationResponse", "ReservationWithUser", "ReservationStatus",
    # Event
    "CorporateEventBase", "CorporateEventCreate", "CorporateEventUpdate",
    "CorporateEventResponse", "CorporateEventWithFlow",
    "EventFlowBase", "EventFlowCreate", "EventFlowResponse", "EventStatus",
    # AI
    "RecommendationRequest", "RecommendationResponse", "RestaurantRecommendation",
    "MenuRecommendationRequest", "MenuRecommendationResponse", "MenuItemRecommendation",
    "EventOptimizationRequest", "EventOptimizationResponse", "EventFlowSuggestion",
    "ChatRequest", "ChatResponse", "ChatMessage", "PreferenceAnalysis"
]
