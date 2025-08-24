import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '../services/api';

export const useSearchQuery = (query, enabled = true) => {
  // Ensure enabled is always a boolean
  const isEnabled = Boolean(enabled && query?.trim() && query.trim().length >= 2);
  
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query?.trim()) return { results: [], totalResults: 0, totalPages: 1 };
      const response = await searchProducts(query.trim(), 1, 20);
      
      // Format the search results
      const formattedResults = [];
      
      // Process products
      if (response.data.products && response.data.products.length > 0) {
        const products = response.data.products.map(product => ({
          id: product._id,
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0] : null,
          path: `/product/${product.slug}`,
          category: 'products',
          description: product.shortDescription || '',
          price: product.price,
          tags: product.tags || [],
        }));
        formattedResults.push(...products);
      }
      
      // Process brands
      if (response.data.brands && response.data.brands.length > 0) {
        const brands = response.data.brands.map(brand => ({
          id: brand._id,
          name: brand.name,
          image: brand.logo || null,
          path: `/brands/${brand.slug}`,
          category: 'brands',
          description: brand.description || '',
        }));
        formattedResults.push(...brands);
      }
      
      // Process categories
      if (response.data.categories && response.data.categories.length > 0) {
        const categories = response.data.categories.map(category => ({
          id: category._id,
          name: category.name,
          image: category.image || null,
          path: `/category/${category.slug}`,
          category: 'categories',
          description: category.description || '',
        }));
        formattedResults.push(...categories);
      }

      // Sort results by relevance - exact matches first, then by category
      const lowerQuery = query.toLowerCase();
      const sortedResults = formattedResults.sort((a, b) => {
        // Exact matches come first
        const aExact = a.name.toLowerCase() === lowerQuery;
        const bExact = b.name.toLowerCase() === lowerQuery;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Then sort by whether name starts with the query
        const aStarts = a.name.toLowerCase().startsWith(lowerQuery);
        const bStarts = b.name.toLowerCase().startsWith(lowerQuery);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        // Check for tags and keywords matching (for products)
        if (a.category === 'products' && b.category === 'products') {
          const aTagMatch = a.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
          const bTagMatch = b.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
          
          if (aTagMatch && !bTagMatch) return -1;
          if (!aTagMatch && bTagMatch) return 1;
        }
        
        // Then sort by category
        return a.category.localeCompare(b.category);
      });

      return {
        results: sortedResults,
        totalResults: response.data.totalResults || sortedResults.length,
        totalPages: response.data.totalPages || 1,
      };
    },
    enabled: isEnabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
