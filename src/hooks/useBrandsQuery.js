import { useSuspenseQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useBrands = () => {
  return useSuspenseQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await api.get('/brands');
      if (response.data.success) {
        return response.data.data || [];
      }
      throw new Error('Failed to load brands');
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx), but do retry on server errors (5xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
