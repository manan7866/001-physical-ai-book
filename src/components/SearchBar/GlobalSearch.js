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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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