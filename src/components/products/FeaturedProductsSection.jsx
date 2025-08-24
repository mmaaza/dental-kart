import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../ui/ProductCard";
import { TooltipProvider } from "../ui/tooltip";

const FeaturedProductsSection = ({ title, subtitle, products, isLoading }) => {
  // Product Skeleton Loader Component
  const ProductSkeletonLoader = () => {
    return (
      <div className="bg-white rounded-mobile-lg shadow-mobile overflow-hidden">
        <div className="aspect-square w-full bg-gray-200 animate-pulse"></div>
        <div className="p-3 xs:p-4">
          <div className="h-4 bg-gray-200 animate-pulse rounded-full mb-2 w-3/4"></div>
          <div className="h-3 bg-gray-200 animate-pulse rounded-full mb-3 w-1/2"></div>
          <div className="h-5 bg-gray-200 animate-pulse rounded-full mb-3 w-1/3"></div>
          <div className="h-8 bg-gray-200 animate-pulse rounded-full w-full"></div>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-white py-6 sm:py-8 md:py-10 lg:py-12">
      <div className="md:container mx-auto px-4">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-heading font-bold text-admin-slate-800 mb-2">
            {title}
          </h2>
          <p className="text-sm xs:text-base text-admin-slate-500">
            {subtitle}
          </p>
        </div>

        {/* Products grid with responsive columns */}
        <TooltipProvider>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 xs:gap-4 md:gap-6">
            {isLoading ? (
              // Show skeleton loaders when loading
              Array(4).fill(0).map((_, index) => (
                <div key={`skeleton-${index}`} className="w-full">
                  <ProductSkeletonLoader />
                </div>
              ))
            ) : products && products.length > 0 ? (
              // Show products when available, filter out any null/invalid products
              products.filter(product => product && (product._id || product.id)).map((product) => (
                <div key={product._id || product.id} className="w-full">
                  <ProductCard 
                    product={product}
                  />
                </div>
              ))
            ) : (
              // Show message when no products
              <div className="col-span-4 py-10 text-center">
                <p className="text-admin-slate-500">No featured products available at this time.</p>
              </div>
            )}
          </div>
        </TooltipProvider>

        {/* View all products link */}
        <div className="mt-6 md:mt-8 text-center">
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-primary-500 text-primary-600 font-medium rounded-mobile hover:bg-primary-50 transition-colors text-sm"
          >
            View all products
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
