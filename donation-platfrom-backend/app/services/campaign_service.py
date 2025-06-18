from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional, Tuple
from datetime import datetime
import math

from app.db.models.campaign import Campaign, CampaignStatus
from app.schemas.campaign import CampaignCreate, CampaignUpdate, PaginationMeta

def create_campaign(db: Session, campaign_data: CampaignCreate, creator_id: int):
    """Create a new campaign."""
    # Create campaign instance
    db_campaign = Campaign(
        title=campaign_data.title,
        description=campaign_data.description,
        markdown_text=campaign_data.markdown_text,
        target_amount=campaign_data.target_amount,
        start_date=campaign_data.start_date,
        end_date=campaign_data.end_date,
        status=campaign_data.status or CampaignStatus.DRAFT,
        image_path=campaign_data.image_path,
        lang=campaign_data.lang,
        creator_id=creator_id
    )
    
    # Save to DB
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    
    return db_campaign

def get_campaign_by_id(db: Session, campaign_id: int):
    """Get a campaign by ID."""
    return db.query(Campaign).filter(Campaign.id == campaign_id).first()

def get_campaigns_paginated(
    db: Session, 
    page: int = 1,
    page_size: int = 10,
    status: Optional[CampaignStatus] = None,
    lang: Optional[str] = None
) -> Tuple[List[Campaign], PaginationMeta]:
    """Get campaigns with proper pagination metadata and optional language filter."""
    # Build base query
    query = db.query(Campaign)
    
    if status:
        query = query.filter(Campaign.status == status)
    
    if lang:
        query = query.filter(Campaign.lang == lang)
    
    # Get total count
    total_items = query.count()
    
    # Calculate pagination values
    total_pages = math.ceil(total_items / page_size) if total_items > 0 else 1
    skip = (page - 1) * page_size
    
    # Get paginated results
    campaigns = query.order_by(Campaign.created_at.desc()).offset(skip).limit(page_size).all()
    
    # Create pagination metadata
    pagination = PaginationMeta(
        current_page=page,
        page_size=page_size,
        total_items=total_items,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1,
        next_page=page + 1 if page < total_pages else None,
        previous_page=page - 1 if page > 1 else None
    )
    
    return campaigns, pagination

def get_campaigns_by_creator_paginated(
    db: Session, 
    creator_id: int,
    page: int = 1,
    page_size: int = 10,
    lang: Optional[str] = None
) -> Tuple[List[Campaign], PaginationMeta]:
    """Get campaigns by creator with proper pagination metadata and optional language filter."""
    # Build base query
    query = db.query(Campaign).filter(Campaign.creator_id == creator_id)
    
    if lang:
        query = query.filter(Campaign.lang == lang)
    
    # Get total count
    total_items = query.count()
    
    # Calculate pagination values
    total_pages = math.ceil(total_items / page_size) if total_items > 0 else 1
    skip = (page - 1) * page_size
    
    # Get paginated results
    campaigns = query.order_by(Campaign.created_at.desc()).offset(skip).limit(page_size).all()
    
    # Create pagination metadata
    pagination = PaginationMeta(
        current_page=page,
        page_size=page_size,
        total_items=total_items,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1,
        next_page=page + 1 if page < total_pages else None,
        previous_page=page - 1 if page > 1 else None
    )
    
    return campaigns, pagination

def get_campaigns(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    status: Optional[CampaignStatus] = None,
    lang: Optional[str] = None
) -> List[Campaign]:
    """Get all campaigns with optional filtering by status and language (legacy method)."""
    query = db.query(Campaign)
    
    if status:
        query = query.filter(Campaign.status == status)
    
    if lang:
        query = query.filter(Campaign.lang == lang)
    
    return query.order_by(Campaign.created_at.desc()).offset(skip).limit(limit).all()

def get_campaigns_by_creator(
    db: Session, 
    creator_id: int,
    skip: int = 0, 
    limit: int = 100,
    lang: Optional[str] = None
) -> List[Campaign]:
    """Get all campaigns created by a specific user (legacy method)."""
    query = db.query(Campaign).filter(Campaign.creator_id == creator_id)
    
    if lang:
        query = query.filter(Campaign.lang == lang)
    
    return query.order_by(Campaign.created_at.desc()).offset(skip).limit(limit).all()

def update_campaign(db: Session, campaign_id: int, campaign_data: CampaignUpdate):
    """Update an existing campaign."""
    db_campaign = get_campaign_by_id(db, campaign_id)
    if not db_campaign:
        return None
    
    # Update campaign with new data
    update_data = campaign_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_campaign, field, value)
    
    # Update the updated_at timestamp
    db_campaign.updated_at = datetime.now()
    
    # Save changes
    db.commit()
    db.refresh(db_campaign)
    
    return db_campaign

def delete_campaign(db: Session, campaign_id: int):
    """Delete a campaign."""
    db_campaign = get_campaign_by_id(db, campaign_id)
    if not db_campaign:
        return False
    
    db.delete(db_campaign)
    db.commit()
    
    return True

def update_campaign_amount(db: Session, campaign_id: int, amount: float):
    """Update the current_amount of a campaign when a donation is made."""
    db_campaign = get_campaign_by_id(db, campaign_id)
    if not db_campaign:
        return None
    
    # Add the donation amount to the current amount
    db_campaign.current_amount += amount
    
    # Check if target is met and update status if needed
    if db_campaign.current_amount >= db_campaign.target_amount and db_campaign.status == CampaignStatus.ACTIVE:
        db_campaign.status = CampaignStatus.COMPLETED
        
    # Save changes
    db.commit()
    db.refresh(db_campaign)
    
    return db_campaign

def search_campaigns(
    db: Session, 
    keyword: str,
    page: int = 1,
    page_size: int = 10,
    status: Optional[CampaignStatus] = None,
    lang: Optional[str] = None
) -> Tuple[List[Campaign], PaginationMeta]:
    """Search campaigns by keyword with proper pagination metadata and optional language filter."""
    # Build base query
    query = db.query(Campaign)
    
    # Apply search filter if keyword provided
    if keyword and keyword.strip():
        search_term = f"%{keyword.strip()}%"
        query = query.filter(
            or_(
                Campaign.title.ilike(search_term),
                Campaign.description.ilike(search_term),
                Campaign.markdown_text.ilike(search_term)
            )
        )
    
    # Apply status filter if provided
    if status:
        query = query.filter(Campaign.status == status)
    
    # Apply language filter if provided
    if lang:
        query = query.filter(Campaign.lang == lang)
    
    # Get total count
    total_items = query.count()
    
    # Calculate pagination values
    total_pages = math.ceil(total_items / page_size) if total_items > 0 else 1
    skip = (page - 1) * page_size
    
    # Get paginated results
    campaigns = query.order_by(Campaign.created_at.desc()).offset(skip).limit(page_size).all()
    
    # Create pagination metadata
    pagination = PaginationMeta(
        current_page=page,
        page_size=page_size,
        total_items=total_items,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1,
        next_page=page + 1 if page < total_pages else None,
        previous_page=page - 1 if page > 1 else None
    )
    
    return campaigns, pagination