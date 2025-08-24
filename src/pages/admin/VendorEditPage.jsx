import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useLoading } from '../../contexts/LoadingContext';

const FormField = ({ label, name, type = "text", value, onChange, placeholder, required = true }) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="block w-full rounded-lg border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition duration-200 ease-in-out hover:border-gray-400"
      placeholder={placeholder}
    />
  </div>
);

const FileUploadField = ({ label, name, value, onChange, accept = ".pdf,.doc,.docx,image/*", required = true }) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (typeof value === 'string' && value) {
      setPreviewUrl(value);
      setFileName(value.split('/').pop());
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onChange({ target: { name, value: file } });

      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Choose File
          </button>
          <span className="text-sm text-gray-500">{fileName || 'No file chosen'}</span>
          <input
            type="file"
            ref={fileInputRef}
            id={name}
            name={name}
            onChange={handleFileChange}
            accept={accept}
            required={required && !previewUrl}
            className="hidden"
          />
        </div>
        {previewUrl && (
          <div className="relative">
            {previewUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="h-32 w-auto object-cover rounded-lg"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Current file: {fileName}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CityDropdown = ({ name, value, onChange, required = true }) => {
  const cities = [
    "Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Biratnagar", 
    "Birgunj", "Dharan", "Itahari", "Janakpur", "Hetauda", 
    "Nepalgunj", "Butwal", "Dhangadhi", "Bharatpur", "Tulsipur"
  ];
  
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        City
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="block w-full rounded-lg border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition duration-200 ease-in-out hover:border-gray-400"
      >
        <option value="">Select a city</option>
        {cities.map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  );
};

const VendorEditPage = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    primaryPhone: '',
    secondaryPhone: '',
    city: '',
    companyRegistrationCertificate: '',
    vatNumber: '',
    status: 'pending'
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendorId) return;

      try {
        startLoading();
        const response = await api.get(`/vendors/${vendorId}`);
        if (response.data?.success) {
          const vendor = response.data.data;
          setFormData({
            name: vendor.name || '',
            email: vendor.email || '',
            primaryPhone: vendor.primaryPhone || '',
            secondaryPhone: vendor.secondaryPhone || '',
            city: vendor.city || '',
            companyRegistrationCertificate: vendor.companyRegistrationCertificate || '',
            vatNumber: vendor.vatNumber || '',
            status: vendor.status || 'pending'
          });
        } else {
          toast.error('Failed to load vendor data');
          navigate('/admin/vendors');
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error);
        toast.error(error.response?.data?.error || 'Error fetching vendor data');
        navigate('/admin/vendors');
      } finally {
        stopLoading();
      }
    };

    fetchVendorData();
  }, [vendorId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      startLoading();
      const formDataToSend = new FormData();
      
      if (formData.companyRegistrationCertificate instanceof File) {
        const fileFormData = new FormData();
        fileFormData.append('files', formData.companyRegistrationCertificate);
        
        const mediaResponse = await api.post('/media/upload', fileFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          },
        });

        if (mediaResponse.data?.data?.[0]?.url) {
          if (formData.companyRegistrationCertificate && typeof formData.companyRegistrationCertificate === 'string') {
            const oldMediaId = formData.companyRegistrationCertificate.split('/').pop().split('_')[0];
            if (oldMediaId) {
              try {
                await api.delete(`/media/${oldMediaId}`);
              } catch (error) {
                console.error('Error deleting old file:', error);
              }
            }
          }

          formDataToSend.set('companyRegistrationCertificate', mediaResponse.data.data[0].url);
        }
      } else {
        formDataToSend.set('companyRegistrationCertificate', formData.companyRegistrationCertificate || '');
      }

      Object.keys(formData).forEach(key => {
        if (key !== 'companyRegistrationCertificate') {
          formDataToSend.set(key, formData[key]);
        }
      });

      const response = await api.put(`/vendors/${vendorId}`, Object.fromEntries(formDataToSend));
      
      if (response.data?.success) {
        toast.success('Vendor updated successfully');
        navigate(`/admin/vendors/${vendorId}`);
      } else {
        throw new Error(response.data?.error || 'Failed to update vendor');
      }
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast.error(error.response?.data?.error || error.message || 'Error updating vendor');
    } finally {
      stopLoading();
      setUploadProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
            </div>
            <div className="mt-1 h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>

        <div className="bg-white shadow-mobile rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="h-6 w-40 bg-gray-200 rounded"></div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-10 w-full bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <div className="flex items-center">
            <Link
              to={`/admin/vendors/${vendorId}`}
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Vendor</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Update vendor information and account details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow-mobile rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
                <p className="text-sm text-gray-500">Select the appropriate status for this vendor account</p>
              </div>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({
                    ...formData,
                    status: e.target.value
                  })}
                  className={`rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 border focus:ring-primary-500 focus:border-primary-500 ${
                    formData.status === 'active' 
                      ? 'bg-green-50 text-green-700' 
                      : formData.status === 'pending' 
                        ? 'bg-yellow-50 text-yellow-700' 
                        : 'bg-red-50 text-red-700'
                  }`}
                >
                  <option value="pending" className="bg-white text-yellow-700">Pending</option>
                  <option value="active" className="bg-white text-green-700">Active</option>
                  <option value="suspended" className="bg-white text-red-700">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-mobile rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Business Details
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter vendor name"
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-mobile rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Primary Phone"
                name="primaryPhone"
                type="tel"
                value={formData.primaryPhone}
                onChange={handleChange}
                placeholder="Enter primary phone number"
              />
              <FormField
                label="Secondary Phone (Optional)"
                name="secondaryPhone"
                type="tel"
                value={formData.secondaryPhone}
                onChange={handleChange}
                placeholder="Enter secondary phone number"
                required={false}
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-mobile rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Location
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CityDropdown
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-mobile rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Legal Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploadField
                label="Company Registration Certificate"
                name="companyRegistrationCertificate"
                value={formData.companyRegistrationCertificate}
                onChange={handleChange}
                accept=".pdf,.doc,.docx,image/*"
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary-500 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
                </div>
              )}
              <FormField
                label="VAT Number"
                name="vatNumber"
                value={formData.vatNumber}
                onChange={handleChange}
                placeholder="Enter VAT number"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={() => navigate(`/admin/vendors/${vendorId}`)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating...
              </>
            ) : (
              'Update Vendor'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorEditPage;