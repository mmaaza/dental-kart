import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Button } from './button';
import { Badge } from './badge-new';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipArrow } from './tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger, HoverCardArrow } from './hover-card';
import { AspectRatio } from './aspect-ratio';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { cn } from '../../lib/utils';
import { 
  Heart, 
  HeartIcon, 
  ShoppingCart, 
  Star, 
  StarIcon,
  Eye,
  ShoppingBag,
  Zap
} from 'lucide-react';

const ProductCard = ({ product, className }) => {
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

  // Helper function to check if product is out of stock (always returns false now)
  const isOutOfStock = () => {
    // Removed stock check as per requirements - users can order even if out of stock
    return false;
  };

  // Display stars based on rating with modern design
  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star 
          key={`full-${i}`} 
          className="h-3.5 w-3.5 fill-amber-400 text-amber-400" 
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="h-3.5 w-3.5 text-gray-300" />
          <Star className="absolute inset-0 h-3.5 w-3.5 fill-amber-400 text-amber-400 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </div>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon 
          key={`empty-${i}`} 
          className="h-3.5 w-3.5 text-gray-300" 
        />
      );
    }

    return <div className="flex items-center gap-0.5">{stars}</div>;
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

  // Calculate discount percentage for display
  const getDiscountPercentage = () => {
    // First check if there's an explicit discount percentage
    if (product.discountType === 'percentage' && product.discountValue > 0) {
      return product.discountValue;
    }
    
    // Check if there's a fixed discount amount
    if (product.discountType === 'fixed' && product.discountValue > 0 && product.regularPrice > 0) {
      return Math.round((product.discountValue / product.regularPrice) * 100);
    }
    
    // Calculate discount from specialOfferPrice vs regularPrice
    if (product.specialOfferPrice && product.regularPrice && product.specialOfferPrice < product.regularPrice) {
      const discountAmount = product.regularPrice - product.specialOfferPrice;
      return Math.round((discountAmount / product.regularPrice) * 100);
    }
    
    // Calculate discount from price difference (fallback)
    const regularPrice = product.regularPrice || product.price;
    const displayPrice = getDisplayPrice();
    if (regularPrice && displayPrice && regularPrice > displayPrice) {
      const discountAmount = regularPrice - displayPrice;
      return Math.round((discountAmount / regularPrice) * 100);
    }
    
    // Return explicit discount field as last resort
    return product.discount > 0 ? product.discount : 0;
  };

  // Check if product has a discount
  const hasDiscount = () => {
    const discountPercentage = getDiscountPercentage();
    
    return (
      discountPercentage > 0 &&
      (
        (product.discountValue > 0) || 
        (product.specialOfferPrice && product.regularPrice && product.specialOfferPrice < product.regularPrice) ||
        (product.discount > 0) ||
        (product.regularPrice && getDisplayPrice() < product.regularPrice)
      )
    );
  };

  // Get product ID safely (handling different ID formats)
  const getProductId = () => {
    return product._id || product.id;
  };
  
  // Safe access to product image
  const productImage = () => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return product.image || 'https://placehold.co/300x300?text=No+Image';
  };
  
  // Generate brand avatar initials
  const getBrandInitials = (brandName) => {
    if (!brandName) return 'BR';
    return brandName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle wishlist action
  const handleWishlistAction = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlistActionLoading) return;
    
    setIsWishlistActionLoading(true);
    try {
      if (isInWishlist(getProductId())) {
        await removeFromWishlist(getProductId());
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('Wishlist action failed:', error);
    } finally {
      setIsWishlistActionLoading(false);
    }
  };

  // Handle add to cart action
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isCartActionLoading) return;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    
    setIsCartActionLoading(true);
    try {
      await addToCart(getProductId(), 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsCartActionLoading(false);
    }
  };

  // Handle card click for product details
  const handleCardClick = (e) => {
    // Don't navigate if clicking on action buttons
    if (e.target.closest('button') || e.target.closest('[role="button"]')) {
      return;
    }
    navigate(`/product/${product.slug}`);
  };

  // Safe number formatting
  const formatPrice = (price) => {
    return (price || 0).toLocaleString();
  };

  const displayPrice = getDisplayPrice();
  const discountPercentage = getDiscountPercentage();
  const hasDiscountBadge = hasDiscount();
  const productId = getProductId();
  const isWishlisted = isInWishlist(productId);
  const isInCartState = isInCart(productId);

  return (
    <TooltipProvider>
      <HoverCard openDelay={300} closeDelay={100}>
                 <div 
           className={cn(
             "group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-gray-200 cursor-pointer",
             className
           )}
           onMouseEnter={() => setIsHovered(true)}
           onMouseLeave={() => setIsHovered(false)}
           onClick={handleCardClick}
         >
          {/* Product Image Container */}
          <div className="relative overflow-hidden">
            <AspectRatio ratio={1} className="bg-gray-50">
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-2xl" />
              )}
              
                             <HoverCardTrigger asChild>
                 <div className="block relative h-full">
                   <div className="absolute inset-0">
                     <span className="sr-only">View {product.name}</span>
                   </div>
                  <img 
                    src={productImage()} 
                    alt={product.name} 
                    className={cn(
                      "w-full h-full object-contain transition-all duration-500 ease-out",
                      isHovered ? "scale-105" : "scale-100",
                      isImageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={() => setIsImageLoaded(true)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/300x300?text=No+Image';
                      setIsImageLoaded(true);
                    }}
                    loading="lazy"
                  />
                  
                  {/* Hover Overlay */}
                  <div className={cn(
                    "absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-all duration-300 flex items-center justify-center pointer-events-none",
                    isHovered ? "opacity-100" : "opacity-0"
                  )}>
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <Eye className="h-4 w-4" />
                      Quick View
                    </div>
                  </div>
                </div>
              </HoverCardTrigger>
              
              {/* Badges and Actions */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  {hasDiscountBadge && discountPercentage > 0 && (
                    <Badge variant="destructive" className="text-xs font-bold shadow-sm">
                      <Zap className="h-3 w-3 mr-1" />
                      {discountPercentage}% OFF
                    </Badge>
                  )}
                  
                  {product.isNew && (
                    <Badge variant="success" className="text-xs font-bold shadow-sm">
                      NEW
                    </Badge>
                  )}
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        "h-8 w-8 rounded-full shadow-md backdrop-blur-sm transition-all duration-200 flex items-center justify-center",
                        isWishlisted 
                          ? "bg-red-500 hover:bg-red-600 text-white" 
                          : "bg-white/90 hover:bg-white text-gray-700 hover:text-red-500"
                      )}
                      onClick={handleWishlistAction}
                      disabled={isWishlistActionLoading}
                    >
                      {isWishlistActionLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : isWishlisted ? (
                        <Heart className="h-4 w-4 fill-current" />
                      ) : (
                        <HeartIcon className="h-4 w-4" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isWishlisted ? "Remove from wishlist" : "Add to wishlist"}</p>
                    <TooltipArrow />
                  </TooltipContent>
                </Tooltip>
              </div>
            </AspectRatio>
          </div>

          {/* Product Information */}
          <div className="p-4 flex-grow flex flex-col">
            {/* Brand Avatar and Name */}
            {product.brand?.name && (
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="h-6 w-6 border border-gray-200">
                  <AvatarImage 
                    src={product.brand.logo} 
                    alt={product.brand.name}
                  />
                  <AvatarFallback className="text-xs font-medium bg-gray-100">
                    {getBrandInitials(product.brand.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-600 font-medium">
                  {product.brand.name}
                </span>
              </div>
            )}
            
                         {/* Product Name */}
             <Tooltip>
               <TooltipTrigger asChild>
                 <div>
                   <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] leading-tight hover:text-primary-600 transition-colors">
                     {product.name}
                   </h3>
                 </div>
               </TooltipTrigger>
               <TooltipContent className="max-w-xs">
                 <p>{product.name}</p>
                 <TooltipArrow />
               </TooltipContent>
             </Tooltip>
            
            {/* Rating and Reviews */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {renderStars(product.rating)}
                <span className="text-xs text-gray-500 font-medium">
                  ({product.reviews || 0})
                </span>
              </div>
              {product.rating > 4.5 && (
                <Badge variant="outline" className="text-2xs px-1.5 py-0.5">
                  ⭐ Bestseller
                </Badge>
              )}
            </div>
            
            {/* Price Section */}
            <div className="mt-auto">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-lg font-bold text-gray-900">
                  Rs.{formatPrice(displayPrice)}
                </span>
                {hasDiscountBadge && discountPercentage > 0 && (
                  <span className="text-sm text-gray-500 line-through">
                    Rs.{formatPrice(product.regularPrice || product.price)}
                  </span>
                )}
              </div>
              
              {/* Add to Cart Button */}
              <Button 
                className={cn(
                  "w-full transition-all duration-200 font-medium",
                  isInCartState 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-primary-600 hover:bg-primary-700 text-white"
                )}
                onClick={handleAddToCart}
                disabled={isOutOfStock() || isCartActionLoading}
                size="sm"
              >
                {isCartActionLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Adding...</span>
                  </div>
                ) : isInCartState ? (
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Added to Cart</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Hover Card for Quick Preview */}
        <HoverCardContent 
          className="w-80 p-0 overflow-hidden" 
          side="right" 
          sideOffset={10}
        >
          <div className="p-4 border-b border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
            {product.brand?.name && (
              <p className="text-sm text-gray-600">by {product.brand.name}</p>
            )}
          </div>
          
          <div className="p-4 space-y-3">
            {/* Quick stats */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Rating:</span>
              <div className="flex items-center gap-1">
                {renderStars(product.rating)}
                <span className="text-gray-600">({product.reviews || 0})</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Price:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary-600">
                  Rs.{formatPrice(displayPrice)}
                </span>
                {hasDiscountBadge && discountPercentage > 0 && (
                  <span className="text-xs text-gray-500 line-through">
                    Rs.{formatPrice(product.regularPrice || product.price)}
                  </span>
                )}
              </div>
            </div>
            
            {product.shortDescription && (
              <p className="text-sm text-gray-600 line-clamp-3">
                {product.shortDescription}
              </p>
            )}
            
                         <div className="flex gap-2 pt-2">
               <Button 
                 size="sm" 
                 className="w-full"
                 onClick={() => navigate(`/product/${product.slug}`)}
               >
                 View Details
               </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleAddToCart}
                disabled={isCartActionLoading}
                className="flex-1"
              >
                {isCartActionLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <HoverCardArrow />
        </HoverCardContent>
      </HoverCard>
    </TooltipProvider>
  );
};

export default ProductCard;