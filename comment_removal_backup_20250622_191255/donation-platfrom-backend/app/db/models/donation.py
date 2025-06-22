from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

class Donation(Base):
    __tablename__ = "donations"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    message = Column(Text)
    is_anonymous = Column(Boolean, default=False)
    payment_status = Column(String(20), default="pending")  # pending, completed, failed
    payment_id = Column(String(255))  # External payment gateway ID
    
    # Foreign keys
    donor_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Can be null for anonymous donations
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    
    # Relationships
    donor = relationship("User", backref="donations")
    campaign = relationship("Campaign", back_populates="donations")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())