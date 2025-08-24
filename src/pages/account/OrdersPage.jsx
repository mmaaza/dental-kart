import React, { Suspense } from "react";
import { Link } from "react-router-dom";
import { ErrorBoundary } from 'react-error-boundary';
import { useUserOrders } from "../../hooks/queries/useOrderQueries";
import { Button } from "../../components/ui/button";
import { 
  Root as Card, 
  Content as CardContent, 
  Header as CardHeader, 
  Title as CardTitle 
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge-new";
import { Separator } from "../../components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,  
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { ErrorFallback } from "../../components/ui/SuspenseComponents";
import { cn } from "../../lib/utils";
import { 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  Package, 
  Eye, 
  Filter,
  Search,
  ArrowRight
} from 'lucide-react';

// Skeleton loading component for orders table
const OrdersSkeleton = () => {
  const rows = Array(5).fill(null);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="h-6 sm:h-8 bg-gray-200 rounded w-32 sm:w-48 animate-pulse"></div>
        <div className="h-8 sm:h-10 bg-gray-200 rounded w-full sm:w-32 animate-pulse"></div>
      </div>
      
      <Card className="border-slate-200 shadow-mobile">
        <CardContent className="p-0">
          {/* Mobile skeleton */}
          <div className="block sm:hidden space-y-3">
            {rows.map((_, index) => (
              <Card key={index} className="border-slate-200 shadow-sm bg-white">
                <CardContent className="p-4">
                  <div className="space-y-3 animate-pulse">
                    {/* Top row skeleton */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </div>
                    
                    {/* Middle row skeleton */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    </div>
                    
                    {/* Bottom row skeleton */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-8"></div>
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="h-9 bg-gray-200 rounded-lg w-28"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop skeleton */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((_, index) => (
                  <TableRow key={index} className="animate-pulse">
                    <TableCell><div className="h-4 bg-gray-200 rounded w-24"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-20"></div></TableCell>
                    <TableCell><div className="h-5 bg-gray-200 rounded w-20"></div></TableCell>
                    <TableCell><div className="h-5 bg-gray-200 rounded w-16"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-24"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-20"></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main orders content component that uses React Query
const OrdersContent = () => {
  const { data, error, isLoading } = useUserOrders();
  
  // Add safety checks for data structure
  const orders = React.useMemo(() => {
    if (!data || typeof data !== 'object') return [];
    if (Array.isArray(data)) return data;
    if (data.orders && Array.isArray(data.orders)) return data.orders;
    return [];
  }, [data]);

  // Show error state if there's an error
  if (error) {
    console.error('Orders error:', error);
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
            My Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">Error loading orders</p>
        </div>
        <Card className="border-slate-200 shadow-mobile">
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-red-600">Failed to load orders. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper function to get status badge color based on order status
  const getStatusBadgeColor = (status) => {
    const statusMap = {
      pending: "warning",
      processing: "default", 
      shipped: "default",
      delivered: "success",
      cancelled: "destructive",
    };
    return statusMap[status] || "outline";
  };

  // Helper function to get payment status badge color
  const getPaymentStatusBadgeColor = (status) => {
    const statusMap = {
      pending: "warning",
      paid: "success",
      failed: "destructive",
      refunded: "default",
    };
    return statusMap[status] || "outline";
  };

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
        return <Calendar className="h-3 w-3" />;
      case 'processing':
        return <Package className="h-3 w-3" />;
      case 'shipped':
        return <Package className="h-3 w-3" />;
      case 'delivered':
        return <Package className="h-3 w-3" />;
      case 'cancelled':
        return <Package className="h-3 w-3" />;
      default:
        return <Package className="h-3 w-3" />;
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

  // Helper to format currency
  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  // Helper to capitalize status
  const capitalizeStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
          <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary-500" />
          My Orders
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {orders.length > 0 ? (
            <>
              <span className="font-medium">{orders.length}</span> order{orders.length !== 1 ? 's' : ''} found
            </>
          ) : (
            'Track your order history and status'
          )}
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-slate-200 shadow-mobile">
          <CardContent className="py-12">
            <EmptyState
              title="No orders yet"
              description="You haven't placed any orders yet. Start shopping to see your order history here."
              actionText="Start Shopping"
              actionLink="/"
              icon={
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile View - Improved Cards Layout */}
          <div className="block sm:hidden space-y-3">
          {orders && orders.length > 0 && orders.map((order, index) => (
            <Card key={order._id || index} className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
              <CardContent className="p-4">
                {/* Order Header - Mobile Optimized */}
                <div className="space-y-3">
                  {/* Top Row: Order Number & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <ShoppingBag className="h-4 w-4 text-primary-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        #{order.orderNumber || 'N/A'}
                      </span>
                    </div>
                    <div className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold flex-shrink-0 ${
                      getStatusBadgeColor(order.orderStatus) === 'warning' ? 'border-transparent bg-yellow-100 text-yellow-800' :
                      getStatusBadgeColor(order.orderStatus) === 'success' ? 'border-transparent bg-green-100 text-green-800' :
                      getStatusBadgeColor(order.orderStatus) === 'destructive' ? 'border-transparent bg-red-100 text-red-800' :
                      getStatusBadgeColor(order.orderStatus) === 'default' ? 'border-transparent bg-primary-100 text-primary-800' :
                      'border-gray-200 bg-gray-50 text-gray-700'
                    }`}>
                      {getStatusIcon(order.orderStatus)}
                      {capitalizeStatus(order.orderStatus || 'pending')}
                    </div>
                  </div>

                  {/* Middle Row: Date & Payment Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                      getPaymentStatusBadgeColor(order.paymentStatus) === 'warning' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                      getPaymentStatusBadgeColor(order.paymentStatus) === 'success' ? 'border-green-200 bg-green-50 text-green-700' :
                      getPaymentStatusBadgeColor(order.paymentStatus) === 'destructive' ? 'border-red-200 bg-red-50 text-red-700' :
                      getPaymentStatusBadgeColor(order.paymentStatus) === 'default' ? 'border-primary-200 bg-primary-50 text-primary-700' :
                      'border-gray-200 bg-gray-50 text-gray-600'
                    }`}>
                      <CreditCard className="h-3 w-3" />
                      {capitalizeStatus(order.paymentStatus || 'pending')}
                    </div>
                  </div>

                  {/* Bottom Row: Total & Action Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Total</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(order.total || 0)}
                      </span>
                    </div>
                    <Link 
                      to={`/account/orders/${order._id}`} 
                      className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-lg bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 transition-all duration-200"
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      View Details
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop View */}
        <Card className="hidden sm:block border-slate-200 shadow-mobile hover:shadow-mobile-lg transition-all duration-200">
          <CardContent className="p-0">

            {/* Desktop View */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="w-[140px] font-semibold text-gray-700">Order</TableHead>
                    <TableHead className="w-[120px] font-semibold text-gray-700">Date</TableHead>
                    <TableHead className="w-[130px] font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="w-[120px] font-semibold text-gray-700">Payment</TableHead>
                    <TableHead className="w-[120px] text-right font-semibold text-gray-700">Total</TableHead>
                    <TableHead className="w-[140px] font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders && orders.length > 0 && orders.map((order) => (
                    <TableRow key={order._id} className="hover:bg-slate-50/70 border-b border-gray-100 transition-colors duration-150">
                      <TableCell className="font-medium py-4">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-primary-500" />
                          <span className="text-sm">#{order.orderNumber || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm">{formatDate(order.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                          getStatusBadgeColor(order.orderStatus) === 'warning' ? 'border-yellow-200 bg-yellow-100 text-yellow-800' :
                          getStatusBadgeColor(order.orderStatus) === 'success' ? 'border-green-200 bg-green-100 text-green-800' :
                          getStatusBadgeColor(order.orderStatus) === 'destructive' ? 'border-red-200 bg-red-100 text-red-800' :
                          getStatusBadgeColor(order.orderStatus) === 'default' ? 'border-primary-200 bg-primary-100 text-primary-800' :
                          'border-gray-200 bg-gray-100 text-gray-700'
                        }`}>
                          {getStatusIcon(order.orderStatus)}
                          {capitalizeStatus(order.orderStatus || 'pending')}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                          getPaymentStatusBadgeColor(order.paymentStatus) === 'warning' ? 'border-yellow-200 bg-yellow-100 text-yellow-800' :
                          getPaymentStatusBadgeColor(order.paymentStatus) === 'success' ? 'border-green-200 bg-green-100 text-green-800' :
                          getPaymentStatusBadgeColor(order.paymentStatus) === 'destructive' ? 'border-red-200 bg-red-100 text-red-800' :
                          getPaymentStatusBadgeColor(order.paymentStatus) === 'default' ? 'border-primary-200 bg-primary-100 text-primary-800' :
                          'border-gray-200 bg-gray-100 text-gray-700'
                        }`}>
                          <CreditCard className="h-3.5 w-3.5" />
                          {capitalizeStatus(order.paymentStatus || 'pending')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-gray-900 py-4">
                        {formatCurrency(order.total || 0)}
                      </TableCell>
                      <TableCell className="py-4">
                        <Link 
                          to={`/account/orders/${order._id}`} 
                          className="inline-flex items-center h-9 px-4 text-sm font-medium rounded-lg bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 transition-all duration-200"
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          View Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
};

// Main OrdersPage component with Suspense wrapper and Error Boundary
const OrdersPage = () => {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
              My Orders
            </h1>
            <p className="text-sm text-gray-500 mt-1">There was an error loading your orders</p>
          </div>
          <Card className="border-slate-200 shadow-mobile">
            <CardContent className="py-12">
              <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} type="orders" />
            </CardContent>
          </Card>
        </div>
      )}
      onReset={() => {
        // Optional: Refresh the page or reset queries on error boundary reset
        window.location.reload();
      }}
    >
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent />
      </Suspense>
    </ErrorBoundary>
  );
};

export default OrdersPage;
