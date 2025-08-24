import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useLoading } from '../../contexts/LoadingContext';

const FormField = ({ label, name, type = "text", value, onChange, placeholder, required = true, error }) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`block w-full rounded-lg px-4 py-2.5 text-admin-slate-900 dark:text-admin-slate-100 shadow-sm ring-1 ring-inset placeholder:text-admin-slate-400 dark:placeholder:text-admin-slate-500 focus:ring-2 focus:ring-inset focus:ring-admin-ucla-500 sm:text-sm sm:leading-6 transition duration-200 ease-in-out ${
        error 
          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10 ring-red-300 dark:ring-red-600'
          : 'border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 ring-admin-slate-300 dark:ring-admin-slate-700 hover:border-admin-slate-400'
      }`}
      placeholder={placeholder}
    />
    {error && (
      <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

const FileUploadField = ({ label, name, value, onChange, accept = ".pdf,.doc,.docx,image/*", required = true, error }) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onChange({ target: { name, value: file } });
    }
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`px-3 py-2 text-sm font-medium text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 border rounded-md shadow-sm hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 focus:outline-none focus:ring-2 focus:ring-admin-ucla-500 focus:ring-offset-2 dark:focus:ring-offset-admin-slate-800 transition duration-200 ${
            error 
              ? 'border-red-300 dark:border-red-600' 
              : 'border-admin-slate-300 dark:border-admin-slate-700'
          }`}
        >
          Choose File
        </button>
        <span className="text-sm text-admin-slate-500 dark:text-admin-slate-400 flex-1">
          {fileName || 'No file chosen'}
        </span>
        <input
          type="file"
          ref={fileInputRef}
          id={name}
          name={name}
          onChange={handleFileChange}
          accept={accept}
          required={required}
          className="hidden"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

const CreateVendorPage = () => {
  const navigate = useNavigate();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    primaryPhone: '',
    secondaryPhone: '',
    city: '',
    address: '',
    companyRegistrationCertificate: '',
    vatNumber: '',
    status: 'pending'
  });

  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) newErrors.name = 'Business name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.primaryPhone.trim()) newErrors.primaryPhone = 'Primary phone is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.vatNumber.trim()) newErrors.vatNumber = 'VAT number is required';
    if (!formData.companyRegistrationCertificate) newErrors.companyRegistrationCertificate = 'Company registration certificate is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Phone validation
    if (formData.primaryPhone) {
      const cleanPhone = formData.primaryPhone.replace(/[\s-]/g, '');
      if (!/^\+977[0-9]{10}$/.test(cleanPhone)) {
        newErrors.primaryPhone = 'Please enter a valid phone number (should be 10 digits after +977)';
      }
    }

    // Secondary phone validation (if provided)
    if (formData.secondaryPhone.trim()) {
      const cleanSecondaryPhone = formData.secondaryPhone.replace(/[\s-]/g, '');
      if (!/^\+977[0-9]{10}$/.test(cleanSecondaryPhone)) {
        newErrors.secondaryPhone = 'Please enter a valid secondary phone number (should be 10 digits after +977)';
      }
    }

    // VAT number validation
    if (formData.vatNumber && !/^[0-9]{9}$/.test(formData.vatNumber)) {
      newErrors.vatNumber = 'VAT number must be exactly 9 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Auto-format phone numbers with +977 prefix
    if (name === 'primaryPhone' || name === 'secondaryPhone') {
      // Remove all non-digit characters except +
      const cleanValue = value.replace(/[^\d+]/g, '');
      
      // If user starts typing a number without +977, add it automatically
      if (cleanValue && !cleanValue.startsWith('+977') && cleanValue.match(/^\d/)) {
        processedValue = '+977-' + cleanValue;
      }
      // If user types +977 followed by digits, format it nicely
      else if (cleanValue.startsWith('+977') && cleanValue.length > 4) {
        const phoneDigits = cleanValue.substring(4);
        processedValue = '+977-' + phoneDigits;
      }
      // If it's just +977 or less, keep as is
      else if (cleanValue.startsWith('+977') || cleanValue.startsWith('+') || cleanValue === '') {
        processedValue = cleanValue;
      }
      // If it starts with 977 (without +), add the +
      else if (cleanValue.startsWith('977') && cleanValue.length > 3) {
        const phoneDigits = cleanValue.substring(3);
        processedValue = '+977-' + phoneDigits;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      startLoading();
      
      // Create a clean copy of form data
      const dataToSend = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        primaryPhone: formData.primaryPhone.trim(),
        secondaryPhone: formData.secondaryPhone ? formData.secondaryPhone.trim() : '',
        city: formData.city.trim(),
        address: formData.address ? formData.address.trim() : '',
        vatNumber: formData.vatNumber.trim()
      };
      
      // Handle file upload if exists
      if (formData.companyRegistrationCertificate instanceof File) {
        console.log('Uploading file:', formData.companyRegistrationCertificate.name);
        
        const fileFormData = new FormData();
        fileFormData.append('files', formData.companyRegistrationCertificate);
        
        // Upload file first
        const mediaResponse = await api.post('/media/upload', fileFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
            console.log('Upload progress:', progress + '%');
          },
        });

        console.log('Media upload response:', mediaResponse.data);

        // Get the uploaded file URL
        if (mediaResponse.data?.success && mediaResponse.data?.data?.[0]?.url) {
          dataToSend.companyRegistrationCertificate = mediaResponse.data.data[0].url;
          console.log('File uploaded successfully:', dataToSend.companyRegistrationCertificate);
        } else {
          throw new Error('Failed to upload company registration certificate');
        }
      }

      console.log('Sending vendor data:', dataToSend);

      // Send the vendor creation request
      const response = await api.post('/vendors', dataToSend);
      
      console.log('Vendor creation response:', response.data);

      if (response.data?.success) {
        toast.success(response.data.message || 'Vendor created successfully');
        navigate('/admin/vendors'); // Redirect to vendors list
      } else {
        throw new Error(response.data?.error || 'Failed to create vendor');
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
      
      // Handle different types of errors
      let errorMessage = 'Error creating vendor';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      stopLoading();
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-admin-slate-800 to-admin-slate-700 dark:from-admin-slate-900 dark:to-admin-slate-800 p-8">
        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/vendors')}
              className="p-2 text-admin-slate-300 hover:text-white transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Create New Vendor</h1>
              <p className="mt-1 text-sm text-admin-slate-200">
                Add a new vendor to the platform
              </p>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-admin-ucla-500/20 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FormField
                label="Business Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter business name"
                error={errors.name}
              />
            </div>
            
            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter business email"
              error={errors.email}
            />
            
            <FormField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password for vendor account"
              error={errors.password}
            />
            
            <FormField
              label="VAT Number"
              name="vatNumber"
              value={formData.vatNumber}
              onChange={handleChange}
              placeholder="9-digit VAT number"
              error={errors.vatNumber}
            />
            
            <FormField
              label="Primary Phone"
              name="primaryPhone"
              value={formData.primaryPhone}
              onChange={handleChange}
              placeholder="Start typing numbers (e.g., 9841234567)"
              error={errors.primaryPhone}
            />
            
            <FormField
              label="Secondary Phone"
              name="secondaryPhone"
              value={formData.secondaryPhone}
              onChange={handleChange}
              placeholder="Start typing numbers (e.g., 9841234567)"
              required={false}
              error={errors.secondaryPhone}
            />
            
            <FormField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
              error={errors.city}
            />
          </div>
          
          <FormField
            label="Address (Optional)"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter complete address"
            required={false}
            error={errors.address}
          />
          
          <FileUploadField
            label="Company Registration Certificate"
            name="companyRegistrationCertificate"
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png"
            error={errors.companyRegistrationCertificate}
          />
          
          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
                  Uploading file...
                </span>
                <span className="text-sm text-admin-slate-500 dark:text-admin-slate-400">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-admin-slate-200 dark:bg-admin-slate-700 rounded-full h-2">
                <div 
                  className="bg-admin-ucla-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-admin-slate-200 dark:border-admin-slate-700">
            <button
              type="button"
              onClick={() => navigate('/admin/vendors')}
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 border border-admin-slate-300 dark:border-admin-slate-700 rounded-lg shadow-sm hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 focus:outline-none focus:ring-2 focus:ring-admin-ucla-500 focus:ring-offset-2 dark:focus:ring-offset-admin-slate-800 disabled:opacity-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-admin-ucla-500 hover:bg-admin-ucla-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-admin-ucla-500 focus:ring-offset-2 dark:focus:ring-offset-admin-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors duration-200"
            >
              {isLoading && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              )}
              <span>{isLoading ? 'Creating...' : 'Create Vendor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVendorPage;
