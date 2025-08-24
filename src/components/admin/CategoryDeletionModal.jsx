import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CategoryDeletionModal = ({ isOpen, onClose, categoryId, onDeleted }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && categoryId) {
      fetchPreview();
    }
  }, [isOpen, categoryId]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/categories/admin/${categoryId}/deletion-preview`);
      setPreview(response.data.data);
    } catch (error) {
      console.error('Failed to fetch deletion preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      
      const response = await api.delete(`/categories/${categoryId}`, {
        data: { moveToUncategorized: true }
      });

      onDeleted(response.data);
      onClose();
    } catch (error) {
      console.error('Failed to delete category:', error);
      // Handle error display
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-overlay flex items-center justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-admin-slate-900/50" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl my-8 mx-auto p-4">
        <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-xl relative max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-admin-slate-200 dark:border-admin-slate-700">
            <h3 className="text-xl font-bold text-admin-slate-900 dark:text-admin-slate-100">
              Delete Category: {preview?.category.name}
            </h3>
            <button
              onClick={onClose}
              className="text-admin-slate-400 hover:text-admin-slate-600 dark:hover:text-admin-slate-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-ucla-500 mx-auto"></div>
                <p className="mt-2 text-admin-slate-600 dark:text-admin-slate-400">Loading deletion preview...</p>
              </div>
            ) : preview ? (
              <div className="space-y-6">
                {/* Impact Summary */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Deletion Impact
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• <strong>{preview.totalCategoriesToDelete}</strong> categories will be deleted</li>
                    <li>• <strong>{preview.totalProductsAffected}</strong> products are in these categories</li>
                    {preview.subcategories.length > 0 && (
                      <li>• <strong>{preview.subcategories.length}</strong> subcategories will also be deleted</li>
                    )}
                  </ul>
                  
                  {preview.sampleProducts.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Sample affected products:</p>
                      <div className="flex flex-wrap gap-2">
                        {preview.sampleProducts.map(product => (
                          <span key={product.id} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                            {product.name}
                          </span>
                        ))}
                        {preview.totalProductsAffected > preview.sampleProducts.length && (
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                            +{preview.totalProductsAffected - preview.sampleProducts.length} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Handling Information */}
                {preview.totalProductsAffected > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-admin-slate-900 dark:text-admin-slate-100 mb-4">
                      Product Handling
                    </h4>
                    
                    <div className="border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-green-600 dark:text-green-400">
                              Products will be moved to "Uncategorized"
                            </h5>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded">
                              Safe Option
                            </span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            All <strong>{preview.totalProductsAffected}</strong> products will be automatically moved to an "Uncategorized" category and remain available for purchase. This ensures no products are lost or become inaccessible.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subcategories Warning */}
                {preview.subcategories.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                      <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Subcategories Will Also Be Deleted
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                      The following subcategories will be permanently deleted:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {preview.subcategories.map(subcat => (
                        <span key={subcat.id} className="px-2 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 text-xs rounded">
                          {subcat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-admin-slate-200 dark:border-admin-slate-700">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 bg-white dark:bg-admin-slate-800 border border-admin-slate-300 dark:border-admin-slate-600 rounded-md hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-md transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Delete Category'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDeletionModal;
