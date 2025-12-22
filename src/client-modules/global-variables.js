// Global variables module for Docusaurus
// This sets environment variables that can be accessed in the browser

// The environment variables are processed at build time
// We'll use template replacement to inject the actual values during build

// For the RAG API URL, we'll check if it's available in the build environment
// and set it as a global variable that can be accessed by components

// Since process.env is not available in the browser, we need to handle this differently
// We'll create a template that gets replaced during the build process

// At build time, we'll use a template replacement approach
// For development, we'll use default values
// For production builds, environment variables can be passed during build

(function() {
  // Define the global variables with fallback values
  if (typeof window !== 'undefined') {
    // RAG API URL - defaults to empty string (relative path) for same-host deployment
    // Can be overridden during build with environment variables
    // For production deployment, defaults to the Hugging Face deployment URL
    window.RAG_API_URL = typeof window.RAG_API_URL !== 'undefined' ? window.RAG_API_URL : '';

    // AUTH API URL - defaults to empty string (relative path) for same-host deployment
    window.AUTH_API_URL = typeof window.AUTH_API_URL !== 'undefined' ? window.AUTH_API_URL : '';

    // For build-time replacement, these values can be set during the build process
    // Example build command: RAG_API_URL=https://your-backend.com npm run build
  }
})();