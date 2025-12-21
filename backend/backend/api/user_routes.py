from fastapi import APIRouter, HTTPException
from typing import Optional
import logging

from models.user_models import UserProfile, UserProfileUpdateRequest, GetUserProfileResponse
from utils.user_profile_manager import UserProfileManager

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize the user profile manager
profile_manager = UserProfileManager()


@router.get("/profile/{user_id}", response_model=GetUserProfileResponse)
async def get_user_profile(user_id: str):
    """
    Get user profile information
    """
    try:
        profile = profile_manager.get_user_profile(user_id)
        if profile:
            return GetUserProfileResponse(**profile.dict())
        else:
            # Return empty profile if user doesn't exist
            return GetUserProfileResponse(user_id=user_id)
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving user profile: {str(e)}")


@router.post("/profile/{user_id}")
async def update_user_profile(user_id: str, profile_update: UserProfileUpdateRequest):
    """
    Update user profile information
    """
    try:
        profile = profile_manager.update_user_profile(user_id, profile_update)
        return {"message": "Profile updated successfully", "profile": profile.dict()}
    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating user profile: {str(e)}")


@router.post("/profile/{user_id}/initialize")
async def initialize_user_profile(user_id: str, profile_data: dict):
    """
    Initialize user profile with provided data
    """
    try:
        profile = profile_manager.create_user_profile(user_id, profile_data)
        return {"message": "Profile initialized successfully", "profile": profile.dict()}
    except Exception as e:
        logger.error(f"Error initializing user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error initializing user profile: {str(e)}")