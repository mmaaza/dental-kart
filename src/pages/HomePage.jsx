import React, { useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/layout/Hero";
import api from "../services/api";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// Import required Swiper modules
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Radix UI components
import * as Separator from "@radix-ui/react-separator";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Progress from "@radix-ui/react-progress";
import * as AspectRatio from "@radix-ui/react-aspect-ratio";
import { Button } from "../components/ui/button";

// Import React Query hooks
import {
  useHomepageSettings,
  useCategories,
  useFeaturedCategories,
  useBrands,
  useProductsByIds,
} from "../hooks/useHomepageQueries";

// Import custom section components
import FeaturedProductsSection from "../components/products/FeaturedProductsSection";
import NewArrivalsSection from "../components/products/NewArrivalsSection";
import FeaturedCategoriesSection from "../components/categories/FeaturedCategoriesSection";
import CategorySections from "../components/categories/CategorySections";
import BrandsSection from "../components/brands/BrandsSection";
import BrandSections from "../components/brands/BrandSections";
import HomePageSkeleton from "../components/ui/HomePageSkeleton";
import HomePageErrorBoundary from "../components/error/HomePageErrorBoundary";
import { SEOHead } from '../components/seo';

// Add custom CSS styles for Swiper
const useCategorySwiperStyles = () => {
  useEffect(() => {
    if (typeof document !== "undefined") {
      const style = document.createElement("style");
      style.textContent = `
        .category-swiper {
          padding-bottom: 35px !important;
        }
        .category-swiper .swiper-pagination {
          bottom: 0 !important;
        }
        .category-swiper .swiper-slide {
          height: auto;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
};

// HomePage Content Component
const HomePageContent = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Apply custom swiper styles
  useCategorySwiperStyles();

  // React Query hooks
  const {
    data: homepageData,
    isLoading: isHomepageLoading,
    error: homepageError,
  } = useHomepageSettings();

  const {
    data: categoriesApiData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    data: featuredCategoriesData,
    isLoading: isFeaturedCategoriesLoading,
    error: featuredCategoriesError,
  } = useFeaturedCategories();

  const {
    data: brands,
    isLoading: isBrandsLoading,
    error: brandsError,
  } = useBrands();

  // Extract data from homepage settings
  const homepageSettings = homepageData?.settings || {
    featuredProductsTitle: "Featured Medical Devices",
    featuredProductsSubtitle: "Top-rated medical equipment and supplies",
    newArrivalsTitle: "New Medical Supplies",
    newArrivalsSubtitle: "Latest additions to our medical inventory",
    showNewsletter: true,
    showTestimonials: true,
    showBrands: true,
    newsletterTitle: "Subscribe for Health Updates",
    newsletterSubtitle:
      "Get the latest health tips, product updates and special offers directly to your inbox",
  };

  const heroSlides = homepageData?.heroSlides || [];
  const featuredCategories =
    homepageData?.featuredCategories &&
    homepageData.featuredCategories.length > 0
      ? homepageData.featuredCategories
      : featuredCategoriesData || [];

  // Extract category and brand sections from homepage data
  const categorySections = homepageData?.categorySections || [];
  const brandSections = homepageData?.brandSections || [];

  // Featured products query - add safety check for valid IDs
  const featuredProductIds =
    homepageData?.selectedProducts?.featured?.filter(
      (id) => id && typeof id === "string"
    ) || [];
  const {
    data: dynamicFeaturedProducts = [],
    isLoading: isFeaturedProductsLoading,
  } = useProductsByIds(featuredProductIds, featuredProductIds.length > 0);

  // New arrivals query - add safety check for valid IDs
  const newArrivalProductIds =
    homepageData?.selectedProducts?.newArrivals?.filter(
      (id) => id && typeof id === "string"
    ) || [];
  const { data: dynamicNewArrivals = [], isLoading: isNewArrivalsLoading } =
    useProductsByIds(newArrivalProductIds, newArrivalProductIds.length > 0);

  // Calculate overall loading state
  const isLoading = isHomepageLoading || isCategoriesLoading || isFeaturedCategoriesLoading || isBrandsLoading;

  // Check for any errors
  const hasErrors = homepageError || categoriesError || featuredCategoriesError || brandsError;

  // Prepare data with fallbacks for consistent prop passing
  const brandsData = brands || [];
  const categoriesData = featuredCategories || [];
  const featuredProductsData = dynamicFeaturedProducts || [];
  const newArrivalsData = dynamicNewArrivals || [];

  // Early return for errors (optional - can be removed if you want to show fallback data even on errors)
  if (hasErrors && !isLoading) {
    console.warn("Some data failed to load:", {
      homepageError,
      categoriesError,
      featuredCategoriesError,
      brandsError,
    });
    // Continue rendering with fallback data rather than showing error state
  }

  // Medical flash deals
  const flashDeals = [
    {
      id: 9,
      name: "Digital Blood Pressure Monitor",
      price: 129.99,
      salePrice: 79.99,
      image: "https://placehold.co/300x300?text=BP+Monitor",
      timeLeft: "2d 5h",
    },
    {
      id: 10,
      name: "Nebulizer Machine",
      price: 89.99,
      salePrice: 49.99,
      image: "https://placehold.co/300x300?text=Nebulizer",
      timeLeft: "1d 12h",
    },
    {
      id: 11,
      name: "Diabetic Testing Kit",
      price: 199.99,
      salePrice: 149.99,
      image: "https://placehold.co/300x300?text=Testing+Kit",
      timeLeft: "8h 45m",
    },
  ];

  // Mobile optimization utility classes
  const mobileClasses = {
    sectionPadding: "py-4 md:py-12",
    container: "px-2 md:px-4",
    headerText: "text-lg md:text-2xl font-bold",
    subheaderText: "text-xs md:text-sm text-gray-600",
    linkText: "text-xs md:text-sm text-primary-500",
    cardPadding: "p-2 md:p-4",
    buttonText: "text-xs md:text-sm",
    regularText: "text-xs md:text-base",
    smallText: "text-[10px] md:text-xs",
  };

  // Category Skeleton Loader Component
  const CategorySkeletonLoader = () => {
    return (
      <div className="bg-white rounded-mobile-lg shadow-mobile overflow-hidden flex flex-col items-center p-3 xs:p-4">
        <div className="w-16 h-16 xs:w-20 xs:h-20 rounded-full bg-gray-200 animate-pulse mb-3"></div>
        <div className="h-4 bg-gray-200 animate-pulse w-3/4 rounded-full mb-2"></div>
        <div className="h-3 bg-gray-200 animate-pulse w-1/2 rounded-full"></div>
      </div>
    );
  };

  // Flash Deal Card Component with Radix UI
  const FlashDealCard = ({ deal }) => {
    // Render stars function for consistent star display
    const renderStars = () => {
      // Using 5 stars for flash deals
      const stars = [];
      for (let i = 0; i < 5; i++) {
        stars.push(
          <svg
            key={`full-${i}`}
            className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-accent-400 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
          </svg>
        );
      }
      return stars;
    };

    return (
      <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
        <AspectRatio.Root ratio={4 / 3} className="relative overflow-hidden">
          <img
            src={deal.image}
            alt={deal.name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />

          {/* Time left badge with improved mobile visibility */}
          <div className="absolute top-2 xs:top-3 right-2 xs:right-3">
            <div className="bg-secondary-500 text-white text-2xs xs:text-xs font-medium px-2 xs:px-2.5 py-1 xs:py-1.5 rounded-md shadow-sm backdrop-blur-sm">
              <span className="flex items-center gap-1">
                <svg
                  className="w-2.5 h-2.5 xs:w-3 xs:h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {deal.timeLeft}
              </span>
            </div>
          </div>

          {/* Wishlist button with Tooltip */}
          <div className="absolute top-2 xs:top-3 left-2 xs:left-3">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button className="flex items-center justify-center w-7 h-7 xs:w-8 xs:h-8 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1">
                    <svg
                      className="w-3.5 h-3.5 xs:w-4 xs:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-gray-900 text-white px-2 py-1 rounded text-xs"
                    sideOffset={5}
                  >
                    Add to Wishlist
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </AspectRatio.Root>

        <div className="p-3 xs:p-4 space-y-3">
          {/* Product title with improved line clamping */}
          <h3 className="text-sm xs:text-base font-semibold text-gray-900 line-clamp-2 leading-tight min-h-[2.5rem] xs:min-h-[3rem]">
            {deal.name}
          </h3>

          {/* Rating and badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">{renderStars()}</div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-2xs xs:text-xs font-medium bg-secondary-50 text-secondary-700 border border-secondary-200">
              Hot Deal
            </span>
          </div>

          {/* Price section with better mobile spacing */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-lg xs:text-xl font-bold text-primary-600">
                ${deal.salePrice.toFixed(2)}
              </span>
              <span className="text-xs xs:text-sm text-gray-500 line-through">
                ${deal.price.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Save ${(deal.price - deal.salePrice).toFixed(2)} (
              {Math.round(((deal.price - deal.salePrice) / deal.price) * 100)}%
              off)
            </p>
          </div>

          {/* Add to Cart Button */}
          <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Add to Cart
          </Button>
        </div>
      </div>
    );
  };

  // ProductCard component is now in a separate file

  // Newsletter Section Component with Radix UI
  const NewsletterSection = ({ title, subtitle }) => {
    return (
      <section className="bg-gradient-to-br from-admin-prussian-500 via-admin-indigo-500 to-admin-ucla-500 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
              {title}
            </h2>
            <p className="text-base xs:text-lg text-admin-light-200 mb-8 sm:mb-10 leading-relaxed">
              {subtitle}
            </p>

            <form className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full h-12 sm:h-14 px-4 sm:px-5 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <Button className="h-12 sm:h-14 px-6 sm:px-8 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-admin-prussian-500">
                Subscribe Now
              </Button>
            </form>

            <Separator.Root className="h-px bg-admin-light-700 my-6 sm:my-8" />

            <p className="text-sm xs:text-base text-admin-light-300 leading-relaxed">
              By subscribing, you agree to our{" "}
              <Link
                to="/privacy"
                className="text-primary-300 hover:text-primary-200 underline transition-colors"
              >
                Privacy Policy
              </Link>{" "}
              and consent to receive updates from our company.
            </p>
          </div>
        </div>
      </section>
    );
  };

  // FeaturedCategoriesSection is now in a separate file

  // Import FeaturedProductsSection component
  // This component is now in a separate file

  // Flash Deals Section Component with enhanced Radix UI
  const FlashDealsSection = ({ deals }) => {
    return (
      <section className="bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 md:mb-10">
            <div className="mb-4 lg:mb-0">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-2 flex items-center">
                <span className="text-secondary-500 mr-3">
                  <svg
                    className="w-7 h-7 sm:w-8 sm:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </span>
                Flash Deals
              </h2>
              <p className="text-base xs:text-lg text-gray-600 max-w-md">
                Limited-time offers on premium medical supplies
              </p>
            </div>

            {/* Enhanced countdown timer */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Sale ends in:
              </span>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <div className="bg-secondary-500 text-white text-lg font-bold rounded-md px-2 py-1 min-w-[2.5rem]">
                      14
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">
                      Days
                    </span>
                  </div>
                  <span className="text-gray-400 text-lg">:</span>
                  <div className="text-center">
                    <div className="bg-secondary-500 text-white text-lg font-bold rounded-md px-2 py-1 min-w-[2.5rem]">
                      05
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">
                      Hours
                    </span>
                  </div>
                  <span className="text-gray-400 text-lg">:</span>
                  <div className="text-center">
                    <div className="bg-secondary-500 text-white text-lg font-bold rounded-md px-2 py-1 min-w-[2.5rem]">
                      22
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">
                      Mins
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced responsive grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {deals.map((deal) => (
              <div key={deal.id} className="w-full">
                <FlashDealCard deal={deal} />
              </div>
            ))}
          </div>

          <Separator.Root className="h-px bg-gray-200 my-8 md:my-10" />

          {/* Enhanced CTA section */}
          <div className="text-center">
            <Link
              to="/flash-deals"
              className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-primary-500 text-primary-600 hover:bg-primary-50 font-semibold rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
            >
              View All Flash Deals
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    );
  };

  // Main render function to organize all sections
  const renderPageContent = () => {
    return (
      <>
        <SEOHead 
          title={homepageSettings.featuredProductsTitle}
          description={homepageSettings.featuredProductsSubtitle}
          type="website"
        />
        
        {/* Hero Section */}
        <div className="w-full">
          {heroSlides.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={0}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              className="hero-swiper"
            >
              {heroSlides.map((slide, index) => (
                <SwiperSlide key={index}>
                  <div className="relative">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-40 xs:h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="relative">
              <img
                src="https://placehold.co/1200x400?text=Medical+Supplies"
                alt="Medical Supplies"
                className="w-full h-40 xs:h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
              />
            </div>
          )}
        </div>

        {/* Brands Section */}
        {homepageSettings.showBrands && (
          <BrandsSection
            brands={brandsData}
            isLoading={isLoading || isBrandsLoading}
          />
        )}

        {/* Categories Section */}
        <FeaturedCategoriesSection
          categories={categoriesData}
          isLoading={isLoading || isCategoriesLoading}
        />

        {/* Flash Deals Section */}
        {/* <FlashDealsSection deals={flashDeals} /> */}

        {/* Featured Products Section */}
        <FeaturedProductsSection
          title={homepageSettings.featuredProductsTitle}
          subtitle={homepageSettings.featuredProductsSubtitle}
          products={featuredProductsData}
          isLoading={isLoading || isFeaturedProductsLoading}
        />

        {/* 16:3 Banner Section */}
        {homepageSettings.showBanner && homepageSettings.bannerImage && (
          <section className="bg-white py-6 sm:py-8 md:py-10 lg:py-12">
            <div className="md:container mx-auto px-4">
              <div className="relative w-full aspect-[16/3] rounded-lg overflow-hidden shadow-lg">
                <img
                  src={homepageSettings.bannerImage}
                  alt="Medical Equipment Banner"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </section>
        )}

        {/* Category Sections */}
        <CategorySections
          categorySections={categorySections}
          isLoading={isLoading}
        />

        {/* Brand Sections */}
        <BrandSections brandSections={brandSections} isLoading={isLoading} />

        {/* Enhanced Medical Features Banner with Radix UI */}
        <section className="bg-white py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                Why Choose DK Nepal?
              </h2>
              <p className="text-base xs:text-lg text-gray-600 max-w-2xl mx-auto">
                Your trusted partner for premium medical equipment and supplies
              </p>
            </div>

            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div className="group bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 p-6 md:p-8 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg xs:text-xl font-bold text-gray-900 mb-2">
                            Quality Assurance
                          </h3>
                          <p className="text-sm xs:text-base text-gray-600 leading-relaxed">
                            FDA approved medical products with international
                            quality standards
                          </p>
                        </div>
                      </div>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm max-w-xs"
                      sideOffset={5}
                    >
                      All our products meet international medical device
                      standards and regulations
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div className="group bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200 p-6 md:p-8 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-12 h-12 bg-secondary-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg xs:text-xl font-bold text-gray-900 mb-2">
                            24/7 Support
                          </h3>
                          <p className="text-sm xs:text-base text-gray-600 leading-relaxed">
                            Healthcare professionals available round the clock
                            for assistance
                          </p>
                        </div>
                      </div>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm max-w-xs"
                      sideOffset={5}
                    >
                      Our expert team provides technical support and
                      consultation anytime
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div className="group bg-gradient-to-br from-accent-50 to-accent-100 border border-accent-200 p-6 md:p-8 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg xs:text-xl font-bold text-gray-900 mb-2">
                            Fast Delivery
                          </h3>
                          <p className="text-sm xs:text-base text-gray-600 leading-relaxed">
                            Quick and secure delivery across Nepal for orders
                            over $50
                          </p>
                        </div>
                      </div>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm max-w-xs"
                      sideOffset={5}
                    >
                      Express delivery available for urgent medical supply needs
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>
        </section>

        {/* New Arrivals Section */}
        <NewArrivalsSection
          title={homepageSettings.newArrivalsTitle}
          subtitle={homepageSettings.newArrivalsSubtitle}
          products={newArrivalsData}
          isLoading={isLoading || isNewArrivalsLoading}
        />

        {/* Newsletter Section */}
        {homepageSettings.showNewsletter && (
          <NewsletterSection
            title={homepageSettings.newsletterTitle}
            subtitle={homepageSettings.newsletterSubtitle}
          />
        )}
      </>
    );
  };

  return renderPageContent();
};

// Main HomePage component with Suspense and Error Boundary
const HomePage = () => {
  return (
    <HomePageErrorBoundary>
      <Suspense fallback={<HomePageSkeleton />}>
        <HomePageContent />
      </Suspense>
    </HomePageErrorBoundary>
  );
};

export default HomePage;
