import stripe
from typing import Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.models import Donation, Campaign
from app.services.campaign_service import update_campaign_amount

# Initialize Stripe with secret key
stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentService:
    @staticmethod
    async def create_payment_intent(
        campaign_id: int,
        amount: float,
        currency: str = "usd",
        donor_email: Optional[str] = None,
        donor_name: Optional[str] = None,
        is_anonymous: bool = False,
        message: Optional[str] = None
    ):
        """Create a Stripe Payment Intent for campaign donation"""
        try:
            # Convert amount to cents (Stripe uses smallest currency unit)
            amount_cents = int(amount * 100)
            
            # Create payment intent with metadata
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency,
                metadata={
                    'campaign_id': str(campaign_id),
                    'donor_email': donor_email or 'anonymous',
                    'donor_name': donor_name or 'Anonymous',
                    'is_anonymous': str(is_anonymous),
                    'message': message or ''
                },
                receipt_email=donor_email if not is_anonymous and donor_email else None,
                description=f"Donation for Campaign #{campaign_id}"
            )
            
            return {
                'client_secret': payment_intent.client_secret,
                'payment_intent_id': payment_intent.id
            }
            
        except stripe.error.StripeError as e:
            raise Exception(f"Stripe error: {str(e)}")
        except Exception as e:
            raise Exception(f"Payment creation error: {str(e)}")

    @staticmethod
    async def handle_payment_success(
        db: Session,
        payment_intent_id: str,
        donor_id: Optional[int] = None
    ):
        """Handle successful payment and create donation record"""
        try:
            # Retrieve payment intent from Stripe
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if payment_intent.status == 'succeeded':
                metadata = payment_intent.metadata
                campaign_id = int(metadata['campaign_id'])
                amount = payment_intent.amount / 100  # Convert from cents
                
                # Check if donation already exists to prevent duplicates
                existing_donation = db.query(Donation).filter(
                    Donation.payment_id == payment_intent_id
                ).first()
                
                if existing_donation:
                    return existing_donation
                
                # Create donation record
                donation = Donation(
                    amount=amount,
                    currency=payment_intent.currency.upper(),
                    payment_status="completed",
                    payment_id=payment_intent_id,
                    donor_id=donor_id,
                    campaign_id=campaign_id,
                    is_anonymous=metadata.get('is_anonymous', 'False') == 'True',
                    message=metadata.get('message', '') or None
                )
                
                db.add(donation)
                db.commit()
                db.refresh(donation)
                
                # Update campaign amount and check if target reached
                update_campaign_amount(db, campaign_id, amount)
                
                return donation
            else:
                raise Exception(f"Payment not successful. Status: {payment_intent.status}")
                
        except stripe.error.StripeError as e:
            raise Exception(f"Stripe error: {str(e)}")
        except Exception as e:
            raise Exception(f"Payment processing error: {str(e)}")

    @staticmethod
    async def handle_payment_failure(
        db: Session,
        payment_intent_id: str,
        donor_id: Optional[int] = None
    ):
        """Handle failed payment"""
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            metadata = payment_intent.metadata
            
            # Create failed donation record for tracking
            donation = Donation(
                amount=payment_intent.amount / 100,
                currency=payment_intent.currency.upper(),
                payment_status="failed",
                payment_id=payment_intent_id,
                donor_id=donor_id,
                campaign_id=int(metadata['campaign_id']),
                is_anonymous=metadata.get('is_anonymous', 'False') == 'True',
                message=metadata.get('message', '') or None
            )
            
            db.add(donation)
            db.commit()
            db.refresh(donation)
            
            return donation
            
        except Exception as e:
            raise Exception(f"Failed payment handling error: {str(e)}")

    @staticmethod
    def verify_webhook_signature(payload: bytes, sig_header: str) -> dict:
        """Verify Stripe webhook signature"""
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
            return event
        except ValueError as e:
            raise Exception("Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            raise Exception("Invalid signature")