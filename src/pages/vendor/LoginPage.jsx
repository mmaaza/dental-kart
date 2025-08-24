import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const VendorLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [adminLoginMode, setAdminLoginMode] = useState(false);

  // Check if user is admin and got here via admin login flow
  useEffect(() => {
    // Check if user is admin and this is an admin login attempt
    if (currentUser?.role === 'admin' && location.state?.adminLoginAsVendor) {
      setAdminLoginMode(true);
      
      // If vendor email was provided in state, auto-fill it
      if (location.state?.vendorEmail) {
        setFormData(prev => ({
          ...prev,
          email: location.state.vendorEmail
        }));
      }
    }
  }, [currentUser, location.state]);

  // Show error message from route state if exists (e.g., inactive account redirect)
  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      setLoading(true);
      
      // Input validation
      if (!formData.email || (!formData.password && !adminLoginMode)) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      let response;
      
      if (adminLoginMode && currentUser?.role === 'admin') {
        // Admin login as vendor without password
        response = await api.post('/vendors/admin-login', { 
          email: formData.email,
          adminId: currentUser.id
        });
      } else {
        // Normal vendor login
        response = await api.post('/vendors/login', formData);
      }
      
      if (response.data?.token) {
        localStorage.setItem('vendorToken', response.data.token);
        localStorage.setItem('vendorData', JSON.stringify(response.data.data));
        
        // Set flag if this is admin logging in as vendor
        if (adminLoginMode) {
          localStorage.setItem('adminLoginAsVendor', 'true');
        }
        
        // Clear any existing error messages
        if (location.state?.error) {
          navigate(location.pathname, { replace: true, state: {} });
        }
        
        setSuccessMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/vendor/dashboard');
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      
      // Handle specific error cases
      if (error.response?.data?.error?.includes('not active')) {
        setError(
          <div>
            <p className="font-medium">Your account is currently inactive.</p>
            <p className="mt-1 text-sm">Please contact our support team at{' '}
              <a href="mailto:support@medicalbazzar.com" className="text-primary-600 hover:text-primary-500">
                support@medicalbazzar.com
              </a>
              {' '}for assistance.
            </p>
          </div>
        );
      } else if (errorMessage.includes('Invalid credentials')) {
        setError('Invalid email or password');
      } else if (error.response?.status === 429) {
        setError('Too many login attempts. Please try again later.');
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network.');
      } else {
        setError('Unable to log in. Please try again later.');
      }
      
      console.error('Login error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          {adminLoginMode ? 'Admin Access to Vendor Account' : 'Vendor Login'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {adminLoginMode 
            ? 'Access vendor dashboard with admin privileges' 
            : 'Access your Dental Kart Nepal vendor dashboard'
          }
        </p>
        {adminLoginMode && (
          <div className="mt-2 text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Admin Mode
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            {!adminLoginMode && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-red-800">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {!adminLoginMode && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="/vendor/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot your password?
                  </a>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : (adminLoginMode ? 'Access Vendor Account' : 'Sign in')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Need help?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Contact Dental Kart Nepal support at{' '}
                <a href="mailto:support@medicalbazzar.com" className="font-medium text-primary-600 hover:text-primary-500">
                  support@medicalbazzar.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLoginPage;