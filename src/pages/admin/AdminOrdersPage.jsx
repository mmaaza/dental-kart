import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useOrder } from "../../hooks/useOrder";
import AdminLayout from "../../components/layout/AdminLayout";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor =
    type === "error"
      ? "bg-red-100 dark:bg-red-900/30"
      : "bg-green-100 dark:bg-green-900/30";
  const textColor =
    type === "error"
      ? "text-red-800 dark:text-red-400"
      : "text-green-800 dark:text-green-400";
  const borderColor =
    type === "error"
      ? "border-red-300 dark:border-red-700"
      : "border-green-300 dark:border-green-700";
  const iconColor =
    type === "error"
      ? "text-red-400 dark:text-red-300"
      : "text-green-400 dark:text-green-300";

  return (
    <div className={`rounded-md ${bgColor} p-4 mb-4 border ${borderColor}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {type === "error" ? (
            <svg
              className={`h-5 w-5 ${iconColor}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className={`h-5 w-5 ${iconColor}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <p className={`text-sm ${textColor}`}>{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${textColor} hover:bg-${
                type === "error" ? "red" : "green"
              }-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${
                type === "error" ? "red" : "green"
              }-500`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderSkeleton = () => {
  const rows = Array(5).fill(null);

  return (
    <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
          <thead className="bg-admin-slate-50 dark:bg-admin-slate-800/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider"
              >
                Order ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider"
              >
                Customer
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider"
              >
                Payment
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider"
              >
                Total
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-admin-slate-800 divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
            {rows.map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-24"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-admin-slate-200 dark:bg-admin-slate-700"></div>
                    <div className="ml-4">
                      <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-32"></div>
                      <div className="h-3 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-24 mt-2"></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-24"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-5 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-20"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-5 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-16"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-20"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-24 ml-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminOrdersPage = () => {
  const { fetchAllOrders, orders, loading } = useOrder();
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);

      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filterStatus) queryParams.status = filterStatus;
      if (filterPayment) queryParams.paymentStatus = filterPayment;
      if (searchQuery) queryParams.search = searchQuery;

      const result = await fetchAllOrders(queryParams);

      if (result?.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: result.pagination.total,
          pages: result.pagination.pages,
        }));
      }

      setIsLoading(false);
    };

    loadOrders();
  }, [
    fetchAllOrders,
    pagination.page,
    pagination.limit,
    filterStatus,
    filterPayment,
    searchQuery,
  ]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on new search
  };

  const resetFilters = () => {
    setFilterStatus("");
    setFilterPayment("");
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Helper function to get status badge color based on order status
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "shipped":
        return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400";
      case "processing":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
      default:
        return "bg-admin-slate-100 dark:bg-admin-slate-700/50 text-admin-slate-800 dark:text-admin-slate-300";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
      case "refunded":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400";
      default:
        return "bg-admin-slate-100 dark:bg-admin-slate-700/50 text-admin-slate-800 dark:text-admin-slate-300";
    }
  };

  // Helper to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">
            Orders
          </h1>
          <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
            Manage and track all orders
          </p>
        </div>
        <div className="mt-4 sm:mt-0"></div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label
              htmlFor="search-orders"
              className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2"
            >
              Search Orders
            </label>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  id="search-orders"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by order number..."
                  className="w-full rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-10 pr-4 text-sm text-admin-slate-900 dark:text-admin-slate-100 placeholder-admin-slate-400 dark:placeholder-admin-slate-500 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </form>
          </div>

          <div className="flex items-end">
            <button className="px-4 py-2.5 bg-admin-ucla-500 hover:bg-admin-ucla-600 text-white rounded-lg text-sm font-medium transition-colors w-full sm:w-auto">
              Export Orders
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-56">
            <label
              htmlFor="status-select"
              className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2"
            >
              Filter by Status
            </label>
            <div className="relative">
              <select
                id="status-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-4 pr-10 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-56">
            <label
              htmlFor="payment-select"
              className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2"
            >
              Filter by Payment
            </label>
            <div className="relative">
              <select
                id="payment-select"
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full appearance-none rounded-lg border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 py-2.5 pl-4 pr-10 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100 shadow-sm hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-1 focus:ring-admin-ucla-500"
              >
                <option value="">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-5 w-5 text-admin-slate-400 dark:text-admin-slate-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-auto sm:ml-auto flex items-end">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2.5 bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-700 dark:text-admin-slate-300 rounded-lg hover:bg-admin-slate-200 dark:hover:bg-admin-slate-600 text-sm font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      {/* Orders Table */}
      {isLoading ? (
        <OrderSkeleton />
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg p-10 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No orders found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || filterStatus || filterPayment
              ? "Try changing your search criteria or filters"
              : "No orders have been placed yet"}
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
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider"
                  >
                    Order ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider"
                  >
                    Payment
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-admin-slate-500 dark:text-admin-slate-400 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-admin-slate-800 divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">
                        <Link to={`/admin/orders/${order._id}`} className="hover:underline">{order.orderNumber}</Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-admin-ucla-100 dark:bg-admin-ucla-500/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-admin-ucla-600 dark:text-admin-ucla-400">
                            {order.user?.name ? order.user.name.charAt(0) : "?"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">
                            {order.user?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-admin-slate-500 dark:text-admin-slate-400">
                            {order.user?.email || "No email"}
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
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus.charAt(0).toUpperCase() +
                          order.orderStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus.charAt(0).toUpperCase() +
                          order.paymentStatus.slice(1)}
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
                        className="text-admin-ucla-600 hover:text-admin-ucla-700 dark:text-admin-ucla-800 dark:hover:text-admin-ucla-900"
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
                pagination.page <= 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Previous
            </button>
            <button
              onClick={() =>
                handlePageChange(
                  Math.min(pagination.pages || 1, pagination.page + 1)
                )
              }
              disabled={pagination.page >= (pagination.pages || 1)}
              className={`inline-flex items-center px-3 py-2 border border-admin-slate-200 dark:border-admin-slate-700 text-sm font-medium rounded-lg text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 ${
                pagination.page >= (pagination.pages || 1)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
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

export default AdminOrdersPage;
