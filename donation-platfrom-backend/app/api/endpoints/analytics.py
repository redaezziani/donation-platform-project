from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

from app.db.database import get_db
from app.db.models.campaign import Campaign
from app.db.models.donation import Donation
from app.auth.jwt import get_current_user
from app.db.models.user import User

router = APIRouter(tags=["analytics"])

# Response models
class WeeklyStats(BaseModel):
    period: str  # Start date of the week (YYYY-MM-DD)
    donations: float  # Total donation amount for the week
    campaigns: int   # Number of active campaigns that week
    donors: int      # Number of unique donors that week

class AnalyticsResponse(BaseModel):
    weekly_stats: List[WeeklyStats]
    total_donations: float
    total_campaigns: int
    total_donors: int

@router.get("/weekly-overview", response_model=AnalyticsResponse)
async def get_weekly_analytics(
    weeks: int = Query(16, ge=1, le=52, description="Number of weeks to include (max 52)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get weekly analytics data for the donation platform.
    Requires authentication and admin privileges.
    """
    # Check if user is admin
    if not current_user.is_admin:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Calculate the start date (weeks ago from today)
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(weeks=weeks)
    
    # Get weekly donation data
    weekly_donation_query = text("""
        SELECT 
            DATE_TRUNC('week', created_at) as week_start,
            COALESCE(SUM(amount), 0) as total_donations,
            COUNT(DISTINCT donor_id) as unique_donors
        FROM donations 
        WHERE created_at >= :start_date 
            AND created_at <= :end_date
            AND payment_status = 'completed'
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY week_start
    """)
    
    donation_results = db.execute(
        weekly_donation_query, 
        {"start_date": start_date, "end_date": end_date}
    ).fetchall()
    
    # Get weekly campaign data (campaigns that were active during each week)
    weekly_campaign_query = text("""
        SELECT 
            DATE_TRUNC('week', :current_date) as week_start,
            COUNT(*) as active_campaigns
        FROM campaigns 
        WHERE created_at <= :current_date
            AND (status = 'active' OR status = 'completed')
        GROUP BY DATE_TRUNC('week', :current_date)
    """)
    
    # Create a list to store weekly stats
    weekly_stats = []
    
    # Generate data for each week in the range
    current_week = start_date
    while current_week <= end_date:
        week_start = current_week.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start_str = week_start.strftime('%Y-%m-%d')
        
        # Find donation data for this week
        week_donations = 0.0
        week_donors = 0
        for row in donation_results:
            if row[0] and row[0].date() == week_start.date():
                week_donations = float(row[1]) if row[1] else 0.0
                week_donors = int(row[2]) if row[2] else 0
                break
        
        # Count active campaigns for this week
        campaigns_count = db.query(Campaign).filter(
            Campaign.created_at <= week_start + timedelta(days=7),
            Campaign.status.in_(['active', 'completed'])
        ).count()
        
        weekly_stats.append(WeeklyStats(
            period=week_start_str,
            donations=week_donations,
            campaigns=campaigns_count,
            donors=week_donors
        ))
        
        current_week += timedelta(weeks=1)
    
    # Calculate totals
    total_donations = sum(stat.donations for stat in weekly_stats)
    total_campaigns = db.query(Campaign).count()
    total_donors_query = db.query(func.count(func.distinct(Donation.donor_id))).filter(
        Donation.payment_status == 'completed'
    ).scalar()
    total_donors = total_donors_query or 0
    
    return AnalyticsResponse(
        weekly_stats=weekly_stats,
        total_donations=total_donations,
        total_campaigns=total_campaigns,
        total_donors=total_donors
    )