import React, { useState, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { ErrorBoundary } from 'react-error-boundary';
import { useOrderDetail, useCancelOrder } from "../../hooks/queries/useOrderQueries";
import AccountLayout from "../../components/layout/AccountLayout";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Badge from "../../components/ui/Badge";
import ErrorDisplay from "../../components/error/ErrorDisplay";
import { ErrorFallback } from "../../components/ui/SuspenseComponents";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { toast } from "react-hot-toast";

// Skeleton component for order detail loading
const OrderDetailSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
      </div>

      <div className="bg-white rounded-lg shadow-mobile">
        {/* Order Header Skeleton */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-40 mb-2 sm:mb-0 animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-32 mt-1 animate-pulse"></div>
        </div>

        {/* Order Items Skeleton */}
        <div className="p-5 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {Array(3).fill(null).map((_, index) => (
              <div key={index} className="flex items-center py-3 border-b border-gray-100 last:border-b-0">
                <div className="h-16 w-16 bg-gray-200 rounded-md mr-4 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="flex items-center">
                  <div className="h-4 bg-gray-200 rounded w-16 mr-8 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary skeletons */}
        {Array(3).fill(null).map((_, index) => (
          <div key={index} className="p-5 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
            <div className="space-y-2">
              {Array(3).fill(null).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}

        {/* Actions Skeleton */}
        <div className="p-5 flex justify-between">
          <div className="h-9 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-9 bg-gray-200 rounded w-28 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Main order detail content component that uses React Query
const OrderDetailContent = () => {
  const { id } = useParams();
  const { data: currentOrder } = useOrderDetail(id);
  const cancelOrderMutation = useCancelOrder();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeColor = (status) => {
    const statusMap = {
      pending: "yellow",
      processing: "blue",
      shipped: "indigo",
      delivered: "green",
      cancelled: "red",
    };

    return statusMap[status] || "gray";
  };

  const getPaymentStatusBadgeColor = (status) => {
    const statusMap = {
      pending: "yellow",
      paid: "green",
      failed: "red",
      refunded: "blue",
    };

    return statusMap[status] || "gray";
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      await cancelOrderMutation.mutateAsync({ 
        orderId: id, 
        cancelReason 
      });
      setCancelDialogOpen(false);
      setCancelReason("");
      toast.success("Order cancelled successfully");
    } catch (error) {
      toast.error(error.message || "Failed to cancel order");
    }
  };

  const canCancelOrder = () => {
    if (!currentOrder) return false;

    // Can cancel only if status is pending or processing
    return ["pending", "processing"].includes(currentOrder.orderStatus);
  };

  // Show loading if currentOrder is not yet available
  if (!currentOrder) {
    return <OrderDetailSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Order Details</h2>
      </div>

      <div className="bg-white rounded-lg shadow-mobile">
        {/* Order Header */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <h2 className="text-xl font-semibold mb-2 sm:mb-0">
              Order {currentOrder.orderNumber}
            </h2>
            <div className="flex gap-2">
              <Badge color={getStatusBadgeColor(currentOrder.orderStatus)}>
                {currentOrder.orderStatus.charAt(0).toUpperCase() +
                  currentOrder.orderStatus.slice(1)}
              </Badge>
              <Badge
                color={getPaymentStatusBadgeColor(currentOrder.paymentStatus)}
              >
                {currentOrder.paymentStatus.charAt(0).toUpperCase() +
                  currentOrder.paymentStatus.slice(1)}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Placed on {formatDate(currentOrder.createdAt)}
          </p>
        </div>

        {/* Order Items */}
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium mb-4">Order Items</h3>
          <div className="space-y-4">
            {currentOrder.items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-b-0"
              >
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
                  <div className="flex-1 sm:flex-none text-sm text-gray-600 sm:mr-8">
                    Qty: {item.quantity}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Rs. {item.price.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">
                Rs. {currentOrder.subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-900">
                Rs. {currentOrder.shipping.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between font-medium border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900">
                Rs. {currentOrder.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm mb-1">
                <span className="font-medium">Name:</span>{" "}
                {currentOrder.shippingDetails.fullName}
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium">Email:</span>{" "}
                {currentOrder.shippingDetails.email}
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium">Phone:</span>{" "}
                {currentOrder.shippingDetails.phone}
              </p>
            </div>
            <div>
              <p className="text-sm mb-1">
                <span className="font-medium">Address:</span>{" "}
                {currentOrder.shippingDetails.address}
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium">City:</span>{" "}
                {currentOrder.shippingDetails.city}
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium">Province:</span>{" "}
                {currentOrder.shippingDetails.province}
              </p>
              {currentOrder.shippingDetails.clinicName && (
                <p className="text-sm mb-1">
                  <span className="font-medium">Clinic:</span>{" "}
                  {currentOrder.shippingDetails.clinicName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium mb-4">Payment Information</h3>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Payment Method:</span>{" "}
              {currentOrder.paymentMethod === "pay-now"
                ? "Online Payment"
                : "Pay Later"}
            </p>
            <p className="text-sm">
              <span className="font-medium">Payment Status:</span>{" "}
              <Badge
                color={getPaymentStatusBadgeColor(currentOrder.paymentStatus)}
              >
                {currentOrder.paymentStatus.charAt(0).toUpperCase() +
                  currentOrder.paymentStatus.slice(1)}
              </Badge>
            </p>
            {currentOrder.paymentScreenshot && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2">Payment Screenshot:</p>
                <a
                  href={currentOrder.paymentScreenshot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-40 h-40 border border-gray-200 rounded-md overflow-hidden"
                >
                  <img
                    src={currentOrder.paymentScreenshot}
                    alt="Payment Screenshot"
                    className="w-full h-full object-cover"
                  />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Information */}
        {(currentOrder.trackingNumber ||
          currentOrder.estimatedDeliveryDate) && (
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-lg font-medium mb-4">Tracking Information</h3>
            {currentOrder.trackingNumber && (
              <p className="text-sm mb-2">
                <span className="font-medium">Tracking Number:</span>{" "}
                {currentOrder.trackingNumber}
              </p>
            )}
            {currentOrder.estimatedDeliveryDate && (
              <p className="text-sm">
                <span className="font-medium">Estimated Delivery:</span>{" "}
                {formatDate(currentOrder.estimatedDeliveryDate).split(",")[0]}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="p-5 flex justify-between">
          <Link
            to="/account/orders"
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
          >
            Back to Orders
          </Link>

          {canCancelOrder() && (
            <button
              onClick={() => setCancelDialogOpen(true)}
              className="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Cancel Order Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Cancel Order"
        confirmVariant="danger"
        onConfirm={handleCancelOrder}
      >
        <div className="mt-4">
          <label
            htmlFor="cancelReason"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Reason for cancellation
          </label>
          <textarea
            id="cancelReason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            placeholder="Please provide a reason for cancellation"
          />
        </div>
      </ConfirmDialog>
    </div>
  );
};

// Main OrderDetailPage component with Suspense wrapper and Error Boundary
const OrderDetailPage = () => {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">Order Details</h2>
          </div>
          <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} type="order details" />
        </div>
      )}
      onReset={() => {
        // Optional: Refresh the page or reset queries on error boundary reset
        window.location.reload();
      }}
    >
      <Suspense fallback={<OrderDetailSkeleton />}>
        <OrderDetailContent />
      </Suspense>
    </ErrorBoundary>
  );
};

export default OrderDetailPage;
