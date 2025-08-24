import React from "react";
import { Link } from "react-router-dom";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Separator from "@radix-ui/react-separator";
import * as AspectRatio from "@radix-ui/react-aspect-ratio";
import { cn } from "../../lib/utils";

const BrandsSection = ({ brands, isLoading }) => {
  // Function to render a brand item with improved mobile-first design
  const renderBrandItem = (brand) => (
    <div className="group block w-full">
      <Link
        to={`/brands/${brand.slug}`}
        className="block"
      >
        <div className="relative overflow-hidden rounded-mobile bg-white border border-admin-slate-200 transition-all duration-300 hover:shadow-mobile-lg hover:border-admin-slate-300 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
          <AspectRatio.Root ratio={1}>
            <div className="flex items-center justify-center w-full h-full p-2 xs:p-3 sm:p-4">
              {brand.picture || brand.logo ? (
                <img
                  src={brand.picture || brand.logo}
                  alt={brand.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-admin-slate-50 rounded-sm">
                  <span className="text-mobile-small xs:text-sm font-medium text-admin-slate-500">
                    {brand.name?.charAt(0)?.toUpperCase() || "B"}
                  </span>
                </div>
              )}
            </div>
          </AspectRatio.Root>
        </div>
      </Link>
      
      {/* Brand name outside the card */}
      <div className="mt-2 text-center">
        <p className="text-2xs xs:text-xs font-medium text-admin-slate-700 truncate group-hover:text-primary-600 transition-colors duration-300">
          {brand.name}
        </p>
      </div>
    </div>
  );

  // Enhanced skeleton loader with pulse animation
  const renderBrandSkeleton = (index) => (
    <div key={index} className="animate-pulse">
      <AspectRatio.Root ratio={1}>
        <div className="w-full h-full bg-admin-slate-200 rounded-mobile"></div>
      </AspectRatio.Root>
    </div>
  );

  return (
    <section className="bg-white py-6 xs:py-8 sm:py-10 md:py-12">
      <div className="md:container mx-auto px-4">
        
        {isLoading ? (
          <>
            {/* Mobile Skeleton Loader with Horizontal Scroll */}
            <div className="block md:hidden">
              <ScrollArea.Root className="w-full overflow-hidden">
                <ScrollArea.Viewport className="w-full h-full">
                  <div className="flex gap-3 pb-4">
                    {[...Array(8)].map((_, index) => (
                      <div key={index} className="flex-none w-20 xs:w-24 sm:w-28">
                        {renderBrandSkeleton(index)}
                      </div>
                    ))}
                  </div>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar
                  className="flex select-none touch-none p-0.5 bg-admin-slate-100 transition-colors duration-150 ease-out data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                  orientation="horizontal"
                >
                  <ScrollArea.Thumb className="flex-1 bg-admin-slate-300 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                </ScrollArea.Scrollbar>
              </ScrollArea.Root>
            </div>
            
            {/* Desktop Skeleton Loader with Grid */}
            <div className="hidden md:grid grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 lg:gap-4">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="w-full">
                  {renderBrandSkeleton(index)}
                </div>
              ))}
            </div>
          </>
        ) : brands && brands.length > 0 ? (
          <>
            {/* Mobile Brands with Horizontal Scroll */}
            <div className="block md:hidden">
              <ScrollArea.Root className="w-full overflow-hidden">
                <ScrollArea.Viewport className="w-full h-full">
                  <div className="flex gap-3 pb-4">
                    {brands.map((brand) => (
                      <div key={brand.id || brand._id} className="flex-none w-20 xs:w-24 sm:w-28">
                        {renderBrandItem(brand)}
                      </div>
                    ))}
                  </div>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar
                  className="flex select-none touch-none p-0.5 bg-admin-slate-100 transition-colors duration-150 ease-out data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                  orientation="horizontal"
                >
                  <ScrollArea.Thumb className="flex-1 bg-admin-slate-300 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                </ScrollArea.Scrollbar>
              </ScrollArea.Root>
            </div>

            {/* Desktop Brands with Grid */}
            <div className="hidden md:grid grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 lg:gap-4">
              {brands.map((brand) => (
                <div key={brand.id || brand._id} className="w-full">
                  {renderBrandItem(brand)}
                </div>
              ))}
            </div>

            {/* View All Brands Link */}
            {brands.length > 8 && (
              <div className="mt-6 xs:mt-8 flex justify-center">
                <Link
                  to="/brands"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-mobile hover:bg-primary-100 hover:border-primary-300 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  View All Brands
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 xs:py-16">
            <div className="w-16 h-16 xs:w-20 xs:h-20 bg-admin-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 xs:w-10 xs:h-10 text-admin-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <p className="text-admin-slate-500 text-mobile-small xs:text-sm text-center">
              No brands available at the moment
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BrandsSection;
