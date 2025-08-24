import api from './api';
import vendorApi from './vendorApi';

/**
 * Create a new order
 * @param {Object} orderData - Order data including shipping details and payment method
 * @param {File} paymentScreenshot - Optional payment screenshot file for pay-now orders
 * @returns {Promise<Object>} Response from the API
 */
export const createOrder = async (orderData, paymentScreenshot) => {
  try {
    // If we have a payment screenshot, use FormData
    if (paymentScreenshot && orderData.payment.paymentMethod === 'pay-now') {
      const formData = new FormData();
      
      // Add shipping details
      formData.append('shippingDetails', JSON.stringify(orderData.shipping));
      
      // Add payment method
      formData.append('paymentMethod', orderData.payment.paymentMethod);
      
      // Add payment screenshot if available
      formData.append('paymentScreenshot', paymentScreenshot);
      
      const response = await api.post('/orders', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      // Regular JSON request for pay-later orders
      const response = await api.post('/orders', {
        shippingDetails: orderData.shipping,
        paymentMethod: orderData.payment.paymentMethod
      });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create order'
    };
  }
};

/**
 * Get user's order history
 * @returns {Promise<Object>} Response from the API
 */
export const getUserOrders = async () => {
  try {
    const response = await api.get('/orders');
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch orders'
    };
  }
};

/**
 * Get a specific order by ID
 * @param {string} orderId - The ID of the order to fetch
 * @returns {Promise<Object>} Response from the API
 */
export const getOrderById = async (orderId) => {
  try {
    // Try vendor-scoped endpoint first (if vendor token present)
    const vendorToken = localStorage.getItem('vendorToken');
    const response = vendorToken
      ? await vendorApi.get(`/orders/vendor/${orderId}`)
      : await api.get(`/orders/${orderId}`);
    const payload = response.data?.data;
    const order = payload && typeof payload === 'object' && 'order' in payload ? payload.order : payload;
    return {
      success: true,
      data: { order },
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch order details'
    };
  }
};

/**
 * Cancel an order
 * @param {string} orderId - The ID of the order to cancel
 * @param {string} cancelReason - The reason for cancellation
 * @returns {Promise<Object>} Response from the API
 */
export const cancelOrder = async (orderId, cancelReason) => {
  try {
    const response = await api.patch(`/orders/${orderId}/cancel`, { cancelReason });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to cancel order'
    };
  }
};

/**
 * Update order status (admin/vendor only)
 * @param {string} orderId - The ID of the order to update
 * @param {Object} updateData - The data to update (orderStatus, trackingNumber, estimatedDeliveryDate)
 * @returns {Promise<Object>} Response from the API
 */
export const updateOrderStatus = async (orderId, updateData) => {
  try {
    // Admin-only endpoint
    const response = await api.patch(`/orders/${orderId}/status`, updateData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update order status'
    };
  }
};

/**
 * Update payment status (admin only)
 * @param {string} orderId - The ID of the order to update
 * @param {string} paymentStatus - The new payment status
 * @returns {Promise<Object>} Response from the API
 */
export const updatePaymentStatus = async (orderId, paymentStatus) => {
  try {
    const response = await api.patch(`/orders/${orderId}/payment`, { paymentStatus });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update payment status'
    };
  }
};

/**
 * Get all orders (admin only)
 * @param {Object} queryParams - Query parameters for filtering and pagination
 * @returns {Promise<Object>} Response from the API
 */
export const getAllOrders = async (queryParams = {}) => {
  try {
    const response = await api.get('/orders/admin/all', { params: queryParams });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch orders'
    };
  }
};

/**
 * Get vendor orders (vendor only)
 * @param {Object} queryParams - Query parameters for filtering and pagination
 * @returns {Promise<Object>} Response from the API
 */
export const getVendorOrders = async (queryParams = {}) => {
  try {
    // Use vendor-authenticated client if available
    const client = (typeof vendorApi !== 'undefined' ? vendorApi : api);
    const response = await client.get('/orders/vendor', { params: queryParams });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch vendor orders'
    };
  }
};
