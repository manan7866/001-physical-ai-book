// src/components/MDX/PersonalizeContent.js
// MDX component for personalizing content in documentation

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import adaptiveTextbookService from '../../services/adaptiveTextbookService';
import userPreferencesService from '../../services/userPreferencesService';

const PersonalizeContent = ({ children, title = "Chapter" }) => {
  const { user, isAuthenticated, refreshUser, extendedProfile } = useAuthContext();
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('English');

  // Function to load profile data from AuthContext
  const loadProfileData = async () => {
    if (!isAuthenticated) {
      setProfileData(null);
      setCurrentLanguage('English');
      return;
    }

    setProfileLoading(true);

    try {
      // Use the extended profile data from AuthContext directly
      // This data is already loaded by the AuthContext
      if (extendedProfile) {
        setProfileData(extendedProfile);
        const userPreferredLanguage = extendedProfile.preferredLanguage || extendedProfile.preferred_language || 'English';
        setCurrentLanguage(userPreferredLanguage);
      } else if (user?.extendedProfile) {
        setProfileData(user.extendedProfile);
        const userPreferredLanguage = user.extendedProfile.preferredLanguage || user.extendedProfile.preferred_language || 'English';
        setCurrentLanguage(userPreferredLanguage);
      } else {
        // If no extended profile, try to get it from the backend
        const profile = await userPreferencesService.getRagChatbotProfile(user?.id);
        setProfileData(profile);
        const userPreferredLanguage = profile.preferredLanguage || profile.preferred_language || 'English';
        setCurrentLanguage(userPreferredLanguage);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfileData(null);
      setCurrentLanguage('English');
    }

    setProfileLoading(false);
  };

  // Load profile data when component mounts or when user changes
  useEffect(() => {
    loadProfileData();
  }, [user?.id, isAuthenticated]);

  const handlePersonalize = async () => {
    if (!isAuthenticated || !user) {
      alert('Please sign in to personalize content');
      return;
    }

    setIsLoading(true);

    try {
      // Get the content as a string
      let contentStr = '';

      if (typeof children === 'string') {
        contentStr = children;
      } else if (React.isValidElement(children)) {
        // Create a temporary DOM element to extract text content safely
        const tempDiv = document.createElement('div');
        // Render the element to extract its text content
        tempDiv.innerHTML = new DOMParser().parseFromString(
          new XMLSerializer().serializeToString(
            document.createElement('template').content.appendChild(
              document.importNode(React.cloneElement(children).props.children, true)
            )
          ),
          'text/html'
        ).body.innerHTML || '';
        contentStr = tempDiv.textContent || tempDiv.innerText || '';
      } else {
        // For safety, convert the children to string without creating circular references
        try {
          contentStr = typeof children === 'object' ? JSON.stringify(children, (key, value) => {
            // Prevent circular references by excluding problematic properties
            if (key === '_owner' || key === '_store' || key === 'ref' || key === 'key') {
              return undefined;
            }
            if (value && typeof value === 'object' && value._reactInternals) {
              return '[React Element]';
            }
            return value;
          }) : String(children);
        } catch (stringifyError) {
          // Fallback if JSON.stringify fails
          contentStr = 'Documentation content';
        }
      }

      // Personalize the content
      const personalized = await adaptiveTextbookService.rewriteChapterForUser(contentStr, user.id);
      setPersonalizedContent(personalized);
      setIsPersonalized(true);
    } catch (error) {
      console.error('Error personalizing content:', error);
      alert('Error personalizing content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsPersonalized(false);
    setPersonalizedContent('');
  };

  // Toggle language function
  const toggleLanguage = async () => {
    if (!isAuthenticated || !user) {
      alert('Please sign in to change language preferences');
      return;
    }

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

      // If content is already personalized, re-personalize with new language
      if (isPersonalized) {
        let contentStr = '';

        if (typeof children === 'string') {
          contentStr = children;
        } else if (React.isValidElement(children)) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = new DOMParser().parseFromString(
            new XMLSerializer().serializeToString(
              document.createElement('template').content.appendChild(
                document.importNode(React.cloneElement(children).props.children, true)
              )
            ),
            'text/html'
          ).body.innerHTML || '';
          contentStr = tempDiv.textContent || tempDiv.innerText || '';
        } else {
          try {
            contentStr = typeof children === 'object' ? JSON.stringify(children, (key, value) => {
              if (key === '_owner' || key === '_store' || key === 'ref' || key === 'key') {
                return undefined;
              }
              if (value && typeof value === 'object' && value._reactInternals) {
                return '[React Element]';
              }
              return value;
            }) : String(children);
          } catch (stringifyError) {
            contentStr = 'Documentation content';
          }
        }

        // Re-personalize content with new language preference
        const personalized = await adaptiveTextbookService.rewriteChapterForUser(contentStr, user.id);
        setPersonalizedContent(personalized);
      }
    } catch (error) {
      console.error('Error changing language:', error);
      alert('Error changing language. Please try again.');
    }
  };

  return (
    <div className="personalize-content-wrapper">
      {/* Personalization Controls */}
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
            {!isPersonalized ? (
              <button
                onClick={handlePersonalize}
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {isLoading ? 'Personalizing...' : '✨ Personalize Content'}
              </button>
            ) : (
              <button
                onClick={handleReset}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                🔄 Reset to Original
              </button>
            )}

            <button
              onClick={() => setShowOptions(!showOptions)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {showOptions ? 'Hide Profile' : 'Show Profile'}
            </button>

            {/* Language Toggle Button - More Prominent */}
            <button
              onClick={toggleLanguage}
              disabled={profileLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: currentLanguage === 'Urdu' ? '#28a745' : '#dc3545', // Green for English, Red for Urdu
                color: 'white',
                border: '2px solid #fff',
                borderRadius: '6px',
                cursor: profileLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                minWidth: '100px'
              }}
            >
              {profileLoading ? '🔄' : currentLanguage === 'Urdu' ? '🇬🇧 English' : '🇵🇰 Urdu'}
            </button>
          </div>

          {profileData && !profileLoading && (
            <div style={{
              fontSize: '12px',
              color: '#495057',
              padding: '4px 8px',
              backgroundColor: '#e9ecef',
              borderRadius: '3px'
            }}>
              <span title="Your current profile preferences">
                {currentLanguage} • {profileData.technicalLevel || profileData.technical_level || 'N/A'} • {profileData.explanationStyle || profileData.explanation_style || 'N/A'}
              </span>
            </div>
          )}
          {profileLoading && (
            <div style={{
              fontSize: '12px',
              color: '#6c757d',
              padding: '4px 8px',
              backgroundColor: '#e9ecef',
              borderRadius: '3px'
            }}>
              Loading profile...
            </div>
          )}
        </div>

        {/* Profile Options Panel */}
        {showOptions && isAuthenticated && (
          <div style={{
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '1px solid #dee2e6',
            backgroundColor: '#fff',
            borderRadius: '4px',
            padding: '10px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#495057', fontSize: '14px' }}>
              Your Profile Preferences
            </h4>
            {profileLoading ? (
              <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                Loading profile data...
              </div>
            ) : profileData ? (
              <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                <div><strong>Technical Level:</strong> {profileData.technicalLevel || profileData.technical_level || 'Not set'}</div>
                <div><strong>ROS Experience:</strong> {profileData.rosExperience || profileData.ros_experience || 'Not set'}</div>
                <div><strong>Explanation Style:</strong> {profileData.explanationStyle || profileData.explanation_style || 'Not set'}</div>
                <div><strong>Preferred Language:</strong> {profileData.preferredLanguage || profileData.preferred_language || 'Not set'}</div>
                <div><strong>Primary Setup:</strong> {profileData.primarySetup || profileData.primary_setup || 'Not set'}</div>
                <div><strong>Edge Hardware:</strong> {profileData.edgeHardware || profileData.edge_hardware || 'Not set'}</div>
              </div>
            ) : (
              <div style={{ fontSize: '12px', lineHeight: '1.4', color: '#6c757d' }}>
                No profile data available
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Display */}
      <div className="personalized-content">
        {isPersonalized ? (
          <div
            dangerouslySetInnerHTML={{
              __html: personalizedContent
            }}
          />
        ) : (
          <div>{children}</div>
        )}
      </div>
    </div>
  );
};

export default PersonalizeContent;