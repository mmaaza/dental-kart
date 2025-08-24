import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  cancelOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getAllOrders,
  getVendorOrders
} from '../../services/order.service';
import { toast } from 'react-hot-toast';

// Query Keys
export const orderKeys = {
  all: ['orders'],
  lists: () => [...orderKeys.all, 'list'],
  list: (filters) => [...orderKeys.lists(), { filters }],
  details: () => [...orderKeys.all, 'detail'],
  detail: (id) => [...orderKeys.details(), id],
  userOrders: () => [...orderKeys.all, 'user'],
  adminOrders: (filters) => [...orderKeys.all, 'admin', { filters }],
  vendorOrders: (filters) => [...orderKeys.all, 'vendor', { filters }],
};

// Custom Hooks for Order Queries

/**
 * Hook for creating a new order with optimistic updates and error handling
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderData, paymentScreenshot }) => {
      const response = await createOrder(orderData, paymentScreenshot);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create order');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user orders
      queryClient.invalidateQueries({ queryKey: orderKeys.userOrders() });
      
      // Add the new order to the cache optimistically
      queryClient.setQueryData(orderKeys.userOrders(), (oldData) => {
        if (!oldData) return { orders: [data] };
        return { orders: [data, ...oldData.orders] };
      });
      
      toast.success('Order placed successfully!');
    },
    onError: (error) => {
      const errorMessage = error.message || 'Failed to place order';
      toast.error(errorMessage);
    }
  });
};

/**
 * Hook for fetching user's orders with caching and background refetch
 */
export const useUserOrders = (options = {}) => {
  return useQuery({
    queryKey: orderKeys.userOrders(),
    queryFn: async () => {
      const response = await getUserOrders();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch orders');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    suspense: true, // Enable Suspense mode
    ...options
  });
};

/**
 * Hook for fetching a specific order by ID
 */
export const useOrderDetail = (orderId, options = {}) => {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');
      const response = await getOrderById(orderId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch order details');
      }
      return response.data.order;
    },
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    suspense: true, // Enable Suspense mode
    ...options
  });
};

/**
 * Hook for cancelling an order with optimistic updates
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, cancelReason }) => {
      const response = await cancelOrder(orderId, cancelReason);
      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel order');
      }
      return { orderId, updatedOrder: response.data };
    },
    onMutate: async ({ orderId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(orderId) });
      await queryClient.cancelQueries({ queryKey: orderKeys.userOrders() });
      
      // Snapshot the previous values
      const previousOrder = queryClient.getQueryData(orderKeys.detail(orderId));
      const previousOrders = queryClient.getQueryData(orderKeys.userOrders());
      
      // Optimistically update the order status
      if (previousOrder) {
        queryClient.setQueryData(orderKeys.detail(orderId), {
          ...previousOrder,
          orderStatus: 'cancelled'
        });
      }
      
      if (previousOrders) {
        queryClient.setQueryData(orderKeys.userOrders(), {
          ...previousOrders,
          orders: previousOrders.orders.map(order =>
            order._id === orderId 
              ? { ...order, orderStatus: 'cancelled' }
              : order
          )
        });
      }
      
      return { previousOrder, previousOrders };
    },
    onSuccess: ({ orderId, updatedOrder }) => {
      // Update with actual server response
      queryClient.setQueryData(orderKeys.detail(orderId), updatedOrder);
      
      queryClient.setQueryData(orderKeys.userOrders(), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          orders: oldData.orders.map(order =>
            order._id === orderId ? updatedOrder : order
          )
        };
      });
      
      toast.success('Order cancelled successfully');
    },
    onError: (error, { orderId }, context) => {
      // Rollback optimistic updates on error
      if (context?.previousOrder) {
        queryClient.setQueryData(orderKeys.detail(orderId), context.previousOrder);
      }
      if (context?.previousOrders) {
        queryClient.setQueryData(orderKeys.userOrders(), context.previousOrders);
      }
      
      const errorMessage = error.message || 'Failed to cancel order';
      toast.error(errorMessage);
    }
  });
};

/**
 * Hook for updating order status (Admin/Vendor)
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, updateData }) => {
      const response = await updateOrderStatus(orderId, updateData);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update order status');
      }
      return { orderId, updatedOrder: response.data };
    },
    onSuccess: ({ orderId, updatedOrder }) => {
      // Update all relevant caches
      queryClient.setQueryData(orderKeys.detail(orderId), updatedOrder);
      
      // Update user orders cache
      queryClient.setQueryData(orderKeys.userOrders(), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          orders: oldData.orders.map(order =>
            order._id === orderId ? updatedOrder : order
          )
        };
      });
      
      // Invalidate admin and vendor order lists
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      
      toast.success('Order status updated successfully');
    },
    onError: (error) => {
      const errorMessage = error.message || 'Failed to update order status';
      toast.error(errorMessage);
    }
  });
};

/**
 * Hook for updating payment status (Admin only)
 */
export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, paymentStatus }) => {
      const response = await updatePaymentStatus(orderId, paymentStatus);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update payment status');
      }
      return { orderId, updatedOrder: response.data };
    },
    onSuccess: ({ orderId, updatedOrder }) => {
      // Update all relevant caches
      queryClient.setQueryData(orderKeys.detail(orderId), updatedOrder);
      
      queryClient.setQueryData(orderKeys.userOrders(), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          orders: oldData.orders.map(order =>
            order._id === orderId ? updatedOrder : order
          )
        };
      });
      
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      
      toast.success('Payment status updated successfully');
    },
    onError: (error) => {
      const errorMessage = error.message || 'Failed to update payment status';
      toast.error(errorMessage);
    }
  });
};

/**
 * Hook for fetching admin orders with pagination and filters
 */
export const useAdminOrders = (queryParams = {}, options = {}) => {
  return useQuery({
    queryKey: orderKeys.adminOrders(queryParams),
    queryFn: async () => {
      const response = await getAllOrders(queryParams);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch orders');
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true, // Keep previous data while fetching new data
    refetchOnWindowFocus: false,
    retry: 2,
    ...options
  });
};

/**
 * Hook for fetching vendor orders with pagination and filters
 */
export const useVendorOrders = (queryParams = {}, options = {}) => {
  return useQuery({
    queryKey: orderKeys.vendorOrders(queryParams),
    queryFn: async () => {
      const response = await getVendorOrders(queryParams);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch vendor orders');
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    retry: 2,
    ...options
  });
};
