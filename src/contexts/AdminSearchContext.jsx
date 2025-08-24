// filepath: /home/maaz/Web Work/mbnepal/src/contexts/AdminSearchContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';

const AdminSearchContext = createContext();

export const useAdminSearch = () => {
  return useContext(AdminSearchContext);
};

export const AdminSearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('adminRecentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const fuseInstance = useRef(null);
  const searchCache = useRef({});
  const navigate = useNavigate();

  // Categories of searchable admin content
  const searchCategories = {
    navigation: 'Navigation',
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    customers: 'Customers',
    categories: 'Categories',
    brands: 'Brands',
    settings: 'Settings',
    vendors: 'Vendors',
    media: 'Media',
    blog: 'Blog',
    reviews: 'Reviews',
    carts: 'Carts',
    analytics: 'Analytics',
    notifications: 'Notifications',
    users: 'Admin Users'
  };

  // Define searchable admin content
  const adminSearchableData = useRef([
    // Navigation items
    { name: 'Dashboard', path: '/admin', category: 'navigation', description: 'Go to Dashboard section', importance: 10 },
    { name: 'Analytics', path: '/admin/analytics', category: 'navigation', description: 'View detailed site analytics', importance: 9 },
    { name: 'Products', path: '/admin/products', category: 'navigation', description: 'Manage product inventory', importance: 10 },
    { name: 'Orders', path: '/admin/orders', category: 'navigation', description: 'View and manage customer orders', importance: 10 },
    { name: 'Customers', path: '/admin/customers', category: 'navigation', description: 'Manage customer accounts', importance: 9 },
    { name: 'Categories', path: '/admin/categories', category: 'navigation', description: 'Manage product categories', importance: 9 },
    { name: 'Brands', path: '/admin/brands', category: 'navigation', description: 'Manage product brands', importance: 9 },
    { name: 'Media', path: '/admin/media', category: 'navigation', description: 'Manage media library', importance: 8 },
    { name: 'Blog', path: '/admin/blog', category: 'navigation', description: 'Manage blog posts', importance: 8 },
    { name: 'Admin Users', path: '/admin/users', category: 'navigation', description: 'Manage admin user accounts and permissions', importance: 7 },
    { name: 'Vendors', path: '/admin/vendors', category: 'navigation', description: 'Manage vendor accounts', importance: 8 },
    { name: 'Push Notifications', path: '/admin/notifications', category: 'navigation', description: 'Manage system notifications', importance: 7 },
    { name: 'Settings', path: '/admin/settings', category: 'navigation', description: 'Configure site settings', importance: 8 },
    { name: 'Reviews', path: '/admin/reviews', category: 'navigation', description: 'View and manage product reviews', importance: 8 },
    { name: 'Carts', path: '/admin/carts', category: 'navigation', description: 'View active customer shopping carts', importance: 7 },
    
    // Dashboard sections
    { name: 'Revenue Overview', path: '/admin', category: 'dashboard', description: 'View revenue metrics and trends', importance: 9 },
    { name: 'Recent Orders', path: '/admin', category: 'dashboard', description: 'See the latest customer orders', importance: 9 },
    { name: 'Order Status Distribution', path: '/admin', category: 'dashboard', description: 'View orders by status', importance: 8 },
    { name: 'P&L Statement', path: '/admin', category: 'dashboard', description: 'Profit and loss statement', importance: 8 },
    { name: 'Best Selling Products', path: '/admin', category: 'dashboard', description: 'See top performing products', importance: 9 },
    { name: 'Payment Methods', path: '/admin', category: 'dashboard', description: 'View payment method breakdown', importance: 8 },
    
    // Product management
    { name: 'All Products', path: '/admin/products', category: 'products', description: 'View all products', importance: 9 },
    { name: 'Add New Product', path: '/admin/products/create', category: 'products', description: 'Create a new product', importance: 9 },
    { name: 'Product Inventory', path: '/admin/products', category: 'products', description: 'Manage product stock levels', importance: 8 },
    { name: 'Product Drafts', path: '/admin/products', category: 'products', description: 'View and edit product drafts', importance: 7 },
    
    // Order management
    { name: 'All Orders', path: '/admin/orders', category: 'orders', description: 'View all customer orders', importance: 9 },
    { name: 'Pending Orders', path: '/admin/orders', category: 'orders', description: 'View orders awaiting processing', importance: 10 },
    { name: 'Completed Orders', path: '/admin/orders', category: 'orders', description: 'View fulfilled orders', importance: 8 },
    { name: 'Cancelled Orders', path: '/admin/orders', category: 'orders', description: 'View cancelled orders', importance: 7 },
    { name: 'Update Order Status', path: '/admin/orders', category: 'orders', description: 'Change the status of an order', importance: 8 },
    { name: 'Update Payment Status', path: '/admin/orders', category: 'orders', description: 'Mark payments as received or refunded', importance: 8 },
    
    // Customer management
    { name: 'All Customers', path: '/admin/customers', category: 'customers', description: 'View all customer accounts', importance: 9 },
    { name: 'Active Customers', path: '/admin/customers', category: 'customers', description: 'View active customer accounts', importance: 8 },
    { name: 'Customer Support', path: '/admin/customers', category: 'customers', description: 'Handle customer support requests', importance: 8 },
    
    // Category management
    { name: 'All Categories', path: '/admin/categories', category: 'categories', description: 'View all product categories', importance: 9 },
    { name: 'Add New Category', path: '/admin/categories', category: 'categories', description: 'Create a new product category', importance: 8 },
    { name: 'Edit Category', path: '/admin/categories', category: 'categories', description: 'Edit an existing category', importance: 7 },
    { name: 'Toggle Category Status', path: '/admin/categories', category: 'categories', description: 'Enable or disable categories', importance: 7 },
    
    // Brand management
    { name: 'All Brands', path: '/admin/brands', category: 'brands', description: 'View all product brands', importance: 9 },
    { name: 'Add New Brand', path: '/admin/brands', category: 'brands', description: 'Create a new brand', importance: 8 },
    { name: 'Edit Brand', path: '/admin/brands', category: 'brands', description: 'Edit an existing brand', importance: 7 },
    { name: 'Toggle Brand Status', path: '/admin/brands', category: 'brands', description: 'Enable or disable brands', importance: 7 },
    
    // Settings pages
    { name: 'Homepage Settings', path: '/admin/settings/homepage', category: 'settings', description: 'Configure homepage content and layout', importance: 8 },
    { name: 'Navigation Settings', path: '/admin/settings/navigation', category: 'settings', description: 'Configure site navigation', importance: 8 },
    { name: 'SEO Settings', path: '/admin/settings/seo', category: 'settings', description: 'Configure SEO parameters', importance: 7 },
    { name: 'Social Media Settings', path: '/admin/settings/social', category: 'settings', description: 'Configure social media links', importance: 7 },
    { name: 'Contact Settings', path: '/admin/settings/contact', category: 'settings', description: 'Configure contact information', importance: 7 },
    { name: 'Email Settings', path: '/admin/settings/email', category: 'settings', description: 'Configure email notifications', importance: 7 },
    { name: 'Attributes Settings', path: '/admin/settings/attributes', category: 'settings', description: 'Configure product attributes', importance: 7 },
    { name: 'User Permissions', path: '/admin/users', category: 'settings', description: 'Manage user roles and permissions', importance: 7 },
    
    // Vendor management
    { name: 'All Vendors', path: '/admin/vendors', category: 'vendors', description: 'View all vendors', importance: 9 },
    { name: 'Add New Vendor', path: '/admin/vendors', category: 'vendors', description: 'Add a new vendor account', importance: 8 },
    { name: 'Edit Vendor', path: '/admin/vendors', category: 'vendors', description: 'Edit vendor information', importance: 7 },
    { name: 'Vendor Products', path: '/admin/vendors', category: 'vendors', description: 'View products by vendor', importance: 7 },
    
    // Media management
    { name: 'Media Library', path: '/admin/media', category: 'media', description: 'Browse all uploaded media', importance: 8 },
    { name: 'Upload Files', path: '/admin/media', category: 'media', description: 'Upload new media files', importance: 8 },
    { name: 'Delete Media', path: '/admin/media', category: 'media', description: 'Remove unused media files', importance: 7 },
    
    // Blog management
    { name: 'All Posts', path: '/admin/blog', category: 'blog', description: 'View all blog posts', importance: 8 },
    { name: 'Create Post', path: '/admin/blog', category: 'blog', description: 'Write a new blog post', importance: 8 },
    { name: 'Draft Posts', path: '/admin/blog', category: 'blog', description: 'View unpublished blog posts', importance: 7 },
    
    // Review management
    { name: 'All Reviews', path: '/admin/reviews', category: 'reviews', description: 'View all product reviews', importance: 8 },
    { name: 'Pending Reviews', path: '/admin/reviews', category: 'reviews', description: 'Reviews awaiting approval', importance: 9 },
    { name: 'Reported Reviews', path: '/admin/reviews', category: 'reviews', description: 'Reviews flagged by users', importance: 8 },
    
    // Cart management
    { name: 'Active Carts', path: '/admin/carts', category: 'carts', description: 'View all active shopping carts', importance: 8 },
    { name: 'Abandoned Carts', path: '/admin/carts', category: 'carts', description: 'View abandoned shopping carts', importance: 8 },
    
    // Analytics
    { name: 'Sales Analytics', path: '/admin/analytics', category: 'analytics', description: 'View sales performance metrics', importance: 9 },
    { name: 'Customer Analytics', path: '/admin/analytics', category: 'analytics', description: 'View customer behavior data', importance: 8 },
    { name: 'Product Analytics', path: '/admin/analytics', category: 'analytics', description: 'View product performance data', importance: 8 },
    
    // Notification management
    { name: 'Send Notification', path: '/admin/notifications', category: 'notifications', description: 'Send a new push notification', importance: 8 },
    { name: 'Notification History', path: '/admin/notifications', category: 'notifications', description: 'View past notifications', importance: 7 },
    
    // User management
    { name: 'All Users', path: '/admin/users', category: 'users', description: 'View all administrator users', importance: 8 },
    { name: 'Add New User', path: '/admin/users', category: 'users', description: 'Create a new admin user', importance: 7 },
    { name: 'Edit User Permissions', path: '/admin/users', category: 'users', description: 'Change user permissions', importance: 7 }
  ]);

  // Initialize Fuse.js for fuzzy searching
  useEffect(() => {
    const options = {
      includeScore: true,
      threshold: 0.3,
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'description', weight: 0.3 },
        { name: 'category', weight: 0.1 }
      ],
      shouldSort: true,
      ignoreLocation: true,
      findAllMatches: true,
      minMatchCharLength: 2,
      location: 0,
      distance: 100,
      useExtendedSearch: true
    };
    
    // Create Fuse instance with admin searchable data
    fuseInstance.current = new Fuse(adminSearchableData.current, options);
  }, []);

  const addToRecentSearches = useCallback((query) => {
    // Only add non-empty queries to recent searches
    if (!query.trim()) return;
    
    // Add to recent searches (remove duplicates and keep most recent)
    setRecentSearches((prev) => {
      const newSearches = prev.filter(item => item.toLowerCase() !== query.toLowerCase());
      // Add to beginning of array, limit to 10 items
      const updatedSearches = [query, ...newSearches].slice(0, 10);
      // Save to localStorage
      localStorage.setItem('adminRecentSearches', JSON.stringify(updatedSearches));
      return updatedSearches;
    });
  }, []);
  
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('adminRecentSearches');
  }, []);

  // Prioritize search results
  const prioritizeResults = useCallback((results) => {
    if (!results || results.length === 0) return [];
    
    return results.sort((a, b) => {
      // First check for exact name matches - these should always be at the top
      const aNameLower = a.item.name.toLowerCase();
      const bNameLower = b.item.name.toLowerCase();
      const queryLower = searchQuery.toLowerCase();
      
      if (aNameLower === queryLower && bNameLower !== queryLower) return -1;
      if (bNameLower === queryLower && aNameLower !== queryLower) return 1;
      
      // Next check for matches at the beginning of the name
      if (aNameLower.startsWith(queryLower) && !bNameLower.startsWith(queryLower)) return -1;
      if (bNameLower.startsWith(queryLower) && !aNameLower.startsWith(queryLower)) return 1;
      
      // Then consider importance
      if (a.item.importance !== b.item.importance) {
        return b.item.importance - a.item.importance;
      }
      
      // Finally, use Fuse.js score for overall relevance
      return a.score - b.score;
    });
  }, [searchQuery]);

  // Highlight matched text in search results
  const highlightMatch = useCallback((text, query) => {
    if (!query.trim() || !text) return text;
    
    try {
      // Split query into words for better highlighting
      const queryTerms = query.trim().split(/\s+/).map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      // Create a regex that matches any of the query terms
      const regex = new RegExp(`(${queryTerms.join('|')})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    } catch (error) {
      return text;
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setCurrentPage(1);
    setSelectedResultIndex(-1);
  }, []);

  const navigateToSearchResult = useCallback((result) => {
    navigate(result.path);
    clearSearch();
  }, [navigate, clearSearch]);

  // Handle keyboard navigation
  const handleKeyNavigation = useCallback((key) => {
    if (!showResults || searchResults.length === 0) return;
    
    switch (key) {
      case 'ArrowDown':
        setSelectedResultIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        setSelectedResultIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        if (selectedResultIndex >= 0 && selectedResultIndex < searchResults.length) {
          navigateToSearchResult(searchResults[selectedResultIndex]);
        }
        break;
      case 'Escape':
        clearSearch();
        break;
      default:
        break;
    }
  }, [clearSearch, navigateToSearchResult, searchResults, selectedResultIndex, showResults]);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      setSelectedResultIndex(-1);
      return;
    }
    
    // Reset selected index
    setSelectedResultIndex(-1);
    
    // Add to recent searches
    addToRecentSearches(query.trim());

    setIsSearching(true);
    setShowResults(true);

    try {
      // Check cache first
      const cacheKey = query.toLowerCase().trim();
      if (searchCache.current[cacheKey]) {
        setSearchResults(searchCache.current[cacheKey]);
        setTotalResults(searchCache.current[cacheKey].length);
        setIsSearching(false);
        return;
      }
      
      // Perform fuzzy search with timeout to avoid blocking UI
      setTimeout(() => {
        // Get fuzzy search results
        const fuzzyResults = fuseInstance.current.search(query);
        
        // Prioritize and format results
        const prioritizedResults = prioritizeResults(fuzzyResults);
        const formattedResults = prioritizedResults.map((result) => {
          const { item, score } = result;
          return {
            ...item,
            id: `${item.category}-${item.name}`,
            name: item.name,
            nameHighlighted: highlightMatch(item.name, query),
            descriptionHighlighted: highlightMatch(item.description, query),
            score
          };
        });

        // Cache results
        searchCache.current[cacheKey] = formattedResults;
        
        // Update state
        setSearchResults(formattedResults);
        setTotalResults(formattedResults.length);
        setTotalPages(Math.ceil(formattedResults.length / 10));
        setCurrentPage(1);
        setIsSearching(false);
      }, 100);
      
    } catch (error) {
      console.error('Admin search error:', error);
      setSearchResults([]);
      setTotalResults(0);
      setTotalPages(1);
      setIsSearching(false);
    }
  }, [addToRecentSearches, highlightMatch, prioritizeResults]);
  
  const performSearch = useCallback((query) => {
    setSearchQuery(query);
    handleSearch(query);
  }, [handleSearch]);

  // Debounced search to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Add search data dynamically (can be used to add more searchable content from APIs)
  const addSearchData = useCallback((newData) => {
    // Ensure data has required properties and transform if needed
    const processedData = newData.map(item => ({
      id: item.id || `${item.category}-${item.name}`,
      name: item.name,
      path: item.path,
      category: item.category,
      description: item.description || '',
      importance: item.importance || 5
    }));
    
    // Check for duplicates to avoid adding the same item multiple times
    const existingIds = new Set(adminSearchableData.current.map(item => 
      item.id || `${item.category}-${item.name}`
    ));
    
    // Filter out duplicates
    const uniqueNewData = processedData.filter(item => 
      !existingIds.has(item.id || `${item.category}-${item.name}`)
    );
    
    if (uniqueNewData.length > 0) {
      // Add new unique data
      adminSearchableData.current = [...adminSearchableData.current, ...uniqueNewData];
      
      // Recreate Fuse instance with updated data
      const options = {
        includeScore: true,
        threshold: 0.3,
        keys: [
          { name: 'name', weight: 0.7 },
          { name: 'description', weight: 0.3 },
          { name: 'category', weight: 0.1 }
        ],
        shouldSort: true,
        ignoreLocation: true,
        findAllMatches: true,
        minMatchCharLength: 2
      };
      fuseInstance.current = new Fuse(adminSearchableData.current, options);
      
      // Clear cache when data changes
      searchCache.current = {};
      
      return true;
    }
    
    return false;
  }, []);

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
    clearRecentSearches,
    searchCategories,
    handleKeyNavigation,
    selectedResultIndex,
    setSelectedResultIndex,
    addSearchData
  };

  return (
    <AdminSearchContext.Provider value={value}>
      {children}
    </AdminSearchContext.Provider>
  );
};
