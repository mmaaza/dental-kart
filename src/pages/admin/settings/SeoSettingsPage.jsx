import React, { useState } from 'react';
import { useSeoSettings, useUpdateSeoSettings } from '../../../hooks/useHomepageQueries';
import MediaLibraryModal from '../../../components/ui/MediaLibraryModal';

const SeoSettingsPage = () => {
  const [formData, setFormData] = useState({
    defaultMetaTitle: '',
    defaultMetaDescription: '',
    defaultSocialImage: '',
    robotsTxt: 'User-agent: *\nAllow: /',
    sitemapEnabled: true
  });

  const [selectedSocialImage, setSelectedSocialImage] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  // React Query hooks
  const { data: seoSettings, isLoading, error } = useSeoSettings();
  const updateSeoSettingsMutation = useUpdateSeoSettings();

  // Update form data when settings are loaded
  React.useEffect(() => {
    if (seoSettings) {
      setFormData({
        defaultMetaTitle: seoSettings.defaultMetaTitle || '',
        defaultMetaDescription: seoSettings.defaultMetaDescription || '',
        defaultSocialImage: seoSettings.defaultSocialImage || '',
        robotsTxt: seoSettings.robotsTxt || 'User-agent: *\nAllow: /',
        sitemapEnabled: seoSettings.sitemapEnabled !== undefined ? seoSettings.sitemapEnabled : true
      });
      
      // If there's a social image URL, create a mock media object for the modal
      if (seoSettings.defaultSocialImage) {
        setSelectedSocialImage({
          _id: 'temp-id',
          url: seoSettings.defaultSocialImage,
          name: 'Social Image',
          type: 'image/jpeg'
        });
      }
    }
  }, [seoSettings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialImageSelect = (selectedMedia) => {
    if (selectedMedia && selectedMedia.length > 0) {
      const mediaItem = selectedMedia[0];
      setSelectedSocialImage(mediaItem);
      setFormData(prev => ({
        ...prev,
        defaultSocialImage: mediaItem.url
      }));
    }
    setIsMediaLibraryOpen(false);
  };

  const handleRemoveSocialImage = () => {
    setSelectedSocialImage(null);
    setFormData(prev => ({
      ...prev,
      defaultSocialImage: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateSeoSettingsMutation.mutateAsync(formData);
      setNotification({
        show: true,
        type: 'success',
        message: 'SEO settings updated successfully!'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 3000);
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: error.error || 'Failed to update SEO settings'
      });
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">SEO Settings</h1>
          <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
            Optimize your website for search engines
          </p>
        </div>
        <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-1/4"></div>
            <div className="h-10 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
            <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-1/3"></div>
            <div className="h-20 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">SEO Settings</h1>
          <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
            Optimize your website for search engines
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error loading SEO settings: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">SEO Settings</h1>
        <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
          Optimize your website for search engines
        </p>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`p-4 rounded-lg ${
          notification.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <p className={`${
            notification.type === 'success' 
              ? 'text-green-800 dark:text-green-200' 
              : 'text-red-800 dark:text-red-200'
          }`}>
            {notification.message}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg">
        <div className="p-6 space-y-6">
          {/* Global SEO Settings */}
          <section>
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Global SEO Settings</h3>
            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                  Default Meta Title
                </label>
                <input
                  type="text"
                  value={formData.defaultMetaTitle}
                  onChange={(e) => handleInputChange('defaultMetaTitle', e.target.value)}
                  className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                  placeholder="Your website name | Tagline"
                />
                <p className="mt-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">
                  {formData.defaultMetaTitle.length}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                  Default Meta Description
                </label>
                <textarea
                  rows={3}
                  value={formData.defaultMetaDescription}
                  onChange={(e) => handleInputChange('defaultMetaDescription', e.target.value)}
                  className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                  placeholder="Brief description of your website (150-160 characters recommended)"
                />
                <p className="mt-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">
                  {formData.defaultMetaDescription.length}/160 characters
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-admin-slate-200 dark:border-admin-slate-700 my-8"></div>

          {/* Social Media SEO */}
          <section>
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Social Media Preview</h3>
            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                  Default Social Image
                </label>
                <div className="mt-2 flex items-center space-x-6">
                  {selectedSocialImage ? (
                    <div className="relative">
                      <img 
                        src={selectedSocialImage.url} 
                        alt="Social preview" 
                        className="h-32 w-32 rounded-lg object-cover border border-admin-slate-300 dark:border-admin-slate-600"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveSocialImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="h-32 w-32 rounded-lg border-2 border-dashed border-admin-slate-300 dark:border-admin-slate-600 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setIsMediaLibraryOpen(true)}
                        className="text-admin-slate-600 dark:text-admin-slate-400 py-3 px-4"
                      >
                        Upload Image
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => setIsMediaLibraryOpen(true)}
                      className="inline-flex items-center px-4 py-2.5 border border-admin-slate-300 dark:border-admin-slate-600 text-sm font-medium rounded-lg text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Select Media
                    </button>
                    <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400 mt-2">
                      Recommended size: 1200x630 pixels
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-admin-slate-200 dark:border-admin-slate-700 my-8"></div>

          {/* Advanced Settings */}
          <section>
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Advanced Settings</h3>
            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                  Robots.txt Content
                </label>
                <textarea
                  rows={4}
                  value={formData.robotsTxt}
                  onChange={(e) => handleInputChange('robotsTxt', e.target.value)}
                  className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4 font-mono"
                  placeholder="User-agent: *&#10;Allow: /"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sitemapEnabled"
                  checked={formData.sitemapEnabled}
                  onChange={(e) => handleInputChange('sitemapEnabled', e.target.checked)}
                  className="h-4 w-4 text-admin-ucla-600 focus:ring-admin-ucla-500 border-admin-slate-300 rounded"
                />
                <label htmlFor="sitemapEnabled" className="ml-2 block text-sm text-admin-slate-700 dark:text-admin-slate-300">
                  Enable XML Sitemap Generation
                </label>
              </div>
            </div>
          </section>

          <div className="border-t border-admin-slate-200 dark:border-admin-slate-700 my-8"></div>

          {/* Sitemap Settings */}
          <section>
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Sitemap Settings</h3>
            <div className="mt-4">
              <div className="bg-admin-slate-50 dark:bg-admin-slate-900/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">XML Sitemap</p>
                    <p className="text-sm text-admin-slate-600 dark:text-admin-slate-400">
                      Your sitemap is automatically generated and updated
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-admin-slate-300 shadow-sm text-sm leading-4 font-medium rounded-md text-admin-slate-700 bg-white hover:bg-admin-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500 dark:bg-admin-slate-800 dark:text-admin-slate-200 dark:border-admin-slate-600 dark:hover:bg-admin-slate-700"
                  >
                    View Sitemap
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={updateSeoSettingsMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-admin-ucla-600 hover:bg-admin-ucla-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateSeoSettingsMutation.isPending ? 'Saving...' : 'Save SEO Settings'}
            </button>
          </div>
        </div>
      </form>

      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={handleSocialImageSelect}
        maxSelect={1}
        currentSelections={selectedSocialImage ? [selectedSocialImage] : []}
      />
    </div>
  );
};

export default SeoSettingsPage;