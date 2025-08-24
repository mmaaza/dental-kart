import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLoading } from '../../contexts/LoadingContext';

const CustomerRow = ({ customer, isSelected, onSelect }) => {
  return (
    <tr className="hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(customer._id, e.target.checked)}
          className="h-4 w-4 rounded border-admin-slate-300 dark:border-admin-slate-700 text-admin-ucla-600 focus:ring-admin-ucla-500 dark:focus:ring-offset-admin-slate-800"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-admin-ucla-100 dark:bg-admin-ucla-900/30 flex items-center justify-center">
              <span className="text-admin-ucla-600 dark:text-admin-ucla-400 font-medium text-sm">
                {customer.name.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">{customer.name}</div>
            <div className="text-sm text-admin-slate-500 dark:text-admin-slate-400">{customer.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-admin-slate-900 dark:text-admin-slate-100">
          {customer.phone || 'Not provided'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-admin-slate-900 dark:text-admin-slate-100">{customer.totalOrders || 0}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-admin-slate-900 dark:text-admin-slate-100">Rs. {customer.totalSpent || 0}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          customer.status === 'active' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
            : customer.status === 'blocked' 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' 
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
        }`}>
          {customer.status}
        </span>
        {customer.blockReason && (
          <span className="block mt-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">
            Reason: {customer.blockReason}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-slate-500 dark:text-admin-slate-400">
        {customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString() : 'No purchases yet'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-3 justify-end">
          <button className="text-admin-ucla-500 hover:text-admin-ucla-600 dark:text-admin-ucla-400 dark:hover:text-admin-ucla-300 transition-colors duration-200">View Orders</button>
          <button className="text-admin-ucla-500 hover:text-admin-ucla-600 dark:text-admin-ucla-400 dark:hover:text-admin-ucla-300 transition-colors duration-200">Edit</button>
          {customer.status === 'blocked' ? (
            <button
              onClick={() => handleStatusChange(customer._id, 'active')}
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200"
            >
              Unblock
            </button>
          ) : (
            <button
              onClick={() => handleBlock(customer._id, customer.email)}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
            >
              Block
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div className="sm:flex sm:items-center sm:justify-between animate-pulse">
      <div>
        <div className="h-8 w-32 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
        <div className="mt-1 h-4 w-64 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
      </div>
      <div className="mt-4 sm:mt-0">
        <div className="h-10 w-32 bg-admin-slate-200 dark:bg-admin-slate-700 rounded-md"></div>
      </div>
    </div>

    {/* Filters Skeleton */}
    <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-56">
          <div className="h-4 w-24 bg-admin-slate-200 dark:bg-admin-slate-700 rounded mb-2"></div>
          <div className="h-10 w-full bg-admin-slate-200 dark:bg-admin-slate-700 rounded-lg"></div>
        </div>
        <div className="flex-1">
          <div className="h-4 w-32 bg-admin-slate-200 dark:bg-admin-slate-700 rounded mb-2"></div>
          <div className="h-10 w-full bg-admin-slate-200 dark:bg-admin-slate-700 rounded-lg"></div>
        </div>
      </div>
    </div>

    {/* Table Skeleton */}
    <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
          <thead className="bg-admin-slate-50 dark:bg-admin-slate-800/50">
            <tr>
              {[...Array(7)].map((_, i) => (
                <th key={i} scope="col" className="px-6 py-3">
                  <div className="h-4 w-20 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-admin-slate-800 divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="h-4 w-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-admin-slate-200 dark:bg-admin-slate-700 rounded-full"></div>
                    <div className="ml-4">
                      <div className="h-4 w-32 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
                      <div className="mt-1 h-3 w-24 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-12 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-20 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 w-16 bg-admin-slate-200 dark:bg-admin-slate-700 rounded-full"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-3">
                    <div className="h-4 w-16 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
                    <div className="h-4 w-12 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
                    <div className="h-4 w-14 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      startLoading();
      const response = await api.get('/users');
      setCustomers(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch customers. Please try again later.');
      console.error('Error fetching customers:', err);
    } finally {
      stopLoading();
    }
  };

  const handleStatusChange = async (userId, newStatus, reason = '') => {
    try {
      startLoading();
      await api.put(`/users/${userId}/status`, {
        status: newStatus,
        blockReason: reason
      });
      fetchCustomers();
    } catch (err) {
      console.error('Error updating user status:', err);
    } finally {
      stopLoading();
    }
  };

  const handleBlock = (userId, email) => {
    const reason = window.prompt(`Please enter a reason for blocking ${email}:`);
    if (reason !== null) {
      handleStatusChange(userId, 'blocked', reason);
    }
  };

  const handleBulkAction = async (action) => {
    try {
      startLoading();
      for (const customerId of selectedCustomers) {
        if (action === 'activate' || action === 'deactivate') {
          await api.put(`/users/${customerId}/status`, {
            status: action === 'activate' ? 'active' : 'inactive'
          });
        }
        // Add other bulk actions here
      }
      fetchCustomers(); // Refresh the list
      setSelectedCustomers([]); // Clear selection
    } catch (err) {
      console.error('Error performing bulk action:', err);
    } finally {
      stopLoading();
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">Customers</h1>
          <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">
            Manage your customer base and view customer information
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-admin-ucla-500 hover:bg-admin-ucla-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500 dark:focus:ring-offset-admin-slate-800 transition-colors duration-200">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Customer
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCustomers.length > 0 && (
        <div className="bg-admin-slate-50 dark:bg-admin-slate-800/50 border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-admin-slate-700 dark:text-admin-slate-300">
              {selectedCustomers.length} customers selected
            </span>
            <div className="space-x-3">
              <button
                onClick={() => handleBulkAction('export')}
                className="px-4 py-2 text-sm font-medium text-admin-ucla-700 dark:text-admin-ucla-400 bg-admin-ucla-100 dark:bg-admin-ucla-900/30 rounded-md hover:bg-admin-ucla-200 dark:hover:bg-admin-ucla-900/50 transition-colors duration-200"
              >
                Export
              </button>
              <button
                onClick={() => handleBulkAction('email')}
                className="px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors duration-200"
              >
                Email
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-56">
            <label htmlFor="status-select" className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
              Filter by Status
            </label>
            <div className="relative">
              <select
                id="status-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-4 pr-10 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
              >
                <option value="all">All Customers</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="unverified">Unverified</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label htmlFor="search-customers" className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
              Search Customers
            </label>
            <div className="relative">
              <input
                id="search-customers"
                type="text"
                placeholder="Search by name, email, or order ID..."
                className="w-full rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-10 pr-4 text-sm text-admin-slate-900 dark:text-admin-slate-100 placeholder-admin-slate-400 dark:placeholder-admin-slate-500 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
            <thead className="bg-admin-slate-50 dark:bg-admin-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCustomers(customers.map(c => c._id));
                      } else {
                        setSelectedCustomers([]);
                      }
                    }}
                    className="h-4 w-4 rounded border-admin-slate-300 dark:border-admin-slate-700 text-admin-ucla-600 focus:ring-admin-ucla-500 dark:focus:ring-offset-admin-slate-800"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Orders
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Total Spent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Last Purchase
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-admin-slate-800 divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
              {customers.map((customer) => (
                <CustomerRow
                  key={customer._id}
                  customer={customer}
                  isSelected={selectedCustomers.includes(customer._id)}
                  onSelect={(id, checked) => {
                    if (checked) {
                      setSelectedCustomers(prev => [...prev, id]);
                    } else {
                      setSelectedCustomers(prev => prev.filter(customerId => customerId !== id));
                    }
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;