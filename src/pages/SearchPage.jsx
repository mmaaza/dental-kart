import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';
import HighlightedText from '../components/ui/HighlightedText';
import SearchFilters from '../components/ui/SearchFilters';
import SearchSorting from '../components/ui/SearchSorting';
import RelatedSearches from '../components/ui/RelatedSearches';

const SearchPage = () => {
  const { 
    searchQuery, 
    searchResults, 
    isSearching, 
    performSearch, 
    totalResults, 
    currentPage, 
    totalPages,
    loadNextPage,
    loadPreviousPage,
    searchCategories
  } = useSearch();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q');
  const pageParam = searchParams.get('page');
  const sortParam = searchParams.get('sort');
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortOption, setSortOption] = useState(sortParam || 'relevance');
  const [filteredResults, setFilteredResults] = useState([]);
  
  // Effect to perform search when the page loads with a query parameter
  useEffect(() => {
    if (queryParam) {
      const page = pageParam ? parseInt(pageParam) : 1;
      performSearch(queryParam, page);
    }
  }, [queryParam, pageParam, performSearch]);
  
  // Sort and filter the results
  useEffect(() => {
    // First, filter by category if needed
    let results = [...searchResults];
    if (activeFilter !== 'all') {
      results = results.filter(result => result.category === activeFilter);
    }
    
    // Then sort according to the selected sort option
    results.sort((a, b) => {
      switch(sortOption) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'price-low':
          // Only applicable to products
          if (a.price && b.price) return a.price - b.price;
          if (a.price) return -1;
          if (b.price) return 1;
          return 0;
        case 'price-high':
          // Only applicable to products
          if (a.price && b.price) return b.price - a.price;
          if (a.price) return -1;
          if (b.price) return 1;
          return 0;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'relevance':
        default:
          // Keep the original order (sorted by relevance from the API)
          return 0;
      }
    });
    
    setFilteredResults(results);
  }, [searchResults, activeFilter, sortOption]);
  
  const handleSortChange = (sort) => {
    setSortOption(sort);
    // Update URL params to include the sort option
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sort);
    setSearchParams(newParams);
  };
  
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };
  
  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
    
    if (page > currentPage) {
      loadNextPage();
    } else if (page < currentPage) {
      loadPreviousPage();
    }
  };
  
  // Group filtered results by category
  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {});

  // Get count by category for displaying in filters
  const resultCountByCategory = searchResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = 0;
    }
    acc[result.category]++;
    return acc;
  }, {});

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{searchQuery || queryParam}"</h1>
      
      {searchResults.length > 0 && (
        <>
          <SearchFilters onFilterChange={handleFilterChange} />
          
          {filteredResults.length > 0 && activeFilter !== 'categories' && activeFilter !== 'brands' && (
            <div className="mb-2">
              <SearchSorting onSortChange={handleSortChange} />
            </div>
          )}
        </>
      )}
      
      {isSearching ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-pulse flex space-x-4 items-center">
            <div className="h-5 w-5 bg-primary-400 rounded-full"></div>
            <div className="h-5 w-5 bg-primary-400 rounded-full"></div>
            <div className="h-5 w-5 bg-primary-400 rounded-full"></div>
          </div>
          <p className="ml-4 text-lg text-gray-600">Searching...</p>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="text-center py-12 px-4">
          <svg 
            className="mx-auto h-16 w-16 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <p className="mt-4 text-xl text-gray-500">No results found for "{searchQuery || queryParam}"</p>
          <p className="mt-2 text-gray-400">Try different keywords or check your spelling</p>
          
          <div className="mt-8 max-w-md mx-auto">
            <h3 className="font-medium text-gray-700 mb-3">Search suggestions:</h3>
            <ul className="text-left text-gray-600 space-y-2">
              <li className="flex items-start">
                <svg className="mt-1 mr-2 w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Check for spelling mistakes</span>
              </li>
              <li className="flex items-start">
                <svg className="mt-1 mr-2 w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Try using more general terms</span>
              </li>
              <li className="flex items-start">
                <svg className="mt-1 mr-2 w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Try searching by category or brand name</span>
              </li>
              <li className="flex items-start">
                <svg className="mt-1 mr-2 w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Reduce the number of search terms</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <Link to="/products" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Browse All Products
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              Found {totalResults} results for "{searchQuery || queryParam}"
              {activeFilter !== 'all' && ` (Showing ${filteredResults.length} ${searchCategories[activeFilter]} results)`}
            </p>
          </div>
        
          <div className="space-y-8">
            {Object.entries(groupedResults).map(([category, results]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                  {searchCategories[category] || category} ({results.length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.map((result) => (
                    <Link 
                      to={result.path} 
                      key={`${result.category}-${result.id}`}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col"
                    >
                      {result.image && (
                        <div className="h-48 overflow-hidden bg-gray-100">
                          <img 
                            src={result.image} 
                            alt={result.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                         <div className="p-4 flex-grow">
                      <h3 className="font-medium text-lg mb-1 text-primary-700">
                        <HighlightedText text={result.name} highlight={searchQuery || queryParam} />
                      </h3>
                      
                      {result.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          <HighlightedText text={result.description} highlight={searchQuery || queryParam} />
                        </p>
                      )}
                        
                        {result.price && (
                          <div className="mt-2 font-semibold text-primary-600">
                            Rs. {result.price.toFixed(2)}
                          </div>
                        )}
                        
                        {result.tags && result.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {result.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                            {result.tags.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                +{result.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {/* Related Searches */}
          {filteredResults.length > 0 && (
            <RelatedSearches query={searchQuery || queryParam} />
          )}
          
          {filteredResults.length > 0 && totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-1">
                {/* Previous page button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={`px-2 py-2 border rounded-l-md ${
                    currentPage <= 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-primary-50'
                  }`}
                  aria-label="Previous page"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                
                {/* Page numbers */}
                <div className="hidden sm:flex">
                  {/* Logic for displaying page numbers with ellipsis */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(pageNum => {
                      // Always show first and last page
                      if (pageNum === 1 || pageNum === totalPages) return true;
                      // Always show current page and pages adjacent to current
                      if (Math.abs(pageNum - currentPage) <= 1) return true;
                      // Don't show other pages
                      return false;
                    })
                    .map((pageNum, index, array) => {
                      // Check if we need to show ellipsis
                      const showEllipsisBefore = index > 0 && pageNum > array[index - 1] + 1;
                      const showEllipsisAfter = index < array.length - 1 && pageNum < array[index + 1] - 1;
                      
                      return (
                        <React.Fragment key={pageNum}>
                          {showEllipsisBefore && (
                            <span className="px-4 py-2 border bg-white text-gray-400">…</span>
                          )}
                          
                          <button
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-4 py-2 border ${
                              currentPage === pageNum
                                ? 'bg-primary-50 border-primary-500 text-primary-600'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                          
                          {showEllipsisAfter && (
                            <span className="px-4 py-2 border bg-white text-gray-400">…</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                </div>
                
                {/* Mobile pagination display */}
                <div className="sm:hidden px-4 py-2 border bg-white rounded-md">
                  Page {currentPage} of {totalPages}
                </div>
                
                {/* Next page button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={`px-2 py-2 border rounded-r-md ${
                    currentPage >= totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-primary-50'
                  }`}
                  aria-label="Next page"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
