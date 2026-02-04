"""
AI-related schemas
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any


# Restaurant recommendation request
class RecommendationRequest(BaseModel):
    user_role: str = "customer"
    scenario: str = "dinner"  # dinner, lunch, business, date, family, celebration
    budget_level: int = 3  # 1-5
    cuisine_preference: Optional[str] = None
    guest_count: Optional[int] = None
    top_n: int = 5


# Restaurant recommendation response
class RestaurantRecommendation(BaseModel):
    id: int
    name: str
    cuisine: str
    rating: float
    price_level: int
    score: float  # AI match score
    reason: str  # AI explanation
    image: Optional[str] = None
    address: Optional[str] = None


class RecommendationResponse(BaseModel):
    recommendations: List[RestaurantRecommendation]
    total: int


# Menu recommendation request
class MenuRecommendationRequest(BaseModel):
    restaurant_id: int
    guest_count: int
    budget_per_person: Optional[float] = None
    dietary_restrictions: List[str] = []
    occasion: Optional[str] = None


class MenuItemRecommendation(BaseModel):
    id: int
    name: str
    category: str
    price: float
    reason: str
    is_must_try: bool = False


class MenuRecommendationResponse(BaseModel):
    items: List[MenuItemRecommendation]
    total_cost: float
    ai_notes: str


# Event optimization request
class EventOptimizationRequest(BaseModel):
    event_id: int
    current_flow: List[Dict[str, Any]]
    guest_count: int
    event_type: str
    special_requirements: Optional[str] = None


class EventFlowSuggestion(BaseModel):
    step_order: int
    title: str
    suggested_time: str
    duration_minutes: int
    notes: str
    improvement_reason: Optional[str] = None


class EventOptimizationResponse(BaseModel):
    optimized_flow: List[EventFlowSuggestion]
    suggestions: List[str]
    warnings: List[str] = []


# Chat assistant
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []
    context: Dict[str, Any] = {}  # Current booking state


class ChatResponse(BaseModel):
    response: str
    action: Optional[str] = None  # e.g., "confirm_booking", "ask_date", "ask_guests"
    extracted_data: Dict[str, Any] = {}  # Extracted booking info
    quick_replies: List[str] = []


# User preference analysis
class PreferenceAnalysis(BaseModel):
    cuisine_preferences: Dict[str, float]  # cuisine -> preference score
    price_range: Dict[str, float]  # min, max, preferred
    dining_times: List[str]
    favorite_features: List[str]
    insights: List[str]
