import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrder';
import VendorLayout from '../../components/layout/VendorLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import ErrorDisplay from '../../components/error/ErrorDisplay';
import { toast } from 'react-hot-toast';

const VendorOrderDetailPage = () => {
  const { id } = useParams();
  const { 
    fetchOrderById, 
    currentOrder, 
    loading, 
    error 
  } = useOrder();
  
  
  
  // Prefer vendorId from token payload if available, fallback to localStorage userId
  const getVendorIdFromToken = () => {
    try {
      const token = localStorage.getItem('vendorToken');
      if (!token) return '';
      const base64 = token.split('.')[1];
      if (!base64) return '';
      const payload = JSON.parse(atob(base64));
      return payload?.id ? String(payload.id) : '';
    } catch {
      return '';
    }
  };
  const getVendorId = () => {
    const fromToken = getVendorIdFromToken();
    if (fromToken) return fromToken;
    const id = localStorage.getItem('vendorId') || localStorage.getItem('userId');
    return id ? String(id) : '';
  };
  const normalizeId = (val) => {
    if (!val) return '';
    if (typeof val === 'object') {
      if (val._id) return String(val._id);
      return String(val.toString?.() || '');
    }
    return String(val);
  };

  useEffect(() => {
    const loadOrderDetails = async () => {
      await fetchOrderById(id);
    };
    
    loadOrderDetails();
  }, [fetchOrderById, id]);
  
  
  
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
      pending: 'yellow',
      processing: 'blue',
      shipped: 'indigo',
      delivered: 'green',
      cancelled: 'red'
    };
    
    return statusMap[status] || 'gray';
  };
  
  // Payment status badge hidden in header for vendor view
  
  
  
  if (loading) {
    return (
      <>
        <div className="flex justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }
  
  if (error || !currentOrder) {
    return (
      <>
        <ErrorDisplay
          message={error || 'Order not found'}
          actionText="Back to Orders"
          actionLink="/vendor/orders"
        />
      </>
    );
  }
  
  // Permission is enforced by the backend vendor endpoint; render the order details directly
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order {currentOrder.orderNumber}</h1>
            <p className="mt-1 text-sm text-gray-500">Placed on {formatDate(currentOrder.createdAt)}</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            {(() => {
              const vendorId = getVendorId();
              const vendorSubOrder = (currentOrder.subOrders || []).find(
                (so) => normalizeId(so.vendor) === String(vendorId)
              );
              const status = vendorSubOrder?.status || currentOrder.orderStatus;
              return (
                <Badge color={getStatusBadgeColor(status)}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              );
            })()}
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          

          {/* Order Items */}
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-lg font-medium mb-4">Order Items</h3>
            <div className="space-y-4">
              {(() => {
                const vendorId = getVendorId();
                const vendorSubOrder = (currentOrder.subOrders || []).find(
                  (so) => normalizeId(so.vendor) === String(vendorId)
                );
                let items = currentOrder.items || [];
                if (vendorSubOrder && Array.isArray(vendorSubOrder.items) && vendorSubOrder.items.length > 0) {
                  const vendorProductIds = new Set(
                    vendorSubOrder.items.map((i) => normalizeId(i.product))
                  );
                  items = (currentOrder.items || []).filter((ci) => vendorProductIds.has(normalizeId(ci.product?._id)));
                } else {
                  // Fallback: filter by product.vendor match
                  items = (currentOrder.items || []).filter((ci) => normalizeId(ci.product?.vendor) === String(vendorId));
                }
                return items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center flex-1">
                    <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden mr-4 flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-500 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/products/${item.product.slug}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary-600"
                      >
                        {item.product.name}
                      </Link>
                      {Object.keys(item.attributes || {}).length > 0 && (
                        <div className="mt-1 text-xs text-gray-600">
                          {Object.entries(item.attributes).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center mt-3 sm:mt-0">
                    <div className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </div>
                  </div>
                </div>
                ));
              })()}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm mb-1">
                  <span className="font-medium">Address:</span> {currentOrder.shippingDetails.address}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">City:</span> {currentOrder.shippingDetails.city}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1">
                  <span className="font-medium">Province:</span> {currentOrder.shippingDetails.province}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Notes:</span> {currentOrder.shippingDetails.orderNote || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-lg font-medium mb-4">Tracking Information</h3>
            {(() => {
              const vendorId = getVendorId();
              const vendorSubOrder = (currentOrder.subOrders || []).find(
                (so) => normalizeId(so.vendor) === String(vendorId)
              );
              const tracking = vendorSubOrder?.trackingNumber || currentOrder.trackingNumber;
              const eta = vendorSubOrder?.estimatedDeliveryDate || currentOrder.estimatedDeliveryDate;
              if (tracking || eta) {
                return (
                  <div>
                    {tracking && (
                      <p className="text-sm mb-2">
                        <span className="font-medium">Tracking Number:</span> {tracking}
                      </p>
                    )}
                    {eta && (
                      <p className="text-sm">
                        <span className="font-medium">Estimated Delivery:</span> {' '}
                        {formatDate(eta).split(',')[0]}
                      </p>
                    )}
                  </div>
                );
              }
              return <p className="text-sm text-gray-500">No tracking information available yet.</p>;
            })()}
          </div>

          {/* Actions */}
          <div className="p-5">
            <Link
              to="/vendor/orders"
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
      
      
    </>
  );
};

export default VendorOrderDetailPage;
