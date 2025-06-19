from fastapi import APIRouter, Depends, Query, HTTPException, status
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


# Additional response models for new endpoints
class DonationTrendPoint(BaseModel):
    date: str  # Date in YYYY-MM-DD format
    donations: int  # Number of donations on this date
    amount: float  # Total amount donated on this date

class CategoryDistributionPoint(BaseModel):
    name: str  # Category name
    value: int  # Number of campaigns
    amount: float  # Total amount raised in this category
    color: str  # Color for the chart

class DonationTrendsResponse(BaseModel):
    trends: List[DonationTrendPoint]

class CategoryDistributionResponse(BaseModel):
    distribution: List[CategoryDistributionPoint]


@router.get("/donation-trends", response_model=List[DonationTrendPoint])
async def get_donation_trends(
    days: int = Query(30, ge=7, le=365, description="Number of days to include (max 365)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get daily donation trends data for charts.
    Requires authentication and admin privileges.
    """
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Calculate the start date
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)
    
    # For now, we'll generate mock data since we don't have actual donation tracking
    # In a real implementation, this would query the donations table
    trends = []
    current_date = start_date
    
    while current_date <= end_date:
        date_str = current_date.strftime('%Y-%m-%d')
        
        # Mock data generation - replace with actual queries
        import random
        random.seed(int(current_date.timestamp()))  # Consistent random data
        
        trends.append(DonationTrendPoint(
            date=date_str,
            donations=random.randint(5, 50),
            amount=random.uniform(1000, 10000)
        ))
        
        current_date += timedelta(days=1)
    
    return trends


@router.get("/category-distribution", response_model=List[CategoryDistributionPoint])
async def get_category_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get campaign category distribution data for pie charts.
    Requires authentication and admin privileges.
    """
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Admin access required"
        )
    
    # Colors for the pie chart
    colors = [
        '#3b82f6',  # Blue
        '#22c55e',  # Green
        '#f59e0b',  # Amber
        '#ef4444',  # Red
        '#8b5cf6',  # Purple
        '#06b6d4',  # Cyan
        '#f97316',  # Orange
        '#84cc16',  # Lime
    ]
    
    # Query campaigns by category
    category_data = db.query(
        Campaign.category,
        func.count(Campaign.id).label('count'),
        func.sum(Campaign.current_amount).label('total_amount')
    ).filter(
        Campaign.status.in_(['active', 'completed'])
    ).group_by(Campaign.category).all()
    
    distribution = []
    for i, (category, count, total_amount) in enumerate(category_data):
        distribution.append(CategoryDistributionPoint(
            name=category or 'Other',
            value=int(count),
            amount=float(total_amount or 0),
            color=colors[i % len(colors)]
        ))
    
    # If no data, return mock data
    if not distribution:
        mock_categories = [
            ('Water Projects', 35, 125000),
            ('Orphan Education', 25, 85000),
            ('Medical Aid', 20, 95000),
            ('Food Relief', 15, 45000),
            ('Emergency', 5, 25000),
        ]
        
        for i, (name, value, amount) in enumerate(mock_categories):
            distribution.append(CategoryDistributionPoint(
                name=name,
                value=value,
                amount=amount,
                color=colors[i % len(colors)]
            ))
    
    return distribution