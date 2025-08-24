const ProductDetailSkeleton = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-sm p-3 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            <div className="animate-pulse">
              <div className="aspect-square w-full bg-gray-200 rounded-lg"></div>
              <div className="flex mt-1 sm:mt-2 space-x-1 sm:space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="space-y-2 sm:space-y-4 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-1 sm:space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="h-8 sm:h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
          <div className="mt-4 sm:mt-8 pt-3 sm:pt-6 border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="px-2 sm:px-4 py-2 sm:py-3 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-10 sm:w-16"></div>
                </div>
              ))}
            </div>
            <div className="py-3 sm:py-6 space-y-2 sm:space-y-3 animate-pulse">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
