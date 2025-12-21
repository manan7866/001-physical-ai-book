import json
import os
from typing import Optional
from models.user_models import UserProfile, UserProfileUpdateRequest
from datetime import datetime


class UserProfileManager:
    """
    Simple user profile manager that stores user preferences in a JSON file
    """

    def __init__(self, storage_file: str = "user_profiles.json"):
        # Use absolute path based on the current module's directory to avoid file access issues
        import os
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.storage_file = os.path.join(current_dir, storage_file)
        self.profiles = self._load_profiles()

    def _load_profiles(self) -> dict:
        """Load user profiles from storage file"""
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                return {}
        return {}

    def _save_profiles(self):
        """Save user profiles to storage file"""
        try:
            with open(self.storage_file, 'w', encoding='utf-8') as f:
                json.dump(self.profiles, f, indent=2, ensure_ascii=False)
        except IOError as e:
            print(f"Error saving profiles: {e}")

    def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile by user ID"""
        profile_data = self.profiles.get(user_id)
        if profile_data:
            return UserProfile(**profile_data)
        return None

    def update_user_profile(self, user_id: str, profile_update: UserProfileUpdateRequest) -> UserProfile:
        """Update user profile with new information"""
        existing_profile = self.profiles.get(user_id, {})

        # Update only the fields that are provided in the update request
        for field, value in profile_update.dict(exclude_unset=True).items():
            if value is not None:
                existing_profile[field] = value

        # Add user_id if not already present
        existing_profile['user_id'] = user_id
        existing_profile['updated_at'] = datetime.now().isoformat()

        self.profiles[user_id] = existing_profile
        self._save_profiles()

        return UserProfile(**existing_profile)

    def create_user_profile(self, user_id: str, profile_data: dict) -> UserProfile:
        """Create a new user profile"""
        profile_data['user_id'] = user_id
        profile_data['created_at'] = datetime.now().isoformat()
        profile_data['updated_at'] = datetime.now().isoformat()

        self.profiles[user_id] = profile_data
        self._save_profiles()

        return UserProfile(**profile_data)