import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException
import shutil

class StorageService:
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = Path(upload_dir)
        self.campaign_images_dir = self.upload_dir / "campaigns"
        
        # Create directories if they don't exist
        self.campaign_images_dir.mkdir(parents=True, exist_ok=True)
    
    async def save_campaign_image(self, file: UploadFile) -> str:
        """
        Save uploaded campaign image and return the file path.
        
        Args:
            file: The uploaded file
            
        Returns:
            str: The relative file path where the image was saved
            
        Raises:
            HTTPException: If file type is not supported or file is too large
        """
        # Validate file type
        allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} not supported. Allowed types: {', '.join(allowed_types)}"
            )
        
        # Validate file size (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        file_size = 0
        content = await file.read()
        file_size = len(content)
        
        if file_size > max_size:
            raise HTTPException(
                status_code=400,
                detail="File size too large. Maximum size is 5MB"
            )
        
        # Reset file pointer
        await file.seek(0)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower()
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = self.campaign_images_dir / unique_filename
        
        # Save file
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save file: {str(e)}"
            )
        
        # Return relative path
        return str(file_path.relative_to(self.upload_dir.parent))
    
    def delete_campaign_image(self, file_path: str) -> bool:
        """
        Delete a campaign image file.
        
        Args:
            file_path: The relative file path to delete
            
        Returns:
            bool: True if file was deleted, False otherwise
        """
        try:
            full_path = Path(file_path)
            if full_path.exists():
                full_path.unlink()
                return True
            return False
        except Exception:
            return False
    
    def get_image_url(self, file_path: Optional[str], base_url: str = "/static") -> Optional[str]:
        """
        Convert file path to accessible URL.
        
        Args:
            file_path: The relative file path
            base_url: The base URL for static files
            
        Returns:
            str: The accessible URL for the image, or None if no file path
        """
        if not file_path:
            return None
        
        return f"{base_url}/{file_path}"

# Global instance
storage_service = StorageService()