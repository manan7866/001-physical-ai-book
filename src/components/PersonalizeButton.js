// src/components/PersonalizeButton.js
// Standalone component for personalizing content in Docusaurus docs

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import adaptiveTextbookService from '../services/adaptiveTextbookService';
import userPreferencesService from '../services/userPreferencesService';

const PersonalizeButton = ({ children, contentKey }) => {
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

  // Update authentication state when user or authentication status changes
  useEffect(() => {
    // Load profile data when authentication state changes
    if (isAuthenticated && user?.id) {
      loadProfileData();
    } else {
      setProfileData(null);
    }
  }, [isAuthenticated, user?.id]); // Removed loadProfileData from dependencies to prevent infinite loop

  // Listen for auth changes from other components
  useEffect(() => {
    const handleAuthChange = () => {
      // Refresh the authentication state when notified
      if (isAuthenticated && user?.id) {
        loadProfileData();
      } else {
        setProfileData(null);
      }
    };

    // Add event listener for auth changes
    window.addEventListener('authChange', handleAuthChange);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [isAuthenticated, user?.id]); // Removed loadProfileData to prevent potential infinite loop


  const handlePersonalize = async () => {
    if (!isAuthenticated || !user) {
      alert('Please sign in to personalize content');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Children type:', typeof children, children); // Debug log

      // Get the original content from children
      let originalContent = '';

      if (typeof children === 'string') {
        originalContent = children;
      } else if (typeof children === 'object' && children.props?.dangerouslySetInnerHTML?.__html) {
        originalContent = children.props.dangerouslySetInnerHTML.__html;
      } else if (React.isValidElement(children)) {
        // If it's a React element, try to get its content
        if (children.props?.dangerouslySetInnerHTML?.__html) {
          originalContent = children.props.dangerouslySetInnerHTML.__html;
        } else if (typeof children.props?.children === 'string') {
          originalContent = children.props.children;
        } else if (typeof children.props?.children === 'object' && children.props.children?.props?.dangerouslySetInnerHTML?.__html) {
          // Handle nested elements with dangerouslySetInnerHTML
          originalContent = children.props.children.props.dangerouslySetInnerHTML.__html;
        } else {
          // Try to get content from innerHTML of the rendered element if possible
          // Create a temporary div to render and extract text
          try {
            const tempDiv = document.createElement('div');
            // Use a temporary render to extract content
            originalContent = extractTextContent(children) || '';
          } catch (renderError) {
            console.warn('Could not extract content via render method:', renderError);
            originalContent = '';
          }
        }
      } else {
        // For other object types, try our extraction function
        originalContent = extractTextContent(children) || '';
      }

      console.log('Original content for personalization:', originalContent ? originalContent.substring(0, 200) + '...' : 'EMPTY', '(length:', originalContent?.length || 0, ')'); // Debug log

      // Only proceed with personalization if we have meaningful content
      if (!originalContent || originalContent.trim() === '') {
        console.warn('No content available for personalization. Attempting to get content from DOM...');

        // Try to get content from the actual DOM as a fallback
        try {
          const contentDiv = document.querySelector('.markdown');
          if (contentDiv) {
            originalContent = contentDiv.textContent || contentDiv.innerText || '';
            console.log('Found content in DOM:', originalContent.substring(0, 200) + '...'); // Debug log
          } else {
            // Try other common selectors for Docusaurus content
            const selectors = ['.theme-doc-markdown', '.docItemContainer', '.container', 'main'];
            for (const selector of selectors) {
              const element = document.querySelector(selector);
              if (element) {
                originalContent = element.textContent || element.innerText || '';
                if (originalContent.trim()) {
                  console.log(`Found content in ${selector}:`, originalContent.substring(0, 200) + '...'); // Debug log
                  break;
                }
              }
            }
          }
        } catch (domError) {
          console.warn('Could not extract content from DOM:', domError);
        }
      }

      if (!originalContent || originalContent.trim() === '') {
        console.warn('Still no content available after DOM search');
        alert('No content available for personalization. The content may not be available yet or may be in an unsupported format.');
        setIsPersonalized(false);
        return;
      }

      // Personalize the content with the current language preference
      const personalized = await adaptiveTextbookService.rewriteChapterForUser(originalContent, user.id);

      console.log('Personalized content result length:', personalized ? personalized.length : 0); // Debug log

      // Only update if we got meaningful content back that's different from original
      if (personalized && personalized.trim() !== '' && personalized !== originalContent) {
        setPersonalizedContent(personalized);
        setIsPersonalized(true);
      } else if (personalized && personalized.trim() !== '') {
        // If personalized content is returned but is same as original, still show it
        setPersonalizedContent(personalized);
        setIsPersonalized(true);
        console.log('Content was processed but remained similar to original');
      } else {
        console.warn('Personalization returned empty or same content, showing original');
        alert('Content personalization did not change the content. Showing original content.');
        setIsPersonalized(false);
      }
    } catch (error) {
      console.error('Error personalizing content:', error);
      alert('Error personalizing content. Showing original content.');
      // Don't switch to personalized view if there's an error
      setIsPersonalized(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract text content from React elements safely
  const extractTextContent = (element) => {
    try {
      if (typeof element === 'string' || typeof element === 'number') {
        return element.toString();
      }

      if (element === null || element === undefined) {
        return '';
      }

      // Handle arrays of children
      if (Array.isArray(element)) {
        return element.map(child => extractTextContent(child)).filter(text => text).join(' ');
      }

      // Handle React elements
      if (React.isValidElement(element)) {
        // If element has dangerouslySetInnerHTML, extract that content
        if (element.props?.dangerouslySetInnerHTML?.__html) {
          return element.props.dangerouslySetInnerHTML.__html;
        }

        // If children is a string, return it
        if (typeof element.props?.children === 'string') {
          return element.props.children;
        }

        // If children is an array, process each item
        if (Array.isArray(element.props?.children)) {
          return element.props.children.map(child => extractTextContent(child)).filter(text => text).join(' ');
        }

        // Recursively process single child
        if (element.props?.children) {
          return extractTextContent(element.props.children);
        }

        return '';
      }

      // Handle objects (but avoid circular references)
      if (typeof element === 'object') {
        // For objects that might contain content, try to find meaningful properties
        if (element.props && typeof element.props === 'object') {
          // Check for common content properties
          if (element.props.dangerouslySetInnerHTML?.__html) {
            return element.props.dangerouslySetInnerHTML.__html;
          }
          if (element.props.children) {
            return extractTextContent(element.props.children);
          }
        }
      }

      return '';
    } catch (error) {
      console.warn('Error extracting content:', error);
      return '';
    }
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

      // Update local state first to provide immediate feedback
      setCurrentLanguage(targetLanguage);

      // If content is already personalized, translate with new language preference
      if (isPersonalized) {
        let originalContent = '';

        if (typeof children === 'string') {
          originalContent = children;
        } else if (typeof children === 'object' && children.props?.dangerouslySetInnerHTML?.__html) {
          originalContent = children.props.dangerouslySetInnerHTML.__html;
        } else if (React.isValidElement(children)) {
          if (children.props?.dangerouslySetInnerHTML?.__html) {
            originalContent = children.props.dangerouslySetInnerHTML.__html;
          } else if (typeof children.props?.children === 'string') {
            originalContent = children.props.children;
          } else if (typeof children.props?.children === 'object' && children.props.children?.props?.dangerouslySetInnerHTML?.__html) {
            originalContent = children.props.children.props.dangerouslySetInnerHTML.__html;
          } else {
            originalContent = extractTextContent(children) || '';
          }
        } else {
          originalContent = extractTextContent(children) || '';
        }

        // Use direct translation to switch languages
        const translated = await adaptiveTextbookService.translateContentDirect(originalContent, targetLanguage);
        if (translated && translated.trim() !== '') {
          setPersonalizedContent(translated);
        }
      }

      // Update user preference in the backend in the background (don't block the UI)
      // This may fail if backend is not available, but that's OK
      userPreferencesService.updateRagChatbotProfile(user.id, {
        preferred_language: targetLanguage
      })
      .then(() => {
        // Refresh the user profile to get updated preferences
        return refreshUser();
      })
      .catch(backendError => {
        console.warn('Failed to update backend profile (this may be due to backend server not running):', backendError);
        // Don't show an error to the user since the language toggle still works locally
      });
    } catch (error) {
      console.error('Error changing language:', error);
      alert('Error changing language. Showing original content.');
      // Revert to previous language if there's a critical error
      setCurrentLanguage(prev => prev === 'English' ? 'Urdu' : 'English');
    }
  };

  const handleReset = () => {
    setIsPersonalized(false);
    setPersonalizedContent('');
  };

  return (
    <div>
      {isAuthenticated ? (
        // Authenticated user view
        <div>
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '5px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={isPersonalized ? handleReset : handlePersonalize}
                  disabled={isLoading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isPersonalized ? '#dc3545' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {isLoading ? 'Processing...' : isPersonalized ? 'Reset Original' : 'Personalize Content'}
                </button>

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
                  {showOptions ? 'Hide Options' : 'View Profile'}
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
                <div style={{ fontSize: '12px', color: '#495057', padding: '4px 8px', backgroundColor: '#e9ecef', borderRadius: '3px' }}>
                  <span title="Your current profile preferences">
                    {currentLanguage} • {profileData.technicalLevel || profileData.technical_level || 'N/A'} • {profileData.explanationStyle || profileData.explanation_style || 'N/A'}
                  </span>
                </div>
              )}
              {profileLoading && (
                <div style={{ fontSize: '12px', color: '#6c757d', padding: '4px 8px', backgroundColor: '#e9ecef', borderRadius: '3px' }}>
                  Loading profile...
                </div>
              )}
            </div>

            {showOptions && (
                <div style={{
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: '1px solid #dee2e6',
                  fontSize: '12px',
                  color: '#495057'
                }}>
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

          {isPersonalized ? (
            <div dangerouslySetInnerHTML={{ __html: personalizedContent }} />
          ) : (
            <div>{children}</div>
          )}
        </div>
      ) : (
        // Non-authenticated user view
        <div>
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, color: '#6c757d' }}>
              Sign in to personalize this content to your skill level and preferences.
            </p>
          </div>
          <div>{children}</div>
        </div>
      )}
    </div>
  );
};

export default PersonalizeButton;