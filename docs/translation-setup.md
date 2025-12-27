# Translation API Setup for Urdu/English Toggle

This document explains how to set up translation functionality for the Urdu/English toggle feature in the humanoid robotics book.

## Overview

The language toggle feature allows users to switch between English and Urdu content. The implementation includes:

- A language toggle button in the content personalization controls
- Integration with the user preference system
- Translation API integration points
- HTML content preservation during translation

## Required Setup

### 1. Translation API Service

To enable actual translation functionality, you need to integrate with a translation service API. The code is currently set up to work with:

- Google Cloud Translation API
- Microsoft Translator API
- Other translation services with REST APIs

### 2. Environment Variables

**IMPORTANT SECURITY NOTE**: For production environments, API keys should be handled server-side to prevent exposure. The current implementation uses the API key directly in client-side code for demonstration purposes only.

For development/testing only, you can set the API key directly in the code as has been done in the implementation, but for production:

Create a server-side endpoint that handles translation requests:

```javascript
// Example server-side proxy for translation API
app.post('/api/translate', async (req, res) => {
  const { text, targetLang } = req.body;
  const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY; // Server-side only

  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      target: targetLang,
      source: 'en',
      format: 'html'
    })
  });

  const data = await response.json();
  res.json(data);
});
```

### 3. Update Translation Service Implementation

The current implementation in `src/services/adaptiveTextbookService.js` has been updated to use the Google Translate API directly with the provided API key:

```javascript
async translateToUrdu(content) {
  try {
    // Extract text from HTML while preserving structure
    const extracted = this.extractTextFromHtml(content);

    // For demo purposes only - API key exposed in client-side code
    const API_KEY = "AIzaSyArZ6jLXXMpIf36mnfP5JRAPrD1sJCg5bE";

    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: extracted.text,
        target: 'ur',
        source: 'en',
        format: 'html' // Use 'html' to preserve formatting
      })
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.data.translations[0].translatedText;

    // Reconstruct HTML with translated text
    return this.reconstructHtmlWithTranslation(content, extracted.structure, translatedText);
  } catch (error) {
    console.error('Translation error:', error);
    return content; // Return original on error
  }
}
```

## HTML Preservation During Translation

The translation system is designed to preserve HTML formatting while translating text content:

1. **Text Extraction**: Extracts text content while preserving HTML structure information
2. **Translation**: Translates only the text content
3. **Reconstruction**: Rebuilds the HTML with translated text while maintaining original formatting

## Implementation Notes

### Content Personalization Integration

The language toggle is integrated with the existing content personalization system:

- User language preferences are stored in the user profile
- Translation respects other personalization settings (technical level, explanation style, etc.)
- The toggle button appears alongside other personalization controls

### Fallback Behavior

If translation API is not configured or fails:
- Content remains in original language
- User interface continues to function normally
- Error messages are logged to console

## Testing the Feature

### Manual Testing

1. Sign in to the application
2. Navigate to any book content page
3. Verify the language toggle button appears
4. Click the toggle button to switch between languages
5. Verify content updates appropriately
6. Check that user preferences are saved

### API Testing

You can test your translation API separately using tools like Postman or curl:

```bash
curl -X POST \
  'https://translation.googleapis.com/language/translate/v2?key=AIzaSyArZ6jLXXMpIf36mnfP5JRAPrD1sJCg5bE' \
  -H 'Content-Type: application/json' \
  -d '{
    "q": "Hello, world!",
    "target": "ur",
    "source": "en",
    "format": "text"
  }'
```

## Security Considerations

⚠️ **CRITICAL SECURITY WARNING**: The current implementation exposes the API key in client-side code, which is NOT suitable for production use. In a production environment:

- API keys must be stored server-side only
- Create a server-side proxy endpoint for translation requests
- Implement proper authentication and rate limiting
- Consider using service accounts with limited permissions

## CORS and Browser Issues

When using the Google Translate API directly from the browser, you may encounter Cross-Origin Resource Sharing (CORS) issues. To resolve this:

1. **Development Environment**: Use a browser extension to disable CORS or run the application with CORS disabled for testing
2. **Production Environment**: Always implement a server-side proxy as mentioned in the security section
3. **Alternative Approach**: Consider using the Google Cloud Translation API through a backend service

Example command to run Chrome without CORS for testing:
```bash
chrome --user-data-dir="C:/Chrome dev session" --disable-web-security
```

⚠️ **Warning**: Only use this for development/testing. Never run a production browser without security features.

## Performance Optimization

- Consider caching translated content to reduce API calls
- Implement lazy loading for translation functionality
- Use content delivery networks for translated content
- Monitor API usage and costs
- Implement batch translation for large documents

## Troubleshooting

### Translation Not Working

1. Check that the API key has proper permissions and is not expired
2. Verify API endpoint URLs are correct
3. Confirm translation quotas have not been exceeded
4. Check browser console for error messages
5. Ensure the content is properly formatted for translation

### HTML Formatting Issues

1. Ensure the translation API preserves HTML formatting
2. Verify that the HTML reconstruction logic is working properly
3. Test with various content types and formatting

## Next Steps for Production

1. **Security**: Implement server-side translation proxy to protect API key
2. **Caching**: Add caching for frequently translated content
3. **Error Handling**: Implement better error handling and retry logic
4. **Analytics**: Add tracking for language usage and translation effectiveness
5. **Performance**: Implement lazy loading and progressive enhancement
6. **Testing**: Add comprehensive tests for translation functionality