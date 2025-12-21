// src/components/Textbook/ChapterPersonalizer.js
// Component to personalize textbook chapters for logged-in users

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import adaptiveTextbookService from '../../services/adaptiveTextbookService';

const ChapterPersonalizer = ({ children, chapterId, chapterTitle }) => {
  const { user, isAuthenticated } = useAuthContext();
  const [personalizedContent, setPersonalizedContent] = useState(null);
  const [showPersonalizeButton, setShowPersonalizeButton] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if the content contains chapter-like structure
  useEffect(() => {
    if (isAuthenticated && user) {
      // Show the personalization option if user is logged in
      setShowPersonalizeButton(true);
    }
  }, [isAuthenticated, user]);

  const handlePersonalizeChapter = async () => {
    if (!isAuthenticated || !user || !chapterId) {
      return;
    }

    setIsProcessing(true);

    try {
      // Get the raw chapter content from the children or use a default
      let rawContent = '';

      // If children is a string or can be converted to string
      if (typeof children === 'string') {
        rawContent = children;
      } else if (React.isValidElement(children)) {
        // If it's a React element, we need to extract text content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = new XMLSerializer().serializeToString(
          document.createElement('div').appendChild(React.cloneElement(children).props.children)
        );
        rawContent = tempDiv.textContent || tempDiv.innerText || '';
      } else {
        // Fallback to the innerHTML if possible
        rawContent = typeof children === 'object' && children.props?.dangerouslySetInnerHTML
          ? children.props.dangerouslySetInnerHTML.__html
          : JSON.stringify(children);
      }

      // Personalize the content based on user preferences
      const personalized = await adaptiveTextbookService.rewriteChapterForUser(rawContent, user.id);
      setPersonalizedContent(personalized);
    } catch (error) {
      console.error('Error personalizing chapter:', error);
      // Don't update content on error, show original
    } finally {
      setIsProcessing(false);
    }
  };

  // If personalized content exists, return that; otherwise return original
  if (personalizedContent) {
    return (
      <div className="chapter-personalizer">
        {showPersonalizeButton && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button
              onClick={handlePersonalizeChapter}
              disabled={isProcessing}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {isProcessing ? 'Personalizing...' : 'Reset to Original'}
            </button>
          </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: personalizedContent }} />
      </div>
    );
  }

  return (
    <div className="chapter-personalizer">
      {showPersonalizeButton && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button
            onClick={handlePersonalizeChapter}
            disabled={isProcessing}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {isProcessing ? 'Personalizing...' : 'Personalize This Chapter'}
          </button>
        </div>
      )}
      {children}
    </div>
  );
};

export default ChapterPersonalizer;