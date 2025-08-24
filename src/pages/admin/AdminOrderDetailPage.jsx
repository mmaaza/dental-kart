// filepath: /home/maaz/Web Work/mbnepal/src/pages/admin/AdminOrderDetailPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrder';
import AdminErrorDisplay from '../../components/error/AdminErrorDisplay';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '../../lib/utils';

// Skeleton loader component for order detail page
const OrderDetailSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm mb-6">
        <div className="px-6 py-5 border-b border-admin-slate-200 dark:border-admin-slate-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-row items-center gap-4">
              <div>
                <div className="h-6 w-36 bg-admin-slate-200 dark:bg-admin-slate-700 rounded mb-2"></div>
                <div className="h-4 w-48 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
              </div>
              
              {/* Status badge skeletons */}
              <div className="flex items-center gap-2">
                <div className="h-6 w-20 bg-admin-slate-200 dark:bg-admin-slate-700 rounded-md"></div>
                <div className="h-6 w-20 bg-admin-slate-200 dark:bg-admin-slate-700 rounded-md"></div>
              </div>
            </div>
            
            {/* Action button skeletons */}
            <div className="flex flex-wrap gap-2">
              <div className="h-8 w-28 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
              <div className="h-8 w-32 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Order summary cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white dark:bg-admin-slate-800 rounded-xl p-4 border border-admin-slate-200 dark:border-admin-slate-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 w-9 h-9 bg-admin-slate-200 dark:bg-admin-slate-700 rounded-full"></div>
                <div>
                  <div className="h-3 w-16 bg-admin-slate-200 dark:bg-admin-slate-700 rounded mb-2"></div>
                  <div className="h-5 w-24 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Customer Information Skeleton */}
      <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-admin-slate-200 dark:border-admin-slate-700">
          <div className="h-5 w-40 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {[1, 2].map((item) => (
            <div key={item} className="bg-white dark:bg-admin-slate-700 rounded-lg p-4 border border-admin-slate-200 dark:border-admin-slate-600 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="h-4 w-4 bg-admin-slate-200 dark:bg-admin-slate-600 rounded-full mr-1.5"></div>
                <div className="h-4 w-28 bg-admin-slate-200 dark:bg-admin-slate-600 rounded"></div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="flex justify-between items-center">
                    <div className="h-3 w-20 bg-admin-slate-200 dark:bg-admin-slate-600 rounded"></div>
                    <div className="h-3 w-32 bg-admin-slate-200 dark:bg-admin-slate-600 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Order Items Skeleton */}
      <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-admin-slate-200 dark:border-admin-slate-700">
          <div className="h-5 w-28 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
        </div>
        <div className="overflow-x-auto scrollbar-admin p-6">
          <table className="w-full">
            <thead>
              <tr className="bg-admin-slate-50 dark:bg-admin-slate-700/40">
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-16 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
                </th>
                <th className="px-6 py-3 text-center">
                  <div className="h-3 w-16 bg-admin-slate-200 dark:bg-admin-slate-700 rounded mx-auto"></div>
                </th>
                <th className="px-6 py-3 text-right">
                  <div className="h-3 w-16 bg-admin-slate-200 dark:bg-admin-slate-700 rounded ml-auto"></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-slate-200 dark:divide-admin-slate-700/50">
              {[1, 2, 3].map((item) => (
                <tr key={item} className="hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-14 w-14 bg-admin-slate-200 dark:bg-admin-slate-700 rounded-md"></div>
                      <div className="ml-4">
                        <div className="h-4 w-48 bg-admin-slate-200 dark:bg-admin-slate-700 rounded mb-2"></div>
                        <div className="h-3 w-24 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-4 w-8 bg-admin-slate-200 dark:bg-admin-slate-700 rounded mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-4 w-20 bg-admin-slate-200 dark:bg-admin-slate-700 rounded ml-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-admin-slate-300 dark:border-admin-slate-600">
              {[1, 2, 3].map((row) => (
                <tr key={row} className="bg-admin-slate-50 dark:bg-admin-slate-700/30">
                  <td className="px-6 py-3" colSpan={row === 3 ? 2 : undefined}>
                    <div className="h-4 w-20 bg-admin-slate-200 dark:bg-admin-slate-600 rounded"></div>
                  </td>
                  {row !== 3 && (
                    <td className="px-6 py-3"></td>
                  )}
                  <td className="px-6 py-3 text-right">
                    <div className="h-4 w-24 bg-admin-slate-200 dark:bg-admin-slate-600 rounded ml-auto"></div>
                  </td>
                </tr>
              ))}
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Payment & Tracking Information Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {[1, 2].map((section) => (
          <div key={section} className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-admin-slate-200 dark:border-admin-slate-700">
              <div className="h-5 w-36 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
            </div>
            <div className="p-6">
              <div className="bg-white dark:bg-admin-slate-700 rounded-lg p-4 border border-admin-slate-200 dark:border-admin-slate-600">
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex justify-between items-center">
                      <div className="h-3 w-28 bg-admin-slate-200 dark:bg-admin-slate-600 rounded"></div>
                      <div className="h-5 w-32 bg-admin-slate-200 dark:bg-admin-slate-600 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Action Footer Skeleton */}
      <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="h-9 w-32 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
          <div className="h-9 w-28 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

const AdminDialog = ({ 
  open, 
  onClose, 
  title, 
  description, 
  children, 
  confirmLabel, 
  confirmVariant = 'ucla',
  onConfirm 
}) => {
  if (!open) return null;

  const getVariantColors = (variant) => {
    switch (variant) {
      case 'ucla':
        return 'bg-admin-ucla-500 hover:bg-admin-ucla-600 focus:ring-admin-ucla-500/50';
      case 'cerulean':
        return 'bg-admin-cerulean-500 hover:bg-admin-cerulean-600 focus:ring-admin-cerulean-500/50';
      case 'slate':
      default:
        return 'bg-admin-slate-500 hover:bg-admin-slate-600 focus:ring-admin-slate-500/50';
    }
  };

  return (
    <div className="fixed inset-0 z-overlay overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-admin-slate-800/75 dark:bg-admin-slate-900/90 transition-opacity backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-admin-slate-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="px-5 pb-4 pt-5 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">
                  {title}
                </h3>
                {description && (
                  <div className="mt-2">
                    <p className="text-sm text-admin-slate-600 dark:text-admin-slate-400">
                      {description}
                    </p>
                  </div>
                )}
                <div className="mt-4">
                  {children}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-admin-slate-100 dark:bg-admin-slate-700 px-5 py-4 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className={`inline-flex w-full justify-center rounded-md px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 sm:ml-3 sm:w-auto ${getVariantColors(confirmVariant)}`}
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-admin-slate-300 dark:border-admin-slate-600 bg-white dark:bg-admin-slate-700 px-4 py-2.5 text-sm font-medium text-admin-slate-700 dark:text-admin-slate-200 shadow-sm hover:bg-admin-slate-100 dark:hover:bg-admin-slate-600 focus:outline-none focus:ring-2 focus:ring-admin-slate-500/50 focus:ring-offset-2 dark:focus:ring-offset-admin-slate-700 transition-all duration-200 sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    fetchOrderById, 
    cancelUserOrder, 
    updateOrderStatusById, 
    updateOrderPaymentStatus,
    currentOrder, 
    loading, 
    error 
  } = useOrder();
  
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const invoiceRef = useRef();
  
  useEffect(() => {
    const loadOrderDetails = async () => {
      await fetchOrderById(id);
    };
    
    loadOrderDetails();
  }, [fetchOrderById, id]);
  
  useEffect(() => {
    // Set initial values when order data is loaded
    if (currentOrder) {
      setNewOrderStatus(currentOrder.orderStatus);
      setNewPaymentStatus(currentOrder.paymentStatus);
      setTrackingNumber(currentOrder.trackingNumber || '');
      
      if (currentOrder.estimatedDeliveryDate) {
        const date = new Date(currentOrder.estimatedDeliveryDate);
        // Format date to YYYY-MM-DD for input field
        setEstimatedDeliveryDate(date.toISOString().split('T')[0]);
      }
    }
  }, [currentOrder]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusBadgeColor = (status) => {
    const statusMap = {
      pending: 'bg-admin-light-300 text-admin-slate-900',
      processing: 'bg-admin-light-300 text-admin-slate-900',
      shipped: 'bg-admin-light-300 text-admin-slate-900',
      delivered: 'bg-admin-sky-300 text-admin-slate-900',
      cancelled: 'bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    
    return statusMap[status] || 'bg-admin-slate-300 text-admin-slate-900';
  };
  
  const getPaymentStatusBadgeColor = (status) => {
    const statusMap = {
      pending: 'bg-admin-light-300 text-admin-ucla-900',
      paid: 'bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      failed: 'bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      refunded: 'bg-admin-cerulean-300 text-admin-ucla-900'
    };
    
    return statusMap[status] || 'bg-admin-slate-300 text-admin-slate-900';
  };
  
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    
    try {
      await cancelUserOrder(id, cancelReason);
      setCancelDialogOpen(false);
      setCancelReason('');
      toast.success('Order cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel order: ' + (error.message || 'Unknown error'));
    }
  };
  
  const handleUpdateOrderStatus = async () => {
    try {
      const updateData = {
        orderStatus: newOrderStatus
      };
      
      if (trackingNumber.trim()) {
        updateData.trackingNumber = trackingNumber;
      }
      
      if (estimatedDeliveryDate) {
        updateData.estimatedDeliveryDate = estimatedDeliveryDate;
      }
      
      await updateOrderStatusById(id, updateData);
      setStatusDialogOpen(false);
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Failed to update order status: ' + (error.message || 'Unknown error'));
    }
  };
  
  const handleUpdatePaymentStatus = async () => {
    try {
      await updateOrderPaymentStatus(id, newPaymentStatus);
      setPaymentDialogOpen(false);
      toast.success('Payment status updated successfully');
    } catch (error) {
      toast.error('Failed to update payment status: ' + (error.message || 'Unknown error'));
    }
  };
  
  const canCancelOrder = () => {
    if (!currentOrder) return false;
    return ['pending', 'processing'].includes(currentOrder.orderStatus);
  };

  // Print only the invoice section
  const handlePrintInvoice = () => {
    if (!currentOrder) {
      alert('Order data not found.');
      return;
    }
    
    // Open the invoice print page in a new window
    const printWindow = window.open(`/admin/invoice-print/${currentOrder._id}`, '_blank', 'width=800,height=600');
    
    // The print page will handle loading the order and triggering print automatically
  };
  
  if (loading) {
    return (
      <OrderDetailSkeleton />
    );
  }
  
  if (error || !currentOrder || !currentOrder.orderStatus || !currentOrder.paymentStatus) {
    return (
      <div className="py-8">
        <AdminErrorDisplay 
          title="Failed to load order details" 
          message={error || "Order not found or incomplete order data"} 
          actionText="Return to Orders"
          actionLink="/admin/orders"
        />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        {/* Invoice Section Start - Only wrap the main invoice content with the ref */}
        <div ref={invoiceRef}>
        {/* Header with status badges and actions */}
        <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm mb-6">
          <div className="px-6 py-5 border-b border-admin-slate-200 dark:border-admin-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-row items-center gap-4">
                <div>
                  <h1 className="text-xl font-medium text-admin-slate-900 dark:text-admin-slate-100">
                    Order #{currentOrder.orderNumber}
                  </h1>
                  <p className="text-sm text-admin-slate-600 dark:text-admin-slate-400">
                    Placed on {formatDate(currentOrder.createdAt)}
                  </p>
                </div>
                
                {/* Smaller Status badges */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-admin-slate-50 dark:bg-admin-slate-700 pl-2 pr-1 py-1 rounded-md border border-admin-slate-200 dark:border-admin-slate-600">
                    <span className="text-2xs font-medium text-admin-slate-500 dark:text-admin-slate-400">Status</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-2xs font-medium ${getStatusBadgeColor(currentOrder.orderStatus)}`}>
                      {currentOrder.orderStatus ? currentOrder.orderStatus.charAt(0).toUpperCase() + currentOrder.orderStatus.slice(1) : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-admin-slate-50 dark:bg-admin-slate-700 pl-2 pr-1 py-1 rounded-md border border-admin-slate-200 dark:border-admin-slate-600">
                    <span className="text-2xs font-medium text-admin-slate-500 dark:text-admin-slate-400">Payment</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-2xs font-medium ${getPaymentStatusBadgeColor(currentOrder.paymentStatus)}`}>
                      {currentOrder.paymentStatus ? currentOrder.paymentStatus.charAt(0).toUpperCase() + currentOrder.paymentStatus.slice(1) : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Quick action buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusDialogOpen(true)}
                  className="px-3 py-2 text-xs font-medium bg-admin-ucla-500 hover:bg-admin-ucla-600 text-white rounded transition-colors duration-200 shadow-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Update Status
                </button>
                <button
                  onClick={() => setPaymentDialogOpen(true)}
                  className="px-3 py-2 text-xs font-medium bg-admin-cerulean-500 hover:bg-admin-cerulean-600 text-white rounded transition-colors duration-200 shadow-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 01-2 2h12a2 2 0 012-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                  Update Payment
                </button>
                {canCancelOrder() && (
                  <button
                    onClick={() => setCancelDialogOpen(true)}
                    className="px-3 py-2 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200 shadow-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Order summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            <div className="bg-white dark:bg-admin-slate-800 rounded-xl p-4 border border-admin-slate-200 dark:border-admin-slate-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-admin-ucla-500/10 dark:bg-admin-ucla-500/20 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-admin-ucla-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-admin-slate-600 dark:text-admin-slate-400">Total Amount</p>
                  <p className="text-lg font-semibold text-admin-slate-900 dark:text-admin-slate-100">Rs. {currentOrder.total.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-admin-slate-800 rounded-xl p-4 border border-admin-slate-200 dark:border-admin-slate-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-admin-cerulean-500/10 dark:bg-admin-cerulean-500/20 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-admin-cerulean-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-admin-slate-600 dark:text-admin-slate-400">Items</p>
                  <p className="text-lg font-semibold text-admin-slate-900 dark:text-admin-slate-100">{currentOrder.items.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-admin-slate-800 rounded-xl p-4 border border-admin-slate-200 dark:border-admin-slate-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-admin-light-500/10 dark:bg-admin-light-500/20 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-admin-light-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-admin-slate-600 dark:text-admin-slate-400">Order Date</p>
                  <p className="text-base font-semibold text-admin-slate-900 dark:text-admin-slate-100">{formatDate(currentOrder.createdAt).split(',')[0]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Customer Information */}
        <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-admin-slate-200 dark:border-admin-slate-700">
            <h2 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Customer Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="bg-white dark:bg-admin-slate-700 rounded-lg p-4 border border-admin-slate-200 dark:border-admin-slate-600 shadow-sm">
              <h3 className="text-sm font-semibold text-admin-slate-900 dark:text-admin-slate-100 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Personal Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-admin-slate-600 dark:text-admin-slate-400">Name:</span>
                  <span className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200">{currentOrder.user?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-admin-slate-600 dark:text-admin-slate-400">Email:</span>
                  <span className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200">{currentOrder.user?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-admin-slate-600 dark:text-admin-slate-400">Phone:</span>
                  <span className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200">{currentOrder.shippingDetails.phone}</span>
                </div>
                {currentOrder.shippingDetails.clinicName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-admin-slate-600 dark:text-admin-slate-400">Clinic:</span>
                    <span className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200">{currentOrder.shippingDetails.clinicName}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white dark:bg-admin-slate-700 rounded-lg p-4 border border-admin-slate-200 dark:border-admin-slate-600 shadow-sm">
              <h3 className="text-sm font-semibold text-admin-slate-900 dark:text-admin-slate-100 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Shipping Address
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-admin-slate-600 dark:text-admin-slate-400">Address:</span>
                  <span className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200">{currentOrder.shippingDetails.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-admin-slate-600 dark:text-admin-slate-400">City:</span>
                  <span className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200">{currentOrder.shippingDetails.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-admin-slate-600 dark:text-admin-slate-400">Province:</span>
                  <span className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200">{currentOrder.shippingDetails.province}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Items */}
        <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-admin-slate-200 dark:border-admin-slate-700">
            <h2 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Order Items</h2>
          </div>
          <div className="overflow-x-auto scrollbar-admin">
            <table className="w-full">
              <thead>
                <tr className="bg-admin-slate-50 dark:bg-admin-slate-700/40">
                  <th className="px-6 py-3 text-left text-xs font-medium text-admin-slate-600 dark:text-admin-slate-400 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-admin-slate-600 dark:text-admin-slate-400 uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-admin-slate-600 dark:text-admin-slate-400 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-admin-slate-600 dark:text-admin-slate-400 uppercase tracking-wider">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-slate-200 dark:divide-admin-slate-700/50">
                {currentOrder.items.map((item, index) => (
                  <tr key={index} className="hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-14 w-14 flex-shrink-0 bg-admin-slate-100 dark:bg-admin-slate-700 rounded-md overflow-hidden shadow-sm">
                          {item.product.images && item.product.images.length > 0 ? (
                            <img
                              src={getImageUrl(item.product.images[0])}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-admin-slate-200 dark:bg-admin-slate-700">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-admin-slate-500 dark:text-admin-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <Link
                            to={`/products/${item.product.slug}`}
                            className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200 hover:text-admin-ucla-600 dark:hover:text-admin-ucla-400 transition-colors duration-200"
                          >
                            {item.product.name}
                          </Link>
                          {Object.keys(item.attributes || {}).length > 0 && (
                            <div className="mt-1 text-xs text-admin-slate-600 dark:text-admin-slate-400">
                              {Object.entries(item.attributes).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">{key}:</span> {value}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-admin-slate-600 dark:text-admin-slate-400">
                      Rs. {item.price}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-admin-slate-600 dark:text-admin-slate-400">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-admin-slate-900 dark:text-admin-slate-300">
                      Rs. {(item.price).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-admin-slate-300 dark:border-admin-slate-600">
                <tr className="bg-admin-slate-50 dark:bg-admin-slate-700/30">
                  <td className="px-6 py-3 text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400" colSpan="3">Subtotal</td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-admin-slate-900 dark:text-admin-slate-300">Rs. {currentOrder.subtotal.toLocaleString()}</td>
                </tr>
                <tr className="bg-admin-slate-50 dark:bg-admin-slate-700/30">
                  <td className="px-6 py-3 text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400" colSpan="3">Shipping</td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-admin-slate-900 dark:text-admin-slate-300">Rs. {currentOrder.shipping.toLocaleString()}</td>
                </tr>
                <tr className="bg-admin-slate-100 dark:bg-admin-slate-700/50">
                  <td className="px-6 py-3 text-sm font-bold text-admin-slate-900 dark:text-admin-slate-100" colSpan="3">Total</td>
                  <td className="px-6 py-3 text-right text-base font-bold text-admin-slate-900 dark:text-admin-slate-100">Rs. {currentOrder.total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        {/* Payment & Tracking */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Payment Information */}
          <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-admin-slate-200 dark:border-admin-slate-700">
              <h2 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Payment Information</h2>
            </div>
            <div className="p-6">
              <div className="bg-white dark:bg-admin-slate-700 rounded-lg p-4 border border-admin-slate-200 dark:border-admin-slate-600 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-admin-slate-600 dark:text-admin-slate-400">Payment Method:</span>
                  <span className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200">
                    {currentOrder.paymentMethod === 'pay-now' ? 'Pay Now (Online Payment)' : 'Pay Later'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-admin-slate-600 dark:text-admin-slate-400">Payment Status:</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadgeColor(currentOrder.paymentStatus)}`}>
                      {currentOrder.paymentStatus ? currentOrder.paymentStatus.charAt(0).toUpperCase() + currentOrder.paymentStatus.slice(1) : 'Unknown'}
                    </span>
                    <button 
                      onClick={() => setPaymentDialogOpen(true)}
                      className="p-1 rounded-full hover:bg-admin-slate-200 dark:hover:bg-admin-slate-600 transition-colors"
                      title="Edit payment status"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-admin-slate-600 dark:text-admin-slate-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {currentOrder.paymentScreenshot && (
                  <div className="pt-3 border-t border-admin-slate-200 dark:border-admin-slate-600">
                    <p className="text-sm font-medium text-admin-slate-600 dark:text-admin-slate-400 mb-2">Payment Screenshot:</p>
                    <a 
                      href={getImageUrl(currentOrder.paymentScreenshot)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block border-2 border-admin-slate-300 dark:border-admin-slate-600 hover:border-admin-ucla-500 dark:hover:border-admin-ucla-500 rounded-lg overflow-hidden transition-colors duration-200 shadow-sm"
                    >
                      <img 
                        src={getImageUrl(currentOrder.paymentScreenshot)} 
                        alt="Payment Screenshot" 
                        className="w-40 h-40 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div 
                        className="w-40 h-40 bg-admin-slate-100 dark:bg-admin-slate-700 flex items-center justify-center text-admin-slate-500 dark:text-admin-slate-400 text-sm"
                        style={{ display: 'none' }}
                      >
                        <div className="text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs">Image not found</p>
                        </div>
                      </div>
                    </a>
                    <p className="text-xs text-admin-slate-500 dark:text-admin-slate-400 mt-1">
                      Click to view full size
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tracking Information */}
          <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-admin-slate-200 dark:border-admin-slate-700">
              <h2 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Tracking Information</h2>
            </div>
            <div className="p-6">
              <div className="bg-white dark:bg-admin-slate-700 rounded-lg p-4 border border-admin-slate-200 dark:border-admin-slate-600 space-y-3">
                {(currentOrder.trackingNumber || currentOrder.estimatedDeliveryDate) ? (
                  <>
                    {currentOrder.trackingNumber && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-admin-slate-600 dark:text-admin-slate-400">Tracking Number:</span>
                        <span className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200 bg-admin-slate-100 dark:bg-admin-slate-800/70 px-3 py-1 rounded-md">
                          {currentOrder.trackingNumber}
                        </span>
                      </div>
                    )}
                    {currentOrder.estimatedDeliveryDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-admin-slate-600 dark:text-admin-slate-400">Estimated Delivery:</span>
                        <span className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200">
                          {formatDate(currentOrder.estimatedDeliveryDate).split(',')[0]}
                        </span>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-admin-slate-200 dark:border-admin-slate-600">
                      <div className="flex items-center space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${currentOrder.orderStatus === 'delivered' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-admin-light-300/20'}`}>
                          {currentOrder.orderStatus === 'delivered' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-admin-light-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200">
                            {currentOrder.orderStatus === 'delivered' ? 'Delivered' : 'In Transit'}
                          </p>
                          <p className="text-xs text-admin-slate-600 dark:text-admin-slate-400">
                            {currentOrder.orderStatus === 'delivered' ? 'Successfully delivered' : 'Package is on its way'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-admin-slate-400 dark:text-admin-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mt-2 text-sm text-admin-slate-600 dark:text-admin-slate-400">No tracking information available yet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
        {/* Invoice Section End */}
        {/* Action Footer - outside of invoiceRef so it is not printed */}
        <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-sm p-6 no-print">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link
              to="/admin/orders"
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 text-sm font-medium bg-admin-slate-600 hover:bg-admin-slate-700 text-white rounded transition-colors duration-200 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 010 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Orders
            </Link>
            
            <div className="flex gap-3">
              <button
                onClick={handlePrintInvoice}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-admin-ucla-500 hover:bg-admin-ucla-600 text-white rounded transition-colors duration-200 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <AdminDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Cancel Order"
        confirmVariant="slate"
        onConfirm={handleCancelOrder}
      >
        <div className="mt-4">
          <label htmlFor="cancelReason" className="block text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200 mb-1">
            Reason for cancellation
          </label>
          <textarea
            id="cancelReason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full border border-admin-slate-300 dark:border-admin-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-ucla-500 focus:border-transparent dark:bg-admin-slate-700 dark:text-admin-slate-200"
            rows={3}
            placeholder="Please provide a reason for cancellation"
          />
        </div>
      </AdminDialog>
      
      <AdminDialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        title="Update Order Status"
        description="Update the current status of this order."
        confirmLabel="Update Status"
        confirmVariant="ucla"
        onConfirm={handleUpdateOrderStatus}
      >
        <div className="space-y-4 mt-4">
          <div>
            <label htmlFor="orderStatus" className="block text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200 mb-1">
              Order Status
            </label>
            <select
              id="orderStatus"
              value={newOrderStatus}
              onChange={(e) => setNewOrderStatus(e.target.value)}
              className="w-full border border-admin-slate-300 dark:border-admin-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-ucla-500 focus:border-transparent dark:bg-admin-slate-700 dark:text-admin-slate-200"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="trackingNumber" className="block text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200 mb-1">
              Tracking Number (Optional)
            </label>
            <input
              type="text"
              id="trackingNumber"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="w-full border border-admin-slate-300 dark:border-admin-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-ucla-500 focus:border-transparent dark:bg-admin-slate-700 dark:text-admin-slate-200"
            />
          </div>
          
          <div>
            <label htmlFor="estimatedDeliveryDate" className="block text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200 mb-1">
              Estimated Delivery Date (Optional)
            </label>
            <input
              type="date"
              id="estimatedDeliveryDate"
              value={estimatedDeliveryDate}
              onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
              className="w-full border border-admin-slate-300 dark:border-admin-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-ucla-500 focus:border-transparent dark:bg-admin-slate-700 dark:text-admin-slate-200"
            />
          </div>
        </div>
      </AdminDialog>
      
      <AdminDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        title="Update Payment Status"
        description="Update the payment status for this order."
        confirmLabel="Update Payment"
        confirmVariant="cerulean"
        onConfirm={handleUpdatePaymentStatus}
      >
        <div className="mt-4">
          <label htmlFor="paymentStatus" className="block text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200 mb-1">
            Payment Status
          </label>
          <select
            id="paymentStatus"
            value={newPaymentStatus}
            onChange={(e) => setNewPaymentStatus(e.target.value)}
            className="w-full border border-admin-slate-300 dark:border-admin-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-ucla-500 focus:border-transparent dark:bg-admin-slate-700 dark:text-admin-slate-200"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </AdminDialog>
    </>
  );
};

export default AdminOrderDetailPage;
