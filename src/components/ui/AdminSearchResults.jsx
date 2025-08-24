import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminSearch } from '../../contexts/AdminSearchContext';

const AdminSearchResults = () => {
  const { 
    searchResults, 
    isSearching, 
    showResults, 
    setShowResults, 
    searchCategories,
    clearSearch,
    handleKeyNavigation,
    selectedResultIndex
  } = useAdminSearch();
  const resultsRef = useRef(null);
  const navigate = useNavigate();
  
  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowResults]);
  
  // Handle keyboard navigation and escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showResults) {
        handleKeyNavigation(e.key);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showResults, handleKeyNavigation]);
  
  // Scroll selected item into view
  useEffect(() => {
    if (selectedResultIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedResultIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedResultIndex]);
  
  if (!showResults || (searchResults.length === 0 && !isSearching)) {
    return null;
  }
  
  // Group results by category
  const groupedResults = searchResults.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});
  
  const handleResultClick = (path) => {
    navigate(path);
    clearSearch();
  };
  
  // Helper function to render HTML content safely
  const renderHTML = (html) => {
    return { __html: html };
  };
  
  return (
    <div 
      ref={resultsRef} 
      className="absolute z-50 mt-2 w-full max-w-lg bg-white dark:bg-admin-slate-800 rounded-md shadow-lg py-1 border border-admin-slate-200 dark:border-admin-slate-700 max-h-[70vh] overflow-y-auto"
    >
      {isSearching ? (
        <div className="px-4 py-3 text-sm text-admin-slate-500 dark:text-admin-slate-400">
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-admin-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Searching...
          </div>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="px-4 py-3 text-sm text-admin-slate-500 dark:text-admin-slate-400">
          No results found
        </div>
      ) : (
        <div>
          {Object.keys(groupedResults).map((category) => (
            <div key={category}>
              <div className="px-4 py-2 text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider bg-admin-slate-50 dark:bg-admin-slate-700/50">
                {searchCategories[category] || category}
              </div>
              <ul className="py-1">
                {groupedResults[category].map((result, index) => {
                  // Get global index of this result
                  const globalIndex = searchResults.findIndex(r => r.id === result.id);
                  const isSelected = selectedResultIndex === globalIndex;
                  
                  return (
                    <li key={`${category}-${index}`} data-index={globalIndex}>
                      <button
                        onClick={() => handleResultClick(result.path)}
                        className={`w-full text-left px-4 py-2 text-sm text-admin-slate-700 dark:text-admin-slate-200 flex items-center ${
                          isSelected 
                            ? 'bg-admin-slate-100 dark:bg-admin-slate-700' 
                            : 'hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/70'
                        }`}
                      >
                      {/* Icon based on category */}
                      <span className="mr-3 flex-shrink-0 text-admin-slate-500 dark:text-admin-slate-400">
                        {category === 'navigation' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                        {category === 'dashboard' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                        {category === 'products' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        )}
                        {category === 'orders' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        )}
                        {category === 'customers' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        {category === 'categories' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        )}
                        {category === 'brands' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                        {category === 'settings' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        {category === 'vendors' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                        {category === 'media' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                        {category === 'blog' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        )}
                        {category === 'reviews' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                        {category === 'carts' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )}
                        {category === 'analytics' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        )}
                        {category === 'notifications' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        )}
                        {category === 'users' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                      </span>
                      <div>
                        <div 
                          className="font-medium" 
                          dangerouslySetInnerHTML={renderHTML(result.nameHighlighted || result.name)}
                        />
                        {result.description && (
                          <div 
                            className="text-xs text-admin-slate-500 dark:text-admin-slate-400 mt-0.5"
                            dangerouslySetInnerHTML={renderHTML(result.descriptionHighlighted || result.description)}
                          />
                        )}
                      </div>
                      {isSelected && (
                        <div className="ml-auto text-admin-slate-400">
                          <kbd className="px-1 py-0.5 text-xs rounded bg-admin-slate-100 dark:bg-admin-slate-700 border border-admin-slate-200 dark:border-admin-slate-600">
                            ↵
                          </kbd>
                        </div>
                      )}
                    </button>
                  </li>
                )})}
              </ul>
            </div>
          ))}
        </div>
      )}
      
      {/* Search help footer */}
      <div className="px-4 py-2 text-xs border-t border-admin-slate-200 dark:border-admin-slate-700">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-admin-slate-500 dark:text-admin-slate-400">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-700 dark:text-admin-slate-300 mr-1">
              ↑↓
            </span>
            to navigate
          </div>
          <div className="text-admin-slate-500 dark:text-admin-slate-400">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-700 dark:text-admin-slate-300 mr-1">
              Enter
            </span>
            to select
          </div>
          <div className="text-admin-slate-500 dark:text-admin-slate-400">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-700 dark:text-admin-slate-300 mr-1">
              Esc
            </span>
            to close
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSearchResults;