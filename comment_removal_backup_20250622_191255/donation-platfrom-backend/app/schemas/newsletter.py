from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class NewsletterSubscriptionBase(BaseModel):
    email: EmailStr

class NewsletterSubscriptionCreate(NewsletterSubscriptionBase):
    source: Optional[str] = Field(default="footer", description="Source of subscription (footer, campaign_page, etc.)")
    language: Optional[str] = Field(default="en", description="Preferred language for email notifications")

class NewsletterSubscriptionResponse(NewsletterSubscriptionBase):
    id: int
    is_active: bool
    subscribed_at: datetime
    unsubscribed_at: Optional[datetime] = None
    source: Optional[str] = None
    language: Optional[str] = None
    
    class Config:
        from_attributes = True

class NewsletterUnsubscribeRequest(BaseModel):
    email: EmailStr

class NewsletterStats(BaseModel):
    total_subscribers: int
    active_subscribers: int
    inactive_subscribers: int
    recent_subscriptions: int  # last 30 days
