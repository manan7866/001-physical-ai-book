// src/components/Textbook/AdaptiveChapter.js
// Component to display textbook chapters adapted to user preferences

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import adaptiveTextbookService from '../../services/adaptiveTextbookService';
import PersonalizeChapterButton from './PersonalizeChapterButton';

const AdaptiveChapter = ({ chapterId, chapterContent, title }) => {
  const { user, isAuthenticated } = useAuthContext();
  const [originalContent, setOriginalContent] = useState(chapterContent);
  const [displayedContent, setDisplayedContent] = useState(chapterContent);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAdaptedChapter = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let contentToDisplay = chapterContent;

        if (isAuthenticated && user) {
          // Get user ID from the auth context
          const userId = user.id || user.userId || user.email; // Different possible user ID fields

          if (userId) {
            // Rewrite the chapter based on user preferences
            contentToDisplay = await adaptiveTextbookService.rewriteChapterForUser(
              chapterContent,
              userId
            );
          }
        }

        setOriginalContent(chapterContent);
        setDisplayedContent(contentToDisplay);
      } catch (err) {
        console.error('Error adapting chapter:', err);
        setError('Failed to adapt chapter content. Showing original content.');
        setOriginalContent(chapterContent);
        setDisplayedContent(chapterContent); // Fallback to original content
      } finally {
        setIsLoading(false);
      }
    };

    loadAdaptedChapter();
  }, [chapterContent, user, isAuthenticated]);

  const handleContentUpdate = (newContent) => {
    setDisplayedContent(newContent);
  };

  if (isLoading) {
    return (
      <div className="adaptive-chapter" style={{ padding: '20px' }}>
        <h1>{title}</h1>
        <p>Loading personalized content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adaptive-chapter" style={{ padding: '20px' }}>
        <h1>{title}</h1>
        <div style={{ color: '#dc3545', marginBottom: '15px' }}>
          {error}
        </div>
        <div dangerouslySetInnerHTML={{ __html: displayedContent }} />
      </div>
    );
  }

  return (
    <div className="adaptive-chapter" style={{ padding: '20px' }}>
      <h1>{title}</h1>

      {/* Personalization Button at the start of the chapter */}
      <PersonalizeChapterButton
        chapterId={chapterId}
        chapterContent={originalContent}
        onContentUpdate={handleContentUpdate}
      />

      <div dangerouslySetInnerHTML={{ __html: displayedContent }} />
    </div>
  );
};

export default AdaptiveChapter;