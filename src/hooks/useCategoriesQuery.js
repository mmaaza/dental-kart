import { useSuspenseQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useParentCategories = () => {
  return useSuspenseQuery({
    queryKey: ['parent-categories'],
    queryFn: async () => {
      const response = await api.get('/categories', {
        params: { status: 'active' },
      });
      const categoriesData = response.data.data;
      // Filter to only get parent categories (level 0 categories)
      return categoriesData.filter((category) => category.level === 0);
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
