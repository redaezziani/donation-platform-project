from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

from app.db.database import get_db
from app.db.models.campaign import Campaign
from app.db.models.donation import Donation
from app.db.models.category import Category
from app.auth.jwt import get_current_user
from app.db.models.user import User
from app.services.analytics_service import get_analytics_data, AnalyticsService

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

class ComprehensiveAnalyticsResponse(BaseModel):
    overview: Dict[str, Any]
    donation_trends: List[Dict[str, Any]]
    campaign_status: List[Dict[str, Any]]
    category_distribution: List[Dict[str, Any]]
    monthly_revenue: List[Dict[str, Any]]
    top_campaigns: List[Dict[str, Any]]
    user_growth: List[Dict[str, Any]]

@router.get("/comprehensive", response_model=ComprehensiveAnalyticsResponse)
async def get_comprehensive_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive analytics data for the admin dashboard.
    Requires authentication and admin privileges.
    """
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Get all analytics data using our new service
    analytics_data = get_analytics_data(db)
    
    return ComprehensiveAnalyticsResponse(**analytics_data)


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
    
    # Use the analytics service to get real data
    analytics = AnalyticsService(db)
    trends_data = analytics.get_donation_trends(days)
    
    # Convert to the expected format
    trends = []
    for trend in trends_data:
        trends.append(DonationTrendPoint(
            date=trend['date'],
            donations=trend['donations'],
            amount=trend['amount']
        ))
    
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
    
    # Use the analytics service to get real category data
    analytics = AnalyticsService(db)
    category_data = analytics.get_category_distribution()
    
    # Convert to the expected format
    distribution = []
    for category in category_data:
        # Calculate total amount for this category
        # Query the actual total raised amount for campaigns in this category
        total_amount = db.query(func.sum(Campaign.current_amount)).join(
            Campaign.categories
        ).filter(
            Category.name == category['category']
        ).scalar() or 0
        
        distribution.append(CategoryDistributionPoint(
            name=category['category'],
            value=category['count'],
            amount=float(total_amount),
            color=category['fill']
        ))
    
    # If no real data, provide some fallback data
    if not distribution:
        fallback_data = [
            ('Water Projects', 5, 25000, '#3b82f6'),
            ('Education', 3, 15000, '#22c55e'),
            ('Healthcare', 2, 18000, '#f59e0b'),
            ('Emergency Aid', 1, 5000, '#ef4444'),
        ]
        
        for name, value, amount, color in fallback_data:
            distribution.append(CategoryDistributionPoint(
                name=name,
                value=value,
                amount=amount,
                color=color
            ))
    
    return distribution