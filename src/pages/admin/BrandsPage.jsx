import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import MediaUploadButton from '../../components/ui/MediaUploadButton';
import { useLoading } from '../../contexts/LoadingContext';

// Helper function to format error messages from API responses
const formatErrorMessage = (error) => {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  } else if (error?.response?.data?.message) {
    return error.response.data.message;
  } else if (error?.message) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'error' 
    ? 'bg-red-100 dark:bg-red-900/30' 
    : 'bg-green-100 dark:bg-green-900/30';
  const textColor = type === 'error' 
    ? 'text-red-800 dark:text-red-400' 
    : 'text-green-800 dark:text-green-400';
  const borderColor = type === 'error' 
    ? 'border-red-300 dark:border-red-700' 
    : 'border-green-300 dark:border-green-700';
  const iconColor = type === 'error' 
    ? 'text-red-400 dark:text-red-300' 
    : 'text-green-400 dark:text-green-300';

  return (
    <div className={`rounded-md ${bgColor} p-4 mb-4 border ${borderColor}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {type === 'error' ? (
            <svg className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <p className={`text-sm ${textColor}`}>{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${textColor} hover:bg-${type === 'error' ? 'red' : 'green'}-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type === 'error' ? 'red' : 'green'}-500`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BrandModal = ({ isOpen, onClose, mode, selectedBrand, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    picture: '',
    tags: [],
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    featured: false,
    status: 'active'
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (mode === 'edit' && selectedBrand) {
      setFormData({
        name: selectedBrand.name || '',
        description: selectedBrand.description || '',
        picture: selectedBrand.picture || '',
        tags: selectedBrand.tags || [],
        metaTitle: selectedBrand.metaTitle || '',
        metaDescription: selectedBrand.metaDescription || '',
        keywords: selectedBrand.keywords || '',
        featured: selectedBrand.featured || false,
        status: selectedBrand.status || 'active'
      });
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        description: '',
        picture: '',
        tags: [],
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        featured: false,
        status: 'active'
      });
    }
  }, [selectedBrand, mode]);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle tag input changes
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // Add tag to form data
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  // Remove tag from form data
  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Handle enter key on tag input
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleMediaSelect = (media) => {
    if (Array.isArray(media) && media.length > 0) {
      // If we receive an array (which MediaLibraryModal always returns now)
      setFormData(prev => ({
        ...prev,
        picture: media[0].url
      }));
    } else if (media && media.url) {
      // For backward compatibility
      setFormData(prev => ({
        ...prev,
        picture: media.url
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-overlay flex items-center justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-admin-slate-900/50"></div>
      <div className="relative w-full max-w-3xl mx-auto p-4">
        <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-xl relative flex flex-col max-h-[90vh]">
          {/* Fixed Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-admin-slate-200 dark:border-admin-slate-700 flex-shrink-0">
            <h3 className="text-xl font-bold text-admin-slate-900 dark:text-admin-slate-100">
              {mode === 'add' ? 'Add New Brand' : 'Edit Brand'}
            </h3>
            <button 
              onClick={onClose} 
              className="text-admin-slate-400 dark:text-admin-slate-500 hover:text-admin-slate-500 dark:hover:text-admin-slate-400 focus:outline-none focus:ring-2 focus:ring-admin-ucla-500 focus:ring-offset-2 dark:focus:ring-offset-admin-slate-800 rounded-full p-1"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <form
              id="brand-form"
              onSubmit={(e) => {
                e.preventDefault();
                onSave(formData);
              }}
              className="p-6 space-y-6"
            >
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    name="name"
                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={handleInputChange}
                    name="description"
                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors resize-none"
                    rows="3"
                  />
                </div>
                {/* Tags section */}
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="flex items-center bg-admin-slate-100 dark:bg-admin-slate-700 rounded-full px-3 py-1">
                        <span className="text-sm text-admin-slate-700 dark:text-admin-slate-300">{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-admin-slate-500 dark:text-admin-slate-400 hover:text-admin-slate-700 dark:hover:text-admin-slate-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Enter a tag and press Enter"
                      className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="ml-2 px-4 py-2 bg-admin-ucla-500 text-white rounded-lg hover:bg-admin-ucla-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
                {/* SEO fields */}
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">Meta Title</label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">Meta Description</label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors resize-none"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">Keywords (Separated by Commas)</label>
                  <input
                    type="text"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleInputChange}
                    placeholder="SEO keywords"
                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">Status</label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={handleInputChange}
                      name="status"
                      className="w-full appearance-none rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-4 pr-10 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-admin-slate-400 dark:text-admin-slate-500">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-admin-ucla-600 focus:ring-admin-ucla-500 border-admin-slate-300 dark:border-admin-slate-700 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-admin-slate-700 dark:text-admin-slate-300">
                    Featured Brand
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">Brand Image</label>
                  <div className="space-y-3">
                    {formData.picture && (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                        <img 
                          src={formData.picture} 
                          alt="Brand preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, picture: '' }))}
                          className="absolute top-1 right-1 p-1 bg-red-500 dark:bg-red-600 rounded-full text-white hover:bg-red-600 dark:hover:bg-red-700"
                          type="button"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <MediaUploadButton
                      onSelect={handleMediaSelect}
                      selectedMedia={formData.picture}
                      className="w-full justify-center"
                      type="button"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Fixed Footer */}
          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-admin-slate-200 dark:border-admin-slate-700 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 bg-white dark:bg-admin-slate-800 border border-admin-slate-300 dark:border-admin-slate-600 rounded-md shadow-sm hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700 focus:outline-none focus:ring-2 focus:ring-admin-ucla-500 focus:ring-offset-2 dark:focus:ring-offset-admin-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="brand-form"
              className="px-4 py-2 text-sm font-medium text-white bg-admin-ucla-500 hover:bg-admin-ucla-600 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-admin-ucla-500 focus:ring-offset-2 dark:focus:ring-offset-admin-slate-800"
            >
              {mode === 'add' ? 'Create Brand' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BrandSkeleton = () => {
  const rows = Array(5).fill(null);
  
  return rows.map((_, index) => (
    <tr key={index} className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-admin-slate-200 dark:bg-admin-slate-700 rounded-lg"></div>
          <div className="ml-4">
            <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-32"></div>
            <div className="h-3 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-24 mt-2"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-24"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-5 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-16"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 w-11 bg-admin-slate-200 dark:bg-admin-slate-700 rounded-full"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end space-x-4">
          <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-12"></div>
          <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-24"></div>
          <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-14"></div>
        </div>
      </td>
    </tr>
  ));
};

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { isLoading, startLoading, stopLoading } = useLoading();

  // Get all brands
  const fetchBrands = async () => {
    try {
      startLoading();
      // Use the admin-specific endpoint for fetching brands
      const response = await api.get('/brands/admin/list', {
        params: {
          status: statusFilter,
          search: searchQuery || undefined
        }
      });
      setBrands(response.data.data);
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      setNotification({
        message: `Failed to fetch brands: ${errorMessage}`,
        type: 'error'
      });
      console.error('Error fetching brands:', error);
    } finally {
      stopLoading();
    }
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBrands();
  };

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchBrands();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Fetch brands when status filter changes
  useEffect(() => {
    fetchBrands();
  }, [statusFilter]);

  const handleToggleFeatured = async (brand) => {
    try {
      startLoading();
      await api.put(`/brands/${brand._id}`, {
        ...brand,
        featured: !brand.featured
      });
      await fetchBrands();
      setNotification({
        message: `Brand ${brand.featured ? 'removed from' : 'marked as'} featured successfully`,
        type: 'success'
      });
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      setNotification({
        message: `Failed to update featured status: ${errorMessage}`,
        type: 'error'
      });
    } finally {
      stopLoading();
    }
  };

  const handleSaveBrand = async (formData) => {
    try {
      if (modalMode === 'add') {
        await api.post('/brands', formData);
        setNotification({
          message: 'Brand created successfully',
          type: 'success'
        });
      } else {
        await api.put(`/brands/${selectedBrand._id}`, formData);
        setNotification({
          message: 'Brand updated successfully',
          type: 'success'
        });
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      const action = modalMode === 'add' ? 'creating' : 'updating';
      setNotification({
        message: `Error ${action} brand: ${errorMessage}`,
        type: 'error'
      });
      console.error('Error saving brand:', error);
    }
  };

  const handleDeleteClick = (brand) => {
    setBrandToDelete(brand);
    setDeleteModalOpen(true);
  };

  const handleToggleStatus = async (brand) => {
    try {
      startLoading();
      const newStatus = brand.status === 'active' ? 'inactive' : 'active';
      // If setting to inactive and currently featured, also set featured to false
      const updatedData = {
        ...brand,
        status: newStatus
      };
      
      // Automatically unflag featured when setting to inactive
      if (newStatus === 'inactive' && brand.featured) {
        updatedData.featured = false;
      }
      
      await api.put(`/brands/${brand._id}`, updatedData);
      await fetchBrands();
      
      let message = `Brand ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`;
      if (newStatus === 'inactive' && brand.featured) {
        message += ' and removed from featured';
      }
      
      setNotification({
        message,
        type: 'success'
      });
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      setNotification({
        message: `Failed to update brand status: ${errorMessage}`,
        type: 'error'
      });
    } finally {
      stopLoading();
    }
  };

  const handleConfirmDelete = async () => {
    if (!brandToDelete?._id) return;

    try {
      await api.delete(`/brands/${brandToDelete._id}`);
      setNotification({
        message: 'Brand deleted successfully',
        type: 'success'
      });
      setDeleteModalOpen(false);
      setBrandToDelete(null);
      fetchBrands();
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      setNotification({
        message: `Failed to delete brand: ${errorMessage}`,
        type: 'error'
      });
      console.error('Error deleting brand:', error);
    }
  };

  const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
  
          <div className="relative bg-white dark:bg-admin-slate-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-secondary-100 dark:bg-secondary-900 mb-4">
                <svg className="h-6 w-6 text-secondary-500 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100 text-center">Delete Brand</h3>
              <p className="mt-2 text-sm text-admin-slate-500 dark:text-admin-slate-400 text-center">
                Are you sure you want to delete this brand? This action cannot be undone.
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
                className="w-full sm:w-1/2 px-4 py-2 bg-secondary-500 dark:bg-secondary-600 text-white hover:bg-secondary-600 dark:hover:bg-secondary-700 rounded-md text-sm font-medium transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />

      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">Brands</h1>
          <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
            Manage your product brands
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => {
              setSelectedBrand(null);
              setModalMode('add');
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-admin-ucla-500 hover:bg-admin-ucla-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500 dark:focus:ring-offset-admin-slate-800 transition duration-300"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Brand
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-56">
            <label htmlFor="status-select" className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
              Filter by Status
            </label>
            <div className="relative">
              <select
                id="status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-4 pr-10 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label htmlFor="search-brands" className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
              Search Brands
            </label>
            <div className="relative">
              <input
                type="text"
                id="search-brands"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name or description..."
                className="w-full rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-10 pr-4 text-sm text-admin-slate-900 dark:text-admin-slate-100 placeholder-admin-slate-400 dark:placeholder-admin-slate-500 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
            <thead className="bg-admin-slate-50 dark:bg-admin-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Brand
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Featured
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-admin-slate-800 divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
              {isLoading ? <BrandSkeleton /> : (
                brands.map(brand => (
                  <tr key={brand._id} className="hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {brand.picture ? (
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-lg object-cover" src={brand.picture} alt={brand.name} />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-admin-slate-200 dark:bg-admin-slate-700 flex items-center justify-center">
                            <span className="text-admin-slate-700 dark:text-admin-slate-300 font-medium">
                              {brand.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">{brand.name}</div>
                          {brand.tags && brand.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {brand.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-800 dark:text-admin-slate-300">
                                  {tag}
                                </span>
                              ))}
                              {brand.tags.length > 2 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-800 dark:text-admin-slate-300">
                                  +{brand.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-admin-slate-900 dark:text-admin-slate-100 line-clamp-2">
                        {brand.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        brand.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {brand.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={brand.featured}
                          onChange={() => handleToggleFeatured(brand)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-admin-ucla-300 dark:peer-focus:ring-admin-ucla-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-admin-ucla-500"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                          setSelectedBrand(brand);
                          setModalMode('edit');
                          setIsModalOpen(true);
                        }}
                        className="text-admin-ucla-500 dark:text-admin-ucla-600 hover:text-admin-ucla-600 dark:hover:text-admin-ucla-500 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(brand)}
                        className={`${
                          brand.status === 'active'
                            ? 'text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300'
                            : 'text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300'
                        } mr-4`}
                      >
                        {brand.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(brand)}
                        className="text-secondary-500 dark:text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && brands.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-admin-slate-500 dark:text-admin-slate-400">
                    No brands found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BrandModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        selectedBrand={selectedBrand}
        onSave={handleSaveBrand}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setBrandToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default BrandsPage;