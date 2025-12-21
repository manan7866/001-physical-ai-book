// src/services/userPreferencesService.js
// Service to sync user preferences between the main site and the RAG chatbot

// Use a default URL that can be overridden by environment variables or window properties
const getRagChatbotApiUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Check for a global RAG API URL first (set via Docusaurus config)
    if (window.RAG_API_URL && window.RAG_API_URL.trim() !== '') {
      // If RAG_API_URL is set and not empty, append /api to it
      return window.RAG_API_URL.endsWith('/') ? window.RAG_API_URL + 'api' : window.RAG_API_URL + '/api';
    }

    // For development, use the backend server URL
    // For production, use relative path to same host
    const isDev = window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1' ||
                  window.location.port !== '' && window.location.port !== '80' && window.location.port !== '443';

    if (isDev) {
      return 'http://127.0.0.1:8000/api'; // Use backend server in development (port 8000)
    } else {
      return '/api'; // Use relative path (same host as frontend) in production
    }
  }
  // For server-side rendering in production, use relative path
  return '/api';
};

const RAG_CHATBOT_API_URL = getRagChatbotApiUrl();

class UserPreferencesService {
  /**
   * Sync user preferences to the RAG chatbot
   * @param {string} userId - The user ID
   * @param {Object} preferences - The user preferences to sync
   */
  async syncToRagChatbot(userId, preferences) {
    try {
      const response = await fetch(`${RAG_CHATBOT_API_URL}/user/profile/${userId}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('User preferences synced to RAG chatbot:', data);
      return data;
    } catch (error) {
      console.error('Error syncing user preferences to RAG chatbot:', error);
      throw error;
    }
  }

  /**
   * Update user profile in the RAG chatbot
   * @param {string} userId - The user ID
   * @param {Object} profileUpdate - The profile update to send
   */
  async updateRagChatbotProfile(userId, profileUpdate) {
    try {
      const response = await fetch(`${RAG_CHATBOT_API_URL}/user/profile/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileUpdate),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('User profile updated in RAG chatbot:', data);
      return data;
    } catch (error) {
      console.error('Error updating user profile in RAG chatbot:', error);
      throw error;
    }
  }

  /**
   * Get user profile from the RAG chatbot
   * @param {string} userId - The user ID
   */
  async getRagChatbotProfile(userId) {
    try {
      const response = await fetch(`${RAG_CHATBOT_API_URL}/user/profile/${userId}`);

      if (!response.ok) {
        // If the profile doesn't exist, return a default profile
        if (response.status === 404) {
          return {
            user_id: userId,
            technical_level: 'Intermediate',
            ros_experience: 'Basic',
            primary_setup: null,
            edge_hardware: null,
            explanation_style: 'Balanced',
            preferred_language: 'English'
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting user profile from RAG chatbot:', error);
      // Return a default profile in case of error
      return {
        user_id: userId,
        technical_level: 'Intermediate',
        ros_experience: 'Basic',
        primary_setup: null,
        edge_hardware: null,
        explanation_style: 'Balanced',
        preferred_language: 'English'
      };
    }
  }
}

// Create a singleton instance
const userPreferencesService = new UserPreferencesService();
export default userPreferencesService;