import React, { useState, useRef, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useDebounce } from '../../hooks/useDebounce';
import SearchResultsWithQuery from './SearchResultsWithQuery';

const SearchBarWithQuery = ({ className, placeholder }) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    showResults, 
    setShowResults, 
    clearSearch,
    recentSearches,
    addToRecentSearches 
  } = useSearch();
  
  const [isFocused, setIsFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Debounce the search query by 300ms
  const debouncedQuery = useDebounce(localQuery, 300);

  // Update search context when debounced query changes
  useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery, setSearchQuery]);

  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowResults]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    
    // Show results if we have a query or recent searches
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
      setShowResults(false);
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(localQuery.trim())}`;
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (localQuery.trim().length >= 2 || recentSearches.length > 0) {
      setShowResults(true);
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    clearSearch();
    searchInputRef.current.focus();
  };

  return (
    <div 
      className={`relative ${className || ''}`}
      ref={searchContainerRef}
    >
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <input
            type="text"
            ref={searchInputRef}
            placeholder={placeholder || "Search..."}
            value={localQuery}
            onChange={handleInputChange}
            onFocus={handleFocus}
            className={`w-full py-2 pl-10 pr-4 rounded-md text-gray-700 
                      focus:outline-none focus:ring-2 focus:ring-primary-400 
                      border border-gray-300 bg-white
                      ${isFocused ? 'ring-2 ring-primary-400' : ''}`}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
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
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={handleClear}
            >
              <svg
                className="h-5 w-5 text-gray-400 hover:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </form>
      
      {showResults && (
        <div className="absolute top-full left-0 right-0 z-50">
          <SearchResultsWithQuery 
            searchQuery={debouncedQuery} 
            onClose={() => setShowResults(false)} 
          />
        </div>
      )}
    </div>
  );
};

export default SearchBarWithQuery;
