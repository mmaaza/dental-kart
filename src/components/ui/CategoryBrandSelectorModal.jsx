import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CategoryBrandSelectorModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  type, // 'category' or 'brand'
  selectedItems = [],
  maxSelect = 5
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState(null);
  const [activeItemName, setActiveItemName] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      // Initialize selected items based on type
      if (type === 'category') {
        setSelectedCategories(selectedItems);
        setSelectedBrands([]);
      } else {
        setSelectedBrands(selectedItems);
        setSelectedCategories([]);
      }
    }
  }, [isOpen, type, selectedItems]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredItems(
        items.filter(item => 
          item.name.toLowerCase().includes(query) || 
          (item.slug && item.slug.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, items]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      if (type === 'category') {
        // Use admin endpoint with flat format to get all categories regardless of level
        const response = await api.get('/categories/admin/list', {
          params: {
            status: 'active',
            format: 'flat',
            limit: 100
          }
        });
        setItems(response.data.data || []);
        setFilteredItems(response.data.data || []);
      } else {
        // For brands, use the regular endpoint
        const response = await api.get('/brands', {
          params: {
            status: 'active',
            limit: 100
          }
        });
        setItems(response.data.data || []);
        setFilteredItems(response.data.data || []);
      }
    } catch (error) {
      console.error(`Error fetching ${type}s:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (itemId, itemName) => {
    if (type === 'category') {
      setSelectedCategories(prev => {
        const existing = prev.find(item => item.categoryId === itemId);
        if (existing) {
          return prev.filter(item => item.categoryId !== itemId);
        } else {
          if (prev.length >= maxSelect) {
            return [...prev.slice(1), { categoryId: itemId, categoryName: itemName, productIds: [] }];
          }
          return [...prev, { categoryId: itemId, categoryName: itemName, productIds: [] }];
        }
      });
    } else {
      setSelectedBrands(prev => {
        const existing = prev.find(item => item.brandId === itemId);
        if (existing) {
          return prev.filter(item => item.brandId !== itemId);
        } else {
          if (prev.length >= maxSelect) {
            return [...prev.slice(1), { brandId: itemId, brandName: itemName, productIds: [] }];
          }
          return [...prev, { brandId: itemId, brandName: itemName, productIds: [] }];
        }
      });
    }
  };

  const openProductSelector = (itemId, itemName) => {
    setActiveItemId(itemId);
    setActiveItemName(itemName);
    setProductSelectorOpen(true);
  };

  const handleProductSelection = (productIds) => {
    if (type === 'category') {
      setSelectedCategories(prev => 
        prev.map(item => 
          item.categoryId === activeItemId 
            ? { ...item, productIds }
            : item
        )
      );
    } else {
      setSelectedBrands(prev => 
        prev.map(item => 
          item.brandId === activeItemId 
            ? { ...item, productIds }
            : item
        )
      );
    }
    setProductSelectorOpen(false);
  };

  const handleConfirmSelection = () => {
    const selectedItems = type === 'category' ? selectedCategories : selectedBrands;
    onSelect(selectedItems);
    onClose();
  };

  const isItemSelected = (itemId) => {
    if (type === 'category') {
      return selectedCategories.some(item => item.categoryId === itemId);
    } else {
      return selectedBrands.some(item => item.brandId === itemId);
    }
  };

  const getSelectedItem = (itemId) => {
    if (type === 'category') {
      return selectedCategories.find(item => item.categoryId === itemId);
    } else {
      return selectedBrands.find(item => item.brandId === itemId);
    }
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
                Select {type === 'category' ? 'Categories' : 'Brands'}
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
                  placeholder={`Search ${type === 'category' ? 'categories' : 'brands'}...`}
                  className="w-full pl-10 pr-4 py-2 border border-admin-slate-300 dark:border-admin-slate-600 rounded-lg bg-white dark:bg-admin-slate-700 text-admin-slate-900 dark:text-white focus:ring-admin-ucla-500 focus:border-admin-ucla-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-sm text-admin-slate-500 dark:text-admin-slate-400">
                {type === 'category' ? selectedCategories.length : selectedBrands.length} of {maxSelect} {type === 'category' ? 'categories' : 'brands'} selected
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-admin-ucla-500"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-admin-slate-500 dark:text-admin-slate-400">No {type === 'category' ? 'categories' : 'brands'} found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => {
                  const isSelected = isItemSelected(item._id);
                  const selectedItem = getSelectedItem(item._id);
                  const productCount = selectedItem ? selectedItem.productIds.length : 0;
                  
                  return (
                    <div
                      key={item._id}
                      className={`border rounded-lg p-4 transition-colors ${
                        isSelected
                          ? 'border-admin-ucla-500 bg-admin-ucla-50 dark:bg-admin-ucla-900/20'
                          : 'border-admin-slate-200 dark:border-admin-slate-700 hover:border-admin-ucla-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div
                            onClick={() => handleToggleSelect(item._id, item.name)}
                            className={`h-5 w-5 rounded-full border cursor-pointer flex items-center justify-center ${
                              isSelected 
                                ? 'bg-admin-ucla-500 border-admin-ucla-500' 
                                : 'bg-white dark:bg-admin-slate-700 border-admin-slate-300 dark:border-admin-slate-600'
                            }`}
                          >
                            {isSelected && (
                              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <h4 className="ml-3 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">
                            {item.name}
                          </h4>
                        </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-xs text-admin-slate-500 dark:text-admin-slate-400 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      {isSelected && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-admin-slate-600 dark:text-admin-slate-300">
                              Selected Products: {productCount}
                            </span>
                            <button
                              onClick={() => openProductSelector(item._id, item.name)}
                              className="text-xs text-admin-ucla-600 dark:text-admin-ucla-900 hover:text-admin-ucla-700 dark:hover:text-admin-ucla-300"
                            >
                              {productCount > 0 ? 'Change Products' : 'Add Products'}
                            </button>
                          </div>
                          
                          {productCount > 0 && (
                            <div className="text-xs text-admin-slate-500 dark:text-admin-slate-400">
                              {productCount} product{productCount !== 1 ? 's' : ''} selected
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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

      {/* Product Selector Modal */}
      {productSelectorOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 transition-opacity bg-admin-slate-500 bg-opacity-75" onClick={() => setProductSelectorOpen(false)}></div>
            
            <div className="relative bg-white dark:bg-admin-slate-800 rounded-lg shadow-xl w-full max-w-4xl mx-auto overflow-hidden">
              <div className="px-6 py-4 border-b border-admin-slate-200 dark:border-admin-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">
                    Select Products for {activeItemName}
                  </h3>
                  <button
                    onClick={() => setProductSelectorOpen(false)}
                    className="text-admin-slate-400 hover:text-admin-slate-500 dark:text-admin-slate-500 dark:hover:text-admin-slate-400"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <ProductSelectorContent
                  type={type}
                  itemId={activeItemId}
                  onSelect={handleProductSelection}
                  selectedProductIds={getSelectedItem(activeItemId)?.productIds || []}
                  maxSelect={8}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Separate component for product selection within the modal
const ProductSelectorContent = ({ type, itemId, onSelect, selectedProductIds, maxSelect }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(selectedProductIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [itemId, type]);

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
      const params = {
        limit: 100,
        fields: 'name,regularPrice,specialOfferPrice,discountType,discountValue,images,stock,sku,status'
      };
      
      if (type === 'category') {
        params.category = itemId;
      } else {
        params.brand = itemId;
      }
      
      console.log('Fetching products with params:', params);
      console.log('Type:', type, 'ItemId:', itemId);
      
      const response = await api.get('/products/admin/list', { params });
      console.log('API Response:', response.data);
      
      const products = response.data.data.products || [];
     
      setProducts(products);
      setFilteredProducts(products);
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
        if (prev.length >= maxSelect) {
          return [...prev.slice(1), productId];
        }
        return [...prev, productId];
      }
    });
  };

  const handleConfirmSelection = () => {
    onSelect(selectedItems);
  };

  return (
    <div>
      <div className="mb-4">
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
          {selectedItems.length} of {maxSelect} products selected
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
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
      
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleConfirmSelection}
          className="px-4 py-2 bg-admin-ucla-500 text-white text-sm font-medium rounded-md hover:bg-admin-ucla-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500"
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
};

export default CategoryBrandSelectorModal; 