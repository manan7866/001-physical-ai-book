// Global configuration for the RAG Chatbot
// This file is served from the static directory and can be customized per deployment

// Set the RAG API URL - this can be customized per deployment
// For separate backend deployment, set this to the full URL of your backend
// For example: window.RAG_API_URL = 'https://your-backend-domain.com';
// For same-host deployment with proxy, leave as empty string: window.RAG_API_URL = '';
// This is set during the build process or can be customized per deployment environment

// Default to empty string (relative path) - suitable for same-host deployment
window.RAG_API_URL = '';