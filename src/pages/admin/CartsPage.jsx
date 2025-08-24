import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useLoading } from '../../contexts/LoadingContext';

const CartsPage = () => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [carts, setCarts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [selectedCart, setSelectedCart] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchCarts();
  }, [pagination.currentPage]);

  const fetchCarts = async () => {
    try {
      startLoading();
      const response = await api.get('/cart/admin/all', {
        params: {
          page: pagination.currentPage,
          limit: 10
        }
      });
      setCarts(response.data.data.carts);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching carts:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch carts');
    } finally {
      stopLoading();
    }
  };

  const handleViewCart = async (userId) => {
    try {
      startLoading();
      const response = await api.get(`/cart/admin/${userId}`);
      setSelectedCart(response.data.data);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error fetching cart details:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch cart details');
    } finally {
      stopLoading();
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedCart(null);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatPrice = (price) => {
    return price?.toLocaleString('en-IN', { 
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  const getCartTotal = (cart) => {
    return cart.items.reduce((total, item) => {
      // Check if item and item.product exist before accessing properties
      if (!item || !item.product) {
        return total;
      }
      
      const price = item.product.specialOfferPrice || item.product.regularPrice || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">
            User Carts
          </h1>
          <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
            View and Manage Customer Carts
          </p>
        </div>
        <div className="mt-4 sm:mt-0"></div>
      </div>

      {/* Main content */}
      <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-admin-slate-200 dark:border-admin-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">
            Active Shopping Carts
          </h2>
          <div className="text-sm text-admin-slate-500 dark:text-admin-slate-400">
            {pagination.totalItems} total carts
          </div>
        </div>

        {/* Cart list */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-primary-600" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : carts.length === 0 ? (
            <div className="text-center p-8 text-admin-slate-500 dark:text-admin-slate-400">
              No active shopping carts found.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
              <thead className="bg-admin-slate-50 dark:bg-admin-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-admin-slate-800 divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
                {carts.map((cart) => (
                  <tr key={cart._id} className="hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/25 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">
                      <div className="flex flex-col">
                        <span className="font-medium">{cart.user?.name || 'N/A'}</span>
                        <span className="text-xs text-admin-slate-500 dark:text-admin-slate-400">{cart.user?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-slate-900 dark:text-admin-slate-100">
                      <span className="bg-admin-slate-100 dark:bg-admin-slate-700 px-2 py-1 rounded-full text-xs">
                        {cart.items.length} items
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-slate-900 dark:text-admin-slate-100">
                      Rs. {formatPrice(getCartTotal(cart))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-slate-900 dark:text-admin-slate-100">
                      {formatDate(cart.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewCart(cart.user?._id)}
                        className="text-primary-600 hover:text-primary-900 dark:text-admin-ucla-800 dark:hover:text-admin-ucla-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-admin-slate-200 dark:border-admin-slate-700 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-admin-slate-700 dark:text-admin-slate-300">
                Showing page {pagination.currentPage} of {pagination.totalPages}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1 text-sm font-medium rounded-md bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-900 dark:text-admin-slate-100 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 text-sm font-medium rounded-md bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-900 dark:text-admin-slate-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart Details Modal */}
      {isViewModalOpen && selectedCart && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-admin-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            
            {/* Modal content */}
            <div className="inline-block align-bottom bg-white dark:bg-admin-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white dark:bg-admin-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 sm:mt-0 sm:ml-4 text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-admin-slate-900 dark:text-admin-slate-100">
                        Cart Details
                      </h3>
                      <button
                        type="button"
                        className="text-admin-slate-500 dark:text-admin-slate-400 hover:text-admin-slate-700 dark:hover:text-admin-slate-200"
                        onClick={closeViewModal}
                      >
                        <span className="sr-only">Close</span>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Customer info */}
                    <div className="mb-6 p-4 bg-admin-slate-50 dark:bg-admin-slate-700/30 rounded-lg">
                      <h4 className="text-sm font-medium text-admin-slate-500 dark:text-admin-slate-400 mb-2">Customer Information</h4>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mr-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-admin-slate-900 dark:text-admin-slate-100">{selectedCart.user?.name}</p>
                          <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400">{selectedCart.user?.email}</p>
                        </div>
                        <div className="ml-auto">
                          <Link
                            to={`/admin/customers/${selectedCart.user?._id}`}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Cart items */}
                    <div className="border dark:border-admin-slate-700 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-admin-slate-50 dark:bg-admin-slate-700/30 border-b dark:border-admin-slate-700">
                        <h4 className="font-medium text-admin-slate-900 dark:text-admin-slate-100">Cart Items ({selectedCart.items.length})</h4>
                      </div>
                      <div className="divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
                        {selectedCart.items.map((item) => (
                          <div key={item._id} className="p-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-16 h-16 bg-admin-slate-100 dark:bg-admin-slate-700 rounded-md overflow-hidden">
                                {item.product?.images && item.product.images[0] ? (
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.product?.name || 'Product'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-admin-slate-400 dark:text-admin-slate-500">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex justify-between">
                                  <div>
                                    <h5 className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">
                                      {item.product ? (
                                        <Link
                                          to={`/admin/products/${item.product._id}`}
                                          className="hover:text-primary-600 dark:hover:text-primary-400"
                                        >
                                          {item.product.name || 'Product not found'}
                                        </Link>
                                      ) : (
                                        <span className="text-admin-slate-500 dark:text-admin-slate-400">Product not found</span>
                                      )}
                                    </h5>
                                    {item.attributes && Object.keys(item.attributes).length > 0 && (
                                      <div className="mt-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">
                                        {Object.entries(item.attributes).map(([key, value], i) => (
                                          <span key={key}>
                                            {i > 0 && ', '}
                                            {key}: {value}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">
                                      Rs. {formatPrice(((item.product?.specialOfferPrice || item.product?.regularPrice || 0) * item.quantity))}
                                    </p>
                                    <p className="text-xs text-admin-slate-500 dark:text-admin-slate-400">
                                      {item.quantity} × Rs. {formatPrice(item.product?.specialOfferPrice || item.product?.regularPrice || 0)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-3 bg-admin-slate-50 dark:bg-admin-slate-700/30 border-t dark:border-admin-slate-700">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-admin-slate-900 dark:text-admin-slate-100">Total</span>
                          <span className="font-medium text-admin-slate-900 dark:text-admin-slate-100">
                            Rs. {formatPrice(getCartTotal(selectedCart))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cart last updated */}
                    <div className="mt-4 text-right text-xs text-admin-slate-500 dark:text-admin-slate-400">
                      Last updated: {formatDate(selectedCart.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-admin-slate-50 dark:bg-admin-slate-700/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-admin-slate-600 dark:bg-admin-slate-700 text-base font-medium text-white hover:bg-admin-slate-700 dark:hover:bg-admin-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-slate-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartsPage;
