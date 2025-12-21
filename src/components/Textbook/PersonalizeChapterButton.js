// src/components/Textbook/PersonalizeChapterButton.js
// Component to allow users to personalize chapter content based on their preferences

import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import adaptiveTextbookService from '../../services/adaptiveTextbookService';

const PersonalizeChapterButton = ({ chapterId, chapterContent, onContentUpdate }) => {
  const { user, isAuthenticated } = useAuthContext();
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [customPreferences, setCustomPreferences] = useState({
    technicalLevel: '',
    explanationStyle: '',
    preferredLanguage: ''
  });

  const handlePersonalizeClick = async () => {
    if (!isAuthenticated || !user) {
      alert('Please sign in to personalize content');
      return;
    }

    setIsPersonalizing(true);

    try {
      let personalizedContent;

      // Use custom preferences if set, otherwise use user's profile preferences
      if (customPreferences.technicalLevel || customPreferences.explanationStyle || customPreferences.preferredLanguage) {
        // Use custom preferences
        personalizedContent = adaptiveTextbookService.rewriteChapter(chapterContent, {
          technicalLevel: customPreferences.technicalLevel || user.extendedProfile?.technicalLevel || 'Intermediate',
          rosExperience: user.extendedProfile?.rosExperience || 'Basic',
          explanationStyle: customPreferences.explanationStyle || user.extendedProfile?.explanationStyle || 'Balanced',
          preferredLanguage: customPreferences.preferredLanguage || user.extendedProfile?.preferredLanguage || 'English'
        });
      } else {
        // Use user's profile preferences
        personalizedContent = await adaptiveTextbookService.rewriteChapterForUser(chapterContent, user.id);
      }

      // Update the chapter content
      if (onContentUpdate && typeof onContentUpdate === 'function') {
        onContentUpdate(personalizedContent);
      }
    } catch (error) {
      console.error('Error personalizing chapter:', error);
      alert('Error personalizing content. Showing original content.');
    } finally {
      setIsPersonalizing(false);
      setShowOptions(false);
    }
  };

  const handlePreferenceChange = (field, value) => {
    setCustomPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="personalize-section" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <p style={{ color: '#6c757d', margin: 0 }}>
          Sign in to personalize this chapter content to your skill level and preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="personalize-section" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
        <div>
          <button
            onClick={() => setShowOptions(!showOptions)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {showOptions ? 'Cancel' : 'Personalize Content'}
          </button>

          <button
            onClick={handlePersonalizeClick}
            disabled={isPersonalizing}
            style={{
              marginLeft: '10px',
              padding: '8px 16px',
              backgroundColor: isPersonalizing ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isPersonalizing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {isPersonalizing ? 'Personalizing...' : 'Apply Preferences'}
          </button>
        </div>

        {user.extendedProfile && (
          <div style={{ fontSize: '12px', color: '#6c757d', textAlign: 'right' }}>
            Current: {user.extendedProfile.technicalLevel || 'N/A'} • {user.extendedProfile.explanationStyle || 'N/A'} • {user.extendedProfile.preferredLanguage || 'N/A'}
          </div>
        )}
      </div>

      {showOptions && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>Customize Content Preferences</h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                Technical Level:
              </label>
              <select
                value={customPreferences.technicalLevel}
                onChange={(e) => handlePreferenceChange('technicalLevel', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">Use Profile Default</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                Explanation Style:
              </label>
              <select
                value={customPreferences.explanationStyle}
                onChange={(e) => handlePreferenceChange('explanationStyle', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">Use Profile Default</option>
                <option value="Simple">Simple</option>
                <option value="Balanced">Balanced</option>
                <option value="Deep technical">Deep Technical</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                Language:
              </label>
              <select
                value={customPreferences.preferredLanguage}
                onChange={(e) => handlePreferenceChange('preferredLanguage', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">Use Profile Default</option>
                <option value="English">English</option>
                <option value="Urdu">Urdu</option>
              </select>
            </div>
          </div>

          {Object.values(customPreferences).some(val => val) && (
            <div style={{ marginTop: '15px', fontSize: '12px', color: '#6c757d' }}>
              Note: Custom preferences will override your profile defaults for this chapter only.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalizeChapterButton;