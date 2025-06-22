from sqlalchemy.orm import Session
from sqlalchemy import func, text, extract
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict

from app.db.models.campaign import Campaign, CampaignStatus
from app.db.models.donation import Donation
from app.db.models.category import Category
from app.db.models.user import User
from app.db.models.newsletter import NewsletterSubscription

class AnalyticsService:
    """Service for generating analytics data for the admin dashboard."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_overview_stats(self) -> Dict[str, Any]:
        """Get overview statistics for the dashboard."""
        # Total campaigns by status
        total_campaigns = self.db.query(Campaign).count()
        active_campaigns = self.db.query(Campaign).filter(Campaign.status == CampaignStatus.ACTIVE).count()
        completed_campaigns = self.db.query(Campaign).filter(Campaign.status == CampaignStatus.COMPLETED).count()
        draft_campaigns = self.db.query(Campaign).filter(Campaign.status == CampaignStatus.DRAFT).count()
        pending_campaigns = self.db.query(Campaign).filter(Campaign.status == CampaignStatus.PENDING).count()
        
        # Total donations and amount
        donation_stats = self.db.query(
            func.count(Donation.id).label('total_donations'),
            func.coalesce(func.sum(Donation.amount), 0).label('total_amount')
        ).filter(Donation.payment_status == 'completed').first()
        
        # Total users
        total_users = self.db.query(User).count()
        
        # Newsletter subscribers
        active_subscribers = self.db.query(NewsletterSubscription).filter(
            NewsletterSubscription.is_active == True
        ).count()
        
        # Recent activity (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_campaigns = self.db.query(Campaign).filter(
            Campaign.created_at >= thirty_days_ago
        ).count()
        
        recent_donations = self.db.query(Donation).filter(
            Donation.created_at >= thirty_days_ago,
            Donation.payment_status == 'completed'
        ).count()
        
        # Calculate average donation
        avg_donation = 0
        if donation_stats.total_donations > 0:
            avg_donation = donation_stats.total_amount / donation_stats.total_donations
        
        return {
            'campaigns': {
                'total': total_campaigns,
                'active': active_campaigns,
                'completed': completed_campaigns,
                'draft': draft_campaigns,
                'pending': pending_campaigns,
                'recent': recent_campaigns
            },
            'donations': {
                'total_count': donation_stats.total_donations or 0,
                'total_amount': donation_stats.total_amount or 0,
                'average_amount': round(avg_donation, 2),
                'recent_count': recent_donations
            },
            'users': {
                'total': total_users
            },
            'newsletter': {
                'active_subscribers': active_subscribers
            }
        }
    
    def get_donation_trends(self, days: int = 30) -> List[Dict[str, Any]]:
        """Get donation trends over the specified number of days."""
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days-1)
        
        # Query donations grouped by date
        donations_by_date = self.db.query(
            func.date(Donation.created_at).label('date'),
            func.count(Donation.id).label('count'),
            func.coalesce(func.sum(Donation.amount), 0).label('amount')
        ).filter(
            Donation.created_at >= start_date,
            Donation.payment_status == 'completed'
        ).group_by(func.date(Donation.created_at)).all()
        
        # Create a dictionary for quick lookup
        donations_dict = {
            donation.date: {
                'count': donation.count,
                'amount': float(donation.amount)
            }
            for donation in donations_by_date
        }
        
        # Generate data for all days in range
        result = []
        for i in range(days):
            date = start_date + timedelta(days=i)
            data = donations_dict.get(date, {'count': 0, 'amount': 0})
            result.append({
                'date': date.strftime('%Y-%m-%d'),
                'day': date.strftime('%b %d'),
                'donations': data['count'],
                'amount': data['amount']
            })
        
        return result
    
    def get_campaign_status_distribution(self) -> List[Dict[str, Any]]:
        """Get campaign distribution by status."""
        status_counts = self.db.query(
            Campaign.status,
            func.count(Campaign.id).label('count')
        ).group_by(Campaign.status).all()
        
        # Define colors and labels for each status
        status_config = {
            CampaignStatus.ACTIVE: {'label': 'Active', 'color': '#22c55e'},
            CampaignStatus.COMPLETED: {'label': 'Completed', 'color': '#3b82f6'},
            CampaignStatus.DRAFT: {'label': 'Draft', 'color': '#64748b'},
            CampaignStatus.PENDING: {'label': 'Pending', 'color': '#f59e0b'},
            CampaignStatus.CANCELLED: {'label': 'Cancelled', 'color': '#ef4444'}
        }
        
        result = []
        for status, count in status_counts:
            config = status_config.get(status, {'label': status.value.title(), 'color': '#64748b'})
            result.append({
                'status': status.value,
                'label': config['label'],
                'count': count,
                'fill': config['color']
            })
        
        return result
    
    def get_category_distribution(self) -> List[Dict[str, Any]]:
        """Get campaign distribution by category."""
        # Query campaigns with their categories
        category_counts = self.db.query(
            Category.name,
            Category.color,
            func.count(Campaign.id).label('count')
        ).join(
            Campaign.categories
        ).group_by(Category.id, Category.name, Category.color).all()
        
        result = []
        for category_name, color, count in category_counts:
            result.append({
                'category': category_name,
                'count': count,
                'fill': color or '#64748b'  # Fallback color if none set
            })
        
        return result
    
    def get_monthly_revenue_trends(self, months: int = 12) -> List[Dict[str, Any]]:
        """Get monthly revenue trends."""
        # Calculate start date
        end_date = datetime.now()
        start_date = end_date - timedelta(days=months * 30)
        
        # Query donations grouped by month
        monthly_revenue = self.db.query(
            extract('year', Donation.created_at).label('year'),
            extract('month', Donation.created_at).label('month'),
            func.coalesce(func.sum(Donation.amount), 0).label('revenue'),
            func.count(Donation.id).label('donation_count')
        ).filter(
            Donation.created_at >= start_date,
            Donation.payment_status == 'completed'
        ).group_by(
            extract('year', Donation.created_at),
            extract('month', Donation.created_at)
        ).order_by(
            extract('year', Donation.created_at),
            extract('month', Donation.created_at)
        ).all()
        
        result = []
        for year, month, revenue, count in monthly_revenue:
            month_name = datetime(int(year), int(month), 1).strftime('%b %Y')
            result.append({
                'month': month_name,
                'revenue': float(revenue),
                'donations': count
            })
        
        return result
    
    def get_top_campaigns(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get top campaigns by donation amount."""
        top_campaigns = self.db.query(
            Campaign.id,
            Campaign.title,
            Campaign.target_amount,
            Campaign.current_amount,
            Campaign.status,
            func.count(Donation.id).label('donation_count')
        ).join(
            Donation, Campaign.id == Donation.campaign_id
        ).filter(
            Donation.payment_status == 'completed'
        ).group_by(
            Campaign.id
        ).order_by(
            Campaign.current_amount.desc()
        ).limit(limit).all()
        
        result = []
        for campaign in top_campaigns:
            progress_percentage = 0
            if campaign.target_amount > 0:
                progress_percentage = (campaign.current_amount / campaign.target_amount) * 100
            
            result.append({
                'id': campaign.id,
                'title': campaign.title,
                'target_amount': float(campaign.target_amount),
                'current_amount': float(campaign.current_amount),
                'progress_percentage': round(progress_percentage, 1),
                'donation_count': campaign.donation_count,
                'status': campaign.status.value
            })
        
        return result
    
    def get_user_growth(self, days: int = 30) -> List[Dict[str, Any]]:
        """Get user registration trends."""
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days-1)
        
        # Query user registrations grouped by date
        users_by_date = self.db.query(
            func.date(User.created_at).label('date'),
            func.count(User.id).label('new_users')
        ).filter(
            User.created_at >= start_date
        ).group_by(func.date(User.created_at)).all()
        
        # Create a dictionary for quick lookup
        users_dict = {user.date: user.new_users for user in users_by_date}
        
        # Generate data for all days in range
        result = []
        cumulative_users = self.db.query(User).filter(User.created_at < start_date).count()
        
        for i in range(days):
            date = start_date + timedelta(days=i)
            new_users = users_dict.get(date, 0)
            cumulative_users += new_users
            
            result.append({
                'date': date.strftime('%Y-%m-%d'),
                'day': date.strftime('%b %d'),
                'new_users': new_users,
                'total_users': cumulative_users
            })
        
        return result

def get_analytics_data(db: Session) -> Dict[str, Any]:
    """Get all analytics data for the admin dashboard."""
    analytics = AnalyticsService(db)
    
    return {
        'overview': analytics.get_overview_stats(),
        'donation_trends': analytics.get_donation_trends(30),
        'campaign_status': analytics.get_campaign_status_distribution(),
        'category_distribution': analytics.get_category_distribution(),
        'monthly_revenue': analytics.get_monthly_revenue_trends(12),
        'top_campaigns': analytics.get_top_campaigns(5),
        'user_growth': analytics.get_user_growth(30)
    }
