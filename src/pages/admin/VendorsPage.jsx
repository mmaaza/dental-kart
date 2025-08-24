import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';

// Skeleton loader component for vendors table
const VendorSkeletonLoader = () => (
  <tr>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="w-full">
          <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-3/4 mb-2 animate-pulse"></div>
          <div className="h-3 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-3/4 mb-2 animate-pulse"></div>
      <div className="h-3 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-1/2 animate-pulse"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-5 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-20 animate-pulse"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-24 animate-pulse"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right">
      <div className="flex justify-end space-x-3">
        <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-24 animate-pulse"></div>
        <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-16 animate-pulse"></div>
        <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-24 animate-pulse"></div>
      </div>
    </td>
  </tr>
);

const VendorsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [vendors, setVendors] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [loginAsVendorLoading, setLoginAsVendorLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchVendors = async () => {
    try {
      startLoading();
      const response = await api.get('/vendors');
      setVendors(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error(error.response?.data?.error || 'Error fetching vendors');
      setVendors([]);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleLoginAsVendor = async (vendor) => {
    try {
      setLoginAsVendorLoading(true);
      
      navigate('/vendor/login', {
        state: {
          adminLoginAsVendor: true,
          vendorEmail: vendor.email
        }
      });
    } catch (error) {
      console.error('Error logging in as vendor:', error);
      toast.error('Failed to access vendor account');
    } finally {
      setLoginAsVendorLoading(false);
    }
  };

  // Function to handle vendor status toggle
  const handleStatusToggle = async (vendorId, currentStatus) => {
    try {
      setStatusUpdateLoading(true);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const response = await api.put(`/vendors/${vendorId}`, { status: newStatus });
      
      if (response.data?.success) {
        toast.success(`Vendor ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        fetchVendors(); // Refresh the vendors list
      } else {
        throw new Error(response.data?.error || 'Failed to update vendor status');
      }
    } catch (error) {
      console.error('Error updating vendor status:', error);
      toast.error(error.response?.data?.error || error.message || 'Error updating vendor status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Function to open edit form with selected vendor data
  const openEditForm = (vendor) => {
    setSelectedVendor(vendor);
    setShowEditForm(true);
  };

  // Function to handle edit form submission
  const handleEditSubmit = async (formData) => {
    try {
      startLoading();
      const formDataToSend = new FormData();
      
      // Handle file upload first if there's a new file
      if (formData.companyRegistrationCertificate instanceof File) {
        const fileFormData = new FormData();
        fileFormData.append('files', formData.companyRegistrationCertificate);
        
        // Upload file
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
          formDataToSend.set('companyRegistrationCertificate', mediaResponse.data.data[0].url);
        }
      }

      // Create update data object
      const updateData = {
        ...formData,
        companyRegistrationCertificate: formData.companyRegistrationCertificate instanceof File 
          ? formDataToSend.get('companyRegistrationCertificate') 
          : formData.companyRegistrationCertificate
      };

      const response = await api.put(`/vendors/${selectedVendor._id}`, updateData);
      
      if (response.data?.success) {
        toast.success('Vendor updated successfully');
        setShowEditForm(false);
        setSelectedVendor(null);
        fetchVendors();
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-admin-green-100 dark:bg-admin-green-900/30 text-admin-green-800 dark:text-admin-green-400';
      case 'pending':
        return 'bg-admin-yellow-100 dark:bg-admin-yellow-900/30 text-admin-yellow-800 dark:text-admin-yellow-400';
      case 'suspended':
        return 'bg-admin-red-100 dark:bg-admin-red-900/30 text-admin-red-800 dark:text-admin-red-400';
      case 'rejected':
        return 'bg-admin-slate-100 dark:bg-admin-slate-700/50 text-admin-slate-800 dark:text-admin-slate-300';
      default:
        return 'bg-admin-slate-100 dark:bg-admin-slate-700/50 text-admin-slate-800 dark:text-admin-slate-300';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-admin-green-100 dark:bg-admin-green-900/30 text-admin-green-800 dark:text-admin-green-400';
      case 'pending':
        return 'bg-admin-yellow-100 dark:bg-admin-yellow-900/30 text-admin-yellow-800 dark:text-admin-yellow-400';
      case 'failed':
        return 'bg-admin-red-100 dark:bg-admin-red-900/30 text-admin-red-800 dark:text-admin-red-400';
      default:
        return 'bg-admin-slate-100 dark:bg-admin-slate-700/50 text-admin-slate-800 dark:text-admin-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-admin-slate-800 to-admin-slate-700 dark:from-admin-slate-900 dark:to-admin-slate-800 p-8">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white">Vendors</h1>
          <p className="mt-1 text-sm text-admin-slate-200">
            Manage and track all vendors
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-admin-ucla-500/20 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border-admin-slate-200 dark:border-admin-slate-700 pl-10 pr-3 py-2 text-sm placeholder-admin-slate-500 dark:placeholder-admin-slate-400 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 focus:border-admin-ucla-500 focus:ring-admin-ucla-500"
            placeholder="Search vendors..."
          />
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/admin/vendors/create')}
            className="px-4 py-2 bg-admin-ucla-500 hover:bg-admin-ucla-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add New Vendor</span>
          </button>
          <button className="px-4 py-2 bg-admin-slate-500 hover:bg-admin-slate-600 text-white rounded-lg text-sm font-medium transition-colors duration-200">
            Export
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
          <thead className="bg-admin-slate-50 dark:bg-admin-slate-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">Business</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">VAT</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-admin-slate-800 divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
            {isLoading ? (
              Array(5).fill(0).map((_, index) => (
                <VendorSkeletonLoader key={index} />
              ))
            ) : vendors.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-admin-slate-500 dark:text-admin-slate-400">
                  No vendors found. Click "Add New Vendor" to create one.
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr key={vendor._id} className="hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">{vendor.name}</div>
                        <div className="text-sm text-admin-slate-500 dark:text-admin-slate-400">{vendor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-admin-slate-900 dark:text-admin-slate-100">{vendor.primaryPhone}</div>
                    <div className="text-sm text-admin-slate-500 dark:text-admin-slate-400">{vendor.city}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(vendor.status)}`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-slate-500 dark:text-admin-slate-400">
                    {vendor.vatNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-admin-ucla-600 hover:text-admin-ucla-700 dark:text-admin-ucla-400 dark:hover:text-admin-ucla-300 transition-colors duration-200 mr-3"
                      onClick={() => handleLoginAsVendor(vendor)}
                      disabled={loginAsVendorLoading}
                    >
                      {loginAsVendorLoading ? 'Accessing...' : 'Login as Vendor'}
                    </button>
                    <button 
                      className="text-admin-slate-500 hover:text-admin-slate-600 dark:text-admin-slate-400 dark:hover:text-admin-slate-300 transition-colors duration-200 mr-3"
                      onClick={() => openEditForm(vendor)}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-admin-ucla-600 hover:text-admin-ucla-700 dark:text-admin-ucla-400 dark:hover:text-admin-ucla-300 transition-colors duration-200"
                      onClick={() => navigate(`/admin/vendors/${vendor._id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center">
          <p className="text-sm text-admin-slate-700 dark:text-admin-slate-400">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{vendors.length}</span> of{' '}
            <span className="font-medium">{vendors.length}</span> results
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="inline-flex items-center px-3 py-2 border border-admin-slate-200 dark:border-admin-slate-700 text-sm font-medium rounded-lg text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 transition-colors duration-200">
            Previous
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-admin-slate-200 dark:border-admin-slate-700 text-sm font-medium rounded-lg text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 transition-colors duration-200">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorsPage;