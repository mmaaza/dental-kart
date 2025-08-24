import React, { useState, useRef } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useDebounce } from '../../hooks/useDebounce';
import SearchResultsWithQuery from './SearchResultsWithQuery';

const MobileSearchBarWithQuery = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    clearSearch, 
    recentSearches,
    addToRecentSearches 
  } = useSearch();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [headerHeight, setHeaderHeight] = useState('56px');
  const searchContainerRef = useRef(null);
  
  // Debounce the search query by 300ms
  const debouncedQuery = useDebounce(localQuery, 300);
  
  // Update search context when debounced query changes
  React.useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery, setSearchQuery]);
  
  // Update header height when search opens
  React.useEffect(() => {
    if (isSearchOpen) {
      const header = document.querySelector('header');
      if (header) {
        setHeaderHeight(`${header.getBoundingClientRect().height}px`);
      }
    }
  }, [isSearchOpen]);
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    
    if (value.trim().length >= 2 || recentSearches.length > 0) {
      setShowResults(true);
    } else if (value.trim() === '') {
      setShowResults(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      // Add to recent searches when form is submitted
      addToRecentSearches(localQuery.trim());
      setIsSearchOpen(false);
      setShowResults(false);
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(localQuery.trim())}`;
    }
  };

  const toggleSearchBar = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      // If closing the search bar, clear the search
      setLocalQuery('');
      setSearchQuery('');
      clearSearch();
      setShowResults(false);
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    clearSearch();
  };

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      {/* Always visible search input with toggle for results */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={localQuery}
          onChange={handleInputChange}
          onClick={() => setIsSearchOpen(true)}
          onFocus={() => setShowResults(true)}
          className="w-full py-2 pl-10 pr-8 rounded-md text-gray-700 focus:outline-none text-sm"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        
        {localQuery && (
          <button 
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {/* Slide-down Results Panel */}
      {isSearchOpen && (
        <>
          {/* Overlay - positioned below the header */}
          <div 
            className="fixed inset-x-0 bottom-0 bg-black bg-opacity-40 z-40" 
            style={{ top: headerHeight }}
            onClick={() => {
              setIsSearchOpen(false);
              setShowResults(false);
            }}
          ></div>
          
          {/* Results container */}
          <div className="fixed inset-x-0 mt-0 bg-primary-500 z-50" style={{ top: headerHeight }}>
            <div className="container mx-auto px-4 pb-4 pt-2 relative">
              {/* Close button for the expanded search panel */}
              <button 
                onClick={() => {
                  setIsSearchOpen(false);
                  setShowResults(false);
                }}
                className="absolute top-2 right-4 text-white p-1 rounded-full hover:bg-primary-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {showResults && (
                <div className="w-full">
                  <SearchResultsWithQuery 
                    searchQuery={debouncedQuery} 
                    onClose={() => {
                      setShowResults(false);
                      setIsSearchOpen(false);
                    }} 
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileSearchBarWithQuery;
