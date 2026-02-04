"""
Corporate Event routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import CorporateEvent, EventFlow, User, EventStatus as EvStatus
from ..schemas import (
    CorporateEventCreate, CorporateEventUpdate, CorporateEventResponse, 
    CorporateEventWithFlow, EventFlowCreate, EventFlowResponse
)
from ..services.auth import get_current_user, require_corporate

router = APIRouter(prefix="/api/events", tags=["Corporate Events"])


@router.get("", response_model=List[CorporateEventResponse])
async def get_user_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's corporate events"""
    events = db.query(CorporateEvent).filter(
        CorporateEvent.user_id == current_user.id
    ).order_by(CorporateEvent.date.desc()).all()
    return events


@router.post("", response_model=CorporateEventResponse)
async def create_event(
    event_data: CorporateEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_corporate)
):
    """Create a new corporate event"""
    event = CorporateEvent(
        **event_data.model_dump(),
        user_id=current_user.id,
        status=EvStatus.DRAFT
    )
    
    db.add(event)
    db.commit()
    db.refresh(event)
    
    return event


@router.get("/{event_id}", response_model=CorporateEventWithFlow)
async def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get event details with flow"""
    event = db.query(CorporateEvent).filter(CorporateEvent.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check ownership or admin
    if event.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this event"
        )
    
    return event


@router.put("/{event_id}", response_model=CorporateEventResponse)
async def update_event(
    event_id: int,
    event_data: CorporateEventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a corporate event"""
    event = db.query(CorporateEvent).filter(CorporateEvent.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check ownership
    if event.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this event"
        )
    
    update_data = event_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}")
async def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a corporate event"""
    event = db.query(CorporateEvent).filter(CorporateEvent.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if event.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this event"
        )
    
    # Delete associated flows first
    db.query(EventFlow).filter(EventFlow.event_id == event_id).delete()
    db.delete(event)
    db.commit()
    
    return {"message": "Event deleted successfully"}


# Event Flow
@router.post("/{event_id}/flow", response_model=EventFlowResponse)
async def add_event_flow(
    event_id: int,
    flow_data: EventFlowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a step to event flow"""
    event = db.query(CorporateEvent).filter(CorporateEvent.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if event.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this event"
        )
    
    flow = EventFlow(
        **flow_data.model_dump(),
        event_id=event_id
    )
    
    db.add(flow)
    db.commit()
    db.refresh(flow)
    
    return flow


@router.put("/{event_id}/flow/{flow_id}", response_model=EventFlowResponse)
async def update_event_flow(
    event_id: int,
    flow_id: int,
    flow_data: EventFlowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an event flow step"""
    flow = db.query(EventFlow).filter(
        EventFlow.id == flow_id,
        EventFlow.event_id == event_id
    ).first()
    
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow step not found"
        )
    
    # Check event ownership
    event = db.query(CorporateEvent).filter(CorporateEvent.id == event_id).first()
    if event.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    update_data = flow_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(flow, field, value)
    
    db.commit()
    db.refresh(flow)
    return flow


@router.delete("/{event_id}/flow/{flow_id}")
async def delete_event_flow(
    event_id: int,
    flow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an event flow step"""
    flow = db.query(EventFlow).filter(
        EventFlow.id == flow_id,
        EventFlow.event_id == event_id
    ).first()
    
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow step not found"
        )
    
    db.delete(flow)
    db.commit()
    
    return {"message": "Flow step deleted"}
