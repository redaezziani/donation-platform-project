from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.newsletter import (
    NewsletterSubscriptionCreate,
    NewsletterSubscriptionResponse,
    NewsletterUnsubscribeRequest,
    NewsletterStats
)
from app.services.newsletter_service import (
    subscribe_to_newsletter,
    unsubscribe_from_newsletter,
    get_newsletter_subscription,
    get_newsletter_stats,
    get_subscribers_paginated,
    get_active_subscribers
)
from app.auth.jwt import get_current_user
from app.db.models.user import User

router = APIRouter(tags=["newsletter"])

@router.post("/subscribe", response_model=NewsletterSubscriptionResponse)
async def subscribe_newsletter(
    subscription_data: NewsletterSubscriptionCreate,
    db: Session = Depends(get_db)
):
    """Subscribe to newsletter."""
    subscription = subscribe_to_newsletter(db, subscription_data)
    
    if subscription is None:
        # Email already subscribed and active
        existing = get_newsletter_subscription(db, subscription_data.email)
        if existing and existing.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already subscribed to the newsletter"
            )
    
    if subscription is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to subscribe to newsletter"
        )
    
    return subscription

@router.post("/unsubscribe")
async def unsubscribe_newsletter(
    unsubscribe_data: NewsletterUnsubscribeRequest,
    db: Session = Depends(get_db)
):
    """Unsubscribe from newsletter."""
    success = unsubscribe_from_newsletter(db, unsubscribe_data.email)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found or already unsubscribed"
        )
    
    return {"message": "Successfully unsubscribed from newsletter"}

@router.get("/subscription/{email}", response_model=NewsletterSubscriptionResponse)
async def get_subscription_status(
    email: str,
    db: Session = Depends(get_db)
):
    """Get subscription status for an email."""
    subscription = get_newsletter_subscription(db, email)
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found in newsletter subscriptions"
        )
    
    return subscription

@router.get("/stats", response_model=NewsletterStats)
async def get_newsletter_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get newsletter statistics (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access newsletter statistics"
        )
    
    return get_newsletter_stats(db)

@router.get("/subscribers", response_model=List[NewsletterSubscriptionResponse])
async def get_newsletter_subscribers(
    page: int = 1,
    page_size: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get newsletter subscribers (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access newsletter subscribers"
        )
    
    if page_size > 100:
        page_size = 100  # Limit page size
    
    subscribers = get_subscribers_paginated(db, page, page_size)
    return subscribers

@router.post("/test-email")
async def test_email_notification(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Test email notification system (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can test email notifications"
        )
    
    try:
        from app.services.email_service import email_service
        from app.db.models.campaign import Campaign
        from datetime import datetime, timedelta
        
        # Get active subscribers
        subscribers = get_active_subscribers(db)
        
        if not subscribers:
            return {"message": "No newsletter subscribers found. Subscribe first to test emails."}
        
        # Create a mock campaign for testing
        mock_campaign = Campaign(
            id=999,
            title="🧪 Test Campaign - Email Notification System",
            description="This is a test campaign to verify that email notifications are working properly. If you received this email, the newsletter system is functioning correctly!",
            target_amount=1000.0,
            current_amount=250.0,
            end_date=datetime.now() + timedelta(days=30),
            lang="en"
        )
        
        print(f"🧪 Testing email notification system...")
        print(f"   Admin: {current_user.email}")
        print(f"   Subscribers found: {len(subscribers)}")
        
        # Send test notification
        email_service.send_new_campaign_notification(db, mock_campaign)
        
        return {
            "message": f"Test email notification triggered for {len(subscribers)} subscribers",
            "subscribers": len(subscribers),
            "emails": [sub.email for sub in subscribers],
            "test_campaign": {
                "title": mock_campaign.title,
                "description": mock_campaign.description
            }
        }
        
    except Exception as e:
        print(f"❌ Test email error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test email: {str(e)}"
        )

@router.post("/test-campaign")
async def create_test_campaign(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a real test campaign to trigger email notifications (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create test campaigns"
        )
    
    try:
        from app.services.campaign_service import create_campaign
        from app.schemas.campaign import CampaignCreate
        from app.db.models.campaign import CampaignStatus
        from datetime import datetime, timedelta
        
        # Create campaign data
        campaign_data = CampaignCreate(
            title="🧪 Newsletter Test Campaign",
            description="This campaign was created to test the newsletter email notification system. When this campaign was published, all newsletter subscribers should have received an email notification.",
            markdown_text="# Newsletter Test Campaign\n\nThis is a test campaign created by the admin to verify that:\n\n- Newsletter subscriptions are working\n- Email notifications are sent when campaigns are published\n- The email templates look good\n\n**If you received this email, everything is working perfectly!**",
            target_amount=500.0,
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(days=30),
            status=CampaignStatus.ACTIVE,  # This will trigger email notification
            lang="en"
        )
        
        # Create the campaign (this will trigger the email notification)
        campaign = create_campaign(db, campaign_data, current_user.id)
        
        # Get subscriber count
        subscribers = get_active_subscribers(db)
        
        return {
            "message": f"Test campaign created successfully! Email notifications sent to {len(subscribers)} subscribers.",
            "campaign": {
                "id": campaign.id,
                "title": campaign.title,
                "status": campaign.status
            },
            "subscribers_notified": len(subscribers)
        }
        
    except Exception as e:
        print(f"❌ Test campaign creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create test campaign: {str(e)}"
        )
