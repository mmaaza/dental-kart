import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ProductSelectorModal = ({ isOpen, onClose, onSelect, maxSelect = Infinity, selectedProductIds = [] }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(selectedProductIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedItems(selectedProductIds);
  }, [selectedProductIds]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredProducts(
        products.filter(product => 
          product.name.toLowerCase().includes(query) || 
          (product.sku && product.sku.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Get products with essential fields using admin API
      const response = await api.get('/products/admin/list', {
        params: {
          limit: 1000, // Increased limit to include more products
          fields: 'name,regularPrice,specialOfferPrice,discountType,discountValue,images,stock,sku,status'
        }
      });
      setProducts(response.data.data.products || []);
      setFilteredProducts(response.data.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (productId) => {
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        // If at max selection, remove the first item before adding new one
        if (prev.length >= maxSelect) {
          return [...prev.slice(1), productId];
        }
        return [...prev, productId];
      }
    });
  };

  const handleConfirmSelection = () => {
    onSelect(selectedItems);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 transition-opacity bg-admin-slate-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="relative bg-white dark:bg-admin-slate-800 rounded-lg shadow-xl w-full max-w-4xl mx-auto overflow-hidden">
          <div className="px-6 py-4 border-b border-admin-slate-200 dark:border-admin-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">
                Select Products
              </h3>
              <button
                onClick={onClose}
                className="text-admin-slate-400 hover:text-admin-slate-500 dark:text-admin-slate-500 dark:hover:text-admin-slate-400"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-admin-slate-300 dark:border-admin-slate-600 rounded-lg bg-white dark:bg-admin-slate-700 text-admin-slate-900 dark:text-white focus:ring-admin-ucla-500 focus:border-admin-ucla-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-sm text-admin-slate-500 dark:text-admin-slate-400">
                {selectedItems.length} of {maxSelect === Infinity ? 'unlimited' : maxSelect} products selected
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-admin-ucla-500"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-admin-slate-500 dark:text-admin-slate-400">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <div
                    key={product._id}
                    onClick={() => handleToggleSelect(product._id)}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedItems.includes(product._id)
                        ? 'border-admin-ucla-500 bg-admin-ucla-50 dark:bg-admin-ucla-900/20'
                        : 'border-admin-slate-200 dark:border-admin-slate-700 hover:border-admin-ucla-300'
                    }`}
                  >
                    <div className="flex-shrink-0 h-16 w-16 bg-admin-slate-100 dark:bg-admin-slate-800 rounded-md overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <div className="relative h-full w-full">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                          {(product.specialOfferPrice > 0 || product.discountValue > 0) && (
                            <div className="absolute top-0 left-0 bg-red-500 text-white text-2xs px-1 py-0.5">
                              {product.specialOfferPrice > 0 
                                ? Math.round(((product.regularPrice - product.specialOfferPrice) / product.regularPrice) * 100)
                                : product.discountType === 'percentage'
                                  ? Math.round(product.discountValue)
                                  : Math.round((product.discountValue / product.regularPrice) * 100)
                              }%
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-admin-slate-400 dark:text-admin-slate-500">
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-grow">
                      <h4 className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 line-clamp-2">
                        {product.name}
                      </h4>
                      <p className="text-xs text-admin-slate-500 dark:text-admin-slate-400 mt-1">
                        {product.sku ? `SKU: ${product.sku}` : ''}
                        {product.sku && product.stock !== undefined ? ' | ' : ''}
                        {product.stock !== undefined ? `Stock: ${product.stock}` : ''}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {(product.specialOfferPrice > 0 || product.discountValue > 0) ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-admin-slate-700 dark:text-admin-slate-200">
                              {product.specialOfferPrice > 0 ? (
                                <>Rs. {product.specialOfferPrice.toFixed(2)}</>
                              ) : product.discountType === 'percentage' ? (
                                <>Rs. {(product.regularPrice * (1 - product.discountValue/100)).toFixed(2)}</>
                              ) : (
                                <>Rs. {(product.regularPrice - product.discountValue).toFixed(2)}</>
                              )}
                            </span>
                            <span className="text-2xs line-through text-admin-slate-400 dark:text-admin-slate-500">
                              Rs. {product.regularPrice.toFixed(2)}
                            </span>
                            
                            <span className="text-2xs px-1 py-0.5 bg-red-500 text-white rounded-sm">
                              {product.specialOfferPrice > 0 
                                ? Math.round(((product.regularPrice - product.specialOfferPrice) / product.regularPrice) * 100)
                                : product.discountType === 'percentage'
                                  ? Math.round(product.discountValue)
                                  : Math.round((product.discountValue / product.regularPrice) * 100)
                              }% OFF
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-admin-slate-700 dark:text-admin-slate-200">
                            Rs. {product.regularPrice.toFixed(2)}
                          </span>
                        )}
                        <span className={`text-xs px-1.5 py-0.5 rounded-sm font-medium 
                          ${product.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                            product.status === 'inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                            'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                    <div className="ml-auto flex-shrink-0">
                      <div className={`h-5 w-5 rounded-full border ${
                        selectedItems.includes(product._id) 
                          ? 'bg-admin-ucla-500 border-admin-ucla-500' 
                          : 'bg-white dark:bg-admin-slate-700 border-admin-slate-300 dark:border-admin-slate-600'
                      } flex items-center justify-center`}>
                        {selectedItems.includes(product._id) && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 bg-admin-slate-50 dark:bg-admin-slate-700/50 border-t border-admin-slate-200 dark:border-admin-slate-700 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 hover:text-admin-slate-500 dark:hover:text-admin-slate-100 mr-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSelection}
              className="px-4 py-2 bg-admin-ucla-500 text-white text-sm font-medium rounded-md hover:bg-admin-ucla-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectorModal;
