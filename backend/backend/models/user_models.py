from pydantic import BaseModel
from typing import Optional


class UserProfile(BaseModel):
    """
    Model for storing user profile information including preferences
    """
    user_id: str
    technical_level: Optional[str] = None  # Beginner, Intermediate, Advanced
    ros_experience: Optional[str] = None  # None, Basic, Experienced
    primary_setup: Optional[str] = None  # RTX GPU PC / Workstation, No RTX GPU (Laptop / Basic PC), Cloud only
    edge_hardware: Optional[str] = None  # Jetson (Orin / Xavier), Other robot hardware, None
    explanation_style: Optional[str] = None  # Simple, Balanced, Deep technical
    preferred_language: Optional[str] = None  # English, Urdu


class UserProfileUpdateRequest(BaseModel):
    """
    Request model for updating user profile
    """
    technical_level: Optional[str] = None
    ros_experience: Optional[str] = None
    primary_setup: Optional[str] = None
    edge_hardware: Optional[str] = None
    explanation_style: Optional[str] = None
    preferred_language: Optional[str] = None


class GetUserProfileResponse(BaseModel):
    """
    Response model for getting user profile
    """
    user_id: str
    technical_level: Optional[str] = None
    ros_experience: Optional[str] = None
    primary_setup: Optional[str] = None
    edge_hardware: Optional[str] = None
    explanation_style: Optional[str] = None
    preferred_language: Optional[str] = None