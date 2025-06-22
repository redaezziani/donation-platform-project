from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional, List
from app.db.database import get_db
from app.services.payment_service import PaymentService
from app.schemas.donation import DonationCreate, PaymentIntentResponse, DonationResponse, DonationStats
from app.db.models import User, Donation, Campaign
from app.api.deps import get_current_user_optional, get_current_user
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(
    donation_data: DonationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Create Stripe Payment Intent for donation"""
    try:
        # Verify campaign exists and is active
        campaign = db.query(Campaign).filter(Campaign.id == donation_data.campaign_id).first()
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        if campaign.status not in ["active", "pending"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Campaign is not accepting donations"
            )
        
        # Use current user info if available, otherwise use provided data
        donor_email = current_user.email if current_user else donation_data.donor_email
        donor_name = current_user.full_name if current_user else donation_data.donor_name
        
        result = await PaymentService.create_payment_intent(
            campaign_id=donation_data.campaign_id,
            amount=donation_data.amount,
            currency=donation_data.currency,
            donor_email=donor_email,
            donor_name=donor_name,
            is_anonymous=donation_data.is_anonymous,
            message=donation_data.message
        )
        
        logger.info(f"Payment intent created for campaign {donation_data.campaign_id}, amount: {donation_data.amount}")
        return PaymentIntentResponse(**result)
        
    except Exception as e:
        logger.error(f"Error creating payment intent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/confirm-payment/{payment_intent_id}")
async def confirm_payment(
    payment_intent_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Confirm payment and create donation record"""
    try:
        donation = await PaymentService.handle_payment_success(
            db=db,
            payment_intent_id=payment_intent_id,
            donor_id=current_user.id if current_user else None
        )
        
        logger.info(f"Payment confirmed for donation {donation.id}")
        return {
            "message": "Donation successful", 
            "donation_id": donation.id,
            "amount": donation.amount,
            "campaign_id": donation.campaign_id
        }
        
    except Exception as e:
        logger.error(f"Error confirming payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/campaign/{campaign_id}", response_model=List[DonationResponse])
async def get_campaign_donations(
    campaign_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """Get donations for a specific campaign (non-anonymous only)"""
    donations = db.query(Donation).filter(
        Donation.campaign_id == campaign_id,
        Donation.payment_status == "completed",
        Donation.is_anonymous == False
    ).offset(skip).limit(limit).all()
    
    return donations

@router.get("/stats/{campaign_id}", response_model=DonationStats)
async def get_campaign_donation_stats(
    campaign_id: int,
    db: Session = Depends(get_db)
):
    """Get donation statistics for a campaign"""
    from sqlalchemy import func
    
    # Get donation statistics
    stats = db.query(
        func.count(Donation.id).label('total_donations'),
        func.sum(Donation.amount).label('total_amount'),
        func.avg(Donation.amount).label('average_donation')
    ).filter(
        Donation.campaign_id == campaign_id,
        Donation.payment_status == "completed"
    ).first()
    
    # Get recent donations (last 7 days)
    from datetime import datetime, timedelta
    recent_date = datetime.utcnow() - timedelta(days=7)
    recent_donations = db.query(func.count(Donation.id)).filter(
        Donation.campaign_id == campaign_id,
        Donation.payment_status == "completed",
        Donation.created_at >= recent_date
    ).scalar()
    
    return DonationStats(
        total_donations=stats.total_donations or 0,
        total_amount=float(stats.total_amount or 0),
        average_donation=float(stats.average_donation or 0),
        recent_donations=recent_donations or 0
    )

@router.get("/my-donations", response_model=List[DonationResponse])
async def get_my_donations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50
):
    """Get current user's donations"""
    donations = db.query(Donation).filter(
        Donation.donor_id == current_user.id,
        Donation.payment_status == "completed"
    ).offset(skip).limit(limit).all()
    
    return donations

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhooks for payment events"""
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        if not sig_header:
            raise HTTPException(status_code=400, detail="Missing signature")
        
        # Verify webhook signature
        event = PaymentService.verify_webhook_signature(payload, sig_header)
        
        # Handle different event types
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            await PaymentService.handle_payment_success(
                db=db,
                payment_intent_id=payment_intent['id']
            )
            logger.info(f"Webhook: Payment succeeded for {payment_intent['id']}")
            
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            await PaymentService.handle_payment_failure(
                db=db,
                payment_intent_id=payment_intent['id']
            )
            logger.info(f"Webhook: Payment failed for {payment_intent['id']}")
            
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))