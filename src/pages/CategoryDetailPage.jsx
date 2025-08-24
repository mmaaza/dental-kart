import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import { useCache } from "../contexts/CacheContext";
import { SEOHead } from '../components/seo';

const CategoryDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState('popularity');
  const { getWithBackgroundRefresh, setCachedData } = useCache();

  // Fetch category details and subcategories
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch category details using slug
        const categoryResponse = await api.get(`/categories/slug/${slug}`);
        
        if (!categoryResponse.data.success) {
          throw new Error('Failed to load category information');
        }
        
        const categoryData = categoryResponse.data.data;
        setCategory(categoryData);
        
        const subcategories = categoryData.children || [];
        setSubcategories(subcategories);
        
      } catch (err) {
        console.error('Error loading category details:', err);
        setError(err.message || 'Something went wrong while loading category information');
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  useEffect(() => {
    if (category?._id) {
      fetchProducts();
    }
  }, [currentPage, sortOption, category]);

  // Function to fetch products by category
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Only proceed if we have a valid category ID
      if (!category?._id) {
        return;
      }
      
      // Prepare query parameters
      const params = {
        page: currentPage,
        limit: 16,
        category: category._id,
        sort: sortOption
      };
      
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
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-secondary-50 border border-secondary-200 text-secondary-700 px-4 py-3 rounded-mobile mb-6">
          <p>{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-3 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-mobile text-sm font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {category && (
        <SEOHead 
          title={`${category.name} | Medical Devices Nepal`}
          description={category.description || `Browse ${category.name} products. Quality medical devices and healthcare equipment in Nepal.`}
          url={`${window.location.origin}/category/${category.slug}`}
          type="website"
          keywords={`${category.name}, medical devices, healthcare, Nepal, ${category.parent?.name || ''}`}
        />
      )}
      
      <div className="container mx-auto px-4 xs:px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
        {/* Breadcrumbs */}
        <nav className="mb-4 text-2xs xs:text-xs text-admin-slate-500">
          <ol className="list-none p-0 flex flex-wrap gap-1 items-center">
            <li className="flex items-center">
              <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            </li>
            <li className="flex items-center">
              <svg className="w-3 h-3 mx-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link to="/categories" className="hover:text-primary-600 transition-colors">Categories</Link>
            </li>
            <li className="flex items-center">
              <svg className="w-3 h-3 mx-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-admin-slate-800 font-medium">{category?.name || 'Loading...'}</span>
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-heading font-bold text-admin-slate-800 mb-2">
            {loading ? 'Loading...' : category?.name}
          </h1>
          {category?.description && (
            <p className="text-sm xs:text-base text-admin-slate-500 mb-4 max-w-3xl">
              {category.description}
            </p>
          )}
        </div>

        {/* Subcategories Section */}
        {subcategories.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg xs:text-xl font-heading font-semibold text-admin-slate-800 mb-4">
              Browse {category?.name} Subcategories
            </h2>
            
            {/* Subcategories Grid */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 xs:gap-4">
              {subcategories.map((subcat) => (
                <Link 
                  key={subcat._id} 
                  to={`/category/${subcat.slug}`} 
                  className="bg-white rounded-mobile-lg shadow-mobile hover:shadow-mobile-lg p-3 xs:p-4 transition-shadow duration-300 flex flex-col items-center"
                >
                  {subcat.image ? (
                    <div className=" h-12 xs:h-16 mb-3 bg-primary-50 flex items-center justify-center overflow-hidden">
                      <img 
                        src={subcat.image} 
                        alt={subcat.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder-category.png';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 xs:w-16 xs:h-16 mb-3 rounded-mobile-full bg-primary-50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                  )}
                  <h3 className="text-sm xs:text-base text-admin-slate-800 font-medium text-center line-clamp-2">
                    {subcat.name}
                  </h3>
                  {subcat.productCount > 0 && (
                    <p className="text-2xs xs:text-xs text-admin-slate-500 mt-1">
                      {subcat.productCount} products
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products Section */}
        <section>
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-6">
            <h2 className="text-lg xs:text-xl font-heading font-semibold text-admin-slate-800 mb-3 xs:mb-0">
              {category?.name} Products
            </h2>
            
            {/* Sort options */}
            <div className="w-full xs:w-auto">
              <select 
                value={sortOption} 
                onChange={handleSortChange}
                className="w-full xs:w-auto text-sm text-admin-slate-800 border border-admin-slate-200 rounded-mobile py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="latest">Sort by Latest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading && products.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 xs:gap-4 md:gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse bg-white rounded-mobile-lg shadow-mobile p-3 xs:p-4">
                  <div className="bg-gray-200 h-40 xs:h-44 sm:h-48 md:h-52 lg:h-56 rounded-mobile mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 xs:gap-4 md:gap-6">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-mobile ${
                        currentPage === 1
                          ? "bg-admin-slate-100 text-admin-slate-400 cursor-not-allowed"
                          : "bg-white text-admin-slate-800 hover:bg-primary-50"
                      } text-sm border border-admin-slate-200`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        page =>
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) < 3
                      )
                      .map((page, i, arr) => {
                        if (i > 0 && arr[i - 1] !== page - 1) {
                          return [
                            <span
                              key={`ellipsis-${page}`}
                              className="px-3 py-2 text-admin-slate-500"
                            >
                              ...
                            </span>,
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 text-sm rounded-mobile ${
                                currentPage === page
                                  ? "bg-primary-500 text-white"
                                  : "bg-white text-admin-slate-800 hover:bg-primary-50 border border-admin-slate-200"
                              }`}
                            >
                              {page}
                            </button>
                          ];
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm rounded-mobile ${
                              currentPage === page
                                ? "bg-primary-500 text-white"
                                : "bg-white text-admin-slate-800 hover:bg-primary-50 border border-admin-slate-200"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-mobile ${
                        currentPage === totalPages
                          ? "bg-admin-slate-100 text-admin-slate-400 cursor-not-allowed"
                          : "bg-white text-admin-slate-800 hover:bg-primary-50"
                      } text-sm border border-admin-slate-200`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-admin-slate-50 rounded-mobile-lg">
              <div className="mb-4 text-admin-slate-400">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4M8 16l-4-4 4-4M16 16l4-4-4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-admin-slate-800 mb-1">No Products Found</h3>
              <p className="text-admin-slate-500 text-sm max-w-md mx-auto">
                There are no products available in this category right now. Please check back later or browse other categories.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default CategoryDetailPage;
