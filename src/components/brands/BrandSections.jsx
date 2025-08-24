import React from 'react';
import { Link } from 'react-router-dom';
import { useProductsByIds } from '../../hooks/useHomepageQueries';
import ProductCard from '../ui/ProductCard';
import { TooltipProvider } from '../ui/tooltip';

const BrandSections = ({ brandSections = [], isLoading = false }) => {
  // Extract all product IDs from brand sections
  const allProductIds = brandSections.flatMap(section => 
    section.productIds?.filter(id => id && typeof id === 'string') || []
  );

  // Fetch products for all brand sections
  const {
    data: allProducts = [],
    isLoading: isProductsLoading
  } = useProductsByIds(allProductIds, allProductIds.length > 0);

  // Create a map of product ID to product object for quick lookup
  const productsMap = React.useMemo(() => {
    const map = new Map();
    allProducts.forEach(product => {
      map.set(product._id, product);
    });
    return map;
  }, [allProducts]);

  if (isLoading || isProductsLoading) {
    return (
      <section className="bg-gray-50 py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="md:container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 max-w-md"></div>
            <div className="h-4 bg-gray-200 rounded mb-8 max-w-lg"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!brandSections || brandSections.length === 0) {
    return null;
  }

  return (
    <>
      {brandSections.map((section, index) => {
        const sectionProducts = section.productIds
          ?.map(id => productsMap.get(id))
          .filter(Boolean) || [];

        if (sectionProducts.length === 0) {
          return null;
        }

        return (
          <section key={`${section.brandId}-${index}`} className="bg-gray-50 py-6 sm:py-8 md:py-10 lg:py-12">
            <div className="md:container mx-auto px-4">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {section.brandName}
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Premium products from {section.brandName}
                  </p>
                </div>
                <Link
                  to={`/brand/${section.brandId}`}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base transition-colors"
                >
                  View All →
                </Link>
              </div>

              <TooltipProvider>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {sectionProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </TooltipProvider>

              {sectionProducts.length > 4 && (
                <div className="text-center mt-6 sm:mt-8">
                  <Link
                    to={`/brand/${section.brandId}`}
                    className="inline-flex items-center justify-center px-6 py-3 border border-primary-500 text-primary-600 hover:bg-primary-50 font-medium rounded-lg transition-colors"
                  >
                    View All {section.brandName} Products
                  </Link>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
};

export default BrandSections; 