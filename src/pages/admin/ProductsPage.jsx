import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useLoading } from '../../contexts/LoadingContext';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="relative bg-white dark:bg-admin-slate-800 rounded-lg max-w-md w-full p-6 shadow-xl">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100 text-center">Delete Product</h3>
            <p className="mt-2 text-sm text-admin-slate-500 dark:text-admin-slate-400 text-center">
              Are you sure you want to delete <span className="font-medium text-admin-slate-700 dark:text-admin-slate-300">"{productName}"</span>? This action cannot be undone.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-1/2 px-4 py-2 bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-700 dark:text-admin-slate-300 hover:bg-admin-slate-200 dark:hover:bg-admin-slate-600 rounded-md text-sm font-medium transition duration-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-full sm:w-1/2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800 rounded-md text-sm font-medium transition duration-300"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  const [products, setProducts] = useState([]);
  const [draftProducts, setDraftProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Add state for delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    approvalStatus: 'all',
    search: '',
    page: 1,
    limit: 10
  });
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [productToReview, setProductToReview] = useState(null);
  const [approvalForm, setApprovalForm] = useState({ decision: 'approved', finalRegularPrice: '', finalSpecialOfferPrice: '', notes: '' });


  // Fetch products on component mount and when filters change
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);
  
  // Fetch categories and draft products on component mount
  useEffect(() => {
    fetchCategories();
    fetchDraftProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/admin/list', { params: { status: 'active' } });
      
      // Ensure we're processing categories correctly
      // Flatten the category tree for the dropdown if needed
      const flattenCategories = (categories, result = []) => {
        categories.forEach(category => {
          result.push({
            _id: category._id,
            name: category.name,
            slug: category.slug
          });
          
          if (category.children && category.children.length > 0) {
            flattenCategories(category.children, result);
          }
        });
        return result;
      };
      
      const categoriesData = response.data.data || [];
      const flatCategories = flattenCategories(categoriesData);
      
      setCategories(flatCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  // New function to fetch draft products using the dedicated endpoint
  const fetchDraftProducts = async () => {
    try {
      setDraftsLoading(true);
      const response = await api.get('/products/admin/drafts/list');
      
      // Process draft products - ensure data consistency
      const draftsWithValidData = (response.data.data || []).map(draft => {
        // Ensure categories is always an array (still needed elsewhere)
        if (!draft.categories) {
          draft.categories = [];
        } else if (!Array.isArray(draft.categories)) {
          draft.categories = [draft.categories];
        }
        
        return draft;
      });
      
      setDraftProducts(draftsWithValidData);
    } catch (error) {
      console.error('Error fetching draft products:', error);
      // Don't show error toast here as it might confuse users
      // if they don't have permission to see drafts
    } finally {
      setDraftsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      startLoading();
      setLoading(true);

      // Build query parameters
      const params = {
        page: filters.page,
        limit: filters.limit
      };

      if (filters.category !== 'all') {
        params.category = filters.category;
      }

      // Only set status parameter if it's not 'all'
      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      if (filters.search.trim()) {
        params.search = filters.search.trim();
      }
      if (filters.approvalStatus !== 'all') {
        params.approvalStatus = filters.approvalStatus;
      }

      const response = await api.get('/products/admin/list', { params });
      
      // Ensure the product data is valid and has proper categories
      // Process products - handle categories properly
      const productsWithValidData = response.data.data.products.map(product => {
        // Ensure categories is always an array (still needed for other parts of the UI)
        if (!product.categories) {
          product.categories = [];
        } else if (!Array.isArray(product.categories)) {
          product.categories = [product.categories];
        }
        
        return product;
      });
      
      setProducts(productsWithValidData);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to page 1 when filters change
    }));
  };

  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault();
    // Update search filter and this will trigger useEffect to fetch products
    setFilters(prev => ({
      ...prev,
      search: e.target.search.value,
      page: 1
    }));
  };

  // Handle pagination
  const handleChangePage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Toggle product status
  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      startLoading();
      await api.patch(`/products/${productId}/toggle-status`);
      
      // Update the product status in the local state
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product._id === productId 
            ? { 
                ...product, 
                status: currentStatus === 'active' ? 'inactive' : 'active'
              } 
            : product
        )
      );
      
      toast.success('Product status updated successfully');
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('Failed to update product status');
    } finally {
      stopLoading();
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (productToDelete) {
      try {
        startLoading();
        await api.delete(`/products/${productToDelete.id}`);
        
        // Remove the product from the local state
        setProducts(prevProducts => 
          prevProducts.filter(product => product._id !== productToDelete.id)
        );
        
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      } finally {
        stopLoading();
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      }
    }
  };

  const openApprovalModal = (product) => {
    setProductToReview(product);
    setApprovalForm({
      decision: 'approved',
      finalRegularPrice: product.regularPrice ?? product.vendorRegularPrice ?? '',
      finalSpecialOfferPrice: product.specialOfferPrice ?? product.vendorSpecialOfferPrice ?? '',
      notes: ''
    });
    setIsApprovalModalOpen(true);
  };

  const submitApproval = async () => {
    if (!productToReview) return;
    try {
      startLoading();
      const payload = { approvalStatus: approvalForm.decision, approvalNotes: approvalForm.notes };
      if (approvalForm.decision === 'approved') {
        if (approvalForm.finalRegularPrice === '' || Number(approvalForm.finalRegularPrice) < 0) {
          toast.error('Enter a valid regular price');
          return;
        }
        payload.regularPrice = Number(approvalForm.finalRegularPrice);
        if (approvalForm.finalSpecialOfferPrice !== '') payload.specialOfferPrice = Number(approvalForm.finalSpecialOfferPrice);
      }
      const res = await api.patch(`/products/${productToReview._id}/approve`, payload);
      const updated = res.data?.data || {};
      setProducts(prev => prev.map(p => (p._id === updated._id ? { ...p, ...updated } : p)));
      toast.success('Product approval updated');
      setIsApprovalModalOpen(false);
      setProductToReview(null);
    } catch (error) {
      console.error('Error updating approval:', error);
      toast.error(error.response?.data?.message || 'Failed to update approval');
    } finally {
      stopLoading();
    }
  };

  // Publish draft
  const handlePublishDraft = async (draftId, draftName) => {
    if (window.confirm(`Are you sure you want to publish "${draftName || 'this draft'}"? This will make it visible to customers if status is set to active.`)) {
      try {
        startLoading();
        const response = await api.patch(`/products/${draftId}/publish`);
        
        // Remove the draft from drafts list
        setDraftProducts(prevDrafts => 
          prevDrafts.filter(draft => draft._id !== draftId)
        );
        
        toast.success('Draft published successfully');
        
        // Refresh both draft list and products list
        fetchDraftProducts();
        fetchProducts();
      } catch (error) {
        console.error('Error publishing draft:', error);
        const errorMessage = error.response?.data?.message || 'Failed to publish draft';
        toast.error(errorMessage);
      } finally {
        stopLoading();
      }
    }
  };

  // Format publication status display
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'inactive':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'draft':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'out-of-stock':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      default:
        return 'bg-admin-slate-100 dark:bg-admin-slate-800 text-admin-slate-800 dark:text-admin-slate-200';
    }
  };

  // Helper function to get category name from a category entry
  const getCategoryName = (category) => {
    if (!category) return '';
    
    // If it's an object with a name property, use that
    if (typeof category === 'object' && category.name) {
      return category.name;
    }
    
    // If it's an object ID (string), it might not be populated
    if (typeof category === 'string') {
      // Try to find the category name in our categories list
      const matchingCategory = categories.find(cat => cat._id === category);
      if (matchingCategory) {
        return matchingCategory.name;
      }
      return `ID: ${category}`;
    }
    
    // Fallback
    return 'Unknown';
  };
  
  // Helper function to format product categories for display
  const formatProductCategories = (productCategories) => {
    if (!Array.isArray(productCategories) || productCategories.length === 0) {
      return 'Uncategorized';
    }
    
    // Map each category to its name
    const categoryNames = productCategories
      .filter(cat => cat) // Filter out null/undefined
      .map(cat => getCategoryName(cat));
      
    if (categoryNames.length === 0) return 'Uncategorized';
    
    // Return first category with indication of more if available
    if (categoryNames.length === 1) return categoryNames[0];
    return `${categoryNames[0]} +${categoryNames.length - 1}`;
  };

  // Helper function to get brand name from a brand entry
  const getBrandName = (brand) => {
    if (!brand) return 'N/A';
    
    // If it's an object with a name property, use that
    if (typeof brand === 'object' && brand.name) {
      return brand.name;
    }
    
    // If it's an object ID (string), it might not be populated
    if (typeof brand === 'string') {
      return 'Brand ID: ' + brand;
    }
    
    // Fallback
    return 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">Products</h1>
          <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">Manage your medical supplies inventory</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/admin/products/create" className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-admin-ucla-500 hover:bg-admin-ucla-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500 transition duration-300">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
        </div>
      </div>

      {/* Drafts Section */}
      {draftProducts.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-admin-slate-900 dark:text-admin-slate-100">
                <span className="inline-flex items-center mr-2">
                  <svg className="w-5 h-5 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
                  </svg>
                  Draft Products
                </span>
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {draftProducts.length}
                </span>
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-admin-slate-600 dark:text-admin-slate-400">
                Continue working on your unfinished products
              </p>
            </div>
            <Link 
              to="/admin/products/create" 
              className="inline-flex items-center px-3 py-1.5 border border-blue-300 dark:border-blue-700 text-sm leading-5 font-medium rounded-md text-blue-700 dark:text-blue-400 bg-white dark:bg-admin-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              New Draft
            </Link>
          </div>
          {draftsLoading ? (
            <div className="px-4 py-3 bg-white dark:bg-admin-slate-800 border-t border-blue-200 dark:border-blue-800">
              <div className="flex justify-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-admin-slate-600 dark:text-admin-slate-400">Loading drafts...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-200 dark:divide-blue-800">
                <thead className="bg-blue-100/50 dark:bg-blue-900/30">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                      Brand
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-admin-slate-800 divide-y divide-blue-100 dark:divide-blue-900/40">
                  {draftProducts.map(draft => (
                    <tr key={draft._id} className="hover:bg-blue-50 dark:hover:bg-blue-900/10">
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-lg object-cover border border-blue-200 dark:border-blue-800" 
                              src={draft.images && draft.images.length > 0
                                ? draft.images[0]
                                : 'https://placehold.co/300x300?text=Draft'} 
                              alt={draft.name || 'Unnamed draft'} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">
                              {draft.name || 'Unnamed draft'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="text-sm text-admin-slate-700 dark:text-admin-slate-300">
                          {getBrandName(draft.brand)}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="text-sm text-admin-slate-700 dark:text-admin-slate-300">
                          {new Date(draft.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/admin/products/edit/${draft._id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          Continue Editing
                        </Link>
                        <button 
                          onClick={() => handlePublishDraft(draft._id, draft.name || 'this draft')}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mr-4"
                        >
                          Publish
                        </button>
                        <button 
                          onClick={() => {
                            setIsDeleteModalOpen(true);
                            setProductToDelete({ id: draft._id, name: draft.name || 'this draft' });
                          }}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-56">
            <label htmlFor="category" className="block text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400 mb-2">
              Filter by Category
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full appearance-none rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-4 pr-10 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-56">
            <label htmlFor="status" className="block text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400 mb-2">
              Filter by Status
            </label>
            <div className="relative">
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full appearance-none rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-4 pr-10 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-56">
            <label htmlFor="approvalStatus" className="block text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400 mb-2">
              Filter by Approval
            </label>
            <div className="relative">
              <select
                id="approvalStatus"
                name="approvalStatus"
                value={filters.approvalStatus}
                onChange={handleFilterChange}
                className="w-full appearance-none rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-4 pr-10 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label htmlFor="search-products" className="block text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400 mb-2">
              Search Products
            </label>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  name="search"
                  placeholder="Search by name, description or SKU..."
                  className="w-full rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-10 pr-4 text-sm text-admin-slate-900 dark:text-admin-slate-100 placeholder-admin-slate-400 dark:placeholder-admin-slate-500 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
                  defaultValue={filters.search}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <button type="submit" className="focus:outline-none">
                    <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg overflow-hidden">
        {loading ? (
          <div>
            {/* Table header skeleton */}
            <div className="bg-admin-slate-50 dark:bg-admin-slate-800/50 px-6 py-3 border-b border-admin-slate-200 dark:border-admin-slate-700">
              <div className="flex items-center justify-between">
                <div className="h-4 w-36 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Table row skeletons */}
            {[...Array(5)].map((_, index) => (
              <div key={index} className="px-6 py-4 border-b border-admin-slate-200 dark:border-admin-slate-700">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-admin-slate-200 dark:bg-admin-slate-700 rounded-lg animate-pulse"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-36 md:w-48 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                    <div className="h-3 w-24 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="hidden md:block w-24">
                    <div className="h-4 w-20 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="hidden md:block w-24">
                    <div className="h-4 w-14 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="hidden md:block w-20">
                    <div className="h-4 w-16 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-10 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination skeleton */}
            <div className="px-6 py-3 bg-white dark:bg-admin-slate-800 border-t border-admin-slate-200 dark:border-admin-slate-700">
              <div className="flex items-center justify-between">
                <div className="h-4 w-48 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                <div className="flex space-x-1">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="h-8 w-8 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200">No products found</h3>
            <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">
              {filters.search || filters.category !== 'all' || filters.status !== 'all' 
                ? 'Try changing your search or filter criteria.' 
                : 'Get started by creating a new product.'}
            </p>
            {!filters.search && filters.category === 'all' && filters.status === 'all' && (
              <div className="mt-6">
                <Link
                  to="/admin/products/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-admin-ucla-500 hover:bg-admin-ucla-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Product
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
              <thead className="bg-admin-slate-50 dark:bg-admin-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Brand
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Approval
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-admin-slate-800 divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded-lg object-cover" 
                            src={product.images && product.images.length > 0
                              ? product.images[0]
                              : 'https://placehold.co/300x300?text=No+Image'} 
                            alt={product.name} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">{product.name}</div>
                          <div className="text-xs text-admin-slate-500 dark:text-admin-slate-400">
                            SKU: {product.sku || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-admin-slate-900 dark:text-admin-slate-100">
                        {getBrandName(product.brand)}
                      </div>
                      {product.brand && product.brand.slug && (
                        <div className="text-xs text-admin-slate-500 dark:text-admin-slate-400">
                          {product.brand.slug}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-admin-slate-900 dark:text-admin-slate-100">
                        {product.regularPrice ? `Rs. ${product.regularPrice.toFixed(2)}` : 'N/A'}
                      </div>
                      {product.specialOfferPrice && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Rs. {product.specialOfferPrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-slate-900 dark:text-admin-slate-100">
                      {product.stock !== null ? product.stock : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {product.approvalStatus === 'pending' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">Pending</span>
                        )}
                        {product.approvalStatus === 'approved' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">Approved</span>
                        )}
                        {product.approvalStatus === 'rejected' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">Rejected</span>
                        )}
                      </div>
                      {product.vendorRegularPrice != null && (
                        <div className="text-xs text-admin-slate-500 dark:text-admin-slate-400 mt-1">
                          Vendor price: Rs. {Number(product.vendorRegularPrice).toFixed(2)}{product.vendorSpecialOfferPrice ? ` (Offer: Rs. ${Number(product.vendorSpecialOfferPrice).toFixed(2)})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/admin/products/${product._id}`}
                        className="text-admin-slate-600 hover:text-admin-slate-900 dark:text-admin-slate-300 dark:hover:text-white mr-4"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/admin/products/edit/${product._id}`} 
                        className="text-admin-ucla-500 hover:text-admin-ucla-500 dark:text-admin-ucla-600 dark:hover:text-admin-ucla-700 mr-4"
                      >
                        Edit
                      </Link>
                      {product.approvalStatus === 'pending' && (
                        <button onClick={() => openApprovalModal(product)} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mr-4">Review</button>
                      )}
                      <button 
                        onClick={() => toggleProductStatus(product._id, product.status)}
                        className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 mr-4"
                      >
                        {product.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => {
                          setIsDeleteModalOpen(true);
                          setProductToDelete({ id: product._id, name: product.name });
                        }}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="bg-white dark:bg-admin-slate-800 px-4 py-3 flex items-center justify-between border-t border-admin-slate-200 dark:border-admin-slate-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                onClick={() => handleChangePage(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className={`relative inline-flex items-center px-4 py-2 border border-admin-slate-200 dark:border-admin-slate-700 text-sm font-medium rounded-md text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700 ${!pagination.hasPrevPage && 'opacity-50 cursor-not-allowed'}`}
              >
                Previous
              </button>
              <button 
                onClick={() => handleChangePage(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-admin-slate-200 dark:border-admin-slate-700 text-sm font-medium rounded-md text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700 ${!pagination.hasNextPage && 'opacity-50 cursor-not-allowed'}`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-admin-slate-700 dark:text-admin-slate-300">
                  Showing <span className="font-medium">{(pagination.currentPage - 1) * filters.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * filters.limit, pagination.totalItems)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button 
                    onClick={() => handleChangePage(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-sm font-medium text-admin-slate-500 dark:text-admin-slate-400 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700 ${!pagination.hasPrevPage && 'opacity-50 cursor-not-allowed'}`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(pagination.totalPages).keys()].map(number => {
                    const pageNumber = number + 1;
                    // Only show current page, adjacent pages, first and last page
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      Math.abs(pageNumber - pagination.currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handleChangePage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNumber === pagination.currentPage
                              ? 'z-10 bg-admin-ucla-50 dark:bg-admin-ucla-900/30 border-admin-ucla-500 dark:border-admin-ucla-700 text-admin-ucla-600 dark:text-admin-ucla-300'
                              : 'bg-white dark:bg-admin-slate-800 border-admin-slate-200 dark:border-admin-slate-700 text-admin-slate-500 dark:text-admin-slate-400 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      (pageNumber === 2 && pagination.currentPage > 3) ||
                      (pageNumber === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2)
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300"
                        >
                          ...
                        </span>
                      );
                    } else {
                      return null;
                    }
                  })}
                  
                  <button 
                    onClick={() => handleChangePage(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-sm font-medium text-admin-slate-500 dark:text-admin-slate-400 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700 ${!pagination.hasNextPage && 'opacity-50 cursor-not-allowed'}`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4-4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProduct}
        productName={productToDelete?.name}
      />

      {isApprovalModalOpen && productToReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsApprovalModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-admin-slate-800 rounded-lg max-w-xl w-full p-6 shadow-xl">
              <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100 mb-4">Review Product Approval</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img src={(productToReview.images && productToReview.images[0]) || 'https://placehold.co/80x80'} alt={productToReview.name} className="w-16 h-16 rounded object-cover border" />
                  <div>
                    <div className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">{productToReview.name}</div>
                    <div className="text-xs text-admin-slate-500 dark:text-admin-slate-400">SKU: {productToReview.sku || 'N/A'}</div>
                    {productToReview.vendorRegularPrice != null && (
                      <div className="text-xs text-admin-slate-500 dark:text-admin-slate-400 mt-1">Vendor price: Rs. {Number(productToReview.vendorRegularPrice).toFixed(2)}{productToReview.vendorSpecialOfferPrice ? ` (Offer: Rs. ${Number(productToReview.vendorSpecialOfferPrice).toFixed(2)})` : ''}</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1">Decision</label>
                  <select value={approvalForm.decision} onChange={(e) => setApprovalForm(f => ({ ...f, decision: e.target.value }))} className="w-full rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 px-3 text-sm">
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>
                {approvalForm.decision === 'approved' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1">Final Regular Price</label>
                      <input type="number" min="0" value={approvalForm.finalRegularPrice} onChange={(e) => setApprovalForm(f => ({ ...f, finalRegularPrice: e.target.value }))} className="w-full rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 px-3 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1">Final Special Price (optional)</label>
                      <input type="number" min="0" value={approvalForm.finalSpecialOfferPrice} onChange={(e) => setApprovalForm(f => ({ ...f, finalSpecialOfferPrice: e.target.value }))} className="w-full rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 px-3 text-sm" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1">Notes (optional)</label>
                  <textarea rows={3} value={approvalForm.notes} onChange={(e) => setApprovalForm(f => ({ ...f, notes: e.target.value }))} className="w-full rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 px-3 text-sm" />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button onClick={() => setIsApprovalModalOpen(false)} className="w-full sm:w-1/2 px-4 py-2 bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-700 dark:text-admin-slate-300 hover:bg-admin-slate-200 dark:hover:bg-admin-slate-600 rounded-md text-sm font-medium transition duration-300">Cancel</button>
                  <button onClick={submitApproval} className="w-full sm:w-1/2 px-4 py-2 bg-admin-ucla-500 text-white hover:bg-admin-ucla-600 rounded-md text-sm font-medium transition duration-300">Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;