import React from 'react';
import { getImageUrl } from '../../lib/utils';

const InvoicePrintPage = ({ order }) => {
  if (!order) return null;

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
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusBadgeColor = (status) => {
    const statusMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800'
    };
    
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="invoice-print-page">
      <style jsx>{`
        .invoice-print-page {
          font-family: 'Arial', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          color: #333;
        }
        
        .invoice-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
        }
        
        .invoice-title {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .invoice-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 10px;
        }
        
        .invoice-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          font-size: 14px;
        }
        
        .invoice-section {
          margin-bottom: 25px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .invoice-section-header {
          background: #f9fafb;
          padding: 15px 20px;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
          font-size: 16px;
        }
        
        .invoice-section-content {
          padding: 20px;
        }
        
        .invoice-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .invoice-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 15px;
        }
        
        .invoice-card-header {
          font-weight: 600;
          color: #374151;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .invoice-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
        }
        
        .invoice-info-label {
          color: #6b7280;
        }
        
        .invoice-info-value {
          font-weight: 500;
          color: #374151;
        }
        
        .invoice-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        
        .invoice-table th,
        .invoice-table td {
          border: 1px solid #e5e7eb;
          padding: 12px;
          text-align: left;
          font-size: 13px;
        }
        
        .invoice-table th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        
        .invoice-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .invoice-product-image {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 4px;
        }
        
        .invoice-product-details {
          margin-left: 12px;
        }
        
        .invoice-product-name {
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
          font-size: 13px;
        }
        
        .invoice-product-attributes {
          font-size: 11px;
          color: #6b7280;
        }
        
        .invoice-total-row {
          background: #f9fafb;
          font-weight: 600;
        }
        
        .invoice-total-final {
          background: #e5e7eb;
          font-weight: 700;
          font-size: 16px;
        }
        
        .invoice-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        
        @media print {
          .invoice-print-page {
            box-shadow: none !important;
            border: none !important;
          }
          
          body {
            background: white !important;
            color: #333 !important;
          }
        }
      `}</style>

      {/* Invoice Header */}
      <div className="invoice-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          {/* Left side - Logo and Company Info */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/uploads/logo-orange.png" 
              alt="Dental Kart Logo" 
              style={{ 
                height: '50px', 
                width: '50px',
                marginRight: '15px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                Dental Kart
              </div>
              <div style={{ fontSize: '14px', color: '#f97316', fontWeight: '600' }}>
                Nepal
              </div>
            </div>
          </div>
          
          {/* Right side - Order Invoice Details */}
          <div style={{ textAlign: 'right' }}>
            <div className="invoice-title">Order Invoice</div>
            <div className="invoice-subtitle">Order #{order.orderNumber}</div>
            <div className="invoice-subtitle">Placed on {formatDate(order.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="invoice-section">
        <div className="invoice-section-header">Customer Information</div>
        <div className="invoice-section-content">
          <div className="invoice-grid">
            <div className="invoice-card">
              <div className="invoice-card-header">Personal Details</div>
              <div className="invoice-info-row">
                <span className="invoice-info-label">Name:</span>
                <span className="invoice-info-value">{order.user?.name || 'N/A'}</span>
              </div>
              <div className="invoice-info-row">
                <span className="invoice-info-label">Email:</span>
                <span className="invoice-info-value">{order.user?.email || 'N/A'}</span>
              </div>
              <div className="invoice-info-row">
                <span className="invoice-info-label">Phone:</span>
                <span className="invoice-info-value">{order.shippingDetails.phone}</span>
              </div>
              {order.shippingDetails.clinicName && (
                <div className="invoice-info-row">
                  <span className="invoice-info-label">Clinic:</span>
                  <span className="invoice-info-value">{order.shippingDetails.clinicName}</span>
                </div>
              )}
            </div>
            
            <div className="invoice-card">
              <div className="invoice-card-header">Shipping Address</div>
              <div className="invoice-info-row">
                <span className="invoice-info-label">Address:</span>
                <span className="invoice-info-value">{order.shippingDetails.address}</span>
              </div>
              <div className="invoice-info-row">
                <span className="invoice-info-label">City:</span>
                <span className="invoice-info-value">{order.shippingDetails.city}</span>
              </div>
              <div className="invoice-info-row">
                <span className="invoice-info-label">Province:</span>
                <span className="invoice-info-value">{order.shippingDetails.province}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="invoice-section">
        <div className="invoice-section-header">Order Items</div>
        <div className="invoice-section-content">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style={{ textAlign: 'center' }}>Unit Price</th>
                <th style={{ textAlign: 'center' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '50px', height: '50px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                        {item.product.images && item.product.images.length > 0 ? (
                          <img
                            src={getImageUrl(item.product.images[0])}
                            alt={item.product.name}
                            className="invoice-product-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                            <span style={{ fontSize: '12px' }}>No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="invoice-product-details">
                        <div className="invoice-product-name">{item.product.name}</div>
                        {Object.keys(item.attributes || {}).length > 0 && (
                          <div className="invoice-product-attributes">
                            {Object.entries(item.attributes).map(([key, value]) => (
                              <div key={key}>
                                <span style={{ fontWeight: '500' }}>{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>Rs. {item.price}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>Rs. {(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="invoice-total-row">
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: '600' }}>Subtotal:</td>
                <td style={{ textAlign: 'right', fontWeight: '600' }}>Rs. {order.subtotal.toLocaleString()}</td>
              </tr>
              <tr className="invoice-total-row">
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: '600' }}>Shipping:</td>
                <td style={{ textAlign: 'right', fontWeight: '600' }}>Rs. {order.shipping.toLocaleString()}</td>
              </tr>
              <tr className="invoice-total-final">
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: '700' }}>Total:</td>
                <td style={{ textAlign: 'right', fontWeight: '700' }}>Rs. {order.total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="invoice-footer">
        <p>Thank you for your order!</p>
        <p>For any questions, please contact our customer support.</p>
      </div>
    </div>
  );
};

export default InvoicePrintPage; 