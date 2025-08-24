import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { 
  Root as Card, 
  Content as CardContent, 
  Header as CardHeader, 
  Title as CardTitle 
} from "../../components/ui/card";
import { Badge } from '../../components/ui/badge-new';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../components/ui/dialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { cn } from '../../lib/utils';
import {
  Heart,
  HeartIcon,
  ShoppingCart, 
  Star,
  Trash2,
  Package,
  Eye,
  Plus,
  Minus,
  AlertTriangle,
  Filter,
  Grid3X3,
  List,
  ExternalLink
} from 'lucide-react';

const WishlistPage = () => {
  const { currentUser } = useAuth();
  const { wishlistItems, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const [isClearingWishlist, setIsClearingWishlist] = useState(false);
  const [cartLoading, setCartLoading] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showClearDialog, setShowClearDialog] = useState(false);
  
  // Helper function to check if an item is out of stock
  const isOutOfStock = (item) => {
    if (item.stock === 0) return true;
    if (item.stockStatus === 'out_of_stock') return true;
    return false;
  };

  // Format price helper function
  const formatPrice = (price) => {
    const numPrice = Number(price) || 0;
    return numPrice.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };
  
  // Helper to get original price for display
  const getOriginalPrice = (item) => {
    if (typeof item.regularPrice === 'number') {
      return item.regularPrice;
    } else if (typeof item.originalPrice === 'number') {
      return item.originalPrice;
    } else if (typeof item.price === 'number') {
      return item.price;
    }
    return 0;
  };
  
  // Helper to determine if item has a discounted price
  const hasDiscountedPrice = (item) => {
    if (typeof item.specialOfferPrice === 'number' && 
        typeof item.regularPrice === 'number' && 
        item.regularPrice > item.specialOfferPrice) {
      return true;
    }
    
    if (typeof item.discountValue === 'number' && item.discountValue > 0) {
      return true;
    }
    
    return false;
  };

  // Helper to calculate discount percentage
  const getDiscountPercentage = (item) => {
    if (typeof item.discount === 'number' && item.discount > 0) {
      return Math.round(item.discount);
    }
    
    if (typeof item.originalPrice === 'number' && 
        typeof item.price === 'number' && 
        item.originalPrice > item.price) {
      return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
    }
    
    const effectivePrice = getEffectivePrice(item);
    const originalPrice = getOriginalPrice(item);
    
    if (effectivePrice > 0 && originalPrice > effectivePrice) {
      return Math.round(((originalPrice - effectivePrice) / originalPrice) * 100);
    }
    
    return 0;
  };
  
  // Calculate effective price based on the product model's logic
  const getEffectivePrice = (item) => {
    if (!item) return 0;
    
    if (typeof item.effectivePrice === 'number') {
      return item.effectivePrice;
    }
    
    if (typeof item.specialOfferPrice === 'number' && 
        typeof item.regularPrice === 'number' && 
        item.regularPrice > item.specialOfferPrice) {
      return item.specialOfferPrice;
    }
    
    if (typeof item.discountValue === 'number' && item.discountValue > 0) {
      const basePrice = typeof item.regularPrice === 'number' ? item.regularPrice : 
                       (typeof item.price === 'number' ? item.price : 0);
      
      if (basePrice > 0) {
        if (item.discountType === 'percentage') {
          return basePrice - (basePrice * (item.discountValue / 100));
        } else {
          return Math.max(0, basePrice - item.discountValue);
        }
      }
    }
    
    return typeof item.price === 'number' ? item.price : 
           (typeof item.regularPrice === 'number' ? item.regularPrice : 0);
  };

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      await removeFromWishlist(itemId);
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  const handleAddToCart = async (item) => {
    const itemId = item._id || item.id;
    
    if (isOutOfStock(item)) {
      toast.error('This item is currently out of stock');
      return;
    }
    
    if (isInCart(itemId)) {
      toast.info('Item is already in your cart');
      return;
    }

    setCartLoading(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await addToCart(itemId, 1);
      toast.success('Item added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setCartLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };
  
  const handleClearWishlist = async () => {
    setIsClearingWishlist(true);
    try {
      await clearWishlist();
      toast.success('Wishlist cleared successfully');
      setShowClearDialog(false);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    } finally {
      setIsClearingWishlist(false);
    }
  };

  // Render individual wishlist item
  const renderWishlistItem = (item, index) => {
    const itemId = item._id || item.id;
    const effectivePrice = getEffectivePrice(item);
    const originalPrice = getOriginalPrice(item);
    const discountPercentage = getDiscountPercentage(item);
    const isItemOutOfStock = isOutOfStock(item);
    const isItemInCart = isInCart(itemId);
    const isLoadingCart = cartLoading[itemId];

    if (viewMode === 'list') {
      return (
        <div key={itemId}>
          <div className="flex flex-col sm:flex-row gap-4 p-4">
            {/* Product Image */}
            <div className="relative flex-shrink-0">
              <div className="w-full sm:w-24 h-48 sm:h-24 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={item.images?.[0] || '/placeholder-product.jpg'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {discountPercentage > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 text-xs font-bold"
                >
                  -{discountPercentage}%
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-2">
              <div>
                <Link 
                  to={`/product/${item.slug || item._id}`}
                  className="text-sm sm:text-base font-medium text-gray-900 hover:text-primary-600 line-clamp-2"
                >
                  {item.name}
                </Link>
                {item.brand && (
                  <p className="text-xs text-gray-500 mt-1">by {item.brand}</p>
                )}
              </div>

              {/* Rating */}
              {item.rating && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={cn(
                          "h-3 w-3",
                          star <= item.rating 
                            ? "text-yellow-400 fill-current" 
                            : "text-gray-300"
                        )} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({item.rating})</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-gray-900">
                  Rs. {formatPrice(effectivePrice)}
                </span>
                {hasDiscountedPrice(item) && originalPrice > effectivePrice && (
                  <span className="text-sm text-gray-500 line-through">
                    Rs. {formatPrice(originalPrice)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div>
                {isItemOutOfStock ? (
                  <Badge variant="destructive" className="text-xs">
                    <Package className="h-3 w-3 mr-1" />
                    Out of Stock
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-xs">
                    <Package className="h-3 w-3 mr-1" />
                    In Stock
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col gap-2 sm:w-32">
              <Button
                variant={isItemInCart ? "success" : "default"}
                size="sm"
                onClick={() => handleAddToCart(item)}
                disabled={isItemOutOfStock || isLoadingCart}
                className="flex-1 sm:w-full"
              >
                {isLoadingCart ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : isItemInCart ? (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveFromWishlist(itemId)}
                className="flex-1 sm:w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
          {index < wishlistItems.length - 1 && <Separator />}
        </div>
      );
    }

    // Grid view
    return (
      <Card key={itemId} className="group relative overflow-hidden border-slate-200 shadow-mobile hover:shadow-mobile-lg transition-all duration-200">
        <CardContent className="p-4">
          {/* Product Image */}
          <div className="relative mb-3">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={item.images?.[0] || '/placeholder-product.jpg'}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {discountPercentage > 0 && (
                <Badge variant="destructive" className="text-xs font-bold">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>

            {/* Actions Overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFromWishlist(itemId)}
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                >
                  <Heart className="h-4 w-4 text-red-500 fill-current" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                >
                  <Link to={`/product/${item.slug || item._id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            <div>
              <Link 
                to={`/product/${item.slug || item._id}`}
                className="text-sm font-medium text-gray-900 hover:text-primary-600 line-clamp-2 leading-tight"
              >
                {item.name}
              </Link>
              {item.brand && (
                <p className="text-xs text-gray-500 mt-1">by {item.brand}</p>
              )}
            </div>

            {/* Rating */}
            {item.rating && (
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={cn(
                        "h-3 w-3",
                        star <= item.rating 
                          ? "text-yellow-400 fill-current" 
                          : "text-gray-300"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">({item.rating})</span>
              </div>
            )}

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-gray-900">
                  Rs. {formatPrice(effectivePrice)}
                </span>
                {hasDiscountedPrice(item) && originalPrice > effectivePrice && (
                  <span className="text-sm text-gray-500 line-through">
                    Rs. {formatPrice(originalPrice)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              {isItemOutOfStock ? (
                <Badge variant="destructive" className="text-xs">
                  <Package className="h-3 w-3 mr-1" />
                  Out of Stock
                </Badge>
              ) : (
                <Badge variant="success" className="text-xs">
                  <Package className="h-3 w-3 mr-1" />
                  In Stock
                </Badge>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              variant={isItemInCart ? "success" : "default"}
              size="sm"
              onClick={() => handleAddToCart(item)}
              disabled={isItemOutOfStock || isLoadingCart}
              className="w-full mt-3"
            >
              {isLoadingCart ? (
                <LoadingSpinner className="h-4 w-4 mr-2" />
              ) : isItemInCart ? (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  In Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(null).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {wishlistItems.length > 0 
              ? `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} saved`
              : 'No items in your wishlist yet'
            }
          </p>
        </div>
        
        {wishlistItems.length > 0 && (
          <div className="flex gap-2">
            <div className="flex border border-gray-200 rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Clear Wishlist
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove all items from your wishlist? 
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleClearWishlist}
                    disabled={isClearingWishlist}
                  >
                    {isClearingWishlist ? (
                      <LoadingSpinner className="h-4 w-4 mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Clear All
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Content */}
      {wishlistItems.length === 0 ? (
        <Card className="border-slate-200 shadow-mobile">
          <CardContent className="py-12">
            <EmptyState
              title="Your wishlist is empty"
              description="Save products you love to view them later. Start exploring our medical equipment and add items to your wishlist."
              actionText="Start Shopping"
              actionLink="/"
              icon={
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                  <Heart className="h-8 w-8 text-red-400" />
                </div>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 shadow-mobile hover:shadow-mobile-lg transition-all duration-200">
          <CardContent className={cn("p-0", viewMode === 'grid' && "p-4")}>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlistItems.map((item, index) => renderWishlistItem(item, index))}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {wishlistItems.map((item, index) => renderWishlistItem(item, index))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WishlistPage;