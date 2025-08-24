import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrder';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const OrdersPage = () => {
  const { fetchAllOrders, orders, loading } = useOrder();
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (filterStatus) queryParams.status = filterStatus;
      if (filterPayment) queryParams.paymentStatus = filterPayment;
      if (searchQuery) queryParams.search = searchQuery;
      
      const result = await fetchAllOrders(queryParams);
      
      if (result?.pagination) {
        setPagination(prev => ({
          ...prev,
          total: result.pagination.total,
          pages: result.pagination.pages
        }));
      }
      
      setIsLoading(false);
    };
    
    loadOrders();
  }, [fetchAllOrders, pagination.page, pagination.limit, filterStatus, filterPayment, searchQuery]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on new search
  };
  
  const resetFilters = () => {
    setFilterStatus('');
    setFilterPayment('');
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // Helper function to get status badge color based on order status
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'shipped':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400';
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      default:
        return 'bg-admin-slate-100 dark:bg-admin-slate-700/50 text-admin-slate-800 dark:text-admin-slate-300';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      case 'refunded':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      default:
        return 'bg-admin-slate-100 dark:bg-admin-slate-700/50 text-admin-slate-800 dark:text-admin-slate-300';
    }
  };
  
  // Helper to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-admin-slate-800 to-admin-slate-700 dark:from-admin-slate-900 dark:to-admin-slate-800 p-8">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="mt-1 text-sm text-admin-slate-200">
            Manage and track all orders
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-primary-500/20 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
      </div>

      {/* Search and Export */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-xs">
          <form onSubmit={handleSearch}>
            <div className="flex">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border-admin-slate-200 dark:border-admin-slate-700 pl-10 pr-3 py-2 text-sm placeholder-admin-slate-500 dark:placeholder-admin-slate-400 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 focus:border-admin-ucla-500 focus:ring-admin-ucla-500"
                placeholder="Search order number..."
              />
              <button 
                type="submit"
                className="ml-2 px-4 py-2 bg-admin-ucla-500 hover:bg-admin-ucla-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Search
              </button>
            </div>
          </form>
        </div>
        <button className="px-4 py-2 bg-admin-ucla-500 hover:bg-admin-ucla-600 text-white rounded-lg text-sm font-medium transition-colors duration-200">
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-admin-slate-800 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full rounded-lg border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 py-2 pl-3 pr-10 text-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select 
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="block w-full rounded-lg border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 py-2 pl-3 pr-10 text-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500"
          >
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <button
              onClick={resetFilters}
              className="w-full py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex justify-center p-10">
          <LoadingSpinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg p-10 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || filterStatus || filterPayment
              ? 'Try changing your search criteria or filters'
              : 'No orders have been placed yet'}
          </p>
          {(searchQuery || filterStatus || filterPayment) && (
            <button
              onClick={resetFilters}
              className="mt-3 text-sm text-admin-ucla-600 hover:text-admin-ucla-500"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
              <thead className="bg-admin-slate-50 dark:bg-admin-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-admin-slate-800 divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-admin-ucla-100 dark:bg-admin-ucla-500/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-admin-ucla-600 dark:text-admin-ucla-400">
                            {order.user?.name ? order.user.name.charAt(0) : '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">
                            {order.user?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-admin-slate-500 dark:text-admin-slate-400">
                            {order.user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-admin-slate-900 dark:text-admin-slate-100">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">
                        Rs. {order.total.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link 
                        to={`/admin/orders/${order._id}`}
                        className="text-admin-ucla-600 hover:text-admin-ucla-700 dark:text-admin-ucla-400 dark:hover:text-admin-ucla-300"
                      >
                        View & Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && orders.length > 0 && (
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <p className="text-sm text-admin-slate-700 dark:text-admin-slate-400">
              Page {pagination.page} of {pagination.pages || 1}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className={`inline-flex items-center px-3 py-2 border border-admin-slate-200 dark:border-admin-slate-700 text-sm font-medium rounded-lg text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 ${
                pagination.page <= 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Previous
            </button>
            <button 
              onClick={() => handlePageChange(Math.min(pagination.pages || 1, pagination.page + 1))}
              disabled={pagination.page >= (pagination.pages || 1)}
              className={`inline-flex items-center px-3 py-2 border border-admin-slate-200 dark:border-admin-slate-700 text-sm font-medium rounded-lg text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 ${
                pagination.page >= (pagination.pages || 1) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import AdminLayout from '../../components/layout/AdminLayout';

const OrdersPageWithLayout = () => (
  <AdminLayout activeLink="orders">
    <OrdersPage />
  </AdminLayout>
);

export default OrdersPageWithLayout;