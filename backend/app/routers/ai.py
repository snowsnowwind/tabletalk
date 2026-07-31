"""
AI routes for recommendations and chat
"""
from collections import defaultdict, deque
from threading import Lock
from time import monotonic

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Optional
import re

from ..database import get_db
from ..models import Restaurant, MenuItem, CorporateEvent, User
from ..schemas import (
    RecommendationRequest, RecommendationResponse, RestaurantRecommendation,
    MenuRecommendationRequest, MenuRecommendationResponse,
    EventOptimizationRequest, EventOptimizationResponse,
    ChatRequest, ChatResponse, PreferenceAnalysis
)
from ..services.auth import get_current_user
from ..ai import ai_service, ai_services, get_ai_service

router = APIRouter(prefix="/api/ai", tags=["AI"])

PUBLIC_AI_REQUEST_LIMIT = 20
PUBLIC_AI_REQUEST_WINDOW_SECONDS = 60
# ponytail: in-memory per-process limit; use a shared store when scaling across workers.
PUBLIC_AI_REQUESTS = defaultdict(deque)
PUBLIC_AI_REQUESTS_LOCK = Lock()


def check_public_ai_rate_limit(client_host: str) -> None:
    now = monotonic()
    with PUBLIC_AI_REQUESTS_LOCK:
        requests = PUBLIC_AI_REQUESTS[client_host]
        while requests and requests[0] <= now - PUBLIC_AI_REQUEST_WINDOW_SECONDS:
            requests.popleft()
        if len(requests) >= PUBLIC_AI_REQUEST_LIMIT:
            raise HTTPException(status_code=429, detail="Too many AI requests. Please try again shortly.")
        requests.append(now)


def enforce_public_ai_rate_limit(request: Request) -> None:
    check_public_ai_rate_limit(request.client.host if request.client else "unknown")


def build_database_backed_chat_context(
    db: Session,
    client_context: dict,
) -> dict:
    """Attach trusted restaurant/menu facts without accepting catalog data from the browser."""
    allowed_booking_fields = {
        "restaurant_id",
        "date",
        "time",
        "guests",
        "name",
        "phone",
        "special_requests",
    }
    context = {
        key: value
        for key, value in client_context.items()
        if key in allowed_booking_fields
    }
    context["currency"] = "HKD"
    raw_cart = client_context.get("cart")
    requested_quantities = {}
    if isinstance(raw_cart, list):
        for entry in raw_cart[:50]:
            if not isinstance(entry, dict):
                continue
            item_id = entry.get("id")
            quantity = entry.get("quantity")
            if (
                isinstance(item_id, int)
                and not isinstance(item_id, bool)
                and isinstance(quantity, int)
                and not isinstance(quantity, bool)
                and 1 <= quantity <= 99
            ):
                requested_quantities[item_id] = quantity
    cart_items = []
    if requested_quantities:
        database_items = (
            db.query(MenuItem)
            .filter(
                MenuItem.id.in_(requested_quantities),
                MenuItem.is_available == True,
            )
            .all()
        )
        by_id = {item.id: item for item in database_items}
        for item_id, quantity in requested_quantities.items():
            item = by_id.get(item_id)
            if not item:
                continue
            cart_items.append(
                {
                    "id": item.id,
                    "name": item.name,
                    "price": round(float(item.price), 2),
                    "quantity": quantity,
                    "line_total": round(float(item.price) * quantity, 2),
                }
            )
    subtotal = round(sum(item["line_total"] for item in cart_items), 2)
    service_charge = round(subtotal * 0.10, 2)
    context["cart"] = cart_items
    context["cart_totals"] = {
        "item_count": sum(item["quantity"] for item in cart_items),
        "subtotal": subtotal,
        "service_charge": service_charge,
        "total": round(subtotal + service_charge, 2),
    }
    restaurants = db.query(Restaurant).filter(Restaurant.is_active == True).all()
    context["restaurant_catalog"] = [
        {
            "id": restaurant.id,
            "name": restaurant.name,
            "cuisine": restaurant.cuisine,
            "description": restaurant.description,
            "address": restaurant.address,
            "rating": restaurant.rating,
            "price_level": restaurant.price_level,
            "operating_hours": restaurant.operating_hours,
            "features": restaurant.features,
        }
        for restaurant in restaurants
    ]

    selected_id = context.get("restaurant_id")
    selected_restaurant = next(
        (restaurant for restaurant in restaurants if restaurant.id == selected_id),
        None,
    )
    if not selected_restaurant:
        context["restaurant_id"] = None
        context["selected_restaurant"] = None
        context["selected_menu"] = []
        return context

    context["selected_restaurant"] = next(
        restaurant
        for restaurant in context["restaurant_catalog"]
        if restaurant["id"] == selected_restaurant.id
    )
    menu_items = (
        db.query(MenuItem)
        .filter(
            MenuItem.restaurant_id == selected_restaurant.id,
            MenuItem.is_available == True,
        )
        .all()
    )
    context["selected_menu"] = [
        {
            "name": item.name,
            "description": item.description,
            "category": item.category,
            "price": item.price,
            "is_vegetarian": item.is_vegetarian,
            "is_spicy": item.is_spicy,
            "allergens": item.allergens,
            "order_count": item.order_count,
        }
        for item in menu_items
    ]
    return context


def _money(value: float) -> str:
    return f"{value:.2f}"


def _cart_summary_response(context: dict) -> dict:
    cart = context.get("cart") or []
    totals = context.get("cart_totals") or {}
    if not cart:
        message = "Your cart is empty."
    else:
        lines = ", ".join(
            f"{item['name']} × {item['quantity']} (HKD {_money(item['line_total'])})"
            for item in cart
        )
        message = (
            f"Your cart has {totals['item_count']} item(s): {lines}. "
            f"Subtotal: HKD {_money(totals['subtotal'])}; "
            f"10% service charge: HKD {_money(totals['service_charge'])}; "
            f"total: HKD {_money(totals['total'])}."
        )
    return {
        "response": message,
        "action": "cart_summary",
        "extracted_data": {},
        "clear_fields": [],
        "quick_replies": ["View cart", "Clear cart"],
    }


def _remaining_cart_message(cart: list[dict], removed_item: dict) -> str:
    remaining = [item for item in cart if item["id"] != removed_item["id"]]
    subtotal = round(sum(item["line_total"] for item in remaining), 2)
    total = round(subtotal * 1.10, 2)
    if not remaining:
        return f"Removed {removed_item['name']}. Your cart is now empty."
    return (
        f"Removed {removed_item['name']}. Your new subtotal is HKD {_money(subtotal)} "
        f"and the total with 10% service charge is HKD {_money(total)}."
    )


def handle_deterministic_cart_request(message: str, context: dict) -> Optional[dict]:
    """Handle cart reads/mutations with database-checked data instead of model arithmetic."""
    cart = context.get("cart") or []
    text = message.strip().lower()
    compact = re.sub(r"[^a-z0-9\u4e00-\u9fff]+", " ", text).strip()
    mutation_verb = r"(?:clear|empty|remove|delete|take\s+off)"
    mentions_mutation = bool(re.search(rf"\b{mutation_verb}\b", text))
    negates_mutation = bool(
        re.search(
            rf"\b(?:do\s+not|don't|dont|never|not\s+to|should\s+not|shouldn't)"
            rf"\s+(?:\w+\s+){{0,2}}{mutation_verb}\b",
            text,
        )
        or re.search(r"(?:不要|别|別|不可).{0,12}(?:清空|删除|刪除|移除)", message)
    )
    quotes_mutation = bool(
        re.search(
            rf"""["'“‘][^"'”’]{{0,80}}\b{mutation_verb}\b[^"'”’]{{0,80}}["'”’]""",
            text,
        )
    )
    asks_about_mutation = mentions_mutation and bool(
        re.search(
            r"\b(?:what\s+does|what\s+do|what\s+is|define|explain|"
            r"meaning\s+of|help\s+page\s+says)\b",
            text,
        )
    )
    if negates_mutation or quotes_mutation or asks_about_mutation:
        return None

    clear_requested = bool(
        re.search(r"\b(clear|empty|remove all|delete all)\b.*\bcart\b", compact)
        or re.search(r"(清空|删除全部|刪除全部).*(购物车|購物車|餐车|餐車)", message)
    )
    if clear_requested:
        return {
            "response": "Your cart has been cleared." if cart else "Your cart is already empty.",
            "action": "clear_cart" if cart else "cart_summary",
            "extracted_data": {},
            "clear_fields": [],
            "quick_replies": ["View menu"],
        }

    remove_requested = bool(
        re.search(r"\b(remove|delete|take off)\b", compact)
        or re.search(r"(删除|刪除|移除|不要)", message)
    )
    if remove_requested:
        matches = [item for item in cart if item["name"].lower() in text]
        if not matches:
            message_words = set(compact.split())
            matches = [
                item
                for item in cart
                if any(
                    len(word) >= 4 and word in message_words
                    for word in re.sub(
                        r"[^a-z0-9]+", " ", item["name"].lower()
                    ).split()
                )
            ]
        ordinal = re.search(r"\b(first|1st)\b", compact)
        if not matches and ordinal and cart:
            matches = [cart[0]]
        if len(matches) == 1:
            item = matches[0]
            return {
                "response": _remaining_cart_message(cart, item),
                "action": "remove_cart_item",
                "extracted_data": {"cart_item_id": item["id"]},
                "clear_fields": [],
                "quick_replies": ["View cart", "Continue shopping"],
            }
        if not cart:
            return _cart_summary_response(context)
        names = ", ".join(item["name"] for item in cart)
        return {
            "response": f"Which item should I remove? Your cart contains: {names}.",
            "action": None,
            "extracted_data": {},
            "clear_fields": [],
            "quick_replies": [f"Remove {item['name']}" for item in cart[:4]],
        }

    cart_question = bool(
        re.search(
            r"\b(cart|basket|bill|subtotal|total price|how much.*(?:cart|order)|what.*(?:cart|basket))\b",
            compact,
        )
        or re.search(r"(购物车|購物車|餐车|餐車|账单|賬單|合计|合計|总价|總價)", message)
    )
    return _cart_summary_response(context) if cart_question else None


def normalize_cart_model_action(
    result: dict,
    context: dict,
    *,
    user_message: str = "",
) -> dict:
    action = result.get("action")
    if action == "cart_summary":
        return _cart_summary_response(context)
    if action in {"clear_cart", "remove_cart_item"}:
        authorised = (
            handle_deterministic_cart_request(user_message, context)
            if user_message
            else None
        )
        if not authorised or authorised.get("action") != action:
            return {
                "response": (
                    "I did not change your cart because that action was not "
                    "requested in your message."
                ),
                "action": None,
                "extracted_data": {},
                "clear_fields": [],
                "quick_replies": ["View cart"],
            }
        return authorised
    return result


@router.post(
    "/recommend/restaurants",
    response_model=RecommendationResponse,
    dependencies=[Depends(enforce_public_ai_rate_limit)],
)
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
    recommendations = await ai_service.get_restaurant_recommendations(
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


@router.post(
    "/recommend/menu",
    response_model=MenuRecommendationResponse,
    dependencies=[Depends(enforce_public_ai_rate_limit)],
)
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
    result = await ai_service.get_menu_recommendations(
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
    result = await ai_service.optimize_event_flow(
        current_flow=request.current_flow,
        guest_count=request.guest_count,
        event_type=request.event_type,
        special_requirements=request.special_requirements
    )
    
    return result


@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(enforce_public_ai_rate_limit)])
async def chat_with_assistant(request: ChatRequest, db: Session = Depends(get_db)):
    """Chat with AI booking assistant"""

    trusted_context = build_database_backed_chat_context(db, request.context)
    cart_result = handle_deterministic_cart_request(request.message, trusted_context)
    if cart_result:
        return cart_result
    selected_service = get_ai_service(request.provider)
    result = await selected_service.chat_assistant(
        message=request.message,
        conversation_history=[msg.model_dump() for msg in request.conversation_history],
        context=trusted_context,
    )
    return normalize_cart_model_action(
        result,
        trusted_context,
        user_message=request.message,
    )


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
        'ai_configured': any(service.is_available() for service in ai_services.values()),
        'default_provider': 'opencode_go',
        'providers': [
            {
                'id': provider_id,
                'name': service.provider_name,
                'model': service.model,
                'configured': service.is_available(),
            }
            for provider_id, service in ai_services.items()
        ],
        'features': {
            'restaurant_recommendations': True,
            'menu_recommendations': True,
            'event_optimization': True,
            'chat_assistant': True
        }
    }
