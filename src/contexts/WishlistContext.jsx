import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Fetch wishlist items when component mounts or when user changes
  useEffect(() => {
    const fetchWishlist = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          const response = await api.get('/wishlist');
          setWishlistItems(response.data?.data || []);
        } catch (error) {
          console.error('Error fetching wishlist:', error);
          // If API endpoint doesn't exist yet, use localStorage
          const storedWishlist = localStorage.getItem('wishlist');
          if (storedWishlist) {
            setWishlistItems(JSON.parse(storedWishlist));
          }
        } finally {
          setLoading(false);
        }
      } else {
        // Not logged in, try to get from localStorage
        const storedWishlist = localStorage.getItem('wishlist');
        if (storedWishlist) {
          setWishlistItems(JSON.parse(storedWishlist));
        }
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [currentUser]);

  // Update localStorage whenever wishlist changes
  useEffect(() => {
    if (wishlistItems.length > 0) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    } else {
      localStorage.removeItem('wishlist');
    }
  }, [wishlistItems]);

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId || item.id === productId);
  };

  const addToWishlist = async (product) => {
    if (!product) return;
    
    try {
      if (isInWishlist(product._id || product.id)) {
        toast.error('This item is already in your wishlist');
        return;
      }

      if (currentUser) {
        try {
          const response = await api.post('/wishlist', { productId: product._id || product.id });
          if (response.data?.success) {
            // If API returns a product, use it, otherwise use the provided product
            const addedProduct = response.data?.data || product;
            setWishlistItems(prev => [...prev, addedProduct]);
            toast.success('Added to wishlist');
          } else {
            throw new Error('Failed to add to wishlist');
          }
        } catch (error) {
          console.error('Error adding to wishlist:', error);
          // Fall back to local storage if API fails
          setWishlistItems(prev => [...prev, product]);
          toast.success('Added to wishlist (saved locally)');
        }
      } else {
        // No user, use localStorage
        setWishlistItems(prev => [...prev, product]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      if (currentUser) {
        try {
          const response = await api.delete(`/wishlist/${productId}`);
          if (response.data?.success) {
            setWishlistItems(prev => prev.filter(item => (item._id || item.id) !== productId));
            toast.success('Removed from wishlist');
          } else {
            throw new Error('Failed to remove from wishlist');
          }
        } catch (error) {
          console.error('Error removing from wishlist:', error);
          // Fall back to local storage if API fails
          setWishlistItems(prev => prev.filter(item => (item._id || item.id) !== productId));
          toast.success('Removed from wishlist (updated locally)');
        }
      } else {
        // No user, use localStorage
        setWishlistItems(prev => prev.filter(item => (item._id || item.id) !== productId));
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const clearWishlist = async () => {
    try {
      if (currentUser) {
        try {
          const response = await api.delete('/wishlist');
          if (response.data?.success) {
            setWishlistItems([]);
            toast.success('Wishlist cleared');
          } else {
            throw new Error('Failed to clear wishlist');
          }
        } catch (error) {
          console.error('Error clearing wishlist:', error);
          // Fall back to local storage if API fails
          setWishlistItems([]);
          toast.success('Wishlist cleared (updated locally)');
        }
      } else {
        // No user, use localStorage
        setWishlistItems([]);
        toast.success('Wishlist cleared');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    }
  };

  const value = {
    wishlistItems,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
