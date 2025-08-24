const Settings = require('../models/settings.model');
const Category = require('../models/category.model');
const Brand = require('../models/brand.model');

// @desc    Get homepage settings
// @route   GET /api/admin/settings/homepage
// @access  Private/Admin
exports.getHomepageSettings = async (req, res) => {
  try {
    // Find homepage settings or create default if not exists
    let settings = await Settings.findOne({ key: 'homepage' })
      .populate('featuredCategories', 'name slug image');
    
    if (!settings) {
      // Create default homepage settings
      settings = await Settings.create({
        key: 'homepage',
        data: {
          featuredProductsTitle: 'Featured Medical Devices',
          featuredProductsSubtitle: 'Top-rated medical equipment and supplies',
          newArrivalsTitle: 'New Medical Supplies',
          newArrivalsSubtitle: 'Latest additions to our medical inventory',
          showNewsletter: true,
          showTestimonials: true,
          showBrands: true,
          newsletterTitle: 'Subscribe for Health Updates',
          newsletterSubtitle: 'Get the latest health tips, product updates and special offers directly to your inbox',
        },
        heroSlides: [
          { image: '', link: '', order: 0 }
        ],
        selectedProducts: {
          featured: [],
          newArrivals: []
        },
        categorySections: [],
        brandSections: [],
        updatedBy: req.user._id
      });
      
      // Re-fetch to get populated data
      settings = await Settings.findOne({ key: 'homepage' })
        .populate('featuredCategories', 'name slug image');
    }

    res.status(200).json({
      success: true,
      settings: settings.data,
      heroSlides: settings.heroSlides,
      featuredCategories: settings.featuredCategories || [],
      selectedProducts: settings.selectedProducts || { featured: [], newArrivals: [] },
      categorySections: settings.categorySections || [],
      brandSections: settings.brandSections || []
    });
  } catch (error) {
    console.error('Error fetching homepage settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update homepage settings
// @route   POST /api/admin/settings/homepage
// @access  Private/Admin
exports.updateHomepageSettings = async (req, res) => {
  try {
    const { settings, heroSlides, featuredCategoryIds, selectedProducts, categorySections, brandSections } = req.body;

    // Validate hero slides
    if (heroSlides) {
      for (const slide of heroSlides) {
        if (!slide.image) {
          return res.status(400).json({ 
            success: false, 
            error: 'All hero slides must have an image' 
          });
        }
      }
    }

    // Find existing settings or create new one
    let homepageSettings = await Settings.findOne({ key: 'homepage' });
    
    if (!homepageSettings) {
      homepageSettings = new Settings({ 
        key: 'homepage',
        updatedBy: req.user._id
      });
    }

    // Update fields
    if (settings) {
      homepageSettings.data = settings;
    }
    
    if (heroSlides) {
      homepageSettings.heroSlides = heroSlides.map((slide, index) => ({
        ...slide,
        order: index
      }));
    }
    
    if (featuredCategoryIds && Array.isArray(featuredCategoryIds)) {
      // Validate that all category IDs exist
      const categoryCount = await Category.countDocuments({
        _id: { $in: featuredCategoryIds }
      });
      
      if (categoryCount !== featuredCategoryIds.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more category IDs are invalid'
        });
      }
      
      homepageSettings.featuredCategories = featuredCategoryIds;
    }
    
    // Update selected products
    if (selectedProducts) {
      homepageSettings.selectedProducts = {
        featured: Array.isArray(selectedProducts.featured) ? selectedProducts.featured : [],
        newArrivals: Array.isArray(selectedProducts.newArrivals) ? selectedProducts.newArrivals : []
      };
    }

    // Update category sections
    if (categorySections && Array.isArray(categorySections)) {
      // Validate that all category IDs exist
      const categoryIds = categorySections.map(section => section.categoryId);
      const categoryCount = await Category.countDocuments({
        _id: { $in: categoryIds }
      });
      
      if (categoryCount !== categoryIds.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more category IDs in category sections are invalid'
        });
      }
      
      homepageSettings.categorySections = categorySections;
    }

    // Update brand sections
    if (brandSections && Array.isArray(brandSections)) {
      // Validate that all brand IDs exist
      const brandIds = brandSections.map(section => section.brandId);
      const brandCount = await Brand.countDocuments({
        _id: { $in: brandIds }
      });
      
      if (brandCount !== brandIds.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more brand IDs in brand sections are invalid'
        });
      }
      
      homepageSettings.brandSections = brandSections;
    }
    
    homepageSettings.updatedBy = req.user._id;
    await homepageSettings.save();

    res.status(200).json({
      success: true,
      data: homepageSettings
    });
  } catch (error) {
    console.error('Error updating homepage settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get public homepage settings
// @route   GET /api/settings/homepage
// @access  Public
exports.getPublicHomepageSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ key: 'homepage' })
      .populate('featuredCategories', 'name slug image');
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        error: 'Homepage settings not found'
      });
    }
    
    res.status(200).json({
      success: true,
      settings: settings.data,
      heroSlides: settings.heroSlides,
      featuredCategories: settings.featuredCategories || [],
      selectedProducts: settings.selectedProducts || { featured: [], newArrivals: [] },
      categorySections: settings.categorySections || [],
      brandSections: settings.brandSections || []
    });
  } catch (error) {
    console.error('Error fetching public homepage settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get SEO settings (public)
// @route   GET /api/settings/seo
// @access  Public
exports.getPublicSeoSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'seo' });

    if (!settings) {
      settings = await Settings.create({
        key: 'seo',
        data: {
          defaultMetaTitle: 'Medical Devices Nepal | Quality Healthcare Equipment',
          defaultMetaDescription: 'Your trusted source for medical devices and healthcare equipment in Nepal. Quality products from leading manufacturers.',
          defaultSocialImage: '',
          googleAnalyticsId: '',
          googleSearchConsoleId: '',
          robotsTxt: 'User-agent: *\nAllow: /',
          sitemapEnabled: true
        }
      });
    }

    res.status(200).json({
      success: true,
      data: settings.data
    });
  } catch (error) {
    console.error('Error fetching public SEO settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get SEO settings
// @route   GET /api/admin/settings/seo
// @access  Private/Admin
exports.getSeoSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'seo' });
    
    if (!settings) {
      // Create default SEO settings
      settings = await Settings.create({
        key: 'seo',
        data: {
          defaultMetaTitle: 'Medical Devices Nepal | Quality Healthcare Equipment',
          defaultMetaDescription: 'Your trusted source for medical devices and healthcare equipment in Nepal. Quality products from leading manufacturers.',
          defaultSocialImage: '',
          googleAnalyticsId: '',
          googleSearchConsoleId: '',
          robotsTxt: 'User-agent: *\nAllow: /',
          sitemapEnabled: true
        },
        updatedBy: req.user._id
      });
    }

    res.status(200).json({
      success: true,
      data: settings.data
    });
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update SEO settings
// @route   POST /api/admin/settings/seo
// @access  Private/Admin
exports.updateSeoSettings = async (req, res) => {
  try {
    const { 
      defaultMetaTitle, 
      defaultMetaDescription, 
      defaultSocialImage,
      googleAnalyticsId,
      googleSearchConsoleId,
      robotsTxt,
      sitemapEnabled
    } = req.body;

    // Find existing settings or create new one
    let seoSettings = await Settings.findOne({ key: 'seo' });
    
    if (!seoSettings) {
      seoSettings = new Settings({ 
        key: 'seo',
        updatedBy: req.user._id
      });
    }

    // Update fields
    seoSettings.data = {
      defaultMetaTitle: defaultMetaTitle || '',
      defaultMetaDescription: defaultMetaDescription || '',
      defaultSocialImage: defaultSocialImage || '',
      googleAnalyticsId: googleAnalyticsId || '',
      googleSearchConsoleId: googleSearchConsoleId || '',
      robotsTxt: robotsTxt || 'User-agent: *\nAllow: /',
      sitemapEnabled: sitemapEnabled !== undefined ? sitemapEnabled : true
    };
    
    seoSettings.updatedBy = req.user._id;
    await seoSettings.save();

    res.status(200).json({
      success: true,
      data: seoSettings.data
    });
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get contact settings
// @route   GET /api/admin/settings/contact
// @access  Private/Admin
exports.getContactSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'contact' });
    
    if (!settings) {
      // Create default contact settings
      settings = await Settings.create({
        key: 'contact',
        data: {
          email: '',
          phone: '',
          streetAddress: '',
          city: '',
          province: '',
          weekdaysHours: '9:00 AM - 5:00 PM',
          weekendsHours: 'Closed'
        },
        updatedBy: req.user._id
      });
    }

    res.status(200).json({
      success: true,
      data: settings.data
    });
  } catch (error) {
    console.error('Error fetching contact settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update contact settings
// @route   POST /api/admin/settings/contact
// @access  Private/Admin
exports.updateContactSettings = async (req, res) => {
  try {
    const { 
      email, 
      phone, 
      streetAddress,
      city,
      province,
      weekdaysHours,
      weekendsHours
    } = req.body;

    // Validation
    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Email and phone number are required'
      });
    }

    // Find existing settings or create new one
    let contactSettings = await Settings.findOne({ key: 'contact' });
    
    if (!contactSettings) {
      contactSettings = new Settings({ 
        key: 'contact',
        updatedBy: req.user._id
      });
    }

    // Update fields
    contactSettings.data = {
      email: email.trim(),
      phone: phone.trim(),
      streetAddress: streetAddress ? streetAddress.trim() : '',
      city: city ? city.trim() : '',
      province: province ? province.trim() : '',
      weekdaysHours: weekdaysHours ? weekdaysHours.trim() : '9:00 AM - 5:00 PM',
      weekendsHours: weekendsHours ? weekendsHours.trim() : 'Closed'
    };
    
    contactSettings.updatedBy = req.user._id;
    await contactSettings.save();

    res.status(200).json({
      success: true,
      data: contactSettings.data
    });
  } catch (error) {
    console.error('Error updating contact settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get public contact settings
// @route   GET /api/settings/contact
// @access  Public
exports.getPublicContactSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ key: 'contact' });
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        error: 'Contact settings not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: settings.data
    });
  } catch (error) {
    console.error('Error fetching public contact settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};