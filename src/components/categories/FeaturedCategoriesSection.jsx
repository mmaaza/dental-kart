import React from "react";
import { Link } from "react-router-dom";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Separator from "@radix-ui/react-separator";
import * as AspectRatio from "@radix-ui/react-aspect-ratio";
import { cn } from "../../lib/utils";

const FeaturedCategoriesSection = ({ categories, isLoading }) => {
  // Function to render a category item with compact, image-focused design like brands
  const renderCategoryItem = (category) => (
    <div className="group block w-full">
      <Link
        to={`/category/${category.slug}`}
        className="block"
      >
        <div className="relative overflow-hidden rounded-mobile bg-white border border-admin-slate-200 transition-all duration-300 hover:shadow-mobile-lg hover:border-admin-slate-300 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
          <AspectRatio.Root ratio={1}>
            <div className="flex items-center justify-center w-full h-full p-2 xs:p-3 sm:p-4">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-admin-slate-50 rounded-sm">
                  <svg
                    className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-admin-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </AspectRatio.Root>
        </div>
      </Link>
      
      {/* Category name outside the card */}
      <div className="mt-2 text-center">
        <p className="text-2xs xs:text-xs font-medium text-admin-slate-700 truncate group-hover:text-primary-600 transition-colors duration-300">
          {category.name}
        </p>
      </div>
    </div>
  );

  // Enhanced skeleton loader with pulse animation like brands
  const renderCategorySkeleton = (index) => (
    <div key={index} className="animate-pulse">
      <AspectRatio.Root ratio={1}>
        <div className="w-full h-full bg-admin-slate-200 rounded-mobile"></div>
      </AspectRatio.Root>
    </div>
  );

  return (
    <section className="bg-white py-6 xs:py-8 sm:py-10 md:py-12">
      <div className="md:container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-6 xs:mb-8 sm:mb-10">
          <h2 className="text-mobile-h1 xs:text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-admin-slate-900 mb-3">
            Medical Categories
          </h2>
          <p className="text-mobile-body xs:text-base sm:text-lg text-admin-slate-600 mb-4">
            Discover our comprehensive range of medical supplies and equipment organized by specialty
          </p>
          <div className="w-16 h-1 bg-primary-500 rounded-mobile"></div>
        </div>

        {isLoading ? (
          <>
            {/* Mobile Skeleton Loader with Horizontal Scroll */}
            <div className="block md:hidden">
              <ScrollArea.Root className="w-full overflow-hidden">
                <ScrollArea.Viewport className="w-full h-full">
                  <div className="flex gap-3 pb-4">
                    {[...Array(8)].map((_, index) => (
                      <div key={index} className="flex-none w-20 xs:w-24 sm:w-28">
                        {renderCategorySkeleton(index)}
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
                  {renderCategorySkeleton(index)}
                </div>
              ))}
            </div>
          </>
        ) : categories && categories.length > 0 ? (
          <>
            {/* Mobile Categories with Horizontal Scroll */}
            <div className="block md:hidden">
              <ScrollArea.Root className="w-full overflow-hidden">
                <ScrollArea.Viewport className="w-full h-full">
                  <div className="flex gap-3 pb-4">
                    {categories.map((category) => (
                      <div key={category._id} className="flex-none w-20 xs:w-24 sm:w-28">
                        {renderCategoryItem(category)}
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

            {/* Desktop Categories with Grid */}
            <div className="hidden md:grid grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 lg:gap-4">
              {categories.map((category) => (
                <div key={category._id} className="w-full">
                  {renderCategoryItem(category)}
                </div>
              ))}
            </div>

            {/* View All Categories Link */}
            {categories.length > 8 && (
              <div className="mt-6 xs:mt-8 flex justify-center">
                <Link
                  to="/categories"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-mobile hover:bg-primary-100 hover:border-primary-300 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  View All Categories
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-admin-slate-500 text-mobile-small xs:text-sm text-center">
              No categories available at the moment
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCategoriesSection;
