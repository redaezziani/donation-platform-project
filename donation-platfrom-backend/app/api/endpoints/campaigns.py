from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.db.models.user import User
from app.db.models.campaign import CampaignStatus
from app.schemas.campaign import (
    CampaignCreate, 
    CampaignUpdate, 
    CampaignResponse,
    CampaignDetailResponse,
    PaginatedCampaignsResponse
)
from app.services.campaign_service import (
    create_campaign,
    get_campaign_by_id,
    get_campaigns,
    get_campaigns_paginated,
    get_campaigns_by_creator,
    get_campaigns_by_creator_paginated,
    update_campaign,
    delete_campaign,
    search_campaigns
)
from app.services.storage_service import storage_service
from app.auth.jwt import get_current_user

router = APIRouter(tags=["campaigns"])

@router.post("/", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_new_campaign(
    title: str = Form(...),
    description: str = Form(...),
    markdown_text: Optional[str] = Form(None),
    target_amount: float = Form(...),
    start_date: Optional[str] = Form(None),
    end_date: Optional[str] = Form(None),
    campaign_status: Optional[str] = Form("draft"),
    lang: str = Form("en", description="Language code (e.g., en, ar, fr, ru)"),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new fundraising campaign with optional image upload.
    This endpoint requires authentication and uses form data for file uploads.
    """
    from datetime import datetime
    
    # Handle image upload if provided
    image_path = None
    if image:
        image_path = await storage_service.save_campaign_image(image)
    
    # Parse dates if provided and valid
    parsed_start_date = None
    parsed_end_date = None
    
    if start_date and start_date.strip() and start_date.lower() != "string":
        try:
            # Try to parse the date - handle both with and without 'Z' suffix
            date_str = start_date.strip()
            if date_str.endswith('Z'):
                date_str = date_str.replace('Z', '+00:00')
            parsed_start_date = datetime.fromisoformat(date_str)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid start_date format: '{start_date}'. Use ISO format (YYYY-MM-DDTHH:MM:SS or YYYY-MM-DDTHH:MM:SSZ)"
            )
    
    if end_date and end_date.strip() and end_date.lower() != "string":
        try:
            # Try to parse the date - handle both with and without 'Z' suffix
            date_str = end_date.strip()
            if date_str.endswith('Z'):
                date_str = date_str.replace('Z', '+00:00')
            parsed_end_date = datetime.fromisoformat(date_str)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid end_date format: '{end_date}'. Use ISO format (YYYY-MM-DDTHH:MM:SS or YYYY-MM-DDTHH:MM:SSZ)"
            )
    
    # Validate target_amount
    if target_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target amount must be greater than 0"
        )
    
    # Parse status
    parsed_campaign_status = CampaignStatus.DRAFT
    if campaign_status and campaign_status.strip():
        try:
            requested_status = campaign_status.lower().strip()
            parsed_campaign_status = CampaignStatus(requested_status)
            
            # If user is not an admin and trying to set status to ACTIVE, enforce PENDING
            if not current_user.is_admin and (parsed_campaign_status == CampaignStatus.ACTIVE 
                                          or parsed_campaign_status == CampaignStatus.COMPLETED):
                parsed_campaign_status = CampaignStatus.PENDING
                
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{campaign_status}'. Must be one of: {', '.join([s.value for s in CampaignStatus])}"
            )
    
    # If non-admin user is trying to publish a campaign, set to PENDING
    if not current_user.is_admin and parsed_campaign_status != CampaignStatus.DRAFT:
        parsed_campaign_status = CampaignStatus.PENDING
    
    campaign_data = CampaignCreate(
        title=title,
        description=description,
        markdown_text=markdown_text,
        target_amount=target_amount,
        start_date=parsed_start_date,
        end_date=parsed_end_date,
        status=parsed_campaign_status,
        image_path=image_path,
        lang=lang
    )
    
    return create_campaign(db, campaign_data, current_user.id)

@router.post("/json", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign_json(
    campaign_data: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new fundraising campaign using JSON data (no file upload).
    This endpoint requires authentication and accepts JSON data.
    Non-admin users will have their campaigns set to 'pending' status by default.
    """
    # If user is not an admin, enforce 'pending' status for non-draft campaigns
    if not current_user.is_admin and campaign_data.status != CampaignStatus.DRAFT:
        campaign_data.status = CampaignStatus.PENDING
        
    return create_campaign(db, campaign_data, current_user.id)

@router.post("/{campaign_id}/upload-image")
async def upload_campaign_image(
    campaign_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload or update the image for an existing campaign.
    This endpoint requires authentication and the user must be the campaign creator.
    """
    existing_campaign = get_campaign_by_id(db, campaign_id)
    
    if not existing_campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    # Check permissions
    if existing_campaign.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this campaign"
        )
    
    # Delete old image if it exists
    if existing_campaign.image_path:
        storage_service.delete_campaign_image(existing_campaign.image_path)
    
    # Save new image
    image_path = await storage_service.save_campaign_image(image)
    
    # Update campaign with new image path
    campaign_update = CampaignUpdate(image_path=image_path)
    updated_campaign = update_campaign(db, campaign_id, campaign_update)
    
    return {
        "message": "Image uploaded successfully",
        "image_path": image_path,
        "image_url": storage_service.get_image_url(image_path)
    }

@router.get("/paginated", response_model=PaginatedCampaignsResponse)
async def read_campaigns_paginated(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    status: Optional[CampaignStatus] = Query(None, description="Filter by campaign status"),
    lang: Optional[str] = Query(None, description="Filter by language code (e.g., en, ar, fr, ru)"),
    db: Session = Depends(get_db)
):
    """
    Retrieve campaigns with proper pagination metadata and optional language filtering.
    Returns paginated results with frontend-friendly metadata including:
    - Current page info
    - Total pages and items
    - Next/Previous page numbers
    - Navigation flags
    """
    campaigns, pagination = get_campaigns_paginated(db, page, page_size, status, lang)
    
    return PaginatedCampaignsResponse(
        items=campaigns,
        pagination=pagination
    )

@router.get("/search", response_model=PaginatedCampaignsResponse)
async def search_campaigns_endpoint(
    keyword: str = Query(..., description="Search keyword to find matching campaigns"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    status: Optional[CampaignStatus] = Query(None, description="Filter by campaign status"),
    lang: Optional[str] = Query(None, description="Filter by language code (e.g., en, ar, fr, ru)"),
    db: Session = Depends(get_db)
):
    """
    Search campaigns by keyword with proper pagination metadata and optional language filtering.
    This endpoint performs a search across campaign titles, descriptions, and content,
    returning campaigns that match the provided keyword and language.
    """
    campaigns, pagination = search_campaigns(db, keyword, page, page_size, status, lang)
    
    return PaginatedCampaignsResponse(
        items=campaigns,
        pagination=pagination
    )

@router.get("/me/paginated", response_model=PaginatedCampaignsResponse)
async def read_my_campaigns_paginated(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    lang: Optional[str] = Query(None, description="Filter by language code (e.g., en, ar, fr, ru)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve user's campaigns with proper pagination metadata and optional language filtering.
    This endpoint requires authentication and returns paginated results
    with frontend-friendly metadata.
    """
    campaigns, pagination = get_campaigns_by_creator_paginated(db, current_user.id, page, page_size, lang)
    
    return PaginatedCampaignsResponse(
        items=campaigns,
        pagination=pagination
    )

@router.get("/", response_model=List[CampaignResponse])
async def read_campaigns(
    skip: int = 0,
    limit: int = 100,
    status: Optional[CampaignStatus] = None,
    lang: Optional[str] = Query(None, description="Filter by language code (e.g., en, ar, fr, ru)"),
    db: Session = Depends(get_db)
):
    """
    Retrieve all campaigns with optional status and language filter (legacy endpoint).
    For better frontend support, use /paginated endpoint instead.
    """
    return get_campaigns(db, skip, limit, status, lang)

@router.get("/me", response_model=List[CampaignResponse])
async def read_my_campaigns(
    skip: int = 0,
    limit: int = 100,
    lang: Optional[str] = Query(None, description="Filter by language code (e.g., en, ar, fr, ru)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all campaigns created by the authenticated user with optional language filtering.
    This endpoint requires authentication.
    """
    return get_campaigns_by_creator(db, current_user.id, skip, limit, lang)

@router.get("/public", response_model=PaginatedCampaignsResponse)
async def read_public_campaigns_paginated(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    lang: Optional[str] = Query(None, description="Filter by language code (e.g., en, ar, fr, ru)"),
    db: Session = Depends(get_db)
):
    """
    Retrieve only active campaigns that have been approved by admins with optional language filtering.
    This endpoint is meant for public display on the home page.
    """
    # Enforce ACTIVE status for public display
    campaigns, pagination = get_campaigns_paginated(db, page, page_size, CampaignStatus.ACTIVE, lang)
    
    return PaginatedCampaignsResponse(
        items=campaigns,
        pagination=pagination
    )

@router.get("/admin/paginated", response_model=PaginatedCampaignsResponse)
async def read_admin_campaigns_paginated(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    status: Optional[CampaignStatus] = Query(None, description="Filter by campaign status"),
    lang: Optional[str] = Query(None, description="Filter by language code (e.g., en, ar, fr, ru). If not provided, shows all languages"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin endpoint to retrieve all campaigns with proper pagination metadata.
    Shows campaigns in ALL languages by default unless lang parameter is specified.
    This endpoint requires authentication and admin privileges.
    """
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Note: We pass lang=None by default to show all languages for admin
    campaigns, pagination = get_campaigns_paginated(db, page, page_size, status, lang)
    
    return PaginatedCampaignsResponse(
        items=campaigns,
        pagination=pagination
    )

@router.get("/{campaign_id}", response_model=CampaignDetailResponse)
async def read_campaign(
    campaign_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific campaign by ID.
    """
    campaign = get_campaign_by_id(db, campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    return campaign

@router.put("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign_details(
    campaign_id: int,
    campaign_data: CampaignUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a campaign.
    This endpoint requires authentication and the user must be the campaign creator or an admin.
    """
    existing_campaign = get_campaign_by_id(db, campaign_id)
    
    if not existing_campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    # Check permissions
    if existing_campaign.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this campaign"
        )
    
    updated_campaign = update_campaign(db, campaign_id, campaign_data)
    return updated_campaign

@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campaign_endpoint(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a campaign.
    This endpoint requires authentication and the user must be the campaign creator or an admin.
    """
    existing_campaign = get_campaign_by_id(db, campaign_id)
    
    if not existing_campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    # Check permissions
    if existing_campaign.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this campaign"
        )
    
    delete_result = delete_campaign(db, campaign_id)
    
    if not delete_result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete the campaign"
        )
    
    return None

