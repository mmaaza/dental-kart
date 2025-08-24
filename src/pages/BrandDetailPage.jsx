import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ui/ProductCard';

const BrandDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState('popularity');

  // Fetch brand details
  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch brand details
        const brandResponse = await api.get(`/brands/slug/${slug}`);
        
        if (!brandResponse.data.success) {
          throw new Error('Failed to load brand information');
        }
        
        // Update brand state - product fetching will happen in the next useEffect
        setBrand(brandResponse.data.data);
      } catch (err) {
        console.error('Error loading brand details:', err);
        setError(err.message || 'Something went wrong while loading brand information');
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchBrandData();
    }
  }, [slug]);

  // Fetch products when page or sort option changes
  useEffect(() => {
    if (brand?._id) {
      fetchProducts();
    }
  }, [currentPage, sortOption]);

  // Fetch products when brand changes
  useEffect(() => {
    if (brand?._id) {
      fetchProducts();
    }
  }, [brand]);

  // Function to fetch products by brand
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Only proceed if we have a valid brand ID
      if (!brand?._id) {
        console.log("No brand ID available yet, skipping product fetch");
        return;
      }
      
      // Prepare query parameters
      const params = {
        page: currentPage,
        limit: 16,
        brand: brand._id, // Make sure to use the brand ID properly
        sort: sortOption
      };
      
      console.log("Fetching products with brand ID:", brand._id);
      
      // Use the client-side endpoint for products
      const response = await api.get('/products', { params });
      
      if (response.data.success) {
        setProducts(response.data.data.products || []);
        
        // Set pagination info
        const pagination = response.data.data.pagination;
        setTotalPages(pagination.totalPages || 1);
      } else {
        throw new Error('Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Something went wrong while loading products');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset to page 1 when sorting changes
  };

  // Loading UI
  if (loading && !brand) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="flex items-center space-x-4 mb-8">
              <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-60"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-secondary-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Brand Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/brands')}
              className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md text-sm transition duration-300"
            >
              Back to Brands
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Brand Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              {/* Breadcrumbs */}
              <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-3 overflow-x-auto whitespace-nowrap py-1">
                <Link to="/" className="hover:text-primary-500 transition-colors">Home</Link>
                <svg className="w-3 h-3 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <Link to="/brands" className="hover:text-primary-500 transition-colors">Brands</Link>
                <svg className="w-3 h-3 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700 font-medium truncate">{brand?.name || 'Brand Details'}</span>
              </div>
              
              {/* Brand info */}
              <div className="flex items-center">
                {brand?.picture ? (
                  <div className="w-16 h-16 md:w-20 md:h-20 mr-4 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                    <img 
                      src={brand.picture} 
                      alt={`${brand.name} logo`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 md:w-20 md:h-20 mr-4 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-gray-400">{brand?.name?.charAt(0).toUpperCase() || 'B'}</span>
                  </div>
                )}
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-gray-900">{brand?.name}</h1>
                  {brand?.featured && (
                    <span className="inline-block mt-1 bg-accent-100 text-accent-700 text-xs px-2 py-0.5 rounded-md">
                      Featured Brand
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Brand description */}
          {brand?.description && (
            <div className="mt-4 text-sm md:text-base text-gray-700">
              <p>{brand.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-6">
        {/* Header with product count and sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h2 className="text-lg font-medium text-gray-900">
            {brand?.name} Products
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({products.length} items)
            </span>
          </h2>
          
          <div className="flex items-center">
            <label htmlFor="sort" className="mr-2 text-sm text-gray-700">Sort by:</label>
            <select
              id="sort"
              value={sortOption}
              onChange={handleSortChange}
              className="border border-gray-300 rounded-md text-sm p-1.5 bg-white focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="popularity">Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Products grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Products Found</h3>
            <p className="text-gray-500 text-sm mb-4">
              There are no products available from {brand?.name} at this moment.
            </p>
            <Link 
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-1 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* First page */}
            {currentPage > 2 && (
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                1
              </button>
            )}
            
            {/* Ellipsis */}
            {currentPage > 3 && (
              <span className="px-3 py-1 text-gray-500 text-sm">...</span>
            )}
            
            {/* Previous page */}
            {currentPage > 1 && (
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {currentPage - 1}
              </button>
            )}
            
            {/* Current page */}
            <button
              className="px-3 py-1 rounded-md text-sm font-medium bg-primary-500 text-white"
            >
              {currentPage}
            </button>
            
            {/* Next page */}
            {currentPage < totalPages && (
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {currentPage + 1}
              </button>
            )}
            
            {/* Ellipsis */}
            {currentPage < totalPages - 2 && (
              <span className="px-3 py-1 text-gray-500 text-sm">...</span>
            )}
            
            {/* Last page */}
            {currentPage < totalPages - 1 && (
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {totalPages}
              </button>
            )}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Brand Information Section */}
      <div className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-4">About {brand?.name}</h2>
          <div className="text-sm md:text-base text-gray-700 space-y-4">
            <p>
              {brand?.description || `${brand?.name} is a trusted provider of quality medical supplies and equipment. Browse our selection of high-quality products from ${brand?.name}.`}
            </p>
            {brand?.tags && brand.tags.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm md:text-base font-medium text-gray-900 mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {brand.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandDetailPage;