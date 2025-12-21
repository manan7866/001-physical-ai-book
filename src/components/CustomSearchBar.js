import React, { useState } from 'react';
import { useSearchPage } from '@docusaurus/theme-common';
import { translate } from '@docusaurus/Translate';

const CustomSearchBar = () => {
  const isSearchPage = useSearchPage();
  const [isFocused, setIsFocused] = useState(false);

  // If we're on the search page, don't render the search bar to avoid conflicts
  if (isSearchPage) {
    return null;
  }

  return (
    <div className="navbar__search" key="search-box">
      <input
        id="custom-search-bar"
        className="navbar__search-input"
        type="search"
        placeholder={translate({
          id: 'theme.SearchBar.label',
          message: 'Search',
          description: 'The ARIA label and placeholder for the search bar',
        })}
        onMouseOver={() => setIsFocused(true)}
        onMouseOut={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label={translate({
          id: 'theme.SearchBar.label',
          message: 'Search',
          description: 'The ARIA label and placeholder for the search bar',
        })}
      />
    </div>
  );
};

export default CustomSearchBar;