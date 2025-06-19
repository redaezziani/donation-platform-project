from sqlalchemy import Column, Integer, ForeignKey, Table
from app.db.database import Base

# Association table for many-to-many relationship between campaigns and categories
campaign_categories = Table(
    'campaign_categories',
    Base.metadata,
    Column('campaign_id', Integer, ForeignKey('campaigns.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
)
