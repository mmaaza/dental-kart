import { useState, useEffect } from 'react';
import api from '../services/api';

export const useContactSettings = () => {
  const [contactSettings, setContactSettings] = useState({
    email: 'info@medicalbazzar.com.np',
    phone: '+977 980-123-4567',
    streetAddress: 'Kathmandu Medical College Road',
    city: 'Kathmandu',
    province: 'Bagmati Province',
    weekdaysHours: '9:00 AM - 5:00 PM',
    weekendsHours: 'Closed'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContactSettings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/settings/contact');
        if (response.data.success) {
          setContactSettings(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching contact settings:', error);
        // Keep default values if API fails
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactSettings();
  }, []);

  return { contactSettings, loading, error };
};
