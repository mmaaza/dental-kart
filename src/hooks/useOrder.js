import { useState, useCallback } from 'react';
import { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  cancelOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getAllOrders,
  getVendorOrders
} from '../services/order.service';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for order management functionality
 * @returns {Object} Order management functions and state
 */
const useOrder = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Place a new order
   * @param {Object} orderData - Order data to submit
   * @param {File} [paymentScreenshot] - Payment screenshot file (optional)
   * @returns {Promise<Object>} Response from the API
   */
  const placeOrder = useCallback(async (orderData, paymentScreenshot) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await createOrder(orderData, paymentScreenshot);
      if (response.success) {
        toast.success('Order placed successfully!');
      }
      return response;
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error.message || 'Failed to place order';
      toast.error(errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch user's order history
   * @returns {Promise<Object[]>} User's orders
   */
  const fetchUserOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getUserOrders();
      if (response.success) {
        setOrders(response.data.orders);
      } else {
        setError(response.message || 'Failed to fetch orders');
        toast.error(response.message || 'Failed to fetch orders');
      }
      return response.data?.orders || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      const errorMessage = error.message || 'Failed to fetch orders';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a specific order by its ID
   * @param {string} orderId - ID of the order to fetch
   * @returns {Promise<Object>} Order data
   */
  const fetchOrderById = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getOrderById(orderId);
      if (response.success) {
        setCurrentOrder(response.data.order);
      } else {
        setError(response.message || 'Failed to fetch order');
        toast.error(response.message || 'Failed to fetch order');
      }
      return response.data?.order;
    } catch (error) {
      console.error('Error fetching order:', error);
      const errorMessage = error.message || 'Failed to fetch order';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancel an order
   * @param {string} orderId - ID of the order to cancel
   * @param {string} [cancelReason] - Reason for cancellation
   * @returns {Promise<Object>} Updated order data
   */
  const cancelUserOrder = useCallback(async (orderId, cancelReason) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await cancelOrder(orderId, cancelReason);
      if (response.success) {
        toast.success('Order cancelled successfully');
        
        // Update current order if it's the one being cancelled
        if (currentOrder && currentOrder._id === orderId) {
          setCurrentOrder(response.data);
        }
        
        // Update orders list if it contains the cancelled order
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? response.data : order
          )
        );
        
        return response.data;
      } else {
        setError(response.message || 'Failed to cancel order');
        toast.error(response.message || 'Failed to cancel order');
        return null;
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      const errorMessage = error.message || 'Failed to cancel order';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentOrder]);

  /**
   * Update order status (Admin/Vendor only)
   * @param {string} orderId - ID of the order to update
   * @param {Object} updateData - The data to update (orderStatus, trackingNumber, estimatedDeliveryDate)
   * @returns {Promise<Object>} Updated order data
   */
  const updateOrderStatusById = useCallback(async (orderId, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await updateOrderStatus(orderId, updateData);
      if (response.success) {
        toast.success('Order status updated successfully');
        
        // Update current order if it's the one being updated
        if (currentOrder && currentOrder._id === orderId) {
          setCurrentOrder(response.data);
        }
        
        // Update orders list if it contains the updated order
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? response.data : order
          )
        );
      } else {
        setError(response.message || 'Failed to update order status');
        toast.error(response.message || 'Failed to update order status');
      }
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      const errorMessage = error.message || 'Failed to update order status';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentOrder]);

  /**
   * Update payment status (Admin only)
   * @param {string} orderId - ID of the order to update
   * @param {string} paymentStatus - The new payment status
   * @returns {Promise<Object>} Updated order data
   */
  const updateOrderPaymentStatus = useCallback(async (orderId, paymentStatus) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await updatePaymentStatus(orderId, paymentStatus);
      if (response.success) {
        toast.success('Payment status updated successfully');
        
        // Update current order if it's the one being updated
        if (currentOrder && currentOrder._id === orderId) {
          setCurrentOrder(response.data);
        }
        
        // Update orders list if it contains the updated order
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? response.data : order
          )
        );
      } else {
        setError(response.message || 'Failed to update payment status');
        toast.error(response.message || 'Failed to update payment status');
      }
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      const errorMessage = error.message || 'Failed to update payment status';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentOrder]);

  /**
   * Fetch all orders (Admin only)
   * @param {Object} queryParams - Query parameters for filtering and pagination
   * @returns {Promise<Object>} Orders data with pagination
   */
  const fetchAllOrders = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAllOrders(queryParams);
      if (response.success) {
        setOrders(response.data.orders);
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch orders');
        toast.error(response.message || 'Failed to fetch orders');
        return { orders: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } };
      }
    } catch (error) {
      console.error('Error fetching all orders:', error);
      const errorMessage = error.message || 'Failed to fetch orders';
      setError(errorMessage);
      toast.error(errorMessage);
      return { orders: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch vendor orders (Vendor only)
   * @param {Object} queryParams - Query parameters for filtering and pagination
   * @returns {Promise<Object>} Orders data with pagination
   */
  const fetchVendorOrders = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getVendorOrders(queryParams);
      if (response.success) {
        setOrders(response.data.orders);
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch vendor orders');
        toast.error(response.message || 'Failed to fetch vendor orders');
        return { orders: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } };
      }
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      const errorMessage = error.message || 'Failed to fetch vendor orders';
      setError(errorMessage);
      toast.error(errorMessage);
      return { orders: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    orders,
    currentOrder,
    error,
    placeOrder,
    fetchUserOrders,
    fetchOrderById,
    cancelUserOrder,
    updateOrderStatusById,
    updateOrderPaymentStatus,
    fetchAllOrders,
    fetchVendorOrders
  };
};

export default useOrder;
export { useOrder };
