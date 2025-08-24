import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import api from '../services/api';

// Hook for fetching product by slug with suspense
export const useProductDetail = (slug) => {
  return useSuspenseQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await api.get(`/products/slug/${slug}`);
      return response.data.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Hook for fetching related products
export const useRelatedProducts = (productId) => {
  return useQuery({
    queryKey: ['relatedProducts', productId],
    queryFn: async () => {
      const response = await api.get(`/products/${productId}/related`);
      return response.data.data;
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Hook for fetching product reviews with optimistic updates support
export const useProductReviews = (productId) => {
  return useQuery({
    queryKey: ['productReviews', productId],
    queryFn: async () => {
      const response = await api.get(`/products/${productId}/reviews`);
      return response.data.data;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
