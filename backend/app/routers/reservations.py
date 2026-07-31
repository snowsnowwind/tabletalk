"""
Reservation routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import random
import string

from ..database import get_db
from ..models import Reservation, Restaurant, User, ReservationStatus as ResStatus
from ..schemas import (
    ReservationCreate, ReservationUpdate, ReservationResponse, ReservationWithUser
)
from ..schemas.reservation import normalize_phone
from ..services.auth import get_current_user, get_current_user_optional, require_admin

router = APIRouter(prefix="/api/reservations", tags=["Reservations"])


def generate_confirmation_code() -> str:
    """Generate a unique confirmation code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


@router.get("", response_model=List[ReservationResponse])
async def get_user_reservations(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's reservations"""
    query = db.query(Reservation).filter(Reservation.user_id == current_user.id)
    
    if status:
        query = query.filter(Reservation.status == status)
    
    return query.order_by(Reservation.date.desc()).all()


@router.post("", response_model=ReservationResponse)
async def create_reservation(
    reservation_data: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Create a new reservation"""
    # Verify restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == reservation_data.restaurant_id).first()
    if not restaurant or not restaurant.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    # Generate confirmation code
    confirmation_code = generate_confirmation_code()
    
    # Create reservation
    user_id = current_user.id if current_user else None
    
    reservation = Reservation(
        **reservation_data.model_dump(),
        user_id=user_id,
        confirmation_code=confirmation_code,
        status=ResStatus.PENDING
    )
    
    # Set guest info from user if logged in and not provided
    if current_user:
        if not reservation.guest_name:
            reservation.guest_name = current_user.name
        if not reservation.guest_phone:
            reservation.guest_phone = current_user.phone
        if not reservation.guest_email:
            reservation.guest_email = current_user.email
    
    # Validate that we have contact info either from user or guest fields
    if not reservation.guest_name or not reservation.guest_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name and phone number are required"
        )

    try:
        reservation.guest_phone = normalize_phone(reservation.guest_phone)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid phone number is required",
        ) from error

    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    
    return reservation


@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get reservation details"""
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    # Check ownership or admin
    if reservation.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this reservation"
        )
    
    return reservation


@router.put("/{reservation_id}", response_model=ReservationResponse)
async def update_reservation(
    reservation_id: int,
    reservation_data: ReservationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a reservation"""
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    # Check ownership or admin
    if reservation.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this reservation"
        )
    
    update_data = reservation_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reservation, field, value)
    
    db.commit()
    db.refresh(reservation)
    return reservation


@router.delete("/{reservation_id}")
async def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a reservation"""
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    # Check ownership or admin
    if reservation.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this reservation"
        )
    
    reservation.status = ResStatus.CANCELLED
    db.commit()
    
    return {"message": "Reservation cancelled successfully"}


# Staff endpoints
@router.get("/staff/all", response_model=List[ReservationWithUser])
async def get_all_reservations(
    date: Optional[str] = None,
    status: Optional[str] = None,
    restaurant_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all reservations (Admin/Staff only)"""
    query = db.query(Reservation)
    
    if date:
        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        query = query.filter(Reservation.date >= date_obj)
    
    if status:
        query = query.filter(Reservation.status == status)
    
    if restaurant_id:
        query = query.filter(Reservation.restaurant_id == restaurant_id)
    
    reservations = query.order_by(Reservation.date, Reservation.time).offset(skip).limit(limit).all()
    
    # Add user and restaurant info
    result = []
    for res in reservations:
        res_dict = ReservationWithUser.model_validate(res)
        if res.user:
            res_dict.user_name = res.user.name
            res_dict.user_email = res.user.email
        if res.restaurant:
            res_dict.restaurant_name = res.restaurant.name
        result.append(res_dict)
    
    return result


@router.put("/staff/{reservation_id}/status")
async def update_reservation_status(
    reservation_id: int,
    status: str,
    table_number: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update reservation status (Admin/Staff only)"""
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    reservation.status = status
    if table_number:
        reservation.table_number = table_number
    
    db.commit()
    return {"message": f"Reservation status updated to {status}"}
