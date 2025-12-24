import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';

const GlobalSearch = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if Ctrl+K (or Cmd+K on Mac) is pressed
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }

      // Also allow '/' key for search (common convention)
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only trigger if we're not in an input field
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsSearchOpen(true);
        }
      }
    };

    // Handle click on search icon
    const handleSearchIconClick = () => {
      setIsSearchOpen(true);
    };

    // Add event listener for search input click with mutation observer
    const addSearchInputListener = () => {
      const searchInput = document.getElementById('search-input-placeholder');
      if (searchInput) {
        searchInput.addEventListener('click', handleSearchIconClick);
        return () => searchInput.removeEventListener('click', handleSearchIconClick);
      }
      return () => {};
    };

    // Set up mutation observer to handle dynamic content
    let removeInputListener = () => {};
    const observer = new MutationObserver(() => {
      // Remove old listener
      removeInputListener();
      // Add new listener
      removeInputListener = addSearchInputListener();
    });

    window.addEventListener('keydown', handleKeyDown);

    // Add initial listener
    removeInputListener = addSearchInputListener();

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      removeInputListener();
      observer.disconnect();
    };
  }, []);

  const handleClose = () => {
    setIsSearchOpen(false);
  };

  return (
    <>
      {isSearchOpen && <SearchBar onClose={handleClose} />}
    </>
  );
};

export default GlobalSearch;