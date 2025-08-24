import React from 'react';
import { getImageUrl } from '../../lib/utils';

const VendorEmailInvoice = ({ order, vendorId, vendorInfo }) => {
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

  // Helper function to safely get product data
  const getProductData = (item) => {
    if (!item || !item.product) return null;
    
    // If product is populated (has name property)
    if (typeof item.product === 'object' && item.product.name) {
      return item.product;
    }
    
    // If product is just an ID, return fallback
    return {
      name: 'Product',
      images: []
    };
  };

  // Helper function to safely format attributes
  const formatAttributes = (attributes) => {
    if (!attributes || typeof attributes !== 'object') return '';
    
    // Handle both regular objects and Map objects
    const attributeEntries = attributes instanceof Map 
      ? Array.from(attributes.entries())
      : Object.entries(attributes);

    if (attributeEntries.length === 0) return '';

    return attributeEntries.map(([key, value]) => 
      `<div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">
        <span style="font-weight: 500;">${key}:</span> ${value}
      </div>`
    ).join('');
  };

  // Filter items that belong to this vendor
  const vendorItems = order.items.filter(item => {
    const product = getProductData(item);
    return product && product.vendor && product.vendor._id === vendorId;
  });

  if (vendorItems.length === 0) {
    return null; // No items for this vendor
  }

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
        .vendor-email-container { 
          max-width: 800px; 
          margin: 0 auto; 
          font-family: Arial, sans-serif; 
          padding: 20px;
        }
        .vendor-email-header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
        }
        .vendor-email-title { 
          font-size: 28px; 
          font-weight: bold; 
          color: #1f2937;
          margin-bottom: 8px;
        }
        .vendor-email-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 10px;
        }
        .vendor-email-section { 
          margin-bottom: 25px; 
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .vendor-email-section-header {
          background: #f9fafb;
          padding: 15px 20px;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
          font-size: 16px;
        }
        .vendor-email-section-content {
          padding: 20px;
        }
        .vendor-email-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .vendor-email-card-header {
          font-weight: 600;
          color: #374151;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .vendor-email-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
          align-items: center;
        }
        .vendor-email-info-label {
          color: #6b7280;
          flex-shrink: 0;
        }
        .vendor-email-info-value {
          font-weight: 500;
          color: #374151;
          text-align: right;
          word-break: break-word;
        }
        .vendor-email-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 15px; 
          font-size: 13px;
        }
        .vendor-email-table th, .vendor-email-table td { 
          border: 1px solid #e5e7eb; 
          padding: 12px; 
          text-align: left;
          vertical-align: top;
          font-size: 13px;
        }
        .vendor-email-table th { 
          background: #f9fafb; 
          font-weight: 600;
          color: #374151;
          font-size: 12px;
        }
        .vendor-email-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }
        .vendor-email-table tbody tr:hover {
          background: #f3f4f6;
        }
        .vendor-email-product-image {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }
        .vendor-email-product-details {
          margin-left: 12px;
          flex: 1;
          min-width: 0;
        }
        .vendor-email-product-name {
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
          font-size: 13px;
          line-height: 1.4;
        }
        .vendor-email-product-attributes {
          font-size: 11px;
          color: #6b7280;
          line-height: 1.3;
        }
        .vendor-email-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        @media (max-width: 768px) {
          .vendor-email-table {
            font-size: 12px;
          }
          .vendor-email-table th, .vendor-email-table td {
            padding: 8px;
          }
          .vendor-email-title {
            font-size: 24px;
          }
          .vendor-email-subtitle {
            font-size: 14px;
          }
        }
      `}</style>

      {/* Invoice Header */}
      <div className="vendor-email-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
          {/* Left side - Logo and Company Info */}
          <div style={{ display: 'flex', alignItems: 'center', flex: '1', minWidth: '200px' }}>
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
          <div style={{ textAlign: 'right', flex: '1', minWidth: '200px' }}>
            <div className="vendor-email-title">Vendor Order</div>
            <div className="vendor-email-subtitle">Order #{order.orderNumber}</div>
            <div className="vendor-email-subtitle">Placed on {formatDate(order.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Vendor Information */}
      {vendorInfo && (
        <div className="vendor-email-section">
          <div className="vendor-email-section-header">Vendor Information</div>
          <div className="vendor-email-section-content">
            <div className="vendor-email-card">
              <div className="vendor-email-info-row">
                <span className="vendor-email-info-label">Vendor Name:</span>
                <span className="vendor-email-info-value">{vendorInfo.name || 'N/A'}</span>
              </div>
              <div className="vendor-email-info-row">
                <span className="vendor-email-info-label">Vendor Email:</span>
                <span className="vendor-email-info-value">{vendorInfo.email || 'N/A'}</span>
              </div>
              {vendorInfo.phone && (
                <div className="vendor-email-info-row">
                  <span className="vendor-email-info-label">Vendor Phone:</span>
                  <span className="vendor-email-info-value">{vendorInfo.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shipping Address Only */}
      <div className="vendor-email-section">
        <div className="vendor-email-section-header">Shipping Address</div>
        <div className="vendor-email-section-content">
          <div className="vendor-email-card">
            <div className="vendor-email-info-row">
              <span className="vendor-email-info-label">Address:</span>
              <span className="vendor-email-info-value">{order.shippingDetails?.address || 'N/A'}</span>
            </div>
            <div className="vendor-email-info-row">
              <span className="vendor-email-info-label">City:</span>
              <span className="vendor-email-info-value">{order.shippingDetails?.city || 'N/A'}</span>
            </div>
            <div className="vendor-email-info-row">
              <span className="vendor-email-info-label">Province:</span>
              <span className="vendor-email-info-value">{order.shippingDetails?.province || 'N/A'}</span>
            </div>
            <div className="vendor-email-info-row">
              <span className="vendor-email-info-label">Phone:</span>
              <span className="vendor-email-info-value">{order.shippingDetails?.phone || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Products Only */}
      <div className="vendor-email-section">
        <div className="vendor-email-section-header">Your Products</div>
        <div className="vendor-email-section-content">
          <table className="vendor-email-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style={{ textAlign: 'center' }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {vendorItems.map((item, index) => {
                const product = getProductData(item);
                return (
                  <tr key={index}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{ width: '50px', height: '50px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                          {product && product.images && product.images.length > 0 ? (
                            <img
                              src={getImageUrl(product.images[0])}
                              alt={product.name || 'Product'}
                              className="vendor-email-product-image"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            display: product && product.images && product.images.length > 0 ? 'none' : 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: '#9ca3af' 
                          }}>
                            <span style={{ fontSize: '12px' }}>No Image</span>
                          </div>
                        </div>
                        <div className="vendor-email-product-details">
                          <div className="vendor-email-product-name">
                            {product ? product.name : 'Product'}
                          </div>
                          {item.attributes && Object.keys(item.attributes).length > 0 && (
                            <div className="vendor-email-product-attributes">
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
                    <td style={{ textAlign: 'center', fontWeight: '600' }}>{item.quantity || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="vendor-email-footer">
        <p>Please prepare and ship the above products to the provided address.</p>
        <p>For any questions, please contact our support team.</p>
        <p style={{ marginTop: '15px', fontSize: '11px', color: '#9ca3af' }}>
          Order #{order.orderNumber} • Placed on {formatDate(order.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default VendorEmailInvoice; 