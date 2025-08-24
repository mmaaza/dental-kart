import React from 'react';

const UserEmailInvoice = ({ order }) => {
  if (!order) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return 'Rs. 0';
    return `Rs. ${price.toLocaleString()}`;
  };



  const renderProductAttributes = (attributes) => {
    if (!attributes || Object.keys(attributes).length === 0) {
      return null;
    }

    // Handle both regular objects and Map objects
    const attributeEntries = attributes instanceof Map 
      ? Array.from(attributes.entries())
      : Object.entries(attributes);

    return (
      <div className="email-product-attributes">
        {attributeEntries.map(([key, value]) => (
          <div key={key} style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>
            <span style={{ fontWeight: '500' }}>{key}:</span> {value}
          </div>
        ))}
      </div>
    );
  };

  // Safely get product data, handling both populated and unpopulated items
  const getProductData = (item) => {
    if (!item) return null;
    
    // If item.product is a populated object with name
    if (item.product && typeof item.product === 'object' && item.product.name) {
      return item.product;
    }
    
    // If item.product is just an ID or has no name, return fallback
    return {
      name: 'Product',
      images: []
    };
  };

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      background: 'white',
      color: '#333',
      lineHeight: '1.6'
    }}>
      {/* Email-specific styles */}
      <style>{`
        .email-invoice-container { 
          max-width: 800px; 
          margin: 0 auto; 
          font-family: Arial, sans-serif; 
          padding: 20px;
        }
        .email-header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
        }
        .email-title { 
          font-size: 28px; 
          font-weight: bold; 
          color: #1f2937;
          margin-bottom: 8px;
        }
        .email-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 10px;
        }
        .email-section { 
          margin-bottom: 25px; 
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .email-section-header {
          background: #f9fafb;
          padding: 15px 20px;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
          font-size: 16px;
        }
        .email-section-content {
          padding: 20px;
        }
        .email-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .email-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .email-card-header {
          font-weight: 600;
          color: #374151;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .email-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
          align-items: center;
        }
        .email-info-label {
          color: #6b7280;
          flex-shrink: 0;
        }
        .email-info-value {
          font-weight: 500;
          color: #374151;
          text-align: right;
          word-break: break-word;
        }
        .email-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 15px; 
          font-size: 13px;
        }
        .email-table th, .email-table td { 
          border: 1px solid #e5e7eb; 
          padding: 12px; 
          text-align: left;
          vertical-align: top;
        }
        .email-table th { 
          background: #f9fafb; 
          font-weight: 600;
          color: #374151;
          font-size: 12px;
        }
        .email-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }
        .email-table tbody tr:hover {
          background: #f3f4f6;
        }

        .email-product-details {
          margin-left: 12px;
          flex: 1;
          min-width: 0;
        }
        .email-product-name {
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
          font-size: 13px;
          line-height: 1.4;
        }
        .email-product-attributes {
          font-size: 11px;
          color: #6b7280;
          line-height: 1.3;
        }
        .email-total-row {
          background: #f9fafb;
          font-weight: 600;
        }
        .email-total-final {
          background: #e5e7eb;
          font-weight: 700;
          font-size: 16px;
        }
        .email-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        .email-status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .email-status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        .email-status-processing {
          background: #dbeafe;
          color: #1e40af;
        }
        .email-status-shipped {
          background: #d1fae5;
          color: #065f46;
        }
        .email-status-delivered {
          background: #dcfce7;
          color: #166534;
        }
        .email-status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }
        .email-payment-status {
          background: #f3f4f6;
          color: #374151;
        }
        @media (max-width: 768px) {
          .email-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          .email-table {
            font-size: 12px;
          }
          .email-table th, .email-table td {
            padding: 8px;
          }
          .email-title {
            font-size: 24px;
          }
          .email-subtitle {
            font-size: 14px;
          }
        }
      `}</style>

      {/* Invoice Header */}
      <div className="email-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
          {/* Left side - Company Info */}
          <div style={{ display: 'flex', alignItems: 'center', flex: '1', minWidth: '200px' }}>
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
          <div style={{ textAlign: 'right', flex: '1', minWidth: '200px' }}>
            <div className="email-title">Order Invoice</div>
            <div className="email-subtitle">Order #{order.orderNumber}</div>
            <div className="email-subtitle">Placed on {formatDate(order.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="email-section">
        <div className="email-section-header">Customer Information</div>
        <div className="email-section-content">
          <div className="email-grid">
            <div className="email-card">
              <div className="email-card-header">Personal Details</div>
              <div className="email-info-row">
                <span className="email-info-label">Name:</span>
                <span className="email-info-value">{order.shippingDetails?.fullName || order.user?.name || 'N/A'}</span>
              </div>
              <div className="email-info-row">
                <span className="email-info-label">Email:</span>
                <span className="email-info-value">{order.shippingDetails?.email || order.user?.email || 'N/A'}</span>
              </div>
              <div className="email-info-row">
                <span className="email-info-label">Phone:</span>
                <span className="email-info-value">{order.shippingDetails?.phone || 'N/A'}</span>
              </div>
              {order.shippingDetails?.clinicName && (
                <div className="email-info-row">
                  <span className="email-info-label">Clinic:</span>
                  <span className="email-info-value">{order.shippingDetails.clinicName}</span>
                </div>
              )}
            </div>
            
            <div className="email-card">
              <div className="email-card-header">Shipping Address</div>
              <div className="email-info-row">
                <span className="email-info-label">Address:</span>
                <span className="email-info-value">{order.shippingDetails?.address || 'N/A'}</span>
              </div>
              <div className="email-info-row">
                <span className="email-info-label">City:</span>
                <span className="email-info-value">{order.shippingDetails?.city || 'N/A'}</span>
              </div>
              <div className="email-info-row">
                <span className="email-info-label">Province:</span>
                <span className="email-info-value">{order.shippingDetails?.province || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="email-section">
        <div className="email-section-header">Order Items</div>
        <div className="email-section-content">
          <table className="email-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style={{ textAlign: 'center' }}>Unit Price</th>
                <th style={{ textAlign: 'center' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.map((item, index) => {
                const product = getProductData(item);
                return (
                  <tr key={index}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div className="email-product-details">
                          <div className="email-product-name">
                            {product?.name || 'Product Name Unavailable'}
                          </div>
                          {item.attributes && renderProductAttributes(item.attributes)}
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{formatPrice(item.price)}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity || 0}</td>
                    <td style={{ textAlign: 'right' }}>{formatPrice((item.price || 0) * (item.quantity || 0))}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="email-total-row">
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: '600' }}>Subtotal:</td>
                <td style={{ textAlign: 'right', fontWeight: '600' }}>{formatPrice(order.subtotal)}</td>
              </tr>
              <tr className="email-total-row">
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: '600' }}>Shipping:</td>
                <td style={{ textAlign: 'right', fontWeight: '600' }}>{formatPrice(order.shipping)}</td>
              </tr>
              <tr className="email-total-final">
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: '700' }}>Total:</td>
                <td style={{ textAlign: 'right', fontWeight: '700' }}>{formatPrice(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Order Status and Payment Info */}
      <div className="email-section">
        <div className="email-section-header">Order Status & Payment</div>
        <div className="email-section-content">
          <div className="email-grid">
            <div className="email-card">
              <div className="email-card-header">Order Status</div>
              <div className="email-info-row">
                <span className="email-info-label">Status:</span>
                <span className="email-info-value">
                  <span className={`email-status-badge email-status-${order.orderStatus || 'pending'}`}>
                    {order.orderStatus || 'pending'}
                  </span>
                </span>
              </div>
              <div className="email-info-row">
                <span className="email-info-label">Payment Method:</span>
                <span className="email-info-value">
                  {order.paymentMethod === 'pay-now' ? 'Online Payment' : 'Cash on Delivery'}
                </span>
              </div>
              <div className="email-info-row">
                <span className="email-info-label">Payment Status:</span>
                <span className="email-info-value">
                  <span className="email-status-badge email-payment-status">
                    {order.paymentStatus || 'pending'}
                  </span>
                </span>
              </div>
            </div>
            
            <div className="email-card">
              <div className="email-card-header">Next Steps</div>
              <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                {order.paymentMethod === 'pay-now' ? 
                  'We will process your payment and update you on the order status. You will receive notifications as your order progresses.' :
                  'You will pay when your order is delivered. We will contact you to confirm delivery details and arrange payment.'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="email-footer">
        <p>Thank you for your order!</p>
        <p>For any questions, please contact our customer support.</p>
        <p style={{ marginTop: '15px', fontSize: '11px', color: '#9ca3af' }}>
          Order #{order.orderNumber} • Placed on {formatDate(order.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default UserEmailInvoice; 