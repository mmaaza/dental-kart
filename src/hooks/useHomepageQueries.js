import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { getSeoSettings, updateSeoSettings } from '../services/api';

// Homepage settings query
export const useHomepageSettings = () => {
  return useQuery({
    queryKey: ['homepage-settings'],
    queryFn: async () => {
      const response = await api.get('/settings/homepage');
      if (response.data.success) {
        return {
          settings: response.data.settings,
          heroSlides: response.data.heroSlides || [],
          featuredCategories: response.data.featuredCategories || [],
          selectedProducts: response.data.selectedProducts || { featured: [], newArrivals: [] },
          categorySections: response.data.categorySections || [],
          brandSections: response.data.brandSections || []
        };
      }
      throw new Error('Failed to fetch homepage settings');
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx), but do retry on server errors (5xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Categories query - supports both flat and hierarchical formats
export const useCategories = (format = 'tree') => {
  return useQuery({
    queryKey: ['categories', format],
    queryFn: async () => {
      const response = await api.get('/categories', {
        params: { 
          status: 'active',
          format: format // 'tree' or 'flat'
        },
      });
      const allCategories = response.data.data;

      if (format === 'flat') {
        // For flat format, return all categories and filter featured from all levels
        const topLevelCategories = allCategories.filter((cat) => cat.level === 0);
        const featured = allCategories.filter((cat) => cat.featured); // Get featured from any level

        return { 
          allCategories,
          topLevelCategories, 
          featured,
          hierarchical: allCategories // Keep flat structure for backward compatibility
        };
      } else {
        // For tree format (default), work with hierarchical structure
        const topLevelCategories = allCategories.filter((cat) => !cat.parentId);
        
        // Extract featured categories from all levels in the hierarchy
        const extractFeaturedFromTree = (categories) => {
          let featured = [];
          categories.forEach(cat => {
            if (cat.featured) {
              featured.push(cat);
            }
            if (cat.children && cat.children.length > 0) {
              featured.push(...extractFeaturedFromTree(cat.children));
            }
          });
          return featured;
        };

        const featured = extractFeaturedFromTree(allCategories);

        return { 
          topLevelCategories, 
          featured,
          hierarchical: allCategories // Keep hierarchical structure
        };
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Specialized hook for featured categories (uses flat format to get all featured categories)
export const useFeaturedCategories = () => {
  return useQuery({
    queryKey: ['categories', 'featured'],
    queryFn: async () => {
      const response = await api.get('/categories', {
        params: { 
          status: 'active',
          format: 'flat' // Use flat format to get all categories regardless of level
        },
      });
      const allCategories = response.data.data;
      const featured = allCategories.filter((cat) => cat.featured);

      return featured;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Brands query
export const useBrands = () => {
  return useQuery({
    queryKey: ['brands', 'featured'],
    queryFn: async () => {
      try {
        const response = await api.get('/brands', {
          params: {
            featured: true,
            status: 'active'
          }
        });

        if (response.data.success) {
          return response.data.data || [];
        }
        return [];
      } catch (error) {
        console.error('Error fetching brands:', error);
        return [];
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Products by IDs query
export const useProductsByIds = (productIds, enabled = true) => {
  return useQuery({
    queryKey: ['products', 'by-ids', productIds],
    queryFn: async () => {
      if (!productIds || productIds.length === 0) {
        return [];
      }

      try {
        const promises = productIds.map(id =>
          api.get(`/products/${id}`)
            .then(response => {
              const product = response.data.data;
              
              // Additional check to ensure we have a valid product
              if (!product || !product._id) {
                console.warn(`Product with ID ${id} is missing or invalid`);
                return null;
              }
              
              // Calculate discount once to avoid duplication
              const calculatedDiscount = product.specialOfferPrice
                ? Math.round(((product.regularPrice - product.specialOfferPrice) / product.regularPrice) * 100)
                : (product.discountValue || 0);
              
              // Adapt the API product format to our component's expected format
              return {
                _id: product._id, // Add _id for compatibility
                id: product._id,
                name: product.name,
                price: product.regularPrice,
                regularPrice: product.regularPrice,
                specialOfferPrice: product.specialOfferPrice,
                discountValue: calculatedDiscount,
                discountType: product.discountType || 'percentage',
                discount: calculatedDiscount,
                stock: product.stock || 0,
                stockStatus: product.stockStatus || 'in_stock',
                image: product.images && product.images.length > 0
                  ? product.images[0]
                  : "https://placehold.co/300x300?text=No+Image",
                images: product.images || [],
                rating: product.rating || 0,
                reviews: product.reviewCount || 0,
                slug: product.slug,
                brand: product.brand || null
              };
            })
            .catch(error => {
              // Log the error but with less noise for 404s
              if (error?.response?.status === 404) {
                console.warn(`Product ${id} not found (404) - it may have been deleted`);
              } else {
                console.error(`Error fetching product ${id}:`, error);
              }
              return null;
            })
        );

        const results = await Promise.all(promises);
        const validProducts = results.filter(product => product !== null);
        
        // Log if some products were filtered out
        if (validProducts.length !== productIds.length) {
          console.info(`Filtered out ${productIds.length - validProducts.length} invalid/missing products`);
        }
        
        return validProducts;
      } catch (error) {
        console.error('Error fetching products by IDs:', error);
        return [];
      }
    },
    enabled: enabled && productIds && productIds.length > 0,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// SEO Settings queries
export const useSeoSettings = () => {
  return useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => {
      const response = await getSeoSettings();
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch SEO settings');
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useUpdateSeoSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateSeoSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(['seo-settings']);
    },
    onError: (error) => {
      console.error('Error updating SEO settings:', error);
    },
  });
};
