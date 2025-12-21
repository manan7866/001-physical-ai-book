// src/components/MDX/PersonalizeContent.js
// MDX component for personalizing content in documentation

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import adaptiveTextbookService from '../../services/adaptiveTextbookService';

const PersonalizeContent = ({ children, title = "Chapter" }) => {
  const { user, isAuthenticated, refreshUser } = useAuthContext();
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Function to load profile data directly
  const loadProfileData = async () => {
    if (!isAuthenticated || !user?.id) {
      setProfileData(null);
      return;
    }

    setProfileLoading(true);
    try {
      // Make a direct API call to the auth server to get profile data
      // Add cache busting to ensure we get fresh data
      const cacheBuster = new Date().getTime();
      const getBaseUrl = () => {
        if (typeof window !== 'undefined') {
          // Check for environment variable first
          if (window.AUTH_API_URL) {
            return window.AUTH_API_URL;
          }

          // For development, use the backend server URL
          // For production, use relative path to same host
          const isDev = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1' ||
                        window.location.port !== '' && window.location.port !== '80' && window.location.port !== '443';

          if (isDev) {
            return 'http://localhost:8080';
          } else {
            return ''; // Use relative path (same host as frontend) in production
          }
        }
        // For server-side rendering in production, use relative path
        return '';
      };

      const baseUrl = getBaseUrl();
      // Use the same API URL pattern as other services
      let apiUrl = baseUrl;
      if (baseUrl && !baseUrl.startsWith('http')) {
        // If it's a relative path, use it as-is
        apiUrl = baseUrl;
      } else if (baseUrl && baseUrl.startsWith('http')) {
        // If it's an absolute URL, append /api
        apiUrl = baseUrl.endsWith('/') ? baseUrl + 'api' : baseUrl + '/api';
      } else {
        // Default to /api for relative path
        apiUrl = '/api';
      }
      const response = await fetch(`${apiUrl}/profile?userId=${user.id}&t=${cacheBuster}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProfileData(result.data);
        } else {
          setProfileData(null);
        }
      } else {
        setProfileData(null);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      setProfileData(null);
    } finally {
      setProfileLoading(false);
    }
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
                {profileData.technicalLevel || profileData.technical_level || 'N/A'} • {profileData.explanationStyle || profileData.explanation_style || 'N/A'}
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