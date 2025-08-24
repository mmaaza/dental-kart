import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { trackAddToCart, trackInitiateCheckout, formatProductData, formatCartData } from '../utils/metaPixel';

const CartContext = createContext();

// Default cart context value to prevent destructuring errors
const defaultCartValue = {
  items: [],
  itemCount: 0,
  totalValue: 0,
  loading: false,
  error: null,
  isInitialized: false,
  addToCart: () => Promise.resolve(false),
  updateCartItem: () => Promise.resolve(false),
  removeFromCart: () => Promise.resolve(false),
  clearCart: () => Promise.resolve(false),
  isInCart: () => false,
  getCartItem: () => null,
  formatPrice: (price) => price?.toString() || '0',
  fetchCart: () => Promise.resolve(),
  cleanupDeletedProducts: () => Promise.resolve(false),
  hasDeletedProducts: () => false
};

// Action types
const ADD_TO_CART = 'ADD_TO_CART';
const UPDATE_CART_ITEM = 'UPDATE_CART_ITEM';
const REMOVE_CART_ITEM = 'REMOVE_CART_ITEM';
const CLEAR_CART = 'CLEAR_CART';
const SET_CART = 'SET_CART';
const CART_ERROR = 'CART_ERROR';

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case SET_CART:
      const validItems = filterValidCartItems(action.payload.items || []);
      return {
        ...state,
        items: validItems,
        itemCount: validItems.reduce((total, item) => total + item.quantity, 0),
        totalValue: calculateCartTotal(validItems),
        loading: false,
        error: null
      };
    case ADD_TO_CART:
      return {
        ...state,
        loading: false,
        error: null
      };
    case UPDATE_CART_ITEM:
      return {
        ...state,
        loading: false,
        error: null
      };
    case REMOVE_CART_ITEM:
      return {
        ...state,
        loading: false,
        error: null
      };
    case CLEAR_CART:
      return {
        ...state,
        items: [],
        itemCount: 0,
        totalValue: 0,
        loading: false,
        error: null
      };
    case CART_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

// Helper function to filter out deleted/invalid products from cart items
const filterValidCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  
  return items.filter(item => {
    // Keep only items that have valid product data
    return item && 
           item.product && 
           item.product._id && 
           item.product.name && 
           (item.product.regularPrice || item.product.regularPrice === 0);
  });
};

// Helper function to calculate cart total
const calculateCartTotal = (items) => {
  const validItems = filterValidCartItems(items);
  
  return validItems.reduce((total, item) => {
    const price = getProductPrice(item.product);
    return total + (price * item.quantity);
  }, 0);
};

// Helper function to get the effective price of a product
const getProductPrice = (product) => {
  if (!product) return 0;

  // First check for special offer price (takes precedence)
  if (product.specialOfferPrice && product.specialOfferPrice < product.regularPrice) {
    return product.specialOfferPrice;
  }

  // Then check for discount value
  if (product.discountValue > 0 && product.regularPrice) {
    if (product.discountType === 'percentage') {
      return product.regularPrice * (1 - product.discountValue / 100);
    } else {
      return product.regularPrice - product.discountValue;
    }
  }

  // Default to regular price
  return product.regularPrice || 0;
};

export const CartProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    itemCount: 0,
    totalValue: 0,
    loading: false,
    error: null
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to check if cart has any deleted products
  const hasDeletedProducts = () => {
    try {
      if (!state.items || !Array.isArray(state.items)) {
        return false;
      }
      const validItems = filterValidCartItems(state.items);
      return state.items.length > validItems.length;
    } catch (error) {
      console.warn('Error checking for deleted products:', error);
      return false;
    }
  };

  // Fetch cart on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Reset cart state when logged out
      dispatch({ type: CLEAR_CART });
    }
    setIsInitialized(true);
  }, [isAuthenticated]);

  // Periodic cleanup check - run every 5 minutes when user is authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const cleanupInterval = setInterval(() => {
      try {
        // Only run if we have items and some might be invalid
        if (state.items.length > 0 && hasDeletedProducts()) {
          console.log('Running periodic cart cleanup...');
          // Silent cleanup without showing toast
          cleanupDeletedProducts().catch(error => {
            console.warn('Periodic cleanup failed:', error);
          });
        }
      } catch (error) {
        console.warn('Error in periodic cleanup check:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [isAuthenticated]); // Removed state.items.length from dependencies

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      const cartData = response.data.data;
      
      // Filter out deleted/invalid products
      const validItems = filterValidCartItems(cartData.items || []);
      const originalItemCount = cartData.items?.length || 0;
      const validItemCount = validItems.length;
      
      // If some items were filtered out, we need to clean up the cart on the server
      if (originalItemCount > validItemCount && validItemCount >= 0) {
        console.log(`Filtered out ${originalItemCount - validItemCount} deleted products from cart`);
        
        // If there are deleted products, clean up the cart silently
        if (originalItemCount > validItemCount) {
          try {
            await cleanupCartOnServer(validItems);
          } catch (cleanupError) {
            console.warn('Could not clean up cart on server:', cleanupError);
            // Don't fail the whole operation if cleanup fails
          }
        }
      }
      
      dispatch({ 
        type: SET_CART, 
        payload: {
          ...cartData,
          items: validItems
        }
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      dispatch({ 
        type: CART_ERROR, 
        payload: error.response?.data?.message || 'Failed to load cart' 
      });
    }
  };

  // Helper function to clean up cart on server by removing invalid items
  const cleanupCartOnServer = async (validItems) => {
    try {
      // Send a request to update the cart with only valid items
      await api.put('/cart/cleanup', {
        items: validItems.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          attributes: item.attributes || {}
        }))
      });
    } catch (error) {
      // If the cleanup endpoint doesn't exist, try alternative approach
      if (error.response?.status === 404) {
        console.log('Cart cleanup endpoint not available, using alternative method');
        // We could implement individual removal calls here if needed
        // For now, just log the issue
      } else {
        throw error;
      }
    }
  };

  const addToCart = async (productId, quantity = 1, attributes = {}) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      return false;
    }

    try {
      const response = await api.post('/cart', {
        productId,
        quantity,
        attributes
      });

      dispatch({ 
        type: ADD_TO_CART
      });
      
      dispatch({ 
        type: SET_CART, 
        payload: {
          ...response.data.data,
          items: filterValidCartItems(response.data.data.items || [])
        }
      });
      
      // Track AddToCart event with Meta Pixel
      try {
        const addedItem = response.data.data.items?.find(item => 
          item.product?._id === productId || item.product === productId
        );
        if (addedItem && addedItem.product) {
          const productData = formatProductData({
            id: addedItem.product._id || addedItem.product,
            name: addedItem.product.name,
            category: addedItem.product.category || addedItem.product.categoryName,
            price: addedItem.product.specialOfferPrice || addedItem.product.regularPrice || 0
          });
          productData.value = productData.value * quantity; // Multiply by quantity added
          trackAddToCart(productData);
        }
      } catch (trackingError) {
        console.warn('Meta Pixel tracking failed:', trackingError);
      }
      
      toast.success('Item added to cart');
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add item to cart';
      console.error('Error adding to cart:', error);
      dispatch({ 
        type: CART_ERROR, 
        payload: errorMsg 
      });
      toast.error(errorMsg);
      return false;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (!isAuthenticated) {
      toast.error('Please log in to update your cart');
      return false;
    }

    try {
      const response = await api.put(`/cart/${itemId}`, {
        quantity
      });

      dispatch({ 
        type: UPDATE_CART_ITEM
      });
      
      dispatch({ 
        type: SET_CART, 
        payload: {
          ...response.data.data,
          items: filterValidCartItems(response.data.data.items || [])
        }
      });
      
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update cart';
      console.error('Error updating cart:', error);
      dispatch({ 
        type: CART_ERROR, 
        payload: errorMsg 
      });
      toast.error(errorMsg);
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      toast.error('Please log in to remove items from your cart');
      return false;
    }

    try {
      const response = await api.delete(`/cart/${itemId}`);

      dispatch({ 
        type: REMOVE_CART_ITEM
      });
      
      dispatch({ 
        type: SET_CART, 
        payload: {
          ...response.data.data,
          items: filterValidCartItems(response.data.data.items || [])
        }
      });
      
      toast.success('Item removed from cart');
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to remove item from cart';
      console.error('Error removing from cart:', error);
      dispatch({ 
        type: CART_ERROR, 
        payload: errorMsg 
      });
      toast.error(errorMsg);
      return false;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to clear your cart');
      return false;
    }

    try {
      await api.delete('/cart');

      dispatch({ type: CLEAR_CART });
      toast.success('Cart cleared');
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to clear cart';
      console.error('Error clearing cart:', error);
      dispatch({ 
        type: CART_ERROR, 
        payload: errorMsg 
      });
      toast.error(errorMsg);
      return false;
    }
  };

  // Manual cleanup function to remove deleted products from cart
  const cleanupDeletedProducts = async () => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      const currentValidItems = filterValidCartItems(state.items);
      const removedCount = state.items.length - currentValidItems.length;
      
      if (removedCount > 0) {
        // Update local state immediately
        dispatch({ 
          type: SET_CART, 
          payload: {
            items: currentValidItems
          }
        });

        // Try to clean up on server
        try {
          await cleanupCartOnServer(currentValidItems);
          toast.success(`Removed ${removedCount} unavailable item${removedCount > 1 ? 's' : ''} from cart`);
        } catch (serverError) {
          console.warn('Server cleanup failed, but local cleanup successful:', serverError);
          toast.success(`Cleaned up ${removedCount} unavailable item${removedCount > 1 ? 's' : ''} locally`);
        }
        
        return true;
      } else {
        toast.info('No invalid items found in cart');
        return false;
      }
    } catch (error) {
      console.error('Error cleaning up deleted products:', error);
      toast.error('Failed to clean up cart');
      return false;
    }
  };

  // Check if a product is in the cart
  const isInCart = (productId) => {
    return state.items.some(item => item.product && item.product._id === productId);
  };

  // Get cart item by product ID
  const getCartItem = (productId) => {
    return state.items.find(item => item.product && item.product._id === productId);
  };

  // Format price for display
  const formatPrice = (price) => {
    return price?.toLocaleString('en-IN', { 
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        isInCart,
        getCartItem,
        formatPrice,
        fetchCart,
        cleanupDeletedProducts,
        isInitialized,
        hasDeletedProducts
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    // Return default values if context is not available (e.g., outside provider)
    return defaultCartValue;
  }
  return context;
};
