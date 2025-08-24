import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const ContactSettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contactData, setContactData] = useState({
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    province: '',
    weekdaysHours: '',
    weekendsHours: ''
  });

  useEffect(() => {
    fetchContactSettings();
  }, []);

  const fetchContactSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings/contact');
      if (response.data.success) {
        setContactData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching contact settings:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load contact settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setContactData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!contactData.email || !contactData.phone) {
      toast.error('Email and phone number are required');
      return;
    }

    try {
      setSaving(true);
      const response = await api.post('/admin/settings/contact', contactData);
      
      if (response.data.success) {
        toast.success('Contact settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving contact settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save contact settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-ucla-500"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">Contact Information</h1>
        <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
          Manage your business contact details and locations
        </p>
      </div>

      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg">
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Primary Contact Information */}
          <section>
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Primary Contact</h3>
            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                  Business Email *
                </label>
                <input
                  type="email"
                  required
                  value={contactData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                  placeholder="info@medicalbazzar.com.np"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={contactData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                  placeholder="+977 980-123-4567"
                />
              </div>
            </div>
          </section>

          <div className="border-t border-admin-slate-200 dark:border-admin-slate-700 my-8"></div>

          {/* Physical Address */}
          <section>
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Business Address</h3>
            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={contactData.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                  placeholder="Kathmandu Medical College Road"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={contactData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                    placeholder="Kathmandu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                    Province/State
                  </label>
                  <input
                    type="text"
                    value={contactData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                    placeholder="Bagmati Province"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-admin-slate-200 dark:border-admin-slate-700 my-8"></div>

          {/* Business Hours */}
          <section>
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Business Hours</h3>
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                    Weekdays
                  </label>
                  <input
                    type="text"
                    value={contactData.weekdaysHours}
                    onChange={(e) => handleInputChange('weekdaysHours', e.target.value)}
                    className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                    placeholder="9:00 AM - 5:00 PM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                    Weekends
                  </label>
                  <input
                    type="text"
                    value={contactData.weekendsHours}
                    onChange={(e) => handleInputChange('weekendsHours', e.target.value)}
                    className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                    placeholder="Closed"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="border-t border-admin-slate-200 dark:border-admin-slate-700 pt-6">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-admin-ucla-500 hover:bg-admin-ucla-600 text-white font-medium py-2 px-6 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Contact Settings'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactSettingsPage;