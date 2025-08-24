import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";

const ProductCard = ({ product }) => {
  // Add null check for product
  if (!product || !product._id) {
    return null;
  }

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlistActionLoading, setIsWishlistActionLoading] = useState(false);
  const [isCartActionLoading, setIsCartActionLoading] = useState(false);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handle card click for product details
  const handleCardClick = (e) => {
    // Don't navigate if clicking on action buttons
    if (e.target.closest('button') || e.target.closest('[role="button"]')) {
      return;
    }
    navigate(`/product/${product.slug || product._id}`);
  };

  // Helper function to check if product is out of stock (always returns false now)
  const isOutOfStock = () => {
    // Removed stock check as per requirements - users can order even if out of stock
    return false;
  };

  // Helper function to calculate display price
  const getDisplayPrice = () => {
    if (product.effectivePrice !== undefined) {
      return product.effectivePrice;
    }
    
    if (product.specialOfferPrice && product.specialOfferPrice < (product.regularPrice || product.price)) {
      return product.specialOfferPrice;
    }
    
    if (product.discountValue > 0 && product.regularPrice) {
      if (product.discountType === 'percentage') {
        return product.regularPrice * (1 - product.discountValue / 100);
      } else {
        return product.regularPrice - product.discountValue;
      }
    }
    
    return product.regularPrice || product.price || 0;
  };
  
  // Safe access to product image
  const productImage = () => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return product.image || 'https://placehold.co/300x300?text=No+Image';
  };

  // Render rating stars based on product rating
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg
          key={`full-${i}`}
          className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-accent-400 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"></path>
        </svg>
      );
    }

    // Half star if needed
    if (hasHalfStar) {
      stars.push(
        <svg
          key="half"
          className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-accent-400 fill-current"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"
            fill="white"
          ></path>
        </svg>
      );
    }

    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg
          key={`empty-${i}`}
          className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-gray-300 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"></path>
        </svg>
      );
    }

    return stars;
  };

  // Function to determine if product has a discount
  const hasDiscount = () => {
    return (
      (product.discountValue > 0) || 
      (product.specialOfferPrice && product.regularPrice && product.specialOfferPrice < product.regularPrice) ||
      (product.discount > 0)
    );
  };

  return (
    <div 
      className="group h-full cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="bg-white rounded-mobile-lg overflow-hidden shadow-mobile hover:shadow-mobile-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="relative">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            src={productImage()}
            alt={product.name}
            className={`w-full h-40 xs:h-44 sm:h-48 md:h-52 lg:h-56 object-cover transition-transform duration-500 ease-in-out ${isHovered ? 'scale-105' : 'scale-100'}`}
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/300x300?text=No+Image';
              setIsImageLoaded(true);
            }}
          />

          {/* Discount badge */}
          {hasDiscount() && (
            <div className="absolute top-3 left-3 bg-secondary-500 text-white text-2xs xs:text-xs font-medium px-2 py-0.5 rounded-mobile shadow-sm">
              {product.discount || 0}% OFF
            </div>
          )}

          {/* Wishlist button */}
          <div className="absolute top-3 right-3">
            <button 
              className={`flex items-center justify-center w-8 h-8 ${isInWishlist && isInWishlist(product._id) ? 'bg-primary-500 text-white' : 'bg-white bg-opacity-80 text-primary-500'} rounded-full hover:bg-opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm disabled:opacity-70`}
              onClick={async (e) => {
                e.preventDefault();
                if (isWishlistActionLoading) return;
                
                setIsWishlistActionLoading(true);
                try {
                  if (isInWishlist && isInWishlist(product._id)) {
                    await removeFromWishlist(product._id);
                  } else {
                    await addToWishlist(product);
                  }
                } catch (error) {
                  console.error('Wishlist action failed:', error);
                } finally {
                  setIsWishlistActionLoading(false);
                }
              }}
              disabled={isWishlistActionLoading}
              aria-label={isInWishlist && isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isWishlistActionLoading ? (
                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill={isInWishlist && isInWishlist(product._id) ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  ></path>
                </svg>
              )}
            </button>
          </div>

          {/* Quick View Overlay */}
          <div className={`absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 py-2 text-center text-white text-xs sm:text-sm transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <span className="font-medium">Quick View</span>
          </div>
        </div>

        <div className="p-3.5 xs:p-4 sm:p-5 flex-grow flex flex-col">
          {/* Product category - small tag */}
          <div className="mb-1.5">
            <span className="text-2xs text-admin-slate-500 bg-admin-slate-100 px-1.5 py-0.5 rounded-full">
              {product.category?.name || "Medical Device"}
            </span>
          </div>

          {/* Product name */}
          <h3 className="text-sm xs:text-base font-medium text-admin-slate-800 mb-1.5 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating and reviews */}
          <div className="flex items-center mb-2">
            <div className="flex mr-1.5">
              {renderRatingStars(product.rating)}
            </div>
            <span className="text-2xs xs:text-xs text-admin-slate-500">
              ({product.reviews || 0})
            </span>
          </div>

          {/* Pricing section - showing with discount if applicable */}
          <div className="mt-auto pt-2">
            <div className="flex items-end gap-1.5 mb-3">
              {hasDiscount() ? (
                <>
                  <span className="text-base xs:text-lg font-bold text-primary-600">
                    Rs. {getDisplayPrice().toFixed(2)}
                  </span>
                  <span className="text-2xs xs:text-xs text-admin-slate-500 line-through">
                    Rs. {(product.regularPrice || product.price).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-base xs:text-lg font-bold text-primary-600">
                  Rs. {getDisplayPrice().toFixed(2)}
                </span>
              )}
            </div>

            {/* Add to cart button */}
            <button 
              className={`w-full mt-3 ${
                false 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : isCartActionLoading 
                    ? 'bg-primary-400 cursor-wait'
                    : isInCart && isInCart(product._id) 
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700'
              } text-white py-2 px-3 rounded-mobile text-xs font-medium transition duration-300 flex items-center justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (isCartActionLoading) return;
                
                // Check if user is authenticated
                if (!isAuthenticated) {
                  navigate('/login', { state: { from: { pathname: window.location.pathname } } });
                  return;
                }
                
                setIsCartActionLoading(true);
                addToCart(product._id, 1)
                  .then((success) => {
                    // Success handling is done in CartContext
                  })
                  .catch((error) => {
                    console.error('Error adding to cart:', error);
                    toast.error('Failed to add item to cart');
                  })
                  .finally(() => setIsCartActionLoading(false));
              }}
              disabled={isOutOfStock() || isCartActionLoading}
              aria-label="Add to cart"
            >
              {isCartActionLoading ? (
                <svg className="w-3.5 h-3.5 mr-1.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
              )}
              <span>{isInCart && isInCart(product._id) ? 'Added to Cart' : 'Add to Cart'}</span>
            </button>
            
            {/* Stock Status Indicator removed as per requirements */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
