import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import MediaUploadButton from '../../components/ui/MediaUploadButton';
import DocumentUploadButton from '../../components/ui/DocumentUploadButton';
import CategoryDropdown from '../../components/ui/CategoryDropdown';

const CreateProductPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraft, setIsDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [globalAttributes, setGlobalAttributes] = useState([]);

  // New state for attribute-specific images
  const [hasVariantImages, setHasVariantImages] = useState(false);
  const [attributeImages, setAttributeImages] = useState({});
  const [selectedVariantForImages, setSelectedVariantForImages] = useState(null);
  const [generatedVariants, setGeneratedVariants] = useState([]);

  // Form data state
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

  // Get all ancestor categories for a given category
  const getAncestorCategories = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    if (!category) return [];
    
    // If category has ancestors array, return those IDs
    if (category.ancestors && Array.isArray(category.ancestors)) {
      return category.ancestors.map(ancestor => typeof ancestor === 'object' ? ancestor._id : ancestor);
    }
    
    // If category has parentId but no ancestors array
    if (category.parentId) {
      const parentId = typeof category.parentId === 'object' ? category.parentId._id : category.parentId;
      const ancestors = [parentId];
      let currentParent = categories.find(cat => cat._id === parentId);
      
      // Traverse up the tree to find all ancestors
      while (currentParent && currentParent.parentId) {
        const currentParentId = typeof currentParent.parentId === 'object' 
          ? currentParent.parentId._id 
          : currentParent.parentId;
          
        ancestors.push(currentParentId);
        currentParent = categories.find(cat => cat._id === currentParentId);
      }
      
      return ancestors;
    }
    
    return [];
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
        newAttributeGroups[groupIndex].parentAttribute.values.push(actualValue);
      } else {
        newAttributeGroups[groupIndex].parentAttribute.values[valueIndex] = actualValue;
      }
    } else if (field === 'addValue') {
      newAttributeGroups[groupIndex].parentAttribute.values.push('');
    } else if (field === 'removeValue') {
      const valueIndex = parseInt(value);
      // Remove the value and also any child attributes associated with it
      newAttributeGroups[groupIndex].parentAttribute.values.splice(valueIndex, 1);
      
      // Remove associated child attributes
      newAttributeGroups[groupIndex].childAttributes = newAttributeGroups[groupIndex].childAttributes.filter(
        child => child.parentValueIndex !== valueIndex
      );
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

  // Generate all possible combinations from hierarchical attributes
  const generateHierarchicalVariants = () => {
    const variants = [];

    formData.attributeGroups.forEach(group => {
      const parentName = group.parentAttribute.name.trim();
      
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
            childName: null,
            childValue: null
          }]);
          return;
        }

        // For each valid child attribute, create variants
        childAttrs.forEach(childAttr => {
          const childName = childAttr.name.trim();
          if (!childName) return;

          // For each value of the child attribute
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
  useEffect(() => {
    const hierarchicalVariants = generateHierarchicalVariants();
    
    // Only generate legacy variants if there are valid attributes
    const validLegacyAttributes = formData.attributes.filter(attr =>
      attr.name.trim() !== '' && attr.value.trim() !== ''
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
          const newCombination = { ...current, [attributeName]: value };
          const nextCombinations = generateLegacyCombinations(attributes, index + 1, newCombination);
          combinations = [...combinations, ...nextCombinations];
        }

        return combinations;
      };

      // Generate all legacy variants
      legacyVariants = generateLegacyCombinations(attributesByName);
    }

    // Combine both types of variants, prioritizing hierarchical ones
    const allVariants = [...hierarchicalVariants, ...legacyVariants];
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
  }, [formData.attributes, formData.attributeGroups]);

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
          if (parentNameA !== parentNameB) {
            return parentNameA.localeCompare(parentNameB);
          }
          const childNameA = a.childName || '';
          const childNameB = b.childName || '';
          return childNameA.localeCompare(childNameB);
        })
        .map(attr => {
          if (attr.childName && attr.childValue) {
            return `${attr.parentName}:${attr.parentValue}|${attr.childName}:${attr.childValue}`;
          }
          return `${attr.parentName}:${attr.parentValue}`;
        })
        .join('||');
    }
    
    return '';
  };

  // Organize categories into a hierarchical structure
  const organizeCategoriesHierarchically = (categoriesArray) => {
    // Clone the categories to avoid mutating the original
    const categoriesMap = new Map();
    const rootCategories = [];
    
    // First create a map of all categories by ID
    categoriesArray.forEach(category => {
      // Ensure children property exists
      categoriesMap.set(category._id, { ...category, children: [] });
    });
    
    // Then build the hierarchy
    categoriesArray.forEach(category => {
      const categoryWithChildren = categoriesMap.get(category._id);
      
      // Check if this is a root category (no parent)
      if (!category.parentId) {
        rootCategories.push(categoryWithChildren);
      } else {
        // Get the parent ID (handle both object and string types)
        const parentId = typeof category.parentId === 'object' 
          ? category.parentId._id 
          : category.parentId;
          
        // Add this category as a child of its parent
        const parentCategory = categoriesMap.get(parentId);
        if (parentCategory) {
          // Sort children by name for consistent ordering
          parentCategory.children.push(categoryWithChildren);
          parentCategory.children.sort((a, b) => a.name.localeCompare(b.name));
        } else {
          // If parent isn't found, treat this as a root category
          console.warn(`Parent category ${parentId} not found for ${category.name}, treating as root`);
          rootCategories.push(categoryWithChildren);
        }
      }
    });
    
    // Sort root categories by name
    rootCategories.sort((a, b) => a.name.localeCompare(b.name));
    
    return rootCategories;
  };

  // Fetch necessary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch brands
        const brandsResponse = await api.get('/brands', { params: { status: 'active' } });
        setBrands(brandsResponse.data.data || []);

        // Fetch categories using the admin endpoint
        const categoriesResponse = await api.get('/categories/admin/list', { 
          params: { 
            status: 'active',
            format: 'flat' // Request flat format for processing
          } 
        });
        
        // Process categories to create a lookup for parent-child relationships
        const categoriesData = categoriesResponse.data.data || [];
        console.log('Categories from API:', categoriesData);
        setCategories(categoriesData);
        
        // Create hierarchical structure for categories display
        const organizedCategories = organizeCategoriesHierarchically(categoriesData);
        console.log('Organized hierarchical categories:', organizedCategories);
        setHierarchicalCategories(organizedCategories);

        // Fetch vendors
        const vendorsResponse = await api.get('/vendors', { params: { status: 'active' } });
        setVendors(vendorsResponse.data.data || []);

        // Fetch global attributes - keep the admin endpoint
        const attributesResponse = await api.get('/admin/settings/attributes');
        setGlobalAttributes(attributesResponse.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this effect runs only once on mount

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

  // Handle form submission with attribute-specific images
  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveProduct(false);
  };

  // New function to save product as draft or publish
  const saveProduct = async (saveAsDraft = false) => {
    try {
      setLoading(true);
      
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

      let response;
      if (draftId) {
        // Update existing draft - using standard product endpoint
        response = await api.put(`/products/${draftId}`, productData);
        toast.success(saveAsDraft ? 'Draft updated successfully' : 'Product published successfully');
      } else {
        // Create new product - using standard product endpoint
        response = await api.post('/products', productData);
        setDraftId(response.data.data._id);
        toast.success(saveAsDraft ? 'Draft saved successfully' : 'Product created successfully');
      }

      if (saveAsDraft) {
        setDraftSaved(true);
        setIsDraft(true);
      } else {
        // Only navigate away if we're publishing (not saving as draft)
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || `Failed to ${saveAsDraft ? 'save draft' : 'create product'}`);
    } finally {
      setLoading(false);
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
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Category Selection using the CategoryDropdown component */}
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

            {/* Product Description */}
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

            {/* Meta Tags / Keywords */}
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

            {/* Search Tags / Keywords */}
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

            {/* Discount Type & Value */}
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

            {/* Stock Quantity / Inventory */}
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

            {/* SKU (Stock Keeping Unit) */}
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
            {/* Toggle for attribute-specific images */}
            <div className="flex items-center mb-4">
              <input
                id="has-variant-images"
                type="checkbox"
                className="h-4 w-4 rounded border-admin-slate-300 dark:border-admin-slate-600 text-admin-ucla-600 focus:ring-admin-ucla-500"
                checked={hasVariantImages}
                onChange={(e) => setHasVariantImages(e.target.checked)}
              />
              <label htmlFor="has-variant-images" className="ml-2 text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
                This product has different images for different attribute combinations
              </label>
            </div>

            {hasVariantImages && generatedVariants.length > 0 ? (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                    Select attribute combination for images:
                  </label>
                  <div className="space-y-2">
                    {generatedVariants.map((variant, idx) => {
                      // Format the display text based on variant type
                      let displayText = '';
                      
                      // For hierarchical attributes (array of objects with parentName, etc.)
                      if (Array.isArray(variant)) {
                        displayText = variant.map(attr => {
                          let text = `${attr.parentName}: ${attr.parentValue}`;
                          if (attr.childName && attr.childValue) {
                            text += `, ${attr.childName}: ${attr.childValue}`;
                          }
                          return text;
                        }).join(' | ');
                      }
                      // For legacy flat attributes (object with attribute:value pairs)
                      else if (typeof variant === 'object') {
                        displayText = Object.entries(variant)
                          .map(([attr, value]) => `${attr}: ${value}`)
                          .join(', ');
                      }

                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectVariantForImages(variant)}
                          className={`cursor-pointer p-3 rounded-lg border ${
                            selectedVariantForImages === variant
                              ? 'border-admin-ucla-500 bg-admin-ucla-50 dark:bg-admin-ucla-900/20'
                              : 'border-admin-slate-200 dark:border-admin-slate-700 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-800/50'
                          }`}
                        >
                          <div className="font-medium">{displayText}</div>
                          <div className="text-xs text-admin-slate-500 dark:text-admin-slate-400 mt-1">
                            {attributeImages[generateVariantKey(variant)]?.length || 0} image(s)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                    {selectedVariantForImages ? `Images for selected combination` : `Default Product Images`}
                  </label>

                  {/* Display selected images for variant or default */}
                  <div className="mt-2 space-y-4">
                    {/* Image display and selection logic */}
                    {selectedVariantForImages ? (
                      <>
                        {/* Variant-specific images display */}
                        {attributeImages[generateVariantKey(selectedVariantForImages)]?.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {attributeImages[generateVariantKey(selectedVariantForImages)].map((image, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden border border-admin-slate-200 dark:border-admin-slate-700">
                                  <img
                                    src={image.url}
                                    alt={`Product variant image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const variantKey = generateVariantKey(selectedVariantForImages);
                                    const updatedImages = attributeImages[variantKey].filter((_, i) => i !== index);
                                    setAttributeImages(prev => ({
                                      ...prev,
                                      [variantKey]: updatedImages
                                    }));
                                  }}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex justify-center items-center p-8 border-2 border-dashed border-admin-slate-300 dark:border-admin-slate-700 rounded-lg">
                            <div className="text-center">
                              <svg className="mx-auto h-12 w-12 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="mt-2 text-sm text-admin-slate-500 dark:text-admin-slate-400">No images selected for this variant</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Default image display - for general product images or when no variant is selected */}
                        <div className="text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                          Default Images (shown when no specific variant is selected)
                        </div>
                        {productImages.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {productImages.map((image, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden border border-admin-slate-200 dark:border-admin-slate-700">
                                  <img
                                    src={image.url}
                                    alt={`Product image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setProductImages(prev => prev.filter((_, i) => i !== index))}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex justify-center items-center p-8 border-2 border-dashed border-admin-slate-300 dark:border-admin-slate-700 rounded-lg">
                            <div className="text-center">
                              <svg className="mx-auto h-12 w-12 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="mt-2 text-sm text-admin-slate-500 dark:text-admin-slate-400">No default product images selected</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex justify-center">
                      <MediaUploadButton
                        onSelect={handleMediaSelect}
                        maxSelect={20}
                        selectedMedia={selectedVariantForImages
                          ? attributeImages[generateVariantKey(selectedVariantForImages)] || []
                          : productImages
                        }
                        className="w-full sm:w-auto justify-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Simple image uploader when no attributes or variants
              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                  Product Images <span className="text-red-500">*</span> (Up to 20 photos)
                </label>
                <div className="mt-2 space-y-4">
                  {/* Display selected images */}
                  {productImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {productImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-admin-slate-200 dark:border-admin-slate-700">
                            <img
                              src={image.url}
                              alt={`Product image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setProductImages(prev => prev.filter((_, i) => i !== index))}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center p-8 border-2 border-dashed border-admin-slate-300 dark:border-admin-slate-700 rounded-lg">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-admin-slate-500 dark:text-admin-slate-400">No images selected</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <MediaUploadButton
                      onSelect={handleMediaSelect}
                      maxSelect={20}
                      selectedMedia={productImages}
                      className="w-full sm:w-auto justify-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {hasVariantImages && generatedVariants.length === 0 && (
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      No attributes defined
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>
                        Please add product attributes in the "Attributes" tab before adding variant-specific images.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'attributes':
        return (
          <div className="space-y-6">
            {/* Global Attributes Section */}
            <div>
              <h3 className="text-lg font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-4">
                Global Attributes
              </h3>
              <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400 mb-4">
                Select from predefined global attributes to use in your product.
              </p>

              {globalAttributes.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {globalAttributes.map((attribute) => (
                    <div 
                      key={attribute._id}
                      className="border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg p-3 bg-white dark:bg-admin-slate-800/50 hover:border-admin-ucla-300 dark:hover:border-admin-ucla-700 cursor-pointer"
                      onClick={() => {
                        // Create a new attribute group from the global attribute
                        const newGroup = {
                          parentAttribute: { 
                            name: attribute.name, 
                            values: [...attribute.values] 
                          },
                          childAttributes: []
                        };

                        // Add to form
                        setFormData(prev => ({
                          ...prev,
                          attributeGroups: [...prev.attributeGroups, newGroup]
                        }));

                        toast.success(`Added ${attribute.name} attribute`);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-md font-medium text-admin-slate-900 dark:text-admin-slate-100">
                            {attribute.name}
                          </h4>
                          {attribute.description && (
                            <p className="mt-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">
                              {attribute.description}
                            </p>
                          )}
                        </div>
                        <span className="text-admin-ucla-500 dark:text-admin-ucla-400">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {attribute.values.slice(0, 5).map((value, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-800 dark:text-admin-slate-200"
                            >
                              {value}
                            </span>
                          ))}
                          {attribute.values.length > 5 && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-800 dark:text-admin-slate-200"
                            >
                              +{attribute.values.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-admin-slate-300 dark:border-admin-slate-700 rounded-lg">
                  <svg className="mx-auto h-10 w-10 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2 text-sm text-admin-slate-500 dark:text-admin-slate-400">
                    No global attributes found. Create them in the 
                    <Link to="/admin/settings/attributes" className="ml-1 text-admin-ucla-600 dark:text-admin-ucla-500 hover:underline">
                      Attribute Settings
                    </Link> page.
                  </p>
                </div>
              )}

              <div className="mt-4 text-sm text-admin-slate-700 dark:text-admin-slate-300 flex items-center">
                <span className="mr-2">
                  <svg className="h-5 w-5 text-admin-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Click on an attribute above to add it to your product
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-admin-slate-200 dark:border-admin-slate-700">
              <h3 className="text-lg font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-4">
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
                      <input
                        type="text"
                        value={group.parentAttribute.name}
                        onChange={(e) => handleParentAttributeChange(groupIndex, 'name', e.target.value)}
                        placeholder="Name (e.g., Size)"
                        className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                      />
                    </div>

                    {/* Parent Attribute Values */}
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
                          // Find actual index in the full childAttributes array
                          const actualChildIndex = group.childAttributes.findIndex(
                            a => a === childAttr
                          );
                          
                          return (
                            <div key={childIndex} className="mb-3 bg-admin-slate-50 dark:bg-admin-slate-800 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
                                  Child Attribute
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
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <input
                                    type="text"
                                    value={childAttr.name}
                                    onChange={(e) => handleChildAttributeChange(groupIndex, actualChildIndex, 'name', e.target.value)}
                                    placeholder="Child attribute name"
                                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                                  />
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    value={childAttr.values.join(', ')}
                                    onChange={(e) => handleChildAttributeChange(groupIndex, actualChildIndex, 'values', e.target.value)}
                                    placeholder="Value 1, Value 2"
                                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
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

            {/* Legacy flat attributes (keeping for backward compatibility) */}
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

            {/* Product Status */}
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

            {/* Choose Vendor */}
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

      case 'related':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Cross-sell Products (Optional)
              </label>
              <p className="text-xs text-admin-slate-500 dark:text-admin-slate-400 mb-2">
                Products that will be suggested as complementary to the current product.
              </p>
              <select
                multiple
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                size="5"
              >
                <option value="placeholder" disabled>Select products to cross-sell</option>
                {/* Dynamic product options would be added here */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Up-sell Products (Optional)
              </label>
              <p className="text-xs text-admin-slate-500 dark:text-admin-slate-400 mb-2">
                Higher-priced alternatives that will be suggested to the customer.
              </p>
              <select
                multiple
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                size="5"
              >
                <option value="placeholder" disabled>Select products to up-sell</option>
                {/* Dynamic product options would be added here */}
              </select>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-6">
            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Weight (kg, Optional)
              </label>
              <input
                type="number"
                name="weight"
                min="0"
                step="0.01"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                placeholder="0.00"
              />
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Dimensions (cm, Optional)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-admin-slate-500 dark:text-admin-slate-400 mb-1">Length</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.dimensions.length}
                    onChange={(e) => handleNestedChange('dimensions', 'length', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-admin-slate-500 dark:text-admin-slate-400 mb-1">Width</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.dimensions.width}
                    onChange={(e) => handleNestedChange('dimensions', 'width', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-admin-slate-500 dark:text-admin-slate-400 mb-1">Height</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.dimensions.height}
                    onChange={(e) => handleNestedChange('dimensions', 'height', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Time */}
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
              <p className="mt-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">For medical consumables</p>
            </div>

            {/* Product Video Link */}
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
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="mt-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">YouTube or other video platform link</p>
            </div>

            {/* Additional Info / Notes */}
            <div>
              <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
                Additional Info / Notes (Optional)
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2.5 rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors resize-none"
                placeholder="Any additional information (Internal use only)"
              />
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
          <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">Create New Product</h1>
          <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
            Add a new product to your inventory
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
            {isDraft ? 'Publish Product' : 'Save Product'}
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

export default CreateProductPage;