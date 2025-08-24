import React, { useState, useMemo, useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import { ErrorBoundary } from 'react-error-boundary';
import { useParentCategories } from "../hooks/useCategoriesQuery";
import { LoadingSkeleton, ErrorFallback } from '../components/ui/SuspenseComponents';

// Main content component that uses the hook
const AllCategoriesContent = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: categories } = useParentCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAlphabetFilter, setActiveAlphabetFilter] = useState("");

  // Generate alphabet for filter
  const alphabet = useMemo(() => {
    return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  }, []);

  // Function to check if any categories start with a given letter
  const hasCategories = (letter) => {
    return categories.some((category) =>
      category.name.toUpperCase().startsWith(letter)
    );
  };

  // Handle alphabet filter selection
  const handleAlphabetFilter = (letter) => {
    if (activeAlphabetFilter === letter) {
      // If clicking the same letter, clear filter
      setActiveAlphabetFilter("");
    } else {
      setActiveAlphabetFilter(letter);
      // Clear search query when using alphabet filter
      setSearchQuery("");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveAlphabetFilter("");
    setSearchQuery("");
  };

  // Filter categories based on search query and alphabet filter
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = searchQuery
        ? category.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesAlphabet = activeAlphabetFilter
        ? category.name.toUpperCase().startsWith(activeAlphabetFilter)
        : true;

      return matchesSearch && matchesAlphabet;
    });
  }, [categories, searchQuery, activeAlphabetFilter]);

  // Category Card Component
  const CategoryCard = ({ category }) => (
    <Link
      to={`/category/${category.slug}`}
      className="bg-white rounded-mobile-lg shadow-mobile p-3 xs:p-4 flex flex-col items-center hover:shadow-mobile-lg transition-shadow duration-300"
    >
      <div className="h-12 md:h-16 w-full aspect-square flex items-center justify-center mb-3">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full max-h-full object-contain"
          />
        ) : (
          <div className="w-12 h-12 bg-admin-slate-200 rounded-full flex items-center justify-center text-admin-slate-700 text-xl font-semibold">
            {category.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <h3 className="text-sm xs:text-base text-admin-slate-800 font-medium text-center truncate w-full">
        {category.name}
      </h3>
      {category.products_count && (
        <p className="text-2xs xs:text-xs text-admin-slate-500 mt-1">
          {category.products_count} products
        </p>
      )}
      {category.featured && (
        <span className="mt-2 text-2xs xs:text-xs font-medium bg-accent-100 text-accent-700 py-0.5 px-2 rounded-mobile shadow-sm">
          Featured
        </span>
      )}
    </Link>
  );

  return (
    <div className="w-full bg-admin-slate-50">
      {/* Page Header */}
      <div className="bg-primary-500 text-white">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            Main Product Categories
          </h1>
          <p className="text-sm md:text-base mt-2">
            Browse main medical equipment categories for your healthcare needs
          </p>
        </div>
      </div>

      {/* Search and A-Z Filter */}
      <div className="sticky top-[88px] bg-white shadow-md z-sticky">
        <div className="container mx-auto px-4 py-3">
          {/* Search Input */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) setActiveAlphabetFilter("");
              }}
              placeholder="Search categories..."
              className="w-full h-12 px-4 rounded-mobile text-admin-slate-800 border border-admin-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-admin-slate-400">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* A-Z Filter */}
          <div className="flex flex-wrap items-center gap-1 md:gap-2 justify-center">
            <button
              onClick={clearFilters}
              className={`text-xs md:text-sm py-1 px-2 rounded-mobile-full ${
                !activeAlphabetFilter && !searchQuery
                  ? "bg-primary-500 text-white"
                  : "bg-admin-slate-100 text-admin-slate-700 hover:bg-admin-slate-200"
              } transition duration-300`}
            >
              All
            </button>

            {alphabet.map((letter) => {
              const hasMatchingCategories = hasCategories(letter);
              return (
                <button
                  key={letter}
                  onClick={() =>
                    hasMatchingCategories && handleAlphabetFilter(letter)
                  }
                  disabled={!hasMatchingCategories}
                  className={`text-xs md:text-sm py-1 px-2 rounded-mobile-full ${
                    activeAlphabetFilter === letter
                      ? "bg-primary-500 text-white"
                      : hasMatchingCategories
                      ? "bg-admin-slate-100 text-admin-slate-700 hover:bg-admin-slate-200"
                      : "bg-admin-slate-100 text-admin-slate-400 opacity-40 cursor-not-allowed"
                  } transition duration-300`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10">
        {filteredCategories.length > 0 ? (
          <>
            {/* Title with Count */}
            <h2 className="text-xl md:text-2xl font-heading font-bold text-admin-slate-800 mb-4">
              {activeAlphabetFilter
                ? `Main Categories: ${activeAlphabetFilter}`
                : "Main Categories"}
              <span className="text-sm font-normal text-admin-slate-500 ml-2">
                ({filteredCategories.length})
              </span>
            </h2>

            {/* Categories Grid - Mobile optimized layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {filteredCategories.map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 mb-4 text-admin-slate-400 flex items-center justify-center">
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-medium text-admin-slate-800 mb-2">
              No Categories Found
            </h3>
            <p className="text-admin-slate-500 mb-6">
              {activeAlphabetFilter
                ? `We couldn't find any categories starting with '${activeAlphabetFilter}'.`
                : `We couldn't find any product categories that match your search.`}
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-mobile shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 active:bg-primary-700 transition duration-300"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* SEO Content Section */}
      <div className="container mx-auto px-4 py-8 border-t border-admin-slate-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl md:text-2xl font-heading font-bold text-admin-slate-800 mb-4">
            Main Medical Equipment Categories
          </h2>
          <div className="text-sm md:text-base text-admin-slate-800 space-y-4">
            <p>
              Dental Kart Nepal offers a comprehensive range of main medical
              equipment categories to meet the diverse needs of healthcare
              professionals and facilities across Nepal. Our extensive catalog
              is organized into intuitive main categories to help you quickly find
              the exact medical supplies you need.
            </p>
            <p>
              Each category features carefully selected products that meet
              international quality standards and regulatory requirements. From
              diagnostic devices to surgical instruments, from patient care
              products to laboratory equipment, we provide access to the full
              spectrum of healthcare supplies.
            </p>
            <p>
              Our product categories are regularly updated to include the latest
              innovations and advancements in medical technology. Browse through
              our categories to discover high-quality medical equipment at
              competitive prices, all backed by our commitment to exceptional
              customer service and technical support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component with Suspense and Error Boundary
const AllCategoriesPage = () => {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div className="w-full bg-admin-slate-50">
          <div className="bg-primary-500 text-white">
            <div className="container mx-auto px-4 py-6 sm:py-8">
              <h1 className="text-2xl md:text-3xl font-heading font-bold">
                Main Product Categories
              </h1>
              <p className="text-sm md:text-base mt-2">
                Browse main medical equipment categories for your healthcare needs
              </p>
            </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} type="categories" />
          </div>
        </div>
      )}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={<LoadingSkeleton type="categories" />}>
        <AllCategoriesContent />
      </Suspense>
    </ErrorBoundary>
  );
};

export default AllCategoriesPage;
