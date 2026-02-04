"""
Restaurant routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import Restaurant, MenuItem, User
from ..schemas import (
    RestaurantCreate, RestaurantUpdate, RestaurantResponse, RestaurantWithMenu,
    MenuItemCreate, MenuItemResponse
)
from ..services.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/restaurants", tags=["Restaurants"])


@router.get("", response_model=List[RestaurantResponse])
async def get_restaurants(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    cuisine: Optional[str] = None,
    price_level: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get list of restaurants with optional filters"""
    query = db.query(Restaurant).filter(Restaurant.is_active == True)
    
    if cuisine:
        query = query.filter(Restaurant.cuisine.ilike(f"%{cuisine}%"))
    if price_level:
        query = query.filter(Restaurant.price_level == price_level)
    
    restaurants = query.order_by(Restaurant.rating.desc()).offset(skip).limit(limit).all()
    return restaurants


@router.get("/{restaurant_id}", response_model=RestaurantWithMenu)
async def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    """Get restaurant details with menu"""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    return restaurant


@router.post("", response_model=RestaurantResponse)
async def create_restaurant(
    restaurant_data: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new restaurant (Admin only)"""
    restaurant = Restaurant(**restaurant_data.model_dump())
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.put("/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(
    restaurant_id: int,
    restaurant_data: RestaurantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a restaurant (Admin only)"""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    update_data = restaurant_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(restaurant, field, value)
    
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.delete("/{restaurant_id}")
async def delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a restaurant (Admin only) - soft delete"""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    restaurant.is_active = False
    db.commit()
    return {"message": "Restaurant deleted successfully"}


# Menu Items
@router.get("/{restaurant_id}/menu", response_model=List[MenuItemResponse])
async def get_menu(
    restaurant_id: int,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get restaurant menu items"""
    query = db.query(MenuItem).filter(
        MenuItem.restaurant_id == restaurant_id,
        MenuItem.is_available == True
    )
    
    if category:
        query = query.filter(MenuItem.category == category)
    
    return query.all()


@router.post("/{restaurant_id}/menu", response_model=MenuItemResponse)
async def create_menu_item(
    restaurant_id: int,
    item_data: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Add menu item to restaurant (Admin only)"""
    # Verify restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    menu_item = MenuItem(**item_data.model_dump())
    menu_item.restaurant_id = restaurant_id
    db.add(menu_item)
    db.commit()
    db.refresh(menu_item)
    return menu_item

@router.put("/menu/{menu_item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    menu_item_id: int,
    item_data: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a menu item (Admin only)"""
    menu_item = db.query(MenuItem).filter(MenuItem.id == menu_item_id).first()
    if not menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    
    update_data = item_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(menu_item, field, value)
    
    db.commit()
    db.refresh(menu_item)
    return menu_item


@router.delete("/menu/{menu_item_id}")
async def delete_menu_item(
    menu_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a menu item (Admin only)"""
    menu_item = db.query(MenuItem).filter(MenuItem.id == menu_item_id).first()
    if not menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    
    # Hard delete
    db.delete(menu_item)
    db.commit()
    return {"message": "Menu item deleted successfully"}