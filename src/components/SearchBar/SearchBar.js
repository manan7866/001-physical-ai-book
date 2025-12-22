import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '@docusaurus/router';
import { useSearchPage } from '@docusaurus/theme-common/internal';
import {useDocsPreferredVersion} from '@docusaurus/theme-common/internal';
import { useHistory } from '@docusaurus/router';

const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const inputRef = useRef(null);
  const location = useLocation();

  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        onClose && onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Redirect to search results page or documentation search
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="search-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      zIndex: 1000,
      paddingTop: '15vh'
    }}>
      <div className="search-modal" style={{
        width: '90%',
        maxWidth: '700px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            flex: 1,
            position: 'relative'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search documentation..."
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  outline: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                autoFocus
              />
              <button
                type="submit"
                style={{
                  marginLeft: '10px',
                  padding: '0 20px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Search
              </button>
            </form>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              onClose && onClose();
            }}
            style={{
              marginLeft: '15px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        {/* Search suggestions or recent searches could go here */}
        <div style={{
          padding: '20px',
          maxHeight: '40vh',
          overflowY: 'auto'
        }}>
          {query ? (
            <p style={{ color: '#6b7280', textAlign: 'center' }}>
              Press Enter to search for "{query}"
            </p>
          ) : (
            <div style={{ textAlign: 'center', color: '#9ca3af' }}>
              <p>Type your search query above</p>
              <div style={{ marginTop: '15px', fontSize: '14px' }}>
                <kbd style={{
                  display: 'inline-block',
                  padding: '2px 6px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  marginRight: '5px'
                }}>Esc</kbd> to close
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;