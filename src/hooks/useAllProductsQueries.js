import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

// Products query with filters
export const useProducts = (filters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      // Build query parameters based on filters
      const params = {
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy
      };
      
      // Add category filter if selected
      if (filters.categories.length > 0) {
        params.category = filters.categories.join(',');
      }
      
      // Add brand filter if selected
      if (filters.brands.length > 0) {
        params.brand = filters.brands.join(',');
      }
      
      // Add price range filters if set
      if (filters.priceRange.min) {
        params.minPrice = filters.priceRange.min;
      }
      
      if (filters.priceRange.max) {
        params.maxPrice = filters.priceRange.max;
      }
      
      const response = await api.get('/products', { params });
      
      if (response.data.success) {
        return {
          products: response.data.data.products,
          pagination: response.data.data.pagination
        };
      }
      throw new Error('Failed to fetch products');
    },
    suspense: true, // Enable Suspense mode
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx), but do retry on server errors (5xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Categories query
export const useAllCategories = () => {
  return useQuery({
    queryKey: ['all-categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      if (response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to fetch categories');
    },
    suspense: true, // Enable Suspense mode
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Brands query
export const useAllBrands = () => {
  return useQuery({
    queryKey: ['all-brands'],
    queryFn: async () => {
      const response = await api.get('/brands');
      if (response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to fetch brands');
    },
    suspense: true, // Enable Suspense mode
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
