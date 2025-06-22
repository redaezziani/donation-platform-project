from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta

from app.db.models.newsletter import NewsletterSubscription
from app.schemas.newsletter import NewsletterSubscriptionCreate, NewsletterStats

def subscribe_to_newsletter(db: Session, subscription_data: NewsletterSubscriptionCreate) -> Optional[NewsletterSubscription]:
    """Subscribe an email to the newsletter."""
    # Check if email is already subscribed
    existing_subscription = db.query(NewsletterSubscription).filter(
        NewsletterSubscription.email == subscription_data.email
    ).first()
    
    if existing_subscription:
        if existing_subscription.is_active:
            # Already subscribed and active
            return None
        else:
            # Reactivate subscription
            existing_subscription.is_active = True
            existing_subscription.subscribed_at = datetime.now()
            existing_subscription.unsubscribed_at = None
            existing_subscription.source = subscription_data.source
            existing_subscription.language = subscription_data.language or "en"
            db.commit()
            db.refresh(existing_subscription)
            return existing_subscription
    
    # Create new subscription
    db_subscription = NewsletterSubscription(
        email=subscription_data.email,
        source=subscription_data.source,
        language=subscription_data.language or "en"
    )
    
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    
    return db_subscription

def unsubscribe_from_newsletter(db: Session, email: str) -> bool:
    """Unsubscribe an email from the newsletter."""
    subscription = db.query(NewsletterSubscription).filter(
        NewsletterSubscription.email == email
    ).first()
    
    if subscription and subscription.is_active:
        subscription.is_active = False
        subscription.unsubscribed_at = datetime.now()
        db.commit()
        return True
    
    return False

def get_newsletter_subscription(db: Session, email: str) -> Optional[NewsletterSubscription]:
    """Get newsletter subscription by email."""
    return db.query(NewsletterSubscription).filter(
        NewsletterSubscription.email == email
    ).first()

def get_active_subscribers(db: Session) -> List[NewsletterSubscription]:
    """Get all active newsletter subscribers."""
    return db.query(NewsletterSubscription).filter(
        NewsletterSubscription.is_active == True
    ).all()

def get_newsletter_stats(db: Session) -> NewsletterStats:
    """Get newsletter subscription statistics."""
    total_subscribers = db.query(NewsletterSubscription).count()
    active_subscribers = db.query(NewsletterSubscription).filter(
        NewsletterSubscription.is_active == True
    ).count()
    inactive_subscribers = total_subscribers - active_subscribers
    
    # Recent subscriptions (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_subscriptions = db.query(NewsletterSubscription).filter(
        NewsletterSubscription.subscribed_at >= thirty_days_ago
    ).count()
    
    return NewsletterStats(
        total_subscribers=total_subscribers,
        active_subscribers=active_subscribers,
        inactive_subscribers=inactive_subscribers,
        recent_subscriptions=recent_subscriptions
    )

def get_subscribers_paginated(db: Session, page: int = 1, page_size: int = 50) -> List[NewsletterSubscription]:
    """Get paginated list of newsletter subscribers."""
    offset = (page - 1) * page_size
    return db.query(NewsletterSubscription).order_by(
        NewsletterSubscription.subscribed_at.desc()
    ).offset(offset).limit(page_size).all()
