from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.database import Base

class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING = "pending"  # Added status for campaigns pending admin approval
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    markdown_text = Column(Text, nullable=True)  # Optional markdown text for detailed campaign explanation
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    status = Column(Enum(CampaignStatus), default=CampaignStatus.DRAFT)
    image_path = Column(String(255))  # Changed from image_url to image_path for file uploads
    lang = Column(String(10), default="en", nullable=False)  # Language field for multi-language support
    
    # Foreign keys
    creator_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    creator = relationship("User", backref="campaigns")
    donations = relationship("Donation", back_populates="campaign")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())