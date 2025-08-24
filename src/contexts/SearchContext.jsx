import React, { createContext, useContext, useState, useCallback } from 'react';
import api, { searchProducts } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { trackSearch } from '../utils/metaPixel';

const SearchContext = createContext();

export const useSearch = () => {
  return useContext(SearchContext);
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();

  // Categories of searchable content
  const searchCategories = {
    products: 'Products',
    brands: 'Brands',
    categories: 'Categories',
  };

  const addToRecentSearches = (query) => {
    // Only add non-empty queries to recent searches
    if (!query.trim()) return;
    
    // Add to recent searches (remove duplicates and keep most recent)
    setRecentSearches((prev) => {
      const newSearches = prev.filter(item => item.toLowerCase() !== query.toLowerCase());
      // Add to beginning of array, limit to 10 items
      const updatedSearches = [query, ...newSearches].slice(0, 10);
      // Save to localStorage
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      return updatedSearches;
    });
  };
  
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleSearch = async (query, page = 1, limit = 20) => {
    console.log('Search triggered with query:', query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    // Add to recent searches
    addToRecentSearches(query.trim());

    setIsSearching(true);
    setShowResults(true);

    try {
      console.log('Sending search request to API:', query.trim(), page, limit);
      // Call the backend API to search across products, brands, and categories
      const response = await searchProducts(query.trim(), page, limit);
      console.log('Search API response:', response);
      
      // Format the search results
      const formattedResults = [];
      
      // Process products
      if (response.data.products && response.data.products.length > 0) {
        const products = response.data.products.map(product => ({
          id: product._id,
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0] : null,
          path: `/product/${product.slug}`,
          category: 'products',
          description: product.shortDescription || '',
          price: product.price,
          tags: product.tags || [],
        }));
        formattedResults.push(...products);
      }
      
      // Process brands
      if (response.data.brands && response.data.brands.length > 0) {
        const brands = response.data.brands.map(brand => ({
          id: brand._id,
          name: brand.name,
          image: brand.logo || null,
          path: `/brands/${brand.slug}`,
          category: 'brands',
          description: brand.description || '',
        }));
        formattedResults.push(...brands);
      }
      
      // Process categories
      if (response.data.categories && response.data.categories.length > 0) {
        const categories = response.data.categories.map(category => ({
          id: category._id,
          name: category.name,
          image: category.image || null,
          path: `/category/${category.slug}`,
          category: 'categories',
          description: category.description || '',
        }));
        formattedResults.push(...categories);
      }

      // Sort results by relevance - exact matches first, then by category
      const lowerQuery = query.toLowerCase();
      const sortedResults = formattedResults.sort((a, b) => {
        // Exact matches come first
        const aExact = a.name.toLowerCase() === lowerQuery;
        const bExact = b.name.toLowerCase() === lowerQuery;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Then sort by whether name starts with the query
        const aStarts = a.name.toLowerCase().startsWith(lowerQuery);
        const bStarts = b.name.toLowerCase().startsWith(lowerQuery);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        // Check for tags and keywords matching (for products)
        if (a.category === 'products' && b.category === 'products') {
          const aTagMatch = a.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
          const bTagMatch = b.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
          
          if (aTagMatch && !bTagMatch) return -1;
          if (!aTagMatch && bTagMatch) return 1;
        }
        
        // Then sort by category
        return a.category.localeCompare(b.category);
      });

      setSearchResults(sortedResults);
      setTotalResults(response.data.totalResults || sortedResults.length);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(page);

      // Track Search event with Meta Pixel
      try {
        const productIds = formattedResults
          .filter(item => item.category === 'products')
          .map(item => item.id);
        
        trackSearch({
          search_string: query.trim(),
          content_ids: productIds
        });
      } catch (trackingError) {
        console.warn('Meta Pixel tracking failed:', trackingError);
      }
    } catch (error) {
      console.error('Search error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      setSearchResults([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setCurrentPage(1);
  };

  const navigateToSearchResult = (result) => {
    navigate(result.path);
    clearSearch();
  };
  
  const performSearch = useCallback((query, page = 1) => {
    setSearchQuery(query);
    handleSearch(query, page);
  }, []);

  const navigateToSearchResultsPage = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  };

  const loadNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      handleSearch(searchQuery, nextPage);
    }
  };

  const loadPreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      handleSearch(searchQuery, prevPage);
    }
  };

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showResults,
    setShowResults,
    totalResults,
    currentPage,
    totalPages,
    recentSearches,
    handleSearch,
    clearSearch,
    navigateToSearchResult,
    performSearch,
    navigateToSearchResultsPage,
    loadNextPage,
    loadPreviousPage,
    clearRecentSearches,
    addToRecentSearches,
    searchCategories
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};