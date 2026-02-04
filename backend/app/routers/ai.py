"""
AI routes for recommendations and chat
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models import Restaurant, MenuItem, CorporateEvent, User
from ..schemas import (
    RecommendationRequest, RecommendationResponse, RestaurantRecommendation,
    MenuRecommendationRequest, MenuRecommendationResponse,
    EventOptimizationRequest, EventOptimizationResponse,
    ChatRequest, ChatResponse, PreferenceAnalysis
)
from ..services.auth import get_current_user
from ..ai import gemini_service

router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.post("/recommend/restaurants", response_model=RecommendationResponse)
async def get_restaurant_recommendations(
    request: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """Get AI-powered restaurant recommendations"""
    
    # Get all active restaurants
    restaurants = db.query(Restaurant).filter(Restaurant.is_active == True).all()
    
    # Convert to dict for AI processing
    restaurant_data = [
        {
            'id': r.id,
            'name': r.name,
            'cuisine': r.cuisine,
            'rating': r.rating,
            'price_level': r.price_level,
            'description': r.description,
            'features': r.features,
            'address': r.address,
            'image': r.images[0] if r.images else None
        }
        for r in restaurants
    ]
    
    # Get AI recommendations
    recommendations = await gemini_service.get_restaurant_recommendations(
        restaurants=restaurant_data,
        user_role=request.user_role,
        scenario=request.scenario,
        budget_level=request.budget_level,
        cuisine_preference=request.cuisine_preference,
        guest_count=request.guest_count,
        top_n=request.top_n
    )
    
    return {
        'recommendations': recommendations,
        'total': len(recommendations)
    }


@router.post("/recommend/menu", response_model=MenuRecommendationResponse)
async def get_menu_recommendations(
    request: MenuRecommendationRequest,
    db: Session = Depends(get_db)
):
    """Get AI-powered menu recommendations"""
    
    # Get restaurant menu items
    menu_items = db.query(MenuItem).filter(
        MenuItem.restaurant_id == request.restaurant_id,
        MenuItem.is_available == True
    ).all()
    
    if not menu_items:
        raise HTTPException(status_code=404, detail="No menu items found")
    
    # Convert to dict
    menu_data = [
        {
            'id': m.id,
            'name': m.name,
            'category': m.category,
            'price': m.price,
            'description': m.description,
            'is_vegetarian': m.is_vegetarian,
            'is_spicy': m.is_spicy,
            'allergens': m.allergens,
            'order_count': m.order_count
        }
        for m in menu_items
    ]
    
    # Get AI recommendations
    result = await gemini_service.get_menu_recommendations(
        menu_items=menu_data,
        guest_count=request.guest_count,
        budget_per_person=request.budget_per_person,
        dietary_restrictions=request.dietary_restrictions,
        occasion=request.occasion
    )
    
    return result


@router.post("/optimize/event", response_model=EventOptimizationResponse)
async def optimize_event_flow(
    request: EventOptimizationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-powered event flow optimization"""
    
    # Verify event exists and user has access
    event = db.query(CorporateEvent).filter(CorporateEvent.id == request.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get AI optimization
    result = await gemini_service.optimize_event_flow(
        current_flow=request.current_flow,
        guest_count=request.guest_count,
        event_type=request.event_type,
        special_requirements=request.special_requirements
    )
    
    return result


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """Chat with AI booking assistant"""
    
    result = await gemini_service.chat_assistant(
        message=request.message,
        conversation_history=[msg.model_dump() for msg in request.conversation_history],
        context=request.context
    )
    
    return result


@router.get("/preferences", response_model=PreferenceAnalysis)
async def get_user_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI analysis of user preferences"""
    
    # Get user's reservation history
    from ..models import Reservation
    reservations = db.query(Reservation).filter(
        Reservation.user_id == current_user.id
    ).all()
    
    # Analyze preferences from reservations
    cuisine_counts = {}
    price_levels = []
    dining_times = []
    
    for res in reservations:
        if res.restaurant:
            cuisine = res.restaurant.cuisine
            cuisine_counts[cuisine] = cuisine_counts.get(cuisine, 0) + 1
            price_levels.append(res.restaurant.price_level)
        dining_times.append(res.time)
    
    # Calculate preference scores
    total_reservations = len(reservations) or 1
    cuisine_preferences = {
        cuisine: count / total_reservations 
        for cuisine, count in cuisine_counts.items()
    }
    
    avg_price = sum(price_levels) / len(price_levels) if price_levels else 3
    
    return {
        'cuisine_preferences': cuisine_preferences,
        'price_range': {
            'min': min(price_levels) if price_levels else 1,
            'max': max(price_levels) if price_levels else 5,
            'preferred': avg_price
        },
        'dining_times': list(set(dining_times))[:5],
        'favorite_features': [],  # Would need more data
        'insights': [
            f'您共有 {len(reservations)} 次预订记录',
            f'您偏好的价位约为 {int(avg_price)} 级',
            f'最常选择的菜系是 {max(cuisine_counts, key=cuisine_counts.get) if cuisine_counts else "未知"}'
        ] if reservations else ['暂无足够的预订记录进行分析']
    }


@router.get("/status")
async def get_ai_status():
    """Check AI service status"""
    return {
        'gemini_available': gemini_service.is_available(),
        'features': {
            'restaurant_recommendations': True,
            'menu_recommendations': True,
            'event_optimization': True,
            'chat_assistant': True
        }
    }
