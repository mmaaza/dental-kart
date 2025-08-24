import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useLoading } from '../../contexts/LoadingContext';

const VendorDetailsPage = () => {
  const { vendorId } = useParams();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('details');

  // Fetch vendor details and products
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        startLoading();
        // Fetch vendor details
        const vendorResponse = await api.get(`/vendors/${vendorId}`);
        if (vendorResponse.data?.success) {
          setVendor(vendorResponse.data.data);
        }

        // Fetch vendor products
        const productsResponse = await api.get(`/products?vendor=${vendorId}`);
        if (productsResponse.data?.success) {
          setProducts(productsResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error);
        toast.error(error.response?.data?.error || 'Error fetching vendor data');
      } finally {
        stopLoading();
      }
    };

    if (vendorId) {
      fetchVendorData();
    }
  }, [vendorId]);

  // For demonstration purposes - mock products if API isn't ready
  useEffect(() => {
    if (!isLoading && products.length === 0 && vendor) {
      // Mock products for development
      const mockProducts = [
        {
          id: 'prod001',
          name: 'Digital Blood Pressure Monitor',
          image: 'https://placehold.co/300x300?text=BP+Monitor',
          category: 'Diagnostic Devices',
          price: 5999,
          stock: 25,
          status: 'active'
        },
        {
          id: 'prod002',
          name: 'Infrared Thermometer',
          image: 'https://placehold.co/300x300?text=Thermometer',
          category: 'Diagnostic Devices',
          price: 1899,
          stock: 42,
          status: 'active'
        },
        {
          id: 'prod003',
          name: 'Disposable Face Masks (50 pcs)',
          image: 'https://placehold.co/300x300?text=Masks',
          category: 'Medical Disposables',
          price: 499,
          stock: 200,
          status: 'active'
        },
        {
          id: 'prod004',
          name: 'Stethoscope',
          image: 'https://placehold.co/300x300?text=Stethoscope',
          category: 'Medical Equipment',
          price: 2499,
          stock: 15,
          status: 'active'
        }
      ];
      setProducts(mockProducts);
    }
  }, [isLoading, products.length, vendor]);

  // Helper function to render status badge
  const renderStatusBadge = (status) => {
    let colorClasses = 'bg-gray-100 text-gray-800';
    
    if (status === 'active') {
      colorClasses = 'bg-green-100 text-green-800';
    } else if (status === 'pending') {
      colorClasses = 'bg-yellow-100 text-yellow-800';
    } else if (status === 'inactive' || status === 'suspended') {
      colorClasses = 'bg-red-100 text-red-800';
    }
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>
        {status}
      </span>
    );
  };

  // Render skeleton loader state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton for Page Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
            </div>
            <div className="mt-1 h-4 w-48 bg-gray-200 rounded"></div>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <div className="h-10 w-28 bg-gray-200 rounded-md"></div>
            <div className="h-10 w-20 bg-gray-200 rounded-md"></div>
          </div>
        </div>

        {/* Skeleton for Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            <div className="border-primary-500 border-b-2 pb-4 px-1">
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="border-transparent border-b-2 pb-4 px-1">
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Skeleton for Vendor Details */}
        <div className="bg-white shadow-mobile rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="h-6 w-40 bg-gray-200 rounded"></div>
          </div>
          
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              {[...Array(6)].map((_, index) => (
                <div key={`detail-${index}`}>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-5 w-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-5 border-t border-b border-gray-200">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
          </div>
          
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              <div className="col-span-1 md:col-span-2">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-5 w-64 bg-gray-200 rounded"></div>
              </div>
              {[...Array(2)].map((_, index) => (
                <div key={`contact-${index}`}>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-5 w-36 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-5 border-t border-gray-200">
            <div className="h-6 w-36 bg-gray-200 rounded"></div>
          </div>
          
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              {[...Array(4)].map((_, index) => (
                <div key={`bank-${index}`}>
                  <div className="h-4 w-28 bg-gray-200 rounded mb-2"></div>
                  <div className="h-5 w-40 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render if vendor not found
  if (!vendor && !isLoading) {
    return (
      <div className="bg-white shadow-mobile rounded-lg p-6 text-center">
        <h2 className="text-xl font-medium text-gray-900 mb-2">Vendor Not Found</h2>
        <p className="text-gray-500 mb-6">The vendor you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link
          to="/admin/vendors"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600"
        >
          Back to Vendors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <div className="flex items-center">
            <Link
              to="/admin/vendors"
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Viewing vendor details and products
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Link
            to={`/admin/vendors/edit/${vendorId}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Edit Vendor
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600"
          >
            Back
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`${
              activeTab === 'details'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Vendor Details
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`${
              activeTab === 'products'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Products ({products.length})
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'details' ? (
        <div className="bg-white shadow-mobile rounded-lg overflow-hidden">
          {/* Vendor Overview */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Vendor Overview</h3>
          </div>
          
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Vendor Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{vendor.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{vendor.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Primary Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{vendor.primaryPhone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Secondary Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{vendor.secondaryPhone || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">City</dt>
                <dd className="mt-1 text-sm text-gray-900">{vendor.city}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">{renderStatusBadge(vendor.status)}</dd>
              </div>
            </dl>
          </div>

          {/* Legal Information */}
          <div className="px-6 py-5 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Legal Information</h3>
          </div>
          
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Company Registration Certificate</dt>
                {vendor.companyRegistrationCertificate ? (
                  <dd className="mt-1 text-sm">
                    <a 
                      href={vendor.companyRegistrationCertificate} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary-500 hover:text-primary-700"
                    >
                      View Certificate
                    </a>
                  </dd>
                ) : (
                  <dd className="mt-1 text-sm text-gray-900">Not uploaded</dd>
                )}
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">VAT Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{vendor.vatNumber || 'Not provided'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500 mb-2">Account Access</dt>
                <dd>
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Allow Vendor Login</p>
                      <p className="text-sm text-gray-500">When disabled, the vendor cannot log in to their account</p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          startLoading();
                          const response = await api.put(`/vendors/${vendorId}`, { 
                            isLoginAllowed: !vendor.isLoginAllowed 
                          });
                          if (response.data?.success) {
                            setVendor({...vendor, isLoginAllowed: !vendor.isLoginAllowed});
                            toast.success(`Vendor login ${!vendor.isLoginAllowed ? 'enabled' : 'disabled'} successfully`);
                          }
                        } catch (error) {
                          toast.error(error.response?.data?.error || 'Failed to update vendor access');
                        } finally {
                          stopLoading();
                        }
                      }}
                      disabled={isLoading}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                        vendor.isLoginAllowed ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    >
                      <span className="sr-only">Allow vendor login</span>
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          vendor.isLoginAllowed ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Products Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Vendor Products</h3>
            <Link
              to="/admin/products/new"
              state={{ vendorId }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Link>
          </div>

          {/* Products List */}
          {products.length === 0 ? (
            <div className="bg-white shadow-mobile rounded-lg p-8 text-center">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
              <p className="mt-1 text-sm text-gray-500">
                This vendor doesn't have any products yet.
              </p>
              <div className="mt-6">
                <Link
                  to="/admin/products/new"
                  state={{ vendorId }}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-mobile rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-lg object-cover" src={product.image} alt={product.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">ID: {product.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Rs.{product.price.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStatusBadge(product.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="text-primary-500 hover:text-primary-600 mr-4"
                          >
                            Edit
                          </Link>
                          <button className="text-secondary-500 hover:text-secondary-600">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorDetailsPage;