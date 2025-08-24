import React from 'react';
import { Link } from 'react-router-dom';
import { useSearchQuery } from '../../hooks/useSearchQuery';
import { useSearch } from '../../contexts/SearchContext';
import HighlightedText from './HighlightedText';

// Loading component for Suspense fallback
const SearchResultsLoading = () => (
  <div className="w-full bg-white shadow-lg rounded-b-md z-50 max-h-80 overflow-y-auto">
    <div className="p-4 text-center text-gray-600">
      <div className="animate-pulse flex space-x-2 justify-center">
        <div className="h-2 w-2 bg-primary-400 rounded-full animate-bounce"></div>
        <div className="h-2 w-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="h-2 w-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <p className="mt-2">Searching...</p>
    </div>
  </div>
);

// Error boundary component
class SearchErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Search error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full bg-white shadow-lg rounded-b-md z-50">
          <div className="p-4 text-center text-red-600">
            <p>Something went wrong with the search. Please try again.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main search results component
const SearchResultsContent = ({ searchQuery, onClose }) => {
  const { 
    recentSearches,
    clearRecentSearches, 
    performSearch,
    navigateToSearchResult, 
    navigateToSearchResultsPage, 
    searchCategories 
  } = useSearch();

  // Only use the query if it's long enough - pass boolean to hook
  const shouldSearch = !!(searchQuery?.trim() && searchQuery.trim().length >= 2);
  const { data: searchData, error, isLoading } = useSearchQuery(searchQuery, shouldSearch);

  if (isLoading && shouldSearch) {
    return <SearchResultsLoading />;
  }

  if (error) {
    return (
      <div className="w-full bg-white shadow-lg rounded-b-md z-50">
        <div className="p-4 text-center text-red-600">
          <p>Error searching. Please try again.</p>
        </div>
      </div>
    );
  }

  const searchResults = searchData?.results || [];

  if (!searchResults || searchResults.length === 0) {
    return (
      <div className="w-full bg-white shadow-lg rounded-b-md z-50">
        {searchQuery.trim() ? (
          <div className="p-4 text-center text-gray-600">
            <p>No results found for "{searchQuery}"</p>
          </div>
        ) : recentSearches.length > 0 ? (
          <div>
            <div className="px-4 py-2 bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-600">Recent Searches</h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  clearRecentSearches();
                }}
                className="text-xs text-primary-600 hover:text-primary-800"
              >
                Clear All
              </button>
            </div>
            <div className="divide-y">
              {recentSearches.map((query, index) => (
                <div 
                  key={index}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => {
                    performSearch(query);
                  }}
                >
                  <div className="mr-3 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{query}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-600">
            <p>Start typing to search</p>
          </div>
        )}
      </div>
    );
  }

  // Group results by category
  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {});

  return (
    <div className="w-full bg-white shadow-lg rounded-b-md z-50 max-h-[70vh] overflow-y-auto">
      {Object.entries(groupedResults).map(([category, results]) => (
        <div key={category} className="border-b last:border-b-0">
          <div className="px-4 py-2 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-600">{searchCategories[category]}</h3>
          </div>
          <div className="divide-y">
            {results.map((result) => (
              <div
                key={`${result.category}-${result.id}`}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center"
                onClick={() => {
                  navigateToSearchResult(result);
                  if (onClose) onClose();
                }}
              >
                {result.image && (
                  <div className="w-10 h-10 flex-shrink-0 mr-3">
                    <img
                      src={result.image}
                      alt={result.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex-grow">
                  <p className="font-medium text-gray-800">
                    <HighlightedText text={result.name} highlight={searchQuery} />
                  </p>
                  {result.description && (
                    <p className="text-sm text-gray-600 line-clamp-1">
                      <HighlightedText text={result.description} highlight={searchQuery} />
                    </p>
                  )}
                  {result.price && (
                    <p className="text-sm font-medium text-primary-600">Rs. {result.price.toFixed(2)}</p>
                  )}
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex flex-wrap mt-1 gap-1">
                      {result.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="p-3 bg-gray-50 text-center border-t">
        <button
          onClick={() => {
            navigateToSearchResultsPage();
            if (onClose) onClose();
          }}
          className="text-primary-600 hover:text-primary-800 font-medium text-sm flex items-center justify-center w-full"
        >
          <span>View all results</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Wrapper component with Error Boundary
const SearchResultsWithQuery = ({ searchQuery, onClose }) => {
  return (
    <SearchErrorBoundary>
      <SearchResultsContent searchQuery={searchQuery} onClose={onClose} />
    </SearchErrorBoundary>
  );
};

export default SearchResultsWithQuery;
