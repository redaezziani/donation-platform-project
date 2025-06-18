from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime


class DonationCreate(BaseModel):
    campaign_id: int
    amount: float = Field(..., gt=0, description="Donation amount must be greater than 0")
    currency: str = Field(default="usd", description="Currency code")
    donor_email: Optional[EmailStr] = None
    donor_name: Optional[str] = None
    is_anonymous: bool = False
    message: Optional[str] = Field(None, max_length=500)


class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str


class DonationResponse(BaseModel):
    id: int
    amount: float
    currency: str
    payment_status: str
    is_anonymous: bool
    message: Optional[str]
    created_at: datetime
    campaign_id: int
    donor_id: Optional[int]
    
    class Config:
        from_attributes = True


class DonationStats(BaseModel):
    total_donations: int
    total_amount: float
    average_donation: float
    recent_donations: int