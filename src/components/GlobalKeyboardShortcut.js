import React from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import { usePluginData } from '@docusaurus/useGlobalData';

const GlobalKeyboardShortcut = () => {
  const location = useLocation();

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if Ctrl+K or Cmd+K is pressed
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();

        // Find and click the search icon if it exists
        const searchIcon = document.getElementById('search-icon-placeholder');
        if (searchIcon) {
          searchIcon.click();
          event.preventDefault();
          return;
        }

        // Alternative: look for search input by class
        const searchInput = document.querySelector('.navbar__search-input');
        if (searchInput) {
          searchInput.focus();
          event.preventDefault();
          return;
        }

        // Last resort: look for any search input in navbar
        const anySearchInput = document.querySelector('.navbar__search input');
        if (anySearchInput) {
          anySearchInput.focus();
          event.preventDefault();
        }
      }
    };

    // Add event listener to the document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [location.pathname]); // Add location pathname as dependency to re-register when route changes

  return null; // This component doesn't render anything
};

export default GlobalKeyboardShortcut;