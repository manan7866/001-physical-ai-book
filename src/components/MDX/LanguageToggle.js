// src/components/MDX/LanguageToggle.js
// Component for toggling between Urdu and English content

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import userPreferencesService from '../../services/userPreferencesService';
import adaptiveTextbookService from '../../services/adaptiveTextbookService';

const LanguageToggle = ({ children, title = "Chapter" }) => {
  const { user, isAuthenticated, refreshUser, extendedProfile } = useAuthContext();
  const [currentLanguage, setCurrentLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState('');
  const [isOriginal, setIsOriginal] = useState(true);
  const [profileData, setProfileData] = useState(null);

  // Load user profile and set initial language
  useEffect(() => {
    const loadProfile = async () => {
      if (isAuthenticated && user) {
        try {
          const profile = await userPreferencesService.getRagChatbotProfile(user.id);
          setProfileData(profile);
          // Set initial language based on user preference
          const userPreferredLanguage = profile.preferredLanguage || profile.preferred_language || 'English';
          setCurrentLanguage(userPreferredLanguage);
        } catch (error) {
          console.error('Error loading user profile:', error);
          setCurrentLanguage('English');
        }
      }
    };

    loadProfile();
  }, [isAuthenticated, user]);

  // Toggle between Urdu and English
  const toggleLanguage = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to use language translation features');
      return;
    }

    if (!user) {
      console.error('No user available for translation');
      return;
    }

    setIsTranslating(true);

    try {
      // Determine target language
      const targetLanguage = currentLanguage === 'English' ? 'Urdu' : 'English';

      // Update user preference in the backend
      await userPreferencesService.updateRagChatbotProfile(user.id, {
        preferred_language: targetLanguage
      });

      // Refresh the user profile to get updated preferences
      await refreshUser();

      // Update local state
      setCurrentLanguage(targetLanguage);

      // Get the original content as a string
      let contentStr = '';

      // If children is a string, use it directly
      if (typeof children === 'string') {
        contentStr = children;
      } else {
        // For React elements, we need to convert to a string representation
        // We'll use JSON.stringify as a fallback method
        try {
          contentStr = JSON.stringify(children, (key, value) => {
            if (key === '_owner' || key === '_store' || key === 'ref' || key === 'key') {
              return undefined;
            }
            if (value && typeof value === 'object' && value._reactInternals) {
              return '[React Element]';
            }
            return value;
          });
        } catch (stringifyError) {
          // Fallback if JSON.stringify fails
          contentStr = 'Documentation content';
        }
      }

      // Translate the content using the adaptive textbook service
      const translated = await adaptiveTextbookService.translateContent(contentStr, targetLanguage);
      setTranslatedContent(translated);
      setIsOriginal(!isOriginal); // Toggle the state
    } catch (error) {
      console.error('Error toggling language:', error);
      alert('Error changing language. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="language-toggle-wrapper">
      {/* Language Toggle Controls */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={toggleLanguage}
              disabled={isTranslating}
              style={{
                padding: '8px 16px',
                backgroundColor: currentLanguage === 'Urdu' ? '#28a745' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isTranslating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {isTranslating
                ? 'Translating...'
                : currentLanguage === 'Urdu'
                  ? '🌐 English'
                  : '🌐 Urdu'}
            </button>
          </div>

          <div style={{
            fontSize: '12px',
            color: '#495057',
            padding: '4px 8px',
            backgroundColor: '#e9ecef',
            borderRadius: '3px'
          }}>
            <span title="Current language">
              {currentLanguage}
            </span>
          </div>
        </div>
      </div>

      {/* Content Display */}
      <div className="translated-content">
        {isOriginal ? (
          <div>{children}</div>
        ) : (
          <div>
            {/* Show the translated content if available, otherwise show original */}
            {translatedContent ? (
              <div dangerouslySetInnerHTML={{ __html: translatedContent }} />
            ) : (
              <div>{children}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageToggle;