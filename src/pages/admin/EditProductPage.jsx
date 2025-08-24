import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import MediaUploadButton from '../../components/ui/MediaUploadButton';
import DocumentUploadButton from '../../components/ui/DocumentUploadButton';
import CategoryDropdown from '../../components/ui/CategoryDropdown';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVariantImages, setHasVariantImages] = useState(false);
  const [attributeImages, setAttributeImages] = useState({});
  const [selectedVariantForImages, setSelectedVariantForImages] = useState(null);
  const [generatedVariants, setGeneratedVariants] = useState([]);
  const [isDraft, setIsDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [globalAttributes, setGlobalAttributes] = useState([]);

  // Form data state with default values
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    brand: '',
    categories: [], // Changed from category to categories array
    description: '',
    packagingDescription: '',
    packageDocument: null, // New field for package document

    // Meta Information
    metaTitle: '',
    metaDescription: '',
    metaTags: '',
    searchTags: '',

    // Pricing & Inventory
    regularPrice: '',
    specialOfferPrice: '',
    discountType: 'percentage', // percentage or amount
    discountValue: '',
    minPurchaseQuantity: 1,
    stock: '',
    sku: '',

    // Marketing & Relations
    crossSellProducts: [],
    upSellProducts: [],

    // Attributes
    attributeGroups: [
      {
        parentAttribute: { name: '', values: [''] },
        childAttributes: []
      }
    ],
    attributes: [{ name: '', value: '' }],

    // Additional Information
    status: 'active',
    vendor: '',

    // Shipping Information
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    estimatedDeliveryTime: '',

    // Additional Details
    expiryDate: '',
    videoLink: '',
    additionalNotes: ''
  });

  // Helper function to fetch product data from either the regular or draft endpoint
  const fetchProductData = async (productId) => {
    // Try the regular product endpoint first
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data.data;
    } catch (regularError) {
      // If that fails, try the draft endpoint
      try {
        const draftResponse = await api.get(`/products/drafts/${productId}`);
        return draftResponse.data.data;
      } catch (draftError) {
        // If both fail, throw the original error for better error reporting
        throw regularError;
      }
    }
  };

  // Fetch product data and other necessary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        setIsLoading(true);
        
        // Fetch product details using our helper function
        const product = await fetchProductData(id);

        // Check if product exists
        if (!product) {
          toast.error('Product not found');
          navigate('/admin/products');
          return;
        }

        // Set isDraft state based on product status
        setIsDraft(product.status === 'draft');
        setDraftSaved(product.status === 'draft');
        
        // Pre-process images to match the format used in MediaLibrary component
        let processedImages = [];
        if (product.images && product.images.length > 0) {
          processedImages = product.images.map(url => ({
            url,
            name: url.split('/').pop(),
            type: 'image'
          }));
        }

        // Pre-process variant images if any
        let processedAttributeImages = {};
        if (product.hasVariantImages && product.variants && product.variants.length > 0) {
          product.variants.forEach(variant => {
            if (variant.attributes && variant.images && variant.images.length > 0) {
              const variantKey = generateVariantKey(variant.attributes);
              processedAttributeImages[variantKey] = variant.images.map(url => ({
                url,
                name: url.split('/').pop(),
                type: 'image'
              }));
            }
          });
        }

        // Set product data to state
        setFormData({
          ...formData,
          name: product.name || '',
          brand: product.brand?._id || '',
          categories: product.categories?.map(cat => cat._id) || [],
          description: product.description || '',
          packagingDescription: product.packagingDescription || '',
          packageDocument: product.packageDocument ? {
            url: product.packageDocument,
            name: product.packageDocument.split('/').pop(),
            type: 'application/octet-stream',
            createdAt: new Date().toISOString()
          } : null,
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
          metaTags: product.metaTags || '',
          searchTags: product.searchTags || '',
          regularPrice: product.regularPrice || '',
          specialOfferPrice: product.specialOfferPrice || '',
          discountType: product.discountType || 'percentage',
          discountValue: product.discountValue || '',
          minPurchaseQuantity: product.minPurchaseQuantity || 1,
          stock: product.stock || '',
          sku: product.sku || '',
          crossSellProducts: product.crossSellProducts || [],
          upSellProducts: product.upSellProducts || [],
          attributeGroups: product.attributeGroups?.length > 0 
            ? product.attributeGroups 
            : [{ parentAttribute: { name: '', values: [''] }, childAttributes: [] }],
          attributes: product.attributes?.length > 0 
            ? product.attributes 
            : [{ name: '', value: '' }],
          status: product.status || 'active',
          vendor: product.vendor?._id || '',
          weight: product.weight || '',
          dimensions: product.dimensions || { length: '', width: '', height: '' },
          estimatedDeliveryTime: product.estimatedDeliveryTime || '',
          expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
          videoLink: product.videoLink || '',
          additionalNotes: product.additionalNotes || ''
        });

        setProductImages(processedImages);
        setAttributeImages(processedAttributeImages);
        setHasVariantImages(product.hasVariantImages || false);

        // Fetch additional required data
        const [brandsResponse, categoriesResponse, vendorsResponse, attributesResponse] = await Promise.all([
          api.get('/brands', { params: { status: 'active' } }),
          api.get('/categories', { params: { status: 'active', format: 'flat' } }),
          api.get('/vendors', { params: { status: 'active' } }),
          api.get('/admin/settings/attributes')
        ]);

        setBrands(brandsResponse.data.data || []);
        
        const categoriesData = categoriesResponse.data.data || [];
        setCategories(categoriesData);
        
        // Build hierarchical categories structure
        const buildHierarchicalCategories = () => {
          // Create a map of all categories by id for easy lookup
          const categoryMap = {};
          categoriesData.forEach(category => {
            categoryMap[category._id] = {...category, children: []};
          });
          
          // Root categories will be stored here
          const rootCategories = [];
          
          // Add each category to its parent's children array
          categoriesData.forEach(category => {
            const categoryWithChildren = categoryMap[category._id];
            
            if (category.parentId) {
              // This is a child category, add it to its parent's children
              const parentId = typeof category.parentId === 'object' ? category.parentId._id : category.parentId;
              if (categoryMap[parentId]) {
                categoryMap[parentId].children.push(categoryWithChildren);
              } else {
                // If parent doesn't exist, treat as root
                rootCategories.push(categoryWithChildren);
              }
            } else {
              // This is a root category
              rootCategories.push(categoryWithChildren);
            }
          });
          
          return rootCategories;
        };
        
        // Set the hierarchical categories
        setHierarchicalCategories(buildHierarchicalCategories());
        setVendors(vendorsResponse.data.data || []);
        setGlobalAttributes(attributesResponse.data.data || []);

        // Generate variants based on loaded attribute data
        const initialVariants = generateVariantsFromFormData({
          attributeGroups: product.attributeGroups || [],
          attributes: product.attributes || []
        });
        setGeneratedVariants(initialVariants);
      } catch (error) {
        console.error('Error fetching product data:', error);
        
        // Check specific error types and provide better error messages
        if (error.response) {
          const statusCode = error.response.status;
          if (statusCode === 404) {
            toast.error('Product not found');
          } else if (statusCode === 403) {
            toast.error('You do not have permission to view this product');
          } else {
            toast.error(`Error: ${error.response.data?.message || 'Failed to load product data'}`);
          }
        } else {
          toast.error('Network error. Please check your connection.');
        }
        
        navigate('/admin/products');
      } finally {
        setIsLoading(false);
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Generate all possible combinations from hierarchical attributes
  const generateHierarchicalVariants = (attributeGroups) => {
    const variants = [];

    attributeGroups.forEach(group => {
      const parentName = group.parentAttribute.name?.trim();
      
      // Skip if parent attribute has no name
      if (!parentName) return;
      
      // Process each parent value
      group.parentAttribute.values.forEach((parentValue, parentIndex) => {
        // Skip if parent value is empty
        if (!parentValue.trim()) return;

        // Find child attributes for this parent value
        const childAttrs = group.childAttributes.filter(
          child => child.parentValueIndex === parentIndex
        );

        // If no child attributes, add just the parent attribute as a variant
        if (childAttrs.length === 0) {
          variants.push([{
            parentName,
            parentValue: parentValue.trim(),
          }]);
          return;
        }

        // For each valid child attribute, create variants
        childAttrs.forEach(childAttr => {
          const childName = childAttr.name?.trim();
          if (!childName) return;

          childAttr.values.forEach(childValue => {
            if (!childValue.trim()) return;
            
            variants.push([{
              parentName,
              parentValue: parentValue.trim(),
              childName,
              childValue: childValue.trim()
            }]);
          });
        });
      });
    });

    return variants;
  };

  // Generate product variants from all attribute sources
  const generateVariantsFromFormData = (data) => {
    const hierarchicalVariants = generateHierarchicalVariants(data.attributeGroups || []);
    
    // Only generate legacy variants if there are valid attributes
    const validLegacyAttributes = (data.attributes || []).filter(attr =>
      attr.name?.trim() !== '' && attr.value?.trim() !== ''
    );

    let legacyVariants = [];
    if (validLegacyAttributes.length > 0) {
      // Group attributes by name (for legacy attributes)
      const attributesByName = {};
      validLegacyAttributes.forEach(attr => {
        if (!attributesByName[attr.name]) {
          attributesByName[attr.name] = [];
        }
        // Only add unique values
        if (!attributesByName[attr.name].includes(attr.value)) {
          attributesByName[attr.name].push(attr.value);
        }
      });

      // Generate all possible combinations of legacy attributes
      const generateLegacyCombinations = (attributes, index = 0, current = {}) => {
        const attributeNames = Object.keys(attributes);

        // Base case: we've processed all attribute types
        if (index >= attributeNames.length) {
          return [current];
        }

        const attributeName = attributeNames[index];
        const values = attributes[attributeName];
        let combinations = [];

        for (const value of values) {
          const newCurrent = { ...current, [attributeName]: value };
          combinations = [
            ...combinations,
            ...generateLegacyCombinations(attributes, index + 1, newCurrent)
          ];
        }

        return combinations;
      };

      // Generate all legacy variants
      legacyVariants = generateLegacyCombinations(attributesByName);
    }

    // Combine both types of variants, prioritizing hierarchical ones
    return [...hierarchicalVariants, ...legacyVariants];
  };

  // Generate a consistent key for a variant combination
  const generateVariantKey = (variant) => {
    // For old flat attribute system
    if (variant && typeof variant === 'object' && !Array.isArray(variant)) {
      return Object.entries(variant)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => `${key}:${value}`)
        .join('|');
    }
    
    // For hierarchical attribute system 
    if (Array.isArray(variant)) {
      return variant
        .sort((a, b) => {
          const parentNameA = a.parentName || '';
          const parentNameB = b.parentName || '';
          if (parentNameA !== parentNameB) return parentNameA.localeCompare(parentNameB);
          const childNameA = a.childName || '';
          const childNameB = b.childName || '';
          return childNameA.localeCompare(childNameB);
        })
        .map(attr => {
          if (attr.childName && attr.childValue) {
            return `${attr.parentName}:${attr.parentValue}:${attr.childName}:${attr.childValue}`;
          }
          return `${attr.parentName}:${attr.parentValue}`;
        })
        .join('||');
    }
    
    return '';
  };

  // Handle attribute group changes
  const handleParentAttributeChange = (groupIndex, field, value) => {
    const newAttributeGroups = [...formData.attributeGroups];
    
    if (field === 'name') {
      newAttributeGroups[groupIndex].parentAttribute.name = value;
    } else if (field === 'value') {
      // When changing a parent attribute value
      const valueIndex = parseInt(value.split('-')[1]);
      const actualValue = value.split('-')[0];
      
      // If we're adding a new value
      if (valueIndex >= newAttributeGroups[groupIndex].parentAttribute.values.length) {
        newAttributeGroups[groupIndex].parentAttribute.values.push('');
      } else {
        newAttributeGroups[groupIndex].parentAttribute.values[valueIndex] = actualValue;
      }
    } else if (field === 'addValue') {
      newAttributeGroups[groupIndex].parentAttribute.values.push('');
    } else if (field === 'removeValue') {
      const valueIndex = parseInt(value);
      newAttributeGroups[groupIndex].parentAttribute.values.splice(valueIndex, 1);
      
      // Also remove any child attributes that depended on this value
      newAttributeGroups[groupIndex].childAttributes = newAttributeGroups[groupIndex].childAttributes
        .filter(child => child.parentValueIndex !== valueIndex)
        .map(child => {
          // Update parent value indices for those that came after the removed one
          if (child.parentValueIndex > valueIndex) {
            return { ...child, parentValueIndex: child.parentValueIndex - 1 };
          }
          return child;
        });
    }

    setFormData(prev => ({
      ...prev,
      attributeGroups: newAttributeGroups
    }));
  };

  // Handle child attribute changes
  const handleChildAttributeChange = (groupIndex, childIndex, field, value) => {
    const newAttributeGroups = [...formData.attributeGroups];
    const childAttribute = newAttributeGroups[groupIndex].childAttributes[childIndex];
    
    if (field === 'name') {
      childAttribute.name = value;
    } else if (field === 'values') {
      childAttribute.values = value.split(',').map(v => v.trim());
    } else if (field === 'parentValueIndex') {
      childAttribute.parentValueIndex = parseInt(value);
    }
    
    setFormData(prev => ({
      ...prev,
      attributeGroups: newAttributeGroups
    }));
  };

  // Add a new attribute group
  const addAttributeGroup = () => {
    setFormData(prev => ({
      ...prev,
      attributeGroups: [
        ...prev.attributeGroups,
        {
          parentAttribute: { name: '', values: [''] },
          childAttributes: []
        }
      ]
    }));
  };

  // Remove an attribute group
  const removeAttributeGroup = (groupIndex) => {
    setFormData(prev => ({
      ...prev,
      attributeGroups: prev.attributeGroups.filter((_, index) => index !== groupIndex)
    }));
  };

  // Add a child attribute to a group
  const addChildAttribute = (groupIndex, parentValueIndex) => {
    const newAttributeGroups = [...formData.attributeGroups];
    newAttributeGroups[groupIndex].childAttributes.push({
      name: '',
      values: [],
      parentValueIndex
    });
    
    setFormData(prev => ({
      ...prev,
      attributeGroups: newAttributeGroups
    }));
  };

  // Remove a child attribute
  const removeChildAttribute = (groupIndex, childIndex) => {
    const newAttributeGroups = [...formData.attributeGroups];
    newAttributeGroups[groupIndex].childAttributes.splice(childIndex, 1);
    
    setFormData(prev => ({
      ...prev,
      attributeGroups: newAttributeGroups
    }));
  };

  // Update variants when attributes change
  useEffect(() => {
    const allVariants = generateVariantsFromFormData(formData);
    setGeneratedVariants(allVariants);

    // Initialize attribute image storage for all combinations
    const newAttributeImages = { ...attributeImages };
    allVariants.forEach(variant => {
      const variantKey = generateVariantKey(variant);
      if (!newAttributeImages[variantKey]) {
        newAttributeImages[variantKey] = [];
      }
    });
    
    setAttributeImages(newAttributeImages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.attributes, formData.attributeGroups]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle nested object changes (like dimensions)
  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  // Handle attribute changes
  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index][field] = value;
    setFormData(prev => ({ ...prev, attributes: newAttributes }));
  };

  // Add more attribute fields
  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { name: '', value: '' }]
    }));
  };

  // Remove attribute field
  const removeAttribute = (index) => {
    const newAttributes = [...formData.attributes];
    newAttributes.splice(index, 1);
    setFormData(prev => ({ ...prev, attributes: newAttributes }));
  };

  // Handle media selection for general product images
  const handleMediaSelect = (selectedMedia) => {
    if (!selectedVariantForImages) {
      setProductImages(selectedMedia);
    } else {
      // Handle variant-specific images
      const variantKey = generateVariantKey(selectedVariantForImages);
      setAttributeImages(prev => ({
        ...prev,
        [variantKey]: selectedMedia
      }));
    }
  };

  // Handle package document selection
  const handlePackageDocumentSelect = (selectedDocument) => {
    setFormData(prev => ({
      ...prev,
      packageDocument: selectedDocument
    }));
  };

  // Handle selection of a variant for image assignment
  const handleSelectVariantForImages = (variant) => {
    setSelectedVariantForImages(variant === selectedVariantForImages ? null : variant);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveProduct(false);
  };

  // Save product as draft or publish
  const saveProduct = async (saveAsDraft = false) => {
    try {
      setIsSaving(true);
      
      // Generate slug from product name
      const generateSlug = (name) => {
        return name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') 
          .replace(/\s+/g, '-') 
          .replace(/-+/g, '-') 
          .trim(); 
      };
      
      // Prepare the product data with general and variant-specific images
      const productData = {
        ...formData,
        slug: generateSlug(formData.name),
        images: productImages.map(img => img.url),
        packageDocument: formData.packageDocument ? formData.packageDocument.url : null,
        hasVariantImages,
        variants: hasVariantImages ? generatedVariants.map(variant => {
          const variantKey = generateVariantKey(variant);
          return {
            attributes: variant,
            images: (attributeImages[variantKey] || []).map(img => img.url)
          };
        }) : [],
        status: saveAsDraft ? 'draft' : formData.status
      };

      // Only include vendor if it's not empty
      if (formData.vendor && formData.vendor !== '') {
        productData.vendor = formData.vendor;
      }

      // Update the product
      await api.put(`/products/${id}`, productData);
      
      if (saveAsDraft) {
        setDraftSaved(true);
        setIsDraft(true);
        toast.success('Draft saved successfully');
      } else {
        toast.success('Product updated successfully');
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || `Failed to ${saveAsDraft ? 'save draft' : 'update product'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for Save as Draft button
  const handleSaveAsDraft = async (e) => {
    e.preventDefault(); // Prevent default form submission
    await saveProduct(true);
  };

  // Tabs configuration - reordered for better UX flow
  const tabs = [
    { id: 'basic', name: 'Basic Information' },
    { id: 'images', name: 'Images' },
    { id: 'pricing', name: 'Pricing & Inventory' },
    { id: 'attributes', name: 'Attributes' },
    { id: 'shipping', name: 'Shipping' },
    { id: 'related', name: 'Related Products' },
    { id: 'meta', name: 'Meta & SEO' },
    { id: 'additional', name: 'Additional Info' }
  ];

  // Render appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            {isLoading ? (
              <>
                {/* Product Name Skeleton */}
                <div>
                  <div className="h-5 w-32 bg-admin-slate-200 dark:bg-admin-slate-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-10 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                </div>
                
                {/* Brand Selection Skeleton */}
                <div>
                  <div className="h-5 w-24 bg-admin-slate-200 dark:bg-admin-slate-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-10 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                </div>
                
                {/* Categories Selection Skeleton */}
                <div>
                  <div className="h-5 w-28 bg-admin-slate-200 dark:bg-admin-slate-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-10 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                  <div className="h-4 w-56 bg-admin-slate-200 dark:bg-admin-slate-700 rounded mt-2 animate-pulse"></div>
                </div>
                
                {/* Description Skeleton */}
                <div>
                  <div className="h-5 w-40 bg-admin-slate-200 dark:bg-admin-slate-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-32 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                </div>
                
                {/* Packaging Description Skeleton */}
                <div>
                  <div className="h-5 w-48 bg-admin-slate-200 dark:bg-admin-slate-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-24 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                </div>
              </>
            ) : (
              // Actual content when loaded
              <>
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                    placeholder="Enter product name"
                  />
                </div>

                {/* Brand Selection */}
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                      className="w-full appearance-none rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-4 pr-10 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
                    >
                      <option value="">Select Brand</option>
                      {brands.map(brand => (
                        <option key={brand._id} value={brand._id}>{brand.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a 1 1 0 01-1.414 0l-4-4a 1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Categories Selection */}
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                    Categories <span className="text-red-500">*</span>
                  </label>
                  
                  <CategoryDropdown 
                    selectedCategories={formData.categories}
                    onCategoriesChange={(categories) => setFormData(prev => ({...prev, categories}))}
                    preloadedCategories={categories}
                    preloadedHierarchicalCategories={hierarchicalCategories}
                    required={true}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                    Product Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors resize-none"
                    placeholder="Enter detailed product description"
                  />
                </div>

                {/* Packaging Description */}
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                    Packaging Description
                  </label>
                  <textarea
                    name="packagingDescription"
                    value={formData.packagingDescription}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors resize-none"
                    placeholder="Describe product packaging"
                  />
                </div>

                {/* Package Document */}
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                    Package Document (Optional)
                  </label>
                  <p className="text-xs text-admin-slate-500 dark:text-admin-slate-400 mb-3">
                    Upload Excel or Word documents related to the product package
                  </p>
                  
                  <div className="space-y-3">
                    {formData.packageDocument && (
                      <div className="flex items-center justify-between p-3 bg-admin-slate-50 dark:bg-admin-slate-800 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">
                              {formData.packageDocument.name}
                            </p>
                            <p className="text-xs text-admin-slate-500 dark:text-admin-slate-400">
                              {new Date(formData.packageDocument.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, packageDocument: null }))}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    <DocumentUploadButton
                      onSelect={handlePackageDocumentSelect}
                      selectedDocument={formData.packageDocument}
                      className="w-full justify-center"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'meta':
        return (
          <div className="space-y-6">
            {/* Meta Title */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Meta Title
              </label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                placeholder="Enter SEO meta title"
              />
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors resize-none"
                placeholder="Enter SEO meta description"
              />
            </div>

            {/* Meta Tags */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Meta Tags / Keywords
              </label>
              <input
                type="text"
                name="metaTags"
                value={formData.metaTags}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                placeholder="Enter comma-separated meta tags"
              />
              <p className="mt-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">Separate tags with commas (e.g., medical, dental, equipment)</p>
            </div>

            {/* Search Tags */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Search Tags / Keywords
              </label>
              <input
                type="text"
                name="searchTags"
                value={formData.searchTags}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                placeholder="Enter search tags"
              />
              <p className="mt-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">Tags to help users find this product</p>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            {/* Regular Price */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Regular Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-admin-slate-500 dark:text-admin-slate-400">
                  Rs.
                </span>
                <input
                  type="number"
                  name="regularPrice"
                  min="0"
                  step="0.01"
                  value={formData.regularPrice}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-8 px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Special Offer Price */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Special Offer Price
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-admin-slate-500 dark:text-admin-slate-400">
                  Rs.
                </span>
                <input
                  type="number"
                  name="specialOfferPrice"
                  min="0"
                  step="0.01"
                  value={formData.specialOfferPrice}
                  onChange={handleInputChange}
                  className="w-full pl-8 px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Discount Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                  Discount Type
                </label>
                <div className="relative">
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="w-full appearance-none rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-4 pr-10 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="amount">Fixed Amount (Rs.)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                  Discount Value
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-admin-slate-500 dark:text-admin-slate-400">
                    {formData.discountType === 'percentage' ? '%' : 'Rs.'}
                  </span>
                  <input
                    type="number"
                    name="discountValue"
                    min="0"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    className="w-full pl-8 px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Minimum Purchase Quantity */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Minimum Purchase Quantity
              </label>
              <input
                type="number"
                name="minPurchaseQuantity"
                min="1"
                value={formData.minPurchaseQuantity}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                placeholder="1"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Stock Quantity (Optional)
              </label>
              <input
                type="number"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                placeholder="Enter stock quantity"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                SKU (Optional)
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                placeholder="Enter unique SKU"
              />
            </div>
          </div>
        );
      
      case 'images':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100 mb-4">
                General Product Images
              </h3>
              <p className="mt-1 mb-4 text-sm text-admin-slate-500 dark:text-admin-slate-400">
                These images will be shown as the main product images
              </p>
              
              <div className="mt-2 flex items-center">
                <div className="flex flex-wrap gap-4">
                  {productImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Product ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-lg border border-admin-slate-200 dark:border-admin-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...productImages];
                          newImages.splice(index, 1);
                          setProductImages(newImages);
                        }}
                        className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <MediaUploadButton 
                  onSelect={handleMediaSelect} 
                  selectedMedia={productImages} 
                  maxSelect={10}
                />
              </div>

              {/* Variant-specific images section */}
              {hasVariantImages && generatedVariants.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">
                    Variant-specific Images
                  </h3>
                  <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">
                    Select a variant to manage its specific images
                  </p>

                  <div className="mt-4 space-y-4">
                    {generatedVariants.map((variant, idx) => {
                      const variantKey = generateVariantKey(variant);
                      const variantImages = attributeImages[variantKey] || [];
                      
                      return (
                        <div 
                          key={idx}
                          className={`p-4 rounded-lg border ${
                            selectedVariantForImages === variant
                              ? 'border-admin-ucla-500 bg-admin-ucla-50 dark:bg-admin-ucla-900/20'
                              : 'border-admin-slate-200 dark:border-admin-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">
                                {Array.isArray(variant)
                                  ? variant.map(attr => 
                                      attr.childName 
                                        ? `${attr.parentName}: ${attr.parentValue} / ${attr.childName}: ${attr.childValue}`
                                        : `${attr.parentName}: ${attr.parentValue}`
                                    ).join(', ')
                                  : Object.entries(variant)
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(', ')
                                }
                              </h4>
                              <p className="mt-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">
                                {variantImages.length} image(s)
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSelectVariantForImages(variant)}
                              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                selectedVariantForImages === variant
                                  ? 'bg-admin-ucla-600 text-white'
                                  : 'bg-white dark:bg-admin-slate-800 text-admin-slate-700 dark:text-admin-slate-300 border border-admin-slate-300 dark:border-admin-slate-600'
                              }`}
                            >
                              {selectedVariantForImages === variant ? 'Managing' : 'Manage Images'}
                            </button>
                          </div>

                          {/* Show variant images if selected */}
                          {selectedVariantForImages === variant && (
                            <div className="mt-4">
                              <div className="flex flex-wrap gap-4">
                                {variantImages.map((image, imgIdx) => (
                                  <div key={imgIdx} className="relative group">
                                    <img
                                      src={image.url}
                                      alt={`Variant ${idx + 1} - ${imgIdx + 1}`}
                                      className="h-24 w-24 object-cover rounded-lg border border-admin-slate-200 dark:border-admin-slate-700"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newImages = [...variantImages];
                                        newImages.splice(imgIdx, 1);
                                        setAttributeImages(prev => ({
                                          ...prev,
                                          [variantKey]: newImages
                                        }));
                                      }}
                                      className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="mt-4">
                                <MediaUploadButton 
                                  onSelect={handleMediaSelect} 
                                  selectedMedia={variantImages} 
                                  maxSelect={5}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Toggle for variant-specific images */}
              <div className="mt-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasVariantImages"
                    checked={hasVariantImages}
                    onChange={(e) => setHasVariantImages(e.target.checked)}
                    className="h-4 w-4 rounded border-admin-slate-300 dark:border-admin-slate-600 text-admin-ucla-600 focus:ring-admin-ucla-500"
                  />
                  <label htmlFor="hasVariantImages" className="ml-2 text-sm text-admin-slate-700 dark:text-admin-slate-300">
                    Enable variant-specific images
                  </label>
                </div>
                <p className="mt-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">
                  Allow different images for each variant combination
                </p>
              </div>

              {/* Image Upload Instructions */}
              <div className="mt-8 p-4 border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg bg-admin-slate-50 dark:bg-admin-slate-800/50">
                <h4 className="text-md font-medium text-admin-slate-900 dark:text-admin-slate-100">
                  How to Upload Product Images
                </h4>
                
                <div className="mt-4 space-y-4">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-md bg-admin-ucla-100 dark:bg-admin-ucla-900/30 text-admin-ucla-600 dark:text-admin-ucla-400">
                      <span className="font-medium dark:text-admin-slate-300">1</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-admin-slate-700 dark:text-admin-slate-300">
                        <strong>General Product Images:</strong> Click the "Select Media" button below the general images section to upload main product images. These will be displayed as the primary product images.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-md bg-admin-ucla-100 dark:bg-admin-ucla-900/30 text-admin-ucla-600 dark:text-admin-ucla-400">
                      <span className="font-medium dark:text-admin-slate-300">2</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-admin-slate-700 dark:text-admin-slate-300">
                        <strong>Variant-specific Images:</strong> First enable variant-specific images using the checkbox, then click on the "Manage Images" button next to any variant combination and use the "Select Media" button to upload images for that specific variant.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-md bg-admin-ucla-100 dark:bg-admin-ucla-900/30 text-admin-ucla-600 dark:text-admin-ucla-400">
                      <span className="font-medium dark:text-admin-slate-300">3</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-admin-slate-700 dark:text-admin-slate-300">
                        <strong>Recommended Image Sizes:</strong> For best results, upload images with a 1:1 aspect ratio and minimum dimensions of 800x800 pixels. Supported formats: JPG, PNG, WebP.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'attributes':
        return (
          <div className="space-y-8">
            {/* Global Attributes Section */}
            {globalAttributes.length > 0 && (
              <div className="mb-8 bg-admin-slate-50 dark:bg-admin-slate-800/50 p-4 rounded-lg border border-admin-ucla-100 dark:border-admin-ucla-900/30">
                <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100 mb-3">
                  Pre-defined Attributes
                </h3>
                <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400 mb-4">
                  Select from globally defined attributes to quickly add them to this product
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {globalAttributes.map(attr => (
                    <div 
                      key={attr._id}
                      className="p-3 bg-white dark:bg-admin-slate-800 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 hover:border-admin-ucla-300 dark:hover:border-admin-ucla-500 cursor-pointer transition-colors"
                      onClick={() => {
                        // Check if any attribute with this name already exists
                        const attributeExists = formData.attributes.some(
                          existing => existing.name.toLowerCase() === attr.name.toLowerCase()
                        );

                        if (!attributeExists && attr.values?.length > 0) {
                          // Add all values as separate attributes
                          const newAttributes = [
                            ...formData.attributes,
                            ...attr.values.map(value => ({ name: attr.name, value }))
                          ];
                          
                          // Remove empty default attribute if it's the only one
                          if (newAttributes.length > 1 && 
                              newAttributes[0].name === '' && 
                              newAttributes[0].value === '' &&
                              formData.attributes.length === 1) {
                            newAttributes.shift();
                          }
                          
                          setFormData(prev => ({
                            ...prev,
                            attributes: newAttributes
                          }));
                          
                          toast.success(`Added "${attr.name}" attribute with ${attr.values.length} values`);
                        } else if (attributeExists) {
                          toast.error(`Attribute "${attr.name}" already exists in this product`);
                        } else {
                          toast.error(`Attribute "${attr.name}" has no values defined`);
                        }
                      }}
                    >
                      <div className="font-medium text-admin-slate-800 dark:text-admin-slate-200">
                        {attr.name}
                      </div>
                      {attr.values?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {attr.values.map((value, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-admin-ucla-100 dark:bg-admin-ucla-900/30 text-admin-ucla-800 dark:text-admin-ucla-300"
                            >
                              {value}
                            </span>
                          ))}
                        </div>
                      )}
                      {attr.description && (
                        <p className="mt-2 text-xs text-admin-slate-500 dark:text-admin-slate-400">
                          {attr.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hierarchical Attributes */}
            <div>
              <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100 mb-4">
                Hierarchical Attributes
              </h3>
              <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400 mb-4">
                Create parent attributes (like Size) with multiple values (2mm, 3mm), then add child attributes (like Color) that are specific to each parent value.
              </p>
              
              {formData.attributeGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-8 border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg p-4 bg-white dark:bg-admin-slate-800/50">
                  {/* Parent Attribute */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
                        Parent Attribute
                      </label>
                      {groupIndex > 0 && (
                        <button 
                          type="button" 
                          onClick={() => removeAttributeGroup(groupIndex)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="mb-3">
                      <div className="flex gap-2">
                        <div className="grow">
                          <input
                            type="text"
                            value={group.parentAttribute.name}
                            onChange={(e) => handleParentAttributeChange(groupIndex, 'name', e.target.value)}
                            placeholder="Name (e.g., Size)"
                            className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                          />
                        </div>
                        {globalAttributes.length > 0 && (
                          <div>
                            <select
                              className="px-3 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                              value=""
                              onChange={(e) => {
                                if (!e.target.value) return;
                                
                                const selectedAttr = globalAttributes.find(attr => attr._id === e.target.value);
                                if (selectedAttr) {
                                  const newAttributeGroups = [...formData.attributeGroups];
                                  newAttributeGroups[groupIndex].parentAttribute = {
                                    name: selectedAttr.name,
                                    values: [...selectedAttr.values]
                                  };
                                  
                                  setFormData(prev => ({
                                    ...prev,
                                    attributeGroups: newAttributeGroups
                                  }));
                                  
                                  toast.success(`Added "${selectedAttr.name}" as parent attribute`);
                                }
                                
                                // Reset the select
                                e.target.value = "";
                              }}
                            >
                              <option value="">Use global attribute...</option>
                              {globalAttributes.map(attr => (
                                <option key={attr._id} value={attr._id}>
                                  {attr.name} ({attr.values?.length || 0} values)
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Parent Values */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
                        Parent Values
                      </label>
                      {group.parentAttribute.values.map((value, valueIndex) => (
                        <div key={valueIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleParentAttributeChange(groupIndex, 'value', `${e.target.value}-${valueIndex}`)}
                            placeholder={`Value ${valueIndex + 1} (e.g., ${valueIndex === 0 ? '2mm' : valueIndex === 1 ? '3mm' : '4mm'})`}
                            className="flex-grow px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                          />
                          {valueIndex > 0 && (
                            <button 
                              type="button" 
                              onClick={() => handleParentAttributeChange(groupIndex, 'removeValue', valueIndex)}
                              className="p-2 text-red-500 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        type="button" 
                        onClick={() => handleParentAttributeChange(groupIndex, 'addValue')}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-admin-slate-700 dark:text-admin-slate-300 border border-admin-slate-300 dark:border-admin-slate-600 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Value
                      </button>
                    </div>
                  </div>

                  {/* Child Attributes */}
                  {group.parentAttribute.values.map((parentValue, parentValueIndex) => (
                    <div key={parentValueIndex} className="mt-4 pl-6 border-l-2 border-admin-slate-200 dark:border-admin-slate-700">
                      <div className="mb-2">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
                            Child attributes for "{parentValue || `Value ${parentValueIndex + 1}`}"
                          </span>
                          <button 
                            type="button" 
                            onClick={() => addChildAttribute(groupIndex, parentValueIndex)}
                            className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-admin-slate-700 dark:text-admin-slate-300 border border-admin-slate-300 dark:border-admin-slate-600 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Child Attribute
                          </button>
                        </div>
                      </div>
                      
                      {group.childAttributes
                        .filter(child => child.parentValueIndex === parentValueIndex)
                        .map((childAttr, childIndex) => {
                          const actualChildIndex = group.childAttributes.findIndex(
                            a => a.parentValueIndex === parentValueIndex && a.name === childAttr.name
                          );
                          return (
                            <div key={childIndex} className="mb-3 p-3 bg-admin-slate-50 dark:bg-admin-slate-800 rounded border border-admin-slate-200 dark:border-admin-slate-700">
                              <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
                                  Child Name
                                </label>
                                <button 
                                  type="button" 
                                  onClick={() => removeChildAttribute(groupIndex, actualChildIndex)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <div className="grow">
                                  <input
                                    type="text"
                                    value={childAttr.name}
                                    onChange={(e) => handleChildAttributeChange(groupIndex, actualChildIndex, 'name', e.target.value)}
                                    placeholder="Child name (e.g., Color)"
                                    className="w-full mb-2 px-4 py-2 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                                  />
                                </div>
                                {globalAttributes.length > 0 && (
                                  <div>
                                    <select
                                      className="mb-2 px-3 py-2 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                                      value=""
                                      onChange={(e) => {
                                        if (!e.target.value) return;
                                        
                                        const selectedAttr = globalAttributes.find(attr => attr._id === e.target.value);
                                        if (selectedAttr) {
                                          handleChildAttributeChange(
                                            groupIndex,
                                            actualChildIndex,
                                            'name',
                                            selectedAttr.name
                                          );
                                          handleChildAttributeChange(
                                            groupIndex,
                                            actualChildIndex,
                                            'values',
                                            selectedAttr.values.join(', ')
                                          );
                                          
                                          toast.success(`Added "${selectedAttr.name}" as child attribute`);
                                        }
                                        
                                        // Reset the select
                                        e.target.value = "";
                                      }}
                                    >
                                      <option value="">Use global attribute...</option>
                                      {globalAttributes.map(attr => (
                                        <option key={attr._id} value={attr._id}>
                                          {attr.name} ({attr.values?.length || 0} values)
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1">
                                Values (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={childAttr.values.join(', ')}
                                onChange={(e) => handleChildAttributeChange(groupIndex, actualChildIndex, 'values', e.target.value)}
                                placeholder="Values (e.g., Red, Green, Blue)"
                                className="w-full px-4 py-2 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                              />
                            </div>
                          );
                        })}
                        
                      {group.childAttributes.filter(child => child.parentValueIndex === parentValueIndex).length === 0 && (
                        <div className="text-sm text-admin-slate-500 dark:text-admin-slate-400 italic">
                          No child attributes yet
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              
              <div className="mt-4">
                <button
                  type="button"
                  onClick={addAttributeGroup}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-admin-slate-700 dark:text-admin-slate-200 border border-admin-slate-300 dark:border-admin-slate-600 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700 focus:outline-none focus:ring-2 focus:ring-admin-ucla-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Attribute Group
                </button>
              </div>
            </div>

            {/* Simple Attributes */}
            <div className="mt-8 pt-6 border-t border-admin-slate-200 dark:border-admin-slate-700">
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Simple Attributes (Legacy)
              </label>
              <p className="text-xs text-admin-slate-500 dark:text-admin-slate-400 mb-3">
                For backward compatibility. Use hierarchical attributes above for dependent attribute values.
              </p>

              {formData.attributes.map((attribute, index) => (
                <div key={index} className="flex gap-4 items-center mt-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={attribute.name}
                      onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                      placeholder="Attribute name (e.g., Color)"
                      className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={attribute.value}
                      onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                      placeholder="Value (e.g., Red)"
                      className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="p-2 text-admin-slate-400 hover:text-admin-slate-600 dark:text-admin-slate-500 dark:hover:text-admin-slate-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}

              <div className="mt-4">
                <button
                  type="button"
                  onClick={addAttribute}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-admin-slate-700 dark:text-admin-slate-200 border border-admin-slate-300 dark:border-admin-slate-600 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700 focus:outline-none focus:ring-2 focus:ring-admin-ucla-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Simple Attribute
                </button>
              </div>
            </div>

            {/* Product Status and Vendor */}
            <div className="pt-6 mt-6 border-t border-admin-slate-200 dark:border-admin-slate-700">
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Product Status
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full appearance-none rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-4 pr-10 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Choose Vendor (Optional)
              </label>
              <div className="relative">
                <select
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleInputChange}
                  className="w-full appearance-none rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-4 pr-10 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
                >
                  <option value="">Admin (Default)</option>
                  {vendors.map(vendor => (
                    <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-6">
            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Weight (in grams) (Optional)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                placeholder="Enter weight in grams"
              />
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Dimensions (Optional)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    value={formData.dimensions.length}
                    onChange={(e) => handleNestedChange('dimensions', 'length', e.target.value)}
                    placeholder="Length"
                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.dimensions.width}
                    onChange={(e) => handleNestedChange('dimensions', 'width', e.target.value)}
                    placeholder="Width"
                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.dimensions.height}
                    onChange={(e) => handleNestedChange('dimensions', 'height', e.target.value)}
                    placeholder="Height"
                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">
                Enter dimensions in centimeters (length × width × height)
              </p>
            </div>

            {/* Estimated Delivery Time */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Estimated Delivery Time (Optional)
              </label>
              <input
                type="text"
                name="estimatedDeliveryTime"
                value={formData.estimatedDeliveryTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                placeholder="e.g., 2-3 business days"
              />
            </div>
          </div>
        );

      case 'related':
        return (
          <div className="space-y-6">
            {/* Cross-sell Products */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Cross-sell Products (Optional)
              </label>
              <select
                multiple
                value={formData.crossSellProducts}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({
                    ...prev,
                    crossSellProducts: values
                  }));
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
              >
                {/* Products would be populated here */}
              </select>
              <p className="mt-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">
                Select products to cross-sell with this item
              </p>
            </div>

            {/* Up-sell Products */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Up-sell Products (Optional)
              </label>
              <select
                multiple
                value={formData.upSellProducts}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({
                    ...prev,
                    upSellProducts: values
                  }));
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
              >
                {/* Products would be populated here */}
              </select>
              <p className="mt-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">
                Select premium alternatives to this product
              </p>
            </div>
          </div>
        );

      case 'additional':
        return (
          <div className="space-y-6">
            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
              />
            </div>

            {/* Video Link */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Product Video Link (Optional)
              </label>
              <input
                type="url"
                name="videoLink"
                value={formData.videoLink}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                placeholder="Enter YouTube or Vimeo URL"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Additional Notes (Optional)
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors resize-none"
                placeholder="Enter any additional information about the product"
              />
            </div>

            {/* Vendor Selection */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Vendor (Optional)
              </label>
              <select
                name="vendor"
                value={formData.vendor}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
              >
                <option value="">Admin (Default)</option>
                {vendors.map(vendor => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">Edit Product</h1>
          <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
            Update product details and manage its attributes, images, and more
            {draftSaved && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-800 dark:text-admin-slate-300">
                <svg className="mr-1.5 h-2 w-2 text-admin-slate-400 dark:text-admin-slate-500" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                Draft saved
              </span>
            )}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to="/admin/products"
            className="inline-flex items-center px-4 py-2 border border-admin-slate-300 dark:border-admin-slate-600 rounded-md shadow-sm text-sm font-medium text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSaveAsDraft}
            className="inline-flex items-center px-4 py-2 border border-admin-slate-300 dark:border-admin-slate-600 rounded-md shadow-sm text-sm font-medium text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            form="product-form"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-admin-ucla-500 hover:bg-admin-ucla-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500"
          >
            {isDraft ? 'Publish Product' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Draft Status Banner - show when in draft mode */}
      {draftSaved && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 dark:text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 8a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700 dark:text-blue-200">
                This product is saved as a draft. Click "Publish Product" when you're ready to make it active.
              </p>
              <p className="mt-3 text-sm md:mt-0 md:ml-6">
                <button onClick={() => setActiveTab('attributes')} className="whitespace-nowrap font-medium text-blue-700 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
                  Complete details
                  <span aria-hidden="true"> &rarr;</span>
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-admin-slate-200 dark:border-admin-slate-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-admin-ucla-500 text-admin-ucla-600 dark:text-admin-ucla-400'
                    : 'border-transparent text-admin-slate-500 dark:text-admin-slate-400 hover:text-admin-slate-700 dark:hover:text-admin-slate-300 hover:border-admin-slate-300 dark:hover:border-admin-slate-600'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Form */}
      <form id="product-form" className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg p-6" onSubmit={handleSubmit}>
        {renderTabContent()}
      </form>
    </div>
  );
};

export default EditProductPage;