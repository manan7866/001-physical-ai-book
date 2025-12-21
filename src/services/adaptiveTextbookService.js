// src/services/adaptiveTextbookService.js
// Service to adapt textbook content based on user preferences

import userPreferencesService from './userPreferencesService';

class AdaptiveTextbookService {
  /**
   * Rewrites a textbook chapter based on user preferences
   * @param {string} chapterContent - The original chapter content
   * @param {string} userId - The user ID to get preferences for
   * @returns {Promise<string>} - The rewritten chapter content
   */
  async rewriteChapterForUser(chapterContent, userId) {
    try {
      // Ensure we have content to work with
      if (!chapterContent || chapterContent.trim() === '') {
        console.warn('Empty chapter content provided for personalization, returning as-is');
        return chapterContent || '';
      }

      // Get user profile from RAG chatbot service
      const userProfile = await userPreferencesService.getRagChatbotProfile(userId);

      // If no profile exists, return original content
      if (!userProfile || !userProfile.user_id) {
        console.warn('No user profile found, returning original content');
        return chapterContent;
      }

      // Prepare user preferences for the rewrite
      const preferences = {
        technicalLevel: userProfile.technicalLevel || userProfile.technical_level || 'Intermediate',
        rosExperience: userProfile.rosExperience || userProfile.ros_experience || 'Basic',
        explanationStyle: userProfile.explanationStyle || userProfile.explanation_style || 'Balanced',
        preferredLanguage: userProfile.preferredLanguage || userProfile.preferred_language || 'English'
      };

      console.log('Personalizing content with preferences:', preferences); // Debug log

      // Rewrite the chapter based on user preferences
      const result = this.rewriteChapter(chapterContent, preferences);

      // Ensure we return meaningful content
      if (!result || result.trim() === '') {
        console.warn('Personalization returned empty content, returning original');
        return chapterContent;
      }

      return result;
    } catch (error) {
      console.error('Error getting user profile for chapter rewrite:', error);
      // Return original content if there's an error
      return chapterContent;
    }
  }

  /**
   * Rewrites a textbook chapter based on specific preferences
   * @param {string} chapterContent - The original chapter content
   * @param {Object} preferences - User preferences
   * @returns {string} - The rewritten chapter content
   */
  rewriteChapter(chapterContent, preferences) {
    // Use the HTML-aware method to preserve formatting and structure
    return this.rewriteContentForMDX(chapterContent, preferences);
  }

  /**
   * Rewrites content with enhanced personalization features
   * @param {string} chapterContent - The original chapter content
   * @param {Object} preferences - User preferences
   * @returns {string} - The rewritten chapter content
   */
  rewriteChapterAdvanced(chapterContent, preferences) {
    let rewrittenContent = chapterContent;

    // Apply transformations in order of importance
    rewrittenContent = this.translateContent(rewrittenContent, preferences.preferredLanguage);
    rewrittenContent = this.adjustComplexity(rewrittenContent, preferences.technicalLevel);
    rewrittenContent = this.adjustExplanationStyle(rewrittenContent, preferences.explanationStyle);
    rewrittenContent = this.adjustRosContent(rewrittenContent, preferences.rosExperience);

    // Additional advanced transformations
    rewrittenContent = this.addDifficultyIndicators(rewrittenContent, preferences.technicalLevel);
    rewrittenContent = this.optimizeForReadingLevel(rewrittenContent, preferences.technicalLevel);

    return rewrittenContent;
  }

  /**
   * Rewrites content with enhanced HTML support for MDX components
   * @param {string} content - The content to rewrite
   * @param {Object} preferences - User preferences
   * @returns {string} - The rewritten content with preserved HTML formatting
   */
  rewriteContentForMDX(content, preferences) {
    // Preserve HTML tags and structure while personalizing the text content
    let rewrittenContent = content;

    // First, extract and preserve HTML tags
    const tagRegex = /(<[^>]+>)([^<]*)/g;
    let match;
    const preservedTags = [];

    // Process the content while preserving HTML structure
    rewrittenContent = rewrittenContent.replace(tagRegex, (match, tag, text) => {
      // Only personalize text content, not HTML tags
      const personalizedText = this.personalizeText(text, preferences);
      return tag + personalizedText;
    });

    // Handle content without tags as well
    rewrittenContent = this.personalizeText(rewrittenContent, preferences);

    return rewrittenContent;
  }

  /**
   * Personalizes plain text content based on preferences
   * @param {string} text - The text to personalize
   * @param {Object} preferences - User preferences
   * @returns {string} - The personalized text
   */
  personalizeText(text, preferences) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    let personalizedText = text;

    // Apply language translation if needed
    personalizedText = this.translateContent(personalizedText, preferences.preferredLanguage);

    // Adjust complexity based on technical level
    personalizedText = this.adjustComplexity(personalizedText, preferences.technicalLevel);

    // Adjust explanation style
    personalizedText = this.adjustExplanationStyle(personalizedText, preferences.explanationStyle);

    // Adjust ROS content based on experience
    personalizedText = this.adjustRosContent(personalizedText, preferences.rosExperience);

    // Additional enhancements
    personalizedText = this.addDifficultyIndicators(personalizedText, preferences.technicalLevel);
    personalizedText = this.optimizeForReadingLevel(personalizedText, preferences.technicalLevel);

    return personalizedText;
  }

  /**
   * Translates content to the preferred language if needed
   * @param {string} content - The content to translate
   * @param {string} preferredLanguage - The preferred language
   * @returns {string} - The translated content
   */
  translateContent(content, preferredLanguage) {
    if (preferredLanguage.toLowerCase() === 'english') {
      return content; // Already in English
    }

    // For Urdu, we would typically use a translation API in a real implementation
    // For now, we'll return the original content but note that it would be translated
    if (preferredLanguage.toLowerCase() === 'urdu') {
      // In a real implementation, this would call a translation service
      // For demo purposes, we'll return the original content with a note
      return content; // Placeholder - would be translated in real implementation
    }

    return content;
  }

  /**
   * Adjusts content complexity based on technical level
   * @param {string} content - The content to adjust
   * @param {string} technicalLevel - The technical level ('Beginner', 'Intermediate', 'Advanced')
   * @returns {string} - The adjusted content
   */
  adjustComplexity(content, technicalLevel) {
    switch (technicalLevel) {
      case 'Beginner':
        // Simplify complex concepts, add more explanations, reduce jargon
        return this.simplifyContent(content);
      case 'Advanced':
        // Add more technical depth, use more jargon, assume knowledge
        return this.addTechnicalDepth(content);
      case 'Intermediate':
      default:
        // Keep content as is or make minor adjustments
        return content;
    }
  }

  /**
   * Adjusts explanation style
   * @param {string} content - The content to adjust
   * @param {string} explanationStyle - The explanation style ('Simple', 'Balanced', 'Deep technical')
   * @returns {string} - The adjusted content
   */
  adjustExplanationStyle(content, explanationStyle) {
    switch (explanationStyle) {
      case 'Simple':
        // Make explanations more straightforward with minimal technical details
        return this.simplifyExplanations(content);
      case 'Deep technical':
        // Add detailed technical explanations and in-depth analysis
        return this.addTechnicalExplanations(content);
      case 'Balanced':
      default:
        // Keep explanations balanced
        return content;
    }
  }

  /**
   * Adjusts ROS-related content based on experience
   * @param {string} content - The content to adjust
   * @param {string} rosExperience - The ROS experience level ('None', 'Basic', 'Experienced')
   * @returns {string} - The adjusted content
   */
  adjustRosContent(content, rosExperience) {
    switch (rosExperience) {
      case 'None':
        // Add more ROS explanations and context
        return this.addRosExplanations(content);
      case 'Experienced':
        // Use more advanced ROS terminology
        return this.addAdvancedRosContent(content);
      case 'Basic':
      default:
        // Keep ROS content at basic level
        return content;
    }
  }

  /**
   * Simplifies content for beginners
   * @param {string} content - The content to simplify
   * @returns {string} - Simplified content
   */
  simplifyContent(content) {
    // Replace complex terms with simpler explanations
    let simplified = content.replace(/(algorithm|implementation|optimization)/gi, (match) => {
      const lower = match.toLowerCase();
      switch(lower) {
        case 'algorithm':
          return 'process';
        case 'implementation':
          return 'way of doing';
        case 'optimization':
          return 'improvement';
        default:
          return match;
      }
    });

    // Add more explanations and context
    simplified = simplified.replace(/\b(ROS|SLAM|PID|LIDAR)\b/g, (match) => {
      switch(match.toUpperCase()) {
        case 'ROS':
          return 'ROS (Robot Operating System - a framework for programming robots)';
        case 'SLAM':
          return 'SLAM (Simultaneous Localization and Mapping - how robots understand their location)';
        case 'PID':
          return 'PID (Proportional-Integral-Derivative - a control method)';
        case 'LIDAR':
          return 'LIDAR (Light Detection and Ranging - a sensor that measures distances)';
        default:
          return match;
      }
    });

    return simplified;
  }

  /**
   * Adds technical depth for advanced users
   * @param {string} content - The content to enhance
   * @returns {string} - Enhanced content
   */
  addTechnicalDepth(content) {
    // Add more technical details and advanced concepts
    return content;
  }

  /**
   * Simplifies explanations
   * @param {string} content - The content to simplify
   * @returns {string} - Simplified content
   */
  simplifyExplanations(content) {
    // Remove complex sentences and add simpler explanations
    return content;
  }

  /**
   * Adds technical explanations
   * @param {string} content - The content to enhance
   * @returns {string} - Enhanced content
   */
  addTechnicalExplanations(content) {
    // Add more detailed technical explanations
    return content;
  }

  /**
   * Adds ROS explanations for users with no ROS experience
   * @param {string} content - The content to enhance
   * @returns {string} - Enhanced content
   */
  addRosExplanations(content) {
    // Add more context and explanations for ROS concepts
    return content;
  }

  /**
   * Adds advanced ROS content for experienced users
   * @param {string} content - The content to enhance
   * @returns {string} - Enhanced content
   */
  addAdvancedRosContent(content) {
    // Add advanced ROS terminology and concepts
    return content;
  }

  /**
   * Adds difficulty indicators to the content
   * @param {string} content - The content to adjust
   * @param {string} technicalLevel - The technical level
   * @returns {string} - The adjusted content
   */
  addDifficultyIndicators(content, technicalLevel) {
    if (technicalLevel === 'Beginner') {
      // Add beginner-friendly indicators
      return content.replace(/\b(advanced|complex|sophisticated)\b/gi, (match) => {
        return `basic/simple ${match.toLowerCase()}`;
      });
    } else if (technicalLevel === 'Advanced') {
      // Add advanced indicators where appropriate
      return content;
    }
    return content;
  }

  /**
   * Optimizes content for reading level
   * @param {string} content - The content to adjust
   * @param {string} technicalLevel - The technical level
   * @returns {string} - The adjusted content
   */
  optimizeForReadingLevel(content, technicalLevel) {
    switch (technicalLevel) {
      case 'Beginner':
        // Use shorter sentences, simpler vocabulary
        return content.replace(/(\.|\!|\?)\s+/g, (match) => {
          return match + '\n\n'; // Add paragraph breaks for easier reading
        });
      case 'Advanced':
        // Allow for more complex sentence structures
        return content;
      case 'Intermediate':
      default:
        return content;
    }
  }
}

// Create a singleton instance
const adaptiveTextbookService = new AdaptiveTextbookService();
export default adaptiveTextbookService;