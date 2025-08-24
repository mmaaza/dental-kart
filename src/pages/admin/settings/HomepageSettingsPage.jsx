import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import MediaLibraryModal from '../../../components/ui/MediaLibraryModal';
import ProductSelectorModal from '../../../components/ui/ProductSelectorModal';
import CategoryBrandSelectorModal from '../../../components/ui/CategoryBrandSelectorModal';

const HomepageSettingsPage = () => {
  const [heroSlides, setHeroSlides] = useState([
    { image: '', link: '', order: 0 },
  ]);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(null);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [settings, setSettings] = useState({
    featuredProductsTitle: 'Featured Medical Devices',
    featuredProductsSubtitle: 'Top-rated medical equipment and supplies',
    newArrivalsTitle: 'New Medical Supplies',
    newArrivalsSubtitle: 'Latest additions to our medical inventory',
    showNewsletter: true,
    showTestimonials: true,
    showBrands: true,
    newsletterTitle: 'Subscribe for Health Updates',
    newsletterSubtitle: 'Get the latest health tips, product updates and special offers directly to your inbox',
    bannerImage: '',
    showBanner: true,
  });
  const [errors, setErrors] = useState({
    heroSlides: [],
    settings: {}
  });
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [selectorType, setSelectorType] = useState(''); // 'featured' or 'new'
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivalsProducts, setNewArrivalsProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({
    featured: [],
    newArrivals: []
  });
  
  // New state for categories and brands sections
  const [categorySections, setCategorySections] = useState([]);
  const [brandSections, setBrandSections] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [brandProducts, setBrandProducts] = useState({});
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [isBrandSelectorOpen, setIsBrandSelectorOpen] = useState(false);
  
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    // Fetch current settings from backend
    const fetchSettings = async () => {
      try {
        const response = await api.get('/admin/settings/homepage');
        if (response.data) {
          setSettings(response.data.settings);
          setHeroSlides(response.data.heroSlides);
          
          // If there are selected product IDs in the response
          if (response.data.selectedProducts) {
            setSelectedProducts(response.data.selectedProducts);
          }

          // Set categories and brands sections
          if (response.data.categorySections) {
            setCategorySections(response.data.categorySections);
          }
          if (response.data.brandSections) {
            setBrandSections(response.data.brandSections);
          }
        }
      } catch (error) {
        console.error('Error fetching homepage settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Fetch detailed product data when selected product IDs change
  useEffect(() => {
    if (selectedProducts.featured.length > 0 || selectedProducts.newArrivals.length > 0) {
      fetchSelectedProducts();
    }
  }, [selectedProducts.featured, selectedProducts.newArrivals]);

  // Fetch category products when category sections change
  useEffect(() => {
    if (categorySections.length > 0) {
      fetchCategoryProducts();
    }
  }, [categorySections]);

  // Fetch brand products when brand sections change
  useEffect(() => {
    if (brandSections.length > 0) {
      fetchBrandProducts();
    }
  }, [brandSections]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleHeroSlideChange = (index, field, value) => {
    setHeroSlides(prev => {
      const newSlides = [...prev];
      newSlides[index] = { ...newSlides[index], [field]: value };
      return newSlides;
    });
  };

  const addHeroSlide = () => {
    setHeroSlides(prev => [...prev, { image: '', link: '', order: prev.length }]);
  };

  const removeHeroSlide = (index) => {
    setHeroSlides(prev => prev.filter((_, i) => i !== index));
  };

  const handleHeroSlideImageSelect = (selectedMedia) => {
    if (activeSlideIndex !== null && Array.isArray(selectedMedia) && selectedMedia.length > 0) {
      if (activeSlideIndex === 'banner') {
        // Handle banner image selection
        handleSettingChange('bannerImage', selectedMedia[0].url);
        console.log('Selected banner image URL:', selectedMedia[0].url);
      } else {
        // Handle hero slide image selection
        handleHeroSlideChange(activeSlideIndex, 'image', selectedMedia[0].url);
        console.log('Selected image URL:', selectedMedia[0].url);
      }
    }
    setIsMediaLibraryOpen(false);
  };

  const openMediaLibrary = (index) => {
    setActiveSlideIndex(index);
    setIsMediaLibraryOpen(true);
  };

  // Banner image selection function
  const openBannerMediaLibrary = () => {
    setActiveSlideIndex('banner');
    setIsMediaLibraryOpen(true);
  };

  // Product selector functions
  const openProductSelector = (type) => {
    setSelectorType(type);
    setIsProductSelectorOpen(true);
  };

  const handleProductSelection = (productIds) => {
    console.log(`Selected ${productIds.length} products for ${selectorType} section:`, productIds);
    
    if (selectorType === 'featured') {
      setSelectedProducts(prev => ({
        ...prev,
        featured: productIds
      }));
    } else if (selectorType === 'new') {
      setSelectedProducts(prev => ({
        ...prev,
        newArrivals: productIds
      }));
    }
    setIsProductSelectorOpen(false);
  };

  // Category and Brand selector functions
  const openCategorySelector = () => {
    setIsCategorySelectorOpen(true);
  };

  const openBrandSelector = () => {
    setIsBrandSelectorOpen(true);
  };

  const handleCategorySelection = (selectedCategories) => {
    console.log('Selected categories:', selectedCategories);
    setCategorySections(selectedCategories);
    setIsCategorySelectorOpen(false);
  };

  const handleBrandSelection = (selectedBrands) => {
    console.log('Selected brands:', selectedBrands);
    setBrandSections(selectedBrands);
    setIsBrandSelectorOpen(false);
  };

  const fetchSelectedProducts = async () => {
    try {
      // Fetch each product by ID directly to ensure we get exactly what we want
      // Featured products
      if (selectedProducts.featured.length > 0) {
        const featuredProductPromises = selectedProducts.featured.map(id => 
          api.get(`/products/admin/${id}`, {
            params: {
              fields: 'name,regularPrice,specialOfferPrice,discountType,discountValue,images,stock,status'
            }
          }).then(res => res.data.data)
            .catch(err => {
              console.error(`Error fetching featured product with ID ${id}:`, err);
              return null;
            })
        );
        
        console.log('Fetching featured products with IDs:', selectedProducts.featured);
        const featuredResults = await Promise.all(featuredProductPromises);
        const validFeaturedProducts = featuredResults.filter(product => product !== null);
        console.log('Successfully fetched featured products:', validFeaturedProducts);
        setFeaturedProducts(validFeaturedProducts);
      } else {
        setFeaturedProducts([]);
      }
      
      // New arrivals
      if (selectedProducts.newArrivals.length > 0) {
        const newArrivalsProductPromises = selectedProducts.newArrivals.map(id => 
          api.get(`/products/admin/${id}`, {
            params: {
              fields: 'name,regularPrice,specialOfferPrice,discountType,discountValue,images,stock,status'
            }
          }).then(res => res.data.data)
            .catch(err => {
              console.error(`Error fetching new arrival product with ID ${id}:`, err);
              return null;
            })
        );
        
        console.log('Fetching new arrival products with IDs:', selectedProducts.newArrivals);
        const newArrivalsResults = await Promise.all(newArrivalsProductPromises);
        const validNewArrivalsProducts = newArrivalsResults.filter(product => product !== null);
        console.log('Successfully fetched new arrival products:', validNewArrivalsProducts);
        setNewArrivalsProducts(validNewArrivalsProducts);
      } else {
        setNewArrivalsProducts([]);
      }
    } catch (error) {
      console.error('Error fetching selected products:', error);
    }
  };

  const fetchCategoryProducts = async () => {
    try {
      const categoryProductsData = {};
      
      for (const categorySection of categorySections) {
        if (categorySection.productIds && categorySection.productIds.length > 0) {
          const productPromises = categorySection.productIds.map(id => 
            api.get(`/products/admin/${id}`, {
              params: {
                fields: 'name,regularPrice,specialOfferPrice,discountType,discountValue,images,stock,status'
              }
            }).then(res => res.data.data)
              .catch(err => {
                console.error(`Error fetching category product with ID ${id}:`, err);
                return null;
              })
          );
          
          const results = await Promise.all(productPromises);
          const validProducts = results.filter(product => product !== null);
          categoryProductsData[categorySection.categoryId] = validProducts;
        } else {
          categoryProductsData[categorySection.categoryId] = [];
        }
      }
      
      setCategoryProducts(categoryProductsData);
    } catch (error) {
      console.error('Error fetching category products:', error);
    }
  };

  const fetchBrandProducts = async () => {
    try {
      const brandProductsData = {};
      
      for (const brandSection of brandSections) {
        if (brandSection.productIds && brandSection.productIds.length > 0) {
          const productPromises = brandSection.productIds.map(id => 
            api.get(`/products/admin/${id}`, {
              params: {
                fields: 'name,regularPrice,specialOfferPrice,discountType,discountValue,images,stock,status'
              }
            }).then(res => res.data.data)
              .catch(err => {
                console.error(`Error fetching brand product with ID ${id}:`, err);
                return null;
              })
          );
          
          const results = await Promise.all(productPromises);
          const validProducts = results.filter(product => product !== null);
          brandProductsData[brandSection.brandId] = validProducts;
        } else {
          brandProductsData[brandSection.brandId] = [];
        }
      }
      
      setBrandProducts(brandProductsData);
    } catch (error) {
      console.error('Error fetching brand products:', error);
    }
  };

  const validateSettings = () => {
    const newErrors = {
      heroSlides: [],
      settings: {}
    };
    
    // Validate hero slides
    heroSlides.forEach((slide, index) => {
      const slideErrors = {};
      if (!slide.image) {
        slideErrors.image = 'Image is required';
      }
      if (slide.link && !isValidUrl(slide.link)) {
        slideErrors.link = 'Please enter a valid URL';
      }
      if (Object.keys(slideErrors).length > 0) {
        newErrors.heroSlides[index] = slideErrors;
      }
    });

    // Validate settings - section titles are now read-only, so we don't need to validate them
    if (settings.showNewsletter) {
      if (!settings.newsletterTitle.trim()) {
        newErrors.settings.newsletterTitle = 'Newsletter title is required';
      }
      if (!settings.newsletterSubtitle.trim()) {
        newErrors.settings.newsletterSubtitle = 'Newsletter subtitle is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors.settings).length === 0 && 
           newErrors.heroSlides.every(error => !error);
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateSettings()) {
      // Show error message
      return;
    }

    try {
      await api.post('/admin/settings/homepage', {
        settings,
        heroSlides,
        selectedProducts,
        categorySections,
        brandSections
      });
      setNotification({ show: true, type: 'success', message: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Error saving homepage settings:', error);
      setNotification({ show: true, type: 'error', message: 'Error saving settings. Please try again.' });
    }
  };

  // Utility function to calculate effective price based on product model
  const getEffectivePrice = (product) => {
    if (product.specialOfferPrice && product.regularPrice > product.specialOfferPrice) {
      return product.specialOfferPrice;
    }
    
    if (product.discountValue > 0) {
      if (product.discountType === 'percentage') {
        const discountAmount = (product.regularPrice * product.discountValue) / 100;
        return product.regularPrice - discountAmount;
      } else {
        return product.regularPrice - product.discountValue;
      }
    }
    
    return product.regularPrice;
  };

  const formatPrice = (price) => {
    return Number(price).toFixed(2);
  };

  // ProductItem component for consistent rendering
  const ProductItem = ({ product }) => {
    if (!product || !product._id) {
      console.warn('Invalid product passed to ProductItem:', product);
      return null;
    }
    
    const effectivePrice = getEffectivePrice(product);
    const hasDiscount = effectivePrice < product.regularPrice;
    const discountPercentage = hasDiscount 
      ? Math.round(((product.regularPrice - effectivePrice) / product.regularPrice) * 100) 
      : 0;
    
    return (
      <div className="flex items-center p-2 rounded-md bg-white dark:bg-admin-slate-800 border border-admin-slate-200 dark:border-admin-slate-700">
        <div className="h-12 w-12 bg-admin-slate-100 dark:bg-admin-slate-700 rounded overflow-hidden flex-shrink-0">
          {product.images && product.images.length > 0 ? (
            <div className="relative h-full w-full">
              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
              {hasDiscount && (
                <div className="absolute top-0 left-0 bg-red-500 text-white text-2xs px-1 py-0.5 rounded-br">
                  {discountPercentage}% OFF
                </div>
              )}
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-admin-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="ml-3 flex-grow overflow-hidden">
          <p className="text-xs font-medium text-admin-slate-900 dark:text-admin-slate-100 truncate">{product.name}</p>
          <div className="flex flex-wrap items-center gap-2">
            {hasDiscount ? (
              <div className="flex items-center gap-1">
                <p className="text-2xs font-medium text-admin-slate-700 dark:text-admin-slate-300">
                  Rs. {formatPrice(effectivePrice)}
                </p>
                <p className="text-2xs line-through text-admin-slate-400 dark:text-admin-slate-500">
                  Rs. {formatPrice(product.regularPrice)}
                </p>
              </div>
            ) : (
              <p className="text-2xs text-admin-slate-500 dark:text-admin-slate-400">
                Rs. {formatPrice(product.regularPrice)}
              </p>
            )}
            <span className={`text-2xs px-1 py-0.5 rounded-sm font-medium 
              ${product.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                product.status === 'inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
              {product.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">Homepage Settings</h1>
        <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
          Customize how your homepage appears to visitors
        </p>
      </div>

      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg">
        <div className="p-6 space-y-6">
          {/* Hero Slider Settings */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Hero Slider Settings</h3>
              <button
                onClick={addHeroSlide}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-admin-ucla-500 text-white rounded-md hover:bg-admin-ucla-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Slide
              </button>
            </div>
            <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400 mb-4">
              Configure the rotating banner images that appear at the top of your homepage.
            </p>

            <div className="mt-4 grid gap-6">
              {heroSlides.map((slide, index) => (
                <div 
                  key={index} 
                  className="bg-admin-slate-50 dark:bg-admin-slate-700/40 border border-admin-slate-200 dark:border-admin-slate-600 rounded-lg overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image preview section */}
                    <div className="w-full md:w-1/3 bg-admin-slate-100 dark:bg-admin-slate-800 p-4 flex items-center justify-center">
                      {slide.image ? (
                        <div className="relative w-full h-40 md:h-full">
                          <img
                            src={slide.image}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center p-2 rounded-md">
                            <button
                              onClick={() => openMediaLibrary(index)}
                              className="bg-admin-ucla-500 text-white text-xs px-2 py-1 rounded-md hover:bg-admin-ucla-600 transition-colors"
                            >
                              Change Image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-40 md:h-56 border-2 border-dashed border-admin-slate-300 dark:border-admin-slate-600 flex flex-col items-center justify-center rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-admin-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <button
                            onClick={() => openMediaLibrary(index)}
                            className="mt-2 px-3 py-1.5 bg-admin-ucla-500 text-white rounded-md hover:bg-admin-ucla-600 transition-colors text-sm"
                          >
                            Select Image
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Form fields section */}
                    <div className="w-full md:w-2/3 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium text-admin-slate-900 dark:text-admin-slate-100">
                          Slide {index + 1}
                        </h4>
                        <button
                          onClick={() => removeHeroSlide(index)}
                          className="inline-flex items-center text-red-600 hover:text-red-700 text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                          Link URL <span className="text-xs text-admin-slate-500 dark:text-admin-slate-400">(Where this slide leads when clicked)</span>
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <span className="inline-flex items-center rounded-l-md border border-r-0 border-admin-slate-300 dark:border-admin-slate-600 bg-admin-slate-100 dark:bg-admin-slate-700 px-3 text-admin-slate-500 dark:text-admin-slate-400 text-sm">
                            URL
                          </span>
                          <input
                            type="text"
                            value={slide.link}
                            onChange={(e) => handleHeroSlideChange(index, 'link', e.target.value)}
                            placeholder="https://example.com/product"
                            className="block w-full rounded-r-md border-admin-slate-300 dark:border-admin-slate-600 bg-white dark:bg-admin-slate-700 text-admin-slate-900 dark:text-admin-slate-100 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm py-2 px-3"
                          />
                        </div>
                        {errors.heroSlides[index]?.link && (
                          <p className="text-red-600 text-sm mt-1">{errors.heroSlides[index].link}</p>
                        )}
                      </div>
                      
                      {!slide.image && errors.heroSlides[index]?.image && (
                        <p className="text-red-600 text-sm mt-1">{errors.heroSlides[index].image}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {heroSlides.length === 0 && (
                <div className="text-center py-6 border border-dashed border-admin-slate-300 dark:border-admin-slate-600 rounded-lg">
                  <p className="text-admin-slate-500 dark:text-admin-slate-400">No slides added yet</p>
                  <button
                    onClick={addHeroSlide}
                    className="mt-2 inline-flex items-center px-4 py-2 bg-admin-ucla-500 text-white rounded-md hover:bg-admin-ucla-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Your First Slide
                  </button>
                </div>
              )}
            </div>
          </section>

          <div className="border-t border-admin-slate-200 dark:border-admin-slate-700"></div>

          {/* Banner Settings */}
          <section>
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Banner Settings</h3>
            <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400 mb-4">
              Configure the banner that appears between featured products and category sections.
            </p>

            <div className="mt-4 space-y-4">
              {/* Show Banner Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
                    Show Banner
                  </label>
                  <p className="text-xs text-admin-slate-500 dark:text-admin-slate-400 mt-1">
                    Enable or disable the banner section
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showBanner}
                    onChange={(e) => handleSettingChange('showBanner', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-admin-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-admin-ucla-300 dark:peer-focus:ring-admin-ucla-800 rounded-full peer dark:bg-admin-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-admin-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-admin-slate-600 peer-checked:bg-admin-ucla-600"></div>
                </label>
              </div>

              {/* Banner Image */}
              {settings.showBanner && (
                <div className="bg-admin-slate-50 dark:bg-admin-slate-700/40 border border-admin-slate-200 dark:border-admin-slate-600 rounded-lg p-4">
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-3">
                    Banner Image
                  </label>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Image preview */}
                    <div className="w-full md:w-1/3">
                      {settings.bannerImage ? (
                        <div className="relative w-full aspect-[16/3] rounded-lg overflow-hidden">
                          <img
                            src={settings.bannerImage}
                            alt="Banner Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center p-2 rounded-lg">
                            <button
                              onClick={openBannerMediaLibrary}
                              className="bg-admin-ucla-500 text-white text-xs px-2 py-1 rounded-md hover:bg-admin-ucla-600 transition-colors"
                            >
                              Change Image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full aspect-[16/3] border-2 border-dashed border-admin-slate-300 dark:border-admin-slate-600 flex flex-col items-center justify-center rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-admin-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <button
                            onClick={openBannerMediaLibrary}
                            className="mt-2 px-3 py-1.5 bg-admin-ucla-500 text-white rounded-md hover:bg-admin-ucla-600 transition-colors text-sm"
                          >
                            Select Banner Image
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Image info */}
                    <div className="w-full md:w-2/3 space-y-3">
                      <div>
                        <p className="text-sm text-admin-slate-600 dark:text-admin-slate-400">
                          <strong>Recommended size:</strong> 1200x225 pixels (16:3 aspect ratio)
                        </p>
                        <p className="text-xs text-admin-slate-500 dark:text-admin-slate-400 mt-1">
                          The banner will appear between the Featured Products and Category sections on the homepage.
                        </p>
                      </div>
                      
                      {settings.bannerImage && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSettingChange('bannerImage', '')}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove Image
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="border-t border-admin-slate-200 dark:border-admin-slate-700"></div>

          {/* Section Titles and Content */}
          <section>
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Section Settings</h3>
            <div className="mt-4 space-y-6">
              {/* Featured Products Section */}
              <div className="bg-admin-slate-50 dark:bg-admin-slate-700/30 p-4 rounded-lg border border-admin-slate-200 dark:border-admin-slate-600">
                <h4 className="text-md font-medium text-admin-slate-900 dark:text-admin-slate-100 mb-3">Featured Products Section</h4>
                {/* Product selection for Featured Products */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
                      Select Featured Products
                    </p>
                    <button
                      type="button"
                      onClick={() => openProductSelector('featured')}
                      className="inline-flex items-center px-3 py-1.5 text-xs bg-admin-ucla-500 text-white rounded-md hover:bg-admin-ucla-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {selectedProducts.featured.length > 0 ? 'Change Products' : 'Add Products'}
                    </button>
                  </div>
                  
                  {/* Display selected featured products */}
                  {featuredProducts.length > 0 ? (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {featuredProducts.map(product => (
                        <ProductItem key={product._id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 p-4 border border-dashed border-admin-slate-300 dark:border-admin-slate-600 rounded-md text-center">
                      <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400">No featured products selected</p>
                      <p className="text-xs text-admin-slate-400 dark:text-admin-slate-500 mt-1">Click "Add Products" to select products for this section</p>
                    </div>
                  )}
                </div>
              </div>

              {/* New Arrivals Section */}
              <div className="bg-admin-slate-50 dark:bg-admin-slate-700/30 p-4 rounded-lg border border-admin-slate-200 dark:border-admin-slate-600">
                <h4 className="text-md font-medium text-admin-slate-900 dark:text-admin-slate-100 mb-3">New Arrivals Section</h4>
                {/* Product selection for New Arrivals */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
                      Select New Arrivals
                    </p>
                    <button
                      type="button"
                      onClick={() => openProductSelector('new')}
                      className="inline-flex items-center px-3 py-1.5 text-xs bg-admin-ucla-500 text-white rounded-md hover:bg-admin-ucla-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {selectedProducts.newArrivals.length > 0 ? 'Change Products' : 'Add Products'}
                    </button>
                  </div>
                  
                  {/* Display selected new arrival products */}
                  {newArrivalsProducts.length > 0 ? (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {newArrivalsProducts.map(product => (
                        <ProductItem key={product._id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 p-4 border border-dashed border-admin-slate-300 dark:border-admin-slate-600 rounded-md text-center">
                      <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400">No new arrival products selected</p>
                      <p className="text-xs text-admin-slate-400 dark:text-admin-slate-500 mt-1">Click "Add Products" to select products for this section</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Categories Section */}
              <div className="bg-admin-slate-50 dark:bg-admin-slate-700/30 p-4 rounded-lg border border-admin-slate-200 dark:border-admin-slate-600">
                <h4 className="text-md font-medium text-admin-slate-900 dark:text-admin-slate-100 mb-3">Categories Section</h4>
                <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400 mb-4">
                  Select categories and their associated products to display on the homepage.
                </p>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
                      Select Categories
                    </p>
                    <button
                      type="button"
                      onClick={openCategorySelector}
                      className="inline-flex items-center px-3 py-1.5 text-xs bg-admin-ucla-500 text-white rounded-md hover:bg-admin-ucla-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {categorySections.length > 0 ? 'Change Categories' : 'Add Categories'}
                    </button>
                  </div>
                  
                  {/* Display selected categories */}
                  {categorySections.length > 0 ? (
                    <div className="mt-3 space-y-4">
                      {categorySections.map((categorySection, index) => (
                        <div key={categorySection.categoryId} className="bg-white dark:bg-admin-slate-800 border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">
                              {categorySection.categoryName}
                            </h5>
                            <span className="text-xs text-admin-slate-500 dark:text-admin-slate-400">
                              {categorySection.productIds.length} products
                            </span>
                          </div>
                          
                          {/* Display products for this category */}
                          {categoryProducts[categorySection.categoryId] && categoryProducts[categorySection.categoryId].length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {categoryProducts[categorySection.categoryId].map(product => (
                                <ProductItem key={product._id} product={product} />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-3 border border-dashed border-admin-slate-300 dark:border-admin-slate-600 rounded-md">
                              <p className="text-xs text-admin-slate-500 dark:text-admin-slate-400">No products selected for this category</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 p-4 border border-dashed border-admin-slate-300 dark:border-admin-slate-600 rounded-md text-center">
                      <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400">No categories selected</p>
                      <p className="text-xs text-admin-slate-400 dark:text-admin-slate-500 mt-1">Click "Add Categories" to select categories and their products</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Brands Section */}
              <div className="bg-admin-slate-50 dark:bg-admin-slate-700/30 p-4 rounded-lg border border-admin-slate-200 dark:border-admin-slate-600">
                <h4 className="text-md font-medium text-admin-slate-900 dark:text-admin-slate-100 mb-3">Brands Section</h4>
                <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400 mb-4">
                  Select brands and their associated products to display on the homepage.
                </p>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
                      Select Brands
                    </p>
                    <button
                      type="button"
                      onClick={openBrandSelector}
                      className="inline-flex items-center px-3 py-1.5 text-xs bg-admin-ucla-500 text-white rounded-md hover:bg-admin-ucla-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {brandSections.length > 0 ? 'Change Brands' : 'Add Brands'}
                    </button>
                  </div>
                  
                  {/* Display selected brands */}
                  {brandSections.length > 0 ? (
                    <div className="mt-3 space-y-4">
                      {brandSections.map((brandSection, index) => (
                        <div key={brandSection.brandId} className="bg-white dark:bg-admin-slate-800 border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">
                              {brandSection.brandName}
                            </h5>
                            <span className="text-xs text-admin-slate-500 dark:text-admin-slate-400">
                              {brandSection.productIds.length} products
                            </span>
                          </div>
                          
                          {/* Display products for this brand */}
                          {brandProducts[brandSection.brandId] && brandProducts[brandSection.brandId].length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {brandProducts[brandSection.brandId].map(product => (
                                <ProductItem key={product._id} product={product} />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-3 border border-dashed border-admin-slate-300 dark:border-admin-slate-600 rounded-md">
                              <p className="text-xs text-admin-slate-500 dark:text-admin-slate-400">No products selected for this brand</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 p-4 border border-dashed border-admin-slate-300 dark:border-admin-slate-600 rounded-md text-center">
                      <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400">No brands selected</p>
                      <p className="text-xs text-admin-slate-400 dark:text-admin-slate-500 mt-1">Click "Add Brands" to select brands and their products</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-admin-slate-700/50 border-t border-admin-slate-200 dark:border-admin-slate-700">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-admin-ucla-500 text-white rounded-md hover:bg-admin-ucla-600"
          >
            Save Changes
          </button>
        </div>
      </div>

      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => {
          setIsMediaLibraryOpen(false);
          setActiveSlideIndex(null);
        }}
        onSelect={handleHeroSlideImageSelect}
        maxSelect={1}
      />

      <ProductSelectorModal
        isOpen={isProductSelectorOpen}
        onClose={() => setIsProductSelectorOpen(false)}
        onSelect={handleProductSelection}
        maxSelect={8}
        selectedProductIds={selectorType === 'featured' ? selectedProducts.featured : selectedProducts.newArrivals}
      />

      <CategoryBrandSelectorModal
        isOpen={isCategorySelectorOpen}
        onClose={() => setIsCategorySelectorOpen(false)}
        onSelect={handleCategorySelection}
        type="category"
        selectedItems={categorySections}
        maxSelect={5}
      />

      <CategoryBrandSelectorModal
        isOpen={isBrandSelectorOpen}
        onClose={() => setIsBrandSelectorOpen(false)}
        onSelect={handleBrandSelection}
        type="brand"
        selectedItems={brandSections}
        maxSelect={5}
      />

      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-admin-slate-800 rounded-lg shadow-md p-4 transition-all duration-300 transform ${notification.show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <div className={`flex items-center ${notification.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {notification.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className="text-sm font-medium">{notification.message}</p>
            <button 
              onClick={() => setNotification({ show: false, type: '', message: '' })}
              className="ml-auto text-admin-slate-400 hover:text-admin-slate-500 dark:text-admin-slate-500 dark:hover:text-admin-slate-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomepageSettingsPage;