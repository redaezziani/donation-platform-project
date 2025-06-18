from pydantic import BaseModel, Field
from typing import Optional, List, Generic, TypeVar
from datetime import datetime
from app.db.models.campaign import CampaignStatus

# Generic type for pagination
T = TypeVar('T')

class PaginationMeta(BaseModel):
    """Pagination metadata for frontend"""
    current_page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_previous: bool
    next_page: Optional[int] = None
    previous_page: Optional[int] = None

class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response"""
    items: List[T]
    pagination: PaginationMeta

class CampaignBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str
    markdown_text: Optional[str] = None  # Optional markdown text for detailed campaign explanation
    target_amount: float = Field(..., gt=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    image_path: Optional[str] = None  # Changed from image_url to image_path
    status: Optional[CampaignStatus] = CampaignStatus.DRAFT
    
class CampaignCreate(CampaignBase):
    pass
    
class CampaignUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    markdown_text: Optional[str] = None  # Optional markdown text for detailed campaign explanation
    target_amount: Optional[float] = Field(None, gt=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    image_path: Optional[str] = None  # Changed from image_url to image_path
    status: Optional[CampaignStatus] = None

class CampaignResponse(CampaignBase):
    id: int
    creator_id: int
    current_amount: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        
class CampaignDetailResponse(CampaignResponse):
    """Schema for detailed campaign response that may include additional data"""
    # Could be extended to include donor information, comments, etc.
    pass

# Specific paginated responses
class PaginatedCampaignsResponse(BaseModel):
    """Paginated campaigns response"""
    items: List[CampaignResponse]
    pagination: PaginationMeta