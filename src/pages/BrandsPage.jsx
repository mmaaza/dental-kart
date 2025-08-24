import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { useBrands } from '../hooks/useBrandsQuery';
import { LoadingSkeleton, ErrorFallback } from '../components/ui/SuspenseComponents';

// Main content component that uses the hook
const BrandsContent = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: brands } = useBrands();
  
  // State for the selected letter filter and search query
  const [selectedLetter, setSelectedLetter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Generate A-Z letters for the filter
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  
  // Function to check if any brands start with a given letter
  const hasBrands = letter => {
    return brands.some(brand => 
      brand.name.toUpperCase().startsWith(letter)
    );
  };
  
  // Handle alphabet filter selection
  const handleLetterFilter = (letter) => {
    if (selectedLetter === letter) {
      setSelectedLetter('all');
    } else {
      setSelectedLetter(letter);
      // Clear search when using letter filter
      setSearchQuery('');
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedLetter('all');
    setSearchQuery('');
  };
  
  // Filter brands based on selected letter and search query
  const filteredBrands = useMemo(() => {
    if (!brands.length) return [];
    
    return brands.filter(brand => {
      // Check if matches search query
      const matchesSearch = searchQuery
        ? brand.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
        
      // Check if matches letter filter
      let matchesLetter = true;
      if (selectedLetter !== 'all') {
        if (selectedLetter === 'popular') {
          matchesLetter = brand.featured;
        } else {
          matchesLetter = brand.name.toUpperCase().startsWith(selectedLetter);
        }
      }
      
      return matchesSearch && matchesLetter;
    });
  }, [brands, selectedLetter, searchQuery]);

  return (
    <div className="w-full bg-gray-50">
      {/* Page Header */}
      <div className="bg-primary-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Medical Brands</h1>
          <p className="text-sm md:text-base mt-2">
            Browse quality healthcare products from trusted medical brands
          </p>
        </div>
      </div>

      {/* Search and A-Z Filter */}
      <div className="sticky top-[88px] bg-white shadow-md z-40">
        <div className="container mx-auto px-4 py-3">
          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) setSelectedLetter('all');
              }}
              placeholder="Search brands..."
              className="w-full py-2 px-3 pr-10 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* A-Z Filter */}
          <div className="flex flex-wrap items-center gap-1 md:gap-2 justify-center">
            {/* Popular filter option */}
            <button 
              onClick={() => {
                handleLetterFilter('popular');
              }}
              className={`text-xs md:text-sm py-1 px-2 rounded-mobile-full ${
                selectedLetter === 'popular' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Popular
            </button>
            
            {/* All filter option */}
            <button 
              onClick={clearFilters}
              className={`text-xs md:text-sm py-1 px-2 rounded-mobile-full ${
                selectedLetter === 'all' && !searchQuery
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            
            {/* A-Z filter options */}
            {alphabet.map(letter => {
              const hasBrandsWithLetter = hasBrands(letter);
              return (
                <button 
                  key={letter}
                  onClick={() => hasBrandsWithLetter && handleLetterFilter(letter)}
                  disabled={!hasBrandsWithLetter}
                  className={`text-xs md:text-sm py-1 px-2 rounded-mobile-full ${
                    selectedLetter === letter 
                      ? 'bg-primary-500 text-white' 
                      : hasBrandsWithLetter
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-100 text-gray-400 opacity-40 cursor-not-allowed'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
          
          {/* Active Filters Display */}
          {(selectedLetter !== 'all' || searchQuery) && (
            <div className="flex items-center justify-between pt-2 text-sm">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-gray-500">Active filters:</span>
                {selectedLetter !== 'all' && (
                  <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                    {selectedLetter === 'popular' ? 'Popular brands' : `Starts with: ${selectedLetter}`}
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                    "{searchQuery}"
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-primary-600 hover:text-primary-800"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Brands Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredBrands.length > 0 ? (
          <>
            {/* Mobile Title */}
            <h2 className="text-xl font-medium mb-4">
              {selectedLetter === 'all' ? 'All Brands' : 
               selectedLetter === 'popular' ? 'Popular Brands' : 
               `Brands: ${selectedLetter}`}
               <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredBrands.length})
               </span>
            </h2>
            
            {/* Brands Grid - Mobile optimized with 2 columns on mobile, 3 on tablet, 4 on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBrands.map(brand => (
                <Link 
                  key={brand._id}
                  to={`/brands/${brand.slug}`}
                  className="bg-white rounded-lg shadow-mobile p-4 flex flex-col items-center hover:shadow-mobile-lg transition-shadow duration-300"
                >
                  <div className="h-12 md:h-16 flex items-center justify-center mb-3">
                    {brand.picture ? (
                      <img 
                        src={brand.picture} 
                        alt={`${brand.name} logo`}
                        className="max-h-full object-contain" 
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-xl font-semibold">
                        {brand.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm md:text-base text-center font-medium text-gray-800">
                    {brand.name}
                  </h3>
                  {brand.featured && (
                    <span className="mt-2 text-xs bg-accent-100 text-accent-700 py-0.5 px-2 rounded-md">
                      Popular
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 mb-4 text-gray-400 flex items-center justify-center">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Brands Found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? "We couldn't find any brands matching your search."
                : selectedLetter === 'popular'
                  ? "There are no popular brands at the moment."
                  : `We couldn't find any brands starting with '${selectedLetter}'.`}
            </p>
            <button 
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600"
            >
              View All Brands
            </button>
          </div>
        )}
      </div>

      {/* SEO Content Section */}
      <div className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Medical Brands in Nepal</h2>
          <div className="text-sm md:text-base text-gray-700 space-y-4">
            <p>
              Dental Kart Nepal partners with leading international and local medical brands to provide healthcare 
              professionals and facilities with high-quality medical supplies and equipment. Our carefully curated selection 
              represents the best in medical technology, ensuring reliability and effectiveness for all your healthcare needs.
            </p>
            <p>
              From diagnostic equipment to surgical instruments, from pharmaceutical products to medical consumables, 
              our brand partners maintain the highest standards of quality and innovation. Browse our extensive catalog to find 
              trusted brands that healthcare professionals rely on daily.
            </p>
            <p>
              All products available through Dental Kart Nepal are authentic and sourced directly from authorized 
              distributors, ensuring you receive genuine products backed by manufacturer warranties and support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component with Suspense and Error Boundary
const BrandsPage = () => {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div className="w-full bg-gray-50">
          <div className="bg-primary-500 text-white">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-2xl md:text-3xl font-heading font-bold">Medical Brands</h1>
              <p className="text-sm md:text-base mt-2">
                Browse quality healthcare products from trusted medical brands
              </p>
            </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} type="brands" />
          </div>
        </div>
      )}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={<LoadingSkeleton type="brands" />}>
        <BrandsContent />
      </Suspense>
    </ErrorBoundary>
  );
};

export default BrandsPage;