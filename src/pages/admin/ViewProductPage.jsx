import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const ViewProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/admin/${id}`);
        setProduct(response.data.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error(error.response?.data?.message || 'Failed to load product');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Format price with Nepalese currency symbol
  const formatPrice = (price) => {
    return `Rs. ${parseFloat(price).toLocaleString('en-IN', { 
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    })}`;
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle product status toggle
  const handleToggleStatus = async () => {
    try {
      await api.patch(`/products/${id}/toggle-status`);
      
      // Update product status locally
      setProduct(prev => {
        let newStatus;
        if (prev.status === 'active') newStatus = 'inactive';
        else if (prev.status === 'inactive' || prev.status === 'draft') newStatus = 'active';
        else if (prev.status === 'out-of-stock') newStatus = 'active';
        
        return { ...prev, status: newStatus };
      });
      
      toast.success('Product status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update product status');
    }
  };

  // Handle product publish (if it's a draft)
  const handlePublishDraft = async () => {
    try {
      await api.patch(`/products/${id}/publish`);
      setProduct(prev => ({
        ...prev,
        status: 'active',
        isDraft: false
      }));
      toast.success('Product published successfully');
    } catch (error) {
      console.error('Error publishing product:', error);
      toast.error('Failed to publish product');
    }
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    let bgColor, textColor, text;
    
    switch(status) {
      case 'active':
        bgColor = 'bg-green-100 dark:bg-green-900/30';
        textColor = 'text-green-800 dark:text-green-400';
        text = 'Active';
        break;
      case 'inactive':
        bgColor = 'bg-red-100 dark:bg-red-900/30';
        textColor = 'text-red-800 dark:text-red-400';
        text = 'Inactive';
        break;
      case 'draft':
        bgColor = 'bg-purple-100 dark:bg-purple-900/30';
        textColor = 'text-purple-800 dark:text-purple-400';
        text = 'Draft';
        break;
      case 'out-of-stock':
        bgColor = 'bg-amber-100 dark:bg-amber-900/30';
        textColor = 'text-amber-800 dark:text-amber-400';
        text = 'Out of Stock';
        break;
      default:
        bgColor = 'bg-gray-100 dark:bg-gray-800';
        textColor = 'text-gray-800 dark:text-gray-400';
        text = status;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {text}
      </span>
    );
  };

  // Rating Stars Component
  const RatingStars = ({ rating }) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-500' : 'text-admin-slate-400 dark:text-admin-slate-600'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">({product?.rating || 0})</span>
      </div>
    );
  };

  // Tab navigation component
  const Tab = ({ id, label, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-admin-ucla-500 text-admin-ucla-600 dark:text-admin-ucla-400'
          : 'border-transparent text-admin-slate-600 dark:text-admin-slate-400 hover:text-admin-slate-700 dark:hover:text-admin-slate-300 hover:border-admin-slate-300 dark:hover:border-admin-slate-600'
      }`}
    >
      {label}
    </button>
  );

  // Card container component for consistent styling
  const Card = ({ title, children }) => (
    <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-admin-slate-200 dark:border-admin-slate-700">
          <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">{title}</h3>
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
    </div>
  );

  // Data row component for displaying fields in a consistent way
  const DataRow = ({ label, value, className = '' }) => (
    <div className={`py-3 flex ${className}`}>
      <dt className="text-sm font-medium text-admin-slate-500 dark:text-admin-slate-400 w-1/3">{label}</dt>
      <dd className="text-sm text-admin-slate-900 dark:text-admin-slate-100 flex-1">{value || 'N/A'}</dd>
    </div>
  );
  
  // Display skeleton loader while loading data
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm p-6 animate-pulse">
          <div className="h-8 w-2/3 bg-admin-slate-200 dark:bg-admin-slate-700 rounded mb-4"></div>
          <div className="h-4 w-1/3 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
        </div>
        
        {/* Content Skeleton */}
        <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm p-6 animate-pulse space-y-4">
          <div className="h-4 w-full bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
          <div className="h-4 w-5/6 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
          <div className="h-4 w-4/6 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 005.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Product Not Found</h3>
        <p className="mt-1 text-admin-slate-500 dark:text-admin-slate-400">
          The product you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <div className="mt-6">
          <Link
            to="/admin/products"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-admin-ucla-600 hover:bg-admin-ucla-700"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Product Name and Actions */}
      <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center min-w-0">
            <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100 truncate">
              {product.name}
            </h1>
            <StatusBadge status={product.status} />
          </div>
          <div className="mt-4 flex space-x-3 sm:mt-0">
            <Link
              to={`/admin/products/edit/${id}`}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-admin-ucla-600 hover:bg-admin-ucla-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500 transition duration-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Product
            </Link>
            {product.status === 'draft' ? (
              <button
                onClick={handlePublishDraft}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Publish
              </button>
            ) : (
              <button
                onClick={handleToggleStatus}
                className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white ${
                  product.status === 'active' 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-300`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                    product.status === 'active'
                      ? "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"  // X mark
                      : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"  // Check mark
                  } />
                </svg>
                {product.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
            )}
          </div>
        </div>
        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
          <div className="mt-2 flex items-center text-sm text-admin-slate-500 dark:text-admin-slate-400">
            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            SKU: {product.sku || 'Not assigned'}
          </div>
          <div className="mt-2 flex items-center text-sm text-admin-slate-500 dark:text-admin-slate-400">
            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Created: {formatDate(product.createdAt)}
          </div>
          <div className="mt-2 flex items-center text-sm text-admin-slate-500 dark:text-admin-slate-400">
            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Updated: {formatDate(product.updatedAt)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-admin-slate-200 dark:border-admin-slate-700">
        <nav className="flex -mb-px space-x-8 overflow-x-auto">
          <Tab id="overview" label="Overview" active={activeTab === 'overview'} onClick={setActiveTab} />
          <Tab id="images" label="Images" active={activeTab === 'images'} onClick={setActiveTab} />
          <Tab id="attributes" label="Attributes" active={activeTab === 'attributes'} onClick={setActiveTab} />
          <Tab id="variants" label="Variants" active={activeTab === 'variants'} onClick={setActiveTab} />
          <Tab id="pricing" label="Pricing & Inventory" active={activeTab === 'pricing'} onClick={setActiveTab} />
          <Tab id="related" label="Related Products" active={activeTab === 'related'} onClick={setActiveTab} />
          <Tab id="meta" label="Meta & SEO" active={activeTab === 'meta'} onClick={setActiveTab} />
          <Tab id="shipping" label="Shipping & Additional" active={activeTab === 'shipping'} onClick={setActiveTab} />
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  {/* Main product details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Basic Information</h3>
                      <div className="mt-4 border-t border-admin-slate-200 dark:border-admin-slate-700">
                        <dl className="divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
                          <DataRow label="Product Name" value={product.name} />
                          <DataRow label="Brand" value={product.brand?.name || 'N/A'} />
                          <DataRow label="Categories" value={
                            product.categories?.map(cat => cat.name).join(', ') || 'Uncategorized'
                          } />
                          <DataRow label="Vendor" value={product.vendor?.name || 'Admin'} />
                          <DataRow label="Status" value={<StatusBadge status={product.status} />} />
                          <DataRow label="Rating" value={<RatingStars rating={product.rating} />} />
                          <DataRow label="Reviews" value={product.reviewCount || '0'} />
                        </dl>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-md font-medium text-admin-slate-900 dark:text-admin-slate-100">Description</h4>
                      <div className="mt-2 prose prose-sm max-w-none text-admin-slate-700 dark:text-admin-slate-300">
                        <p>{product.description}</p>
                      </div>
                    </div>

                    {product.packagingDescription && (
                      <div className="mt-6">
                        <h4 className="text-md font-medium text-admin-slate-900 dark:text-admin-slate-100">Packaging Information</h4>
                        <div className="mt-2 prose prose-sm max-w-none text-admin-slate-700 dark:text-admin-slate-300">
                          <p>{product.packagingDescription}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-1">
                  {/* Product thumbnail and quick info */}
                  <div className="space-y-4">
                    <div className="aspect-w-1 aspect-h-1 rounded-lg bg-admin-slate-100 dark:bg-admin-slate-800 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-center object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="h-12 w-12 text-admin-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="bg-admin-slate-50 dark:bg-admin-slate-900/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 mb-2">Quick Info</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-admin-slate-500 dark:text-admin-slate-400">Price:</span>
                          <span className="font-medium text-admin-slate-900 dark:text-admin-slate-100">{formatPrice(product.regularPrice)}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-admin-slate-500 dark:text-admin-slate-400">Stock:</span>
                          <span className="font-medium text-admin-slate-900 dark:text-admin-slate-100">{product.stock || '0'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-admin-slate-500 dark:text-admin-slate-400">SKU:</span>
                          <span className="font-medium text-admin-slate-900 dark:text-admin-slate-100">{product.sku || 'N/A'}</span>
                        </li>
                      </ul>
                    </div>

                    <Link
                      to={`/products/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-sm text-admin-ucla-600 dark:text-admin-ucla-400 hover:text-admin-ucla-500 dark:hover:text-admin-ucla-300"
                    >
                      <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View on Site
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'images' && (
          <Card title="Product Images">
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-w-1 aspect-h-1 rounded-lg bg-admin-slate-100 dark:bg-admin-slate-800 overflow-hidden">
                      <img 
                        src={image} 
                        alt={`${product.name} - ${index + 1}`} 
                        className="w-full h-full object-center object-cover" 
                      />
                    </div>
                    <div className="absolute top-2 left-2 bg-admin-slate-900/70 text-white px-2 py-1 text-xs rounded">
                      {index === 0 ? 'Main' : `#${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-admin-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">No Images</h3>
                <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">
                  This product doesn't have any images attached.
                </p>
              </div>
            )}

            {product.hasVariantImages && product.variants && product.variants.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100 mb-4">Variant Images</h3>
                <div className="space-y-6">
                  {product.variants.filter(variant => variant.images && variant.images.length > 0).map((variant, variantIndex) => (
                    <div key={variantIndex} className="border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 mb-2">
                        {variant.attributes.map((attr, i) => (
                          <span key={i}>
                            {i > 0 && ', '}
                            {attr.parentName ? `${attr.parentName}: ${attr.parentValue}` : ''}
                            {attr.childName ? ` | ${attr.childName}: ${attr.childValue}` : ''}
                          </span>
                        ))}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                        {variant.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="aspect-w-1 aspect-h-1 rounded-lg bg-admin-slate-100 dark:bg-admin-slate-800 overflow-hidden">
                            <img 
                              src={image} 
                              alt={`Variant ${variantIndex + 1} - ${imgIndex + 1}`} 
                              className="w-full h-full object-center object-cover" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'attributes' && (
          <div className="space-y-6">
            {(product.attributeGroups && product.attributeGroups.length > 0) ? (
              <Card title="Hierarchical Attributes">
                <div className="space-y-6">
                  {product.attributeGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg p-4">
                      <h3 className="text-md font-medium text-admin-slate-900 dark:text-admin-slate-100">
                        {group.parentAttribute.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {group.parentAttribute.values.map((value, valueIndex) => (
                          <span 
                            key={valueIndex}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-800 dark:text-admin-slate-200"
                          >
                            {value}
                          </span>
                        ))}
                      </div>

                      {group.childAttributes && group.childAttributes.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-admin-slate-200 dark:border-admin-slate-700">
                          {group.childAttributes.map((child, childIndex) => (
                            <div key={childIndex} className="mt-2">
                              <h4 className="text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
                                For "{group.parentAttribute.values[child.parentValueIndex] || 'Unknown'}" - {child.name}
                              </h4>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {child.values.map((value, valueIndex) => (
                                  <span 
                                    key={valueIndex}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-admin-ucla-100 dark:bg-admin-ucla-800/30 text-admin-ucla-800 dark:text-admin-ucla-300"
                                  >
                                    {value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            {(product.attributes && product.attributes.length > 0) ? (
              <Card title={product.attributeGroups && product.attributeGroups.length > 0 ? "Simple Attributes (Legacy)" : "Product Attributes"}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.attributes.map((attr, index) => (
                    <div key={index} className="border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg p-4">
                      <dt className="text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">{attr.name}</dt>
                      <dd className="mt-1 text-sm text-admin-slate-900 dark:text-admin-slate-100">{attr.value}</dd>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            {(!product.attributes || product.attributes.length === 0) && 
             (!product.attributeGroups || product.attributeGroups.length === 0) && (
              <Card>
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-admin-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">No Attributes</h3>
                  <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">
                    This product doesn't have any attributes defined.
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'variants' && (
          <Card title="Product Variants">
            {product.variants && product.variants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
                  <thead className="bg-admin-slate-50 dark:bg-admin-slate-800/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                        Attributes
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                        Stock
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                        SKU
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-admin-slate-800 divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
                    {product.variants.map((variant, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-slate-900 dark:text-admin-slate-100">
                          {variant.attributes.map((attr, i) => (
                            <span key={i} className="block">
                              {attr.parentName ? <strong>{attr.parentName}</strong> : ''}
                              {attr.parentName ? ': ' : ''}{attr.parentValue || ''}
                              {attr.childName ? <> | <strong>{attr.childName}</strong>: {attr.childValue}</> : ''}
                            </span>
                          ))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-slate-900 dark:text-admin-slate-100">
                          {variant.stock || product.stock || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-slate-900 dark:text-admin-slate-100">
                          {variant.sku || product.sku || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-slate-900 dark:text-admin-slate-100">
                          {variant.price ? formatPrice(variant.price) : formatPrice(product.regularPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-admin-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">No Variants</h3>
                <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">
                  This product doesn't have any variants defined.
                </p>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'pricing' && (
          <Card title="Pricing & Inventory">
            <div className="divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
              <DataRow label="Regular Price" value={formatPrice(product.regularPrice)} />
              <DataRow 
                label="Special Offer Price" 
                value={product.specialOfferPrice ? formatPrice(product.specialOfferPrice) : 'No special offer'}
              />
              
              {product.discountValue > 0 && (
                <DataRow 
                  label={`Discount (${product.discountType === 'percentage' ? '%' : 'Amount'})`}
                  value={product.discountType === 'percentage' ? `${product.discountValue}%` : formatPrice(product.discountValue)}
                />
              )}
              
              <DataRow label="Effective Price" value={formatPrice(product.effectivePrice)} />
              <DataRow label="Stock" value={product.stock || '0'} />
              <DataRow label="Minimum Purchase Quantity" value={product.minPurchaseQuantity || '1'} />
              <DataRow label="SKU" value={product.sku || 'N/A'} />
            </div>
          </Card>
        )}

        {activeTab === 'related' && (
          <div className="space-y-6">
            {(product.crossSellProducts && product.crossSellProducts.length > 0) && (
              <Card title="Cross-sell Products">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.crossSellProducts.map(relatedProduct => (
                    <div key={relatedProduct._id} className="border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg overflow-hidden">
                      <div className="aspect-w-3 aspect-h-2 bg-admin-slate-100 dark:bg-admin-slate-800">
                        {relatedProduct.images && relatedProduct.images.length > 0 ? (
                          <img 
                            src={relatedProduct.images[0]} 
                            alt={relatedProduct.name}
                            className="w-full h-full object-center object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="h-8 w-8 text-admin-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 truncate">
                          {relatedProduct.name}
                        </h4>
                        <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">
                          {formatPrice(relatedProduct.regularPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {(product.upSellProducts && product.upSellProducts.length > 0) && (
              <Card title="Up-sell Products">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.upSellProducts.map(relatedProduct => (
                    <div key={relatedProduct._id} className="border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg overflow-hidden">
                      <div className="aspect-w-3 aspect-h-2 bg-admin-slate-100 dark:bg-admin-slate-800">
                        {relatedProduct.images && relatedProduct.images.length > 0 ? (
                          <img 
                            src={relatedProduct.images[0]} 
                            alt={relatedProduct.name}
                            className="w-full h-full object-center object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="h-8 w-8 text-admin-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 truncate">
                          {relatedProduct.name}
                        </h4>
                        <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">
                          {formatPrice(relatedProduct.regularPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {(!product.crossSellProducts || product.crossSellProducts.length === 0) && 
             (!product.upSellProducts || product.upSellProducts.length === 0) && (
              <Card>
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-admin-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">No Related Products</h3>
                  <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">
                    This product doesn't have any related products defined.
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'meta' && (
          <Card title="Meta & SEO">
            <div className="divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
              <DataRow label="Meta Title" value={product.metaTitle} />
              <DataRow label="Meta Description" value={product.metaDescription} />
              <DataRow label="Meta Tags" value={product.metaTags} className="whitespace-pre-wrap" />
              <DataRow label="Search Tags" value={product.searchTags} className="whitespace-pre-wrap" />
              <DataRow label="URL Slug" value={product.slug} />
            </div>
          </Card>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <Card title="Shipping Information">
              <div className="divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
                <DataRow label="Weight" value={product.weight ? `${product.weight} kg` : 'Not specified'} />
                
                {product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height) && (
                  <DataRow 
                    label="Dimensions" 
                    value={`${product.dimensions.length || '0'} × ${product.dimensions.width || '0'} × ${product.dimensions.height || '0'} cm`}
                  />
                )}
                
                <DataRow label="Estimated Delivery Time" value={product.estimatedDeliveryTime} />
              </div>
            </Card>

            <Card title="Additional Information">
              <div className="divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
                <DataRow 
                  label="Expiry Date" 
                  value={product.expiryDate ? formatDate(product.expiryDate) : 'Not specified'}
                />
                <DataRow label="Video Link" value={
                  product.videoLink ? (
                    <a 
                      href={product.videoLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-admin-ucla-600 dark:text-admin-ucla-400 hover:underline"
                    >
                      {product.videoLink}
                    </a>
                  ) : 'Not specified'
                } />
                <DataRow label="Additional Notes" value={product.additionalNotes} className="whitespace-pre-wrap" />
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProductPage;