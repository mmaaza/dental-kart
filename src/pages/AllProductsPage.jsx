import React, { useState, useEffect, Suspense } from 'react';
import ProductCard from '../components/ui/ProductCard';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useProducts, useAllCategories, useAllBrands } from '../hooks/useAllProductsQueries';

const AllProductsPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // State for UI
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // State for filters
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: { min: '', max: '' },
    sortBy: 'newest',
    brands: [],
    page: 1,
    limit: 12
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
      // Reset to page 1 when filters change (except when changing page itself)
      ...(filterType !== 'page' && { page: 1 })
    }));
  };

  // Handle page change for pagination
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
    window.scrollTo(0, 0); // Scroll to top when changing page
  };

  // Create a separate component for the content that uses React Query
  const AllProductsContent = () => {
    // React Query hooks with Suspense mode
    const { data: productsData } = useProducts(filters);
    const { data: categories } = useAllCategories();
    const { data: brands } = useAllBrands();

    const products = productsData?.products || [];
    const pagination = productsData?.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 };

    const FilterSidebar = ({ isOpen, onClose }) => {
    return (
      <>
        {/* Mobile filter dialog */}
        <div
          className={`fixed inset-0 pt-[88px] z-40 lg:hidden ${isOpen ? '' : 'hidden'}`}
          role="dialog"
          aria-modal="true"
        >
          {/* Semi-transparent overlay */}
          <div className="fixed inset-0 pt-[88px] bg-black bg-opacity-25" onClick={onClose}></div>

          {/* Sidebar panel */}
          <div className="fixed inset-y-0 right-0 top-[88px] z-50 flex max-w-xs w-full bg-white shadow-mobile-lg">
            <div className="w-full h-full flex flex-col overflow-y-auto bg-white py-4 pb-12 scrollbar-admin">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-heading font-medium text-admin-slate-800">Filters</h2>
                <button
                  type="button"
                  className="-mr-2 flex h-10 w-10 items-center justify-center rounded-mobile bg-white p-2 text-admin-slate-500 hover:bg-admin-slate-50 transition-colors duration-300"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Filters */}
              <form className="mt-4 px-4">
                {/* Categories */}
                <div className="border-t border-admin-slate-200 pt-4">
                  <h3 className="text-sm font-medium text-admin-slate-800">Categories</h3>
                  <div className="space-y-2 mt-2">
                    {categories.map((category) => (
                      <div key={category._id} className="flex items-center">
                        <input
                          id={`category-${category._id}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-admin-slate-300 text-primary-600 focus:ring-primary-500"
                          checked={filters.categories.includes(category._id)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...filters.categories, category._id]
                              : filters.categories.filter(id => id !== category._id);
                            handleFilterChange('categories', newCategories);
                          }}
                        />
                        <label htmlFor={`category-${category._id}`} className="ml-3 text-sm text-admin-slate-600">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="border-t border-admin-slate-200 pt-4 mt-4">
                  <h3 className="text-sm font-medium text-admin-slate-800">Price Range</h3>
                  <div className="mt-2 flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-1/2 rounded-mobile border border-admin-slate-200 px-3 py-2 text-sm text-admin-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={filters.priceRange.min}
                      onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-1/2 rounded-mobile border border-admin-slate-200 px-3 py-2 text-sm text-admin-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={filters.priceRange.max}
                      onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: e.target.value })}
                    />
                  </div>
                </div>

                {/* Brands */}
                <div className="border-t border-admin-slate-200 pt-4 mt-4">
                  <h3 className="text-sm font-medium text-admin-slate-800">Brands</h3>
                  <div className="space-y-2 mt-2 max-h-48 overflow-y-auto scrollbar-admin">
                    {brands.map((brand) => (
                      <div key={brand._id} className="flex items-center">
                        <input
                          id={`brand-${brand._id}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-admin-slate-300 text-primary-600 focus:ring-primary-500"
                          checked={filters.brands.includes(brand._id)}
                          onChange={(e) => {
                            const newBrands = e.target.checked
                              ? [...filters.brands, brand._id]
                              : filters.brands.filter(id => id !== brand._id);
                            handleFilterChange('brands', newBrands);
                          }}
                        />
                        <label htmlFor={`brand-${brand._id}`} className="ml-3 text-sm text-admin-slate-600">
                          {brand.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white py-2 px-3.5 rounded-mobile text-sm font-medium transition duration-300 flex items-center shadow-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="bg-admin-slate-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="mobile-h1 md:text-3xl font-heading font-bold text-admin-slate-800">All Products</h1>
          <button
            type="button"
            className="lg:hidden bg-white p-2 rounded-mobile text-admin-slate-600 hover:bg-admin-slate-50 shadow-sm"
            onClick={() => setIsFilterOpen(true)}
          >
            <FunnelIcon className="h-5 w-5" />
            <span className="sr-only">Filters</span>
          </button>
        </div>

        {/* Sort dropdown - Mobile */}
        <div className="mb-4 lg:hidden">
          <select
            className="w-full h-12 rounded-mobile border border-admin-slate-200 px-4 py-2 text-sm text-admin-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-x-8">
          {/* Filter sidebar - Mobile is rendered outside the grid but controlled by isFilterOpen */}
          <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
          
          {/* Filter sidebar - Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-mobile-lg shadow-mobile p-4">
              <h2 className="text-lg font-heading font-medium text-admin-slate-800 mb-4">Filters</h2>
              <div className="hidden lg:block">
                <form className="space-y-6">
                  {/* Categories */}
                  <div>
                    <h3 className="text-sm font-medium text-admin-slate-800 mb-2">Categories</h3>
                    <div className="space-y-2 mt-2">
                      {categories.map((category) => (
                        <div key={category._id} className="flex items-center">
                          <input
                            id={`desktop-category-${category._id}`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-admin-slate-300 text-primary-600 focus:ring-primary-500"
                            checked={filters.categories.includes(category._id)}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...filters.categories, category._id]
                                : filters.categories.filter(id => id !== category._id);
                              handleFilterChange('categories', newCategories);
                            }}
                          />
                          <label htmlFor={`desktop-category-${category._id}`} className="ml-3 text-sm text-admin-slate-600">
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-medium text-admin-slate-800 mb-2">Price Range</h3>
                    <div className="mt-2 flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-1/2 h-12 rounded-mobile border border-admin-slate-200 px-4 py-2 text-sm text-admin-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.priceRange.min}
                        onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: e.target.value })}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-1/2 h-12 rounded-mobile border border-admin-slate-200 px-4 py-2 text-sm text-admin-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.priceRange.max}
                        onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Brands */}
                  <div>
                    <h3 className="text-sm font-medium text-admin-slate-800 mb-2">Brands</h3>
                    <div className="space-y-2 mt-2 max-h-64 overflow-y-auto scrollbar-admin pr-2">
                      {brands.map((brand) => (
                        <div key={brand._id} className="flex items-center">
                          <input
                            id={`desktop-brand-${brand._id}`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-admin-slate-300 text-primary-600 focus:ring-primary-500"
                            checked={filters.brands.includes(brand._id)}
                            onChange={(e) => {
                              const newBrands = e.target.checked
                                ? [...filters.brands, brand._id]
                                : filters.brands.filter(id => id !== brand._id);
                              handleFilterChange('brands', newBrands);
                            }}
                          />
                          <label htmlFor={`desktop-brand-${brand._id}`} className="ml-3 text-sm text-admin-slate-600">
                            {brand.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="lg:col-span-3">
            {/* Sort dropdown - Desktop */}
            <div className="hidden lg:flex justify-end mb-4">
              <select
                className="rounded-mobile border border-admin-slate-200 h-12 px-4 py-2 text-sm text-admin-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center mt-8">
                    <nav className="relative z-0 inline-flex rounded-mobile shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-mobile border border-admin-slate-200 bg-white text-sm font-medium transition-colors duration-300 ${
                          pagination.currentPage === 1
                            ? 'text-admin-slate-300 cursor-not-allowed'
                            : 'text-admin-slate-500 hover:bg-admin-slate-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* First page */}
                      {pagination.currentPage > 2 && (
                        <button
                          onClick={() => handlePageChange(1)}
                          className="relative inline-flex items-center px-4 py-2 border border-admin-slate-200 bg-white text-sm font-medium text-admin-slate-800 hover:bg-admin-slate-50 transition-colors duration-300"
                        >
                          1
                        </button>
                      )}
                      
                      {/* Ellipsis */}
                      {pagination.currentPage > 3 && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-admin-slate-200 bg-white text-sm font-medium text-admin-slate-500">
                          ...
                        </span>
                      )}
                      
                      {/* Current page and neighbors */}
                      {[...Array(pagination.totalPages)].map((_, i) => {
                        const pageNumber = i + 1;
                        // Show current page and one page before and after
                        if (
                          pageNumber === pagination.currentPage ||
                          pageNumber === pagination.currentPage - 1 ||
                          pageNumber === pagination.currentPage + 1
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              aria-current={pagination.currentPage === pageNumber ? "page" : undefined}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-300 ${
                                pagination.currentPage === pageNumber
                                  ? 'z-10 bg-primary-500 border-primary-500 text-white'
                                  : 'bg-white border-admin-slate-200 text-admin-slate-800 hover:bg-admin-slate-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        }
                        return null;
                      })}
                      
                      {/* Ellipsis */}
                      {pagination.currentPage < pagination.totalPages - 2 && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-admin-slate-200 bg-white text-sm font-medium text-admin-slate-500">
                          ...
                        </span>
                      )}
                      
                      {/* Last page */}
                      {pagination.currentPage < pagination.totalPages - 1 && (
                        <button
                          onClick={() => handlePageChange(pagination.totalPages)}
                          className="relative inline-flex items-center px-4 py-2 border border-admin-slate-200 bg-white text-sm font-medium text-admin-slate-800 hover:bg-admin-slate-50 transition-colors duration-300"
                        >
                          {pagination.totalPages}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-mobile border border-admin-slate-200 bg-white text-sm font-medium transition-colors duration-300 ${
                          pagination.currentPage === pagination.totalPages
                            ? 'text-admin-slate-300 cursor-not-allowed'
                            : 'text-admin-slate-500 hover:bg-admin-slate-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-mobile-lg shadow-mobile">
                <svg className="mx-auto h-12 w-12 text-admin-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-mobile-h4 font-heading font-medium text-admin-slate-800">No products found</h3>
                <p className="mt-1 text-mobile-small text-admin-slate-500">
                  Try changing your filters or check back later for new products.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton loading fallback for Suspense
const LoadingFallback = () => (
  <div className="bg-admin-slate-50 min-h-screen">
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-admin-slate-200 rounded w-48 animate-pulse"></div>
        <div className="lg:hidden h-10 w-10 bg-admin-slate-200 rounded animate-pulse"></div>
      </div>

      {/* Sort dropdown skeleton - Mobile */}
      <div className="mb-4 lg:hidden">
        <div className="w-full h-12 bg-admin-slate-200 rounded animate-pulse"></div>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-x-8">
        {/* Filter sidebar skeleton - Desktop */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-mobile-lg shadow-mobile p-4">
            <div className="h-6 bg-admin-slate-200 rounded w-20 mb-4 animate-pulse"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <div key={index}>
                  <div className="h-4 bg-admin-slate-200 rounded w-24 mb-2 animate-pulse"></div>
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div className="h-4 w-4 bg-admin-slate-200 rounded animate-pulse"></div>
                        <div className="ml-3 h-3 bg-admin-slate-200 rounded w-20 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Product grid skeleton */}
        <div className="lg:col-span-3">
          {/* Sort dropdown skeleton - Desktop */}
          <div className="hidden lg:flex justify-end mb-4">
            <div className="h-12 w-48 bg-admin-slate-200 rounded animate-pulse"></div>
          </div>

          {/* Product grid skeleton */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6">
            {[...Array(9)].map((_, index) => (
              <div key={index} className="animate-pulse bg-white rounded-mobile-lg shadow-mobile p-3">
                <div className="bg-admin-slate-200 h-40 xs:h-44 sm:h-48 md:h-52 lg:h-56 rounded-mobile mb-3"></div>
                <div className="h-4 bg-admin-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-admin-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-5 bg-admin-slate-200 rounded w-20"></div>
              </div>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="flex items-center justify-center mt-8">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-10 w-10 bg-admin-slate-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

return (
  <Suspense fallback={<LoadingFallback />}>
    <AllProductsContent />
  </Suspense>
);
};

export default AllProductsPage;