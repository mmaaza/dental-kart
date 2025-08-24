import React, { useState, useRef, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import SearchResults from './SearchResults';

const SearchBar = ({ className, placeholder }) => {
  const { searchQuery, setSearchQuery, performSearch, showResults, setShowResults, clearSearch } = useSearch();
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

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
    setSearchQuery(value);
    
    if (value.trim().length >= 2) {
      performSearch(value);
    } else if (value.trim() === '') {
      clearSearch();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (searchQuery.trim().length >= 2) {
      setShowResults(true);
    } else {
      // Show recent searches when focused without query
      setShowResults(true);
    }
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
            value={searchQuery}
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
          {searchQuery && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => {
                clearSearch();
                searchInputRef.current.focus();
              }}
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
          <SearchResults onClose={() => setShowResults(false)} />
        </div>
      )}
    </div>
  );
};

export default SearchBar;
