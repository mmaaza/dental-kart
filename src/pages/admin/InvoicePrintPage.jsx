import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrder';
import InvoicePrintPage from '../../components/ui/InvoicePrintPage';

const InvoicePrintPageWrapper = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { fetchOrderById, currentOrder, loading } = useOrder();
  const [shouldPrint, setShouldPrint] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (id) {
        await fetchOrderById(id);
      }
    };
    
    loadOrder();
  }, [fetchOrderById, id]);

  useEffect(() => {
    if (currentOrder && !loading && !shouldPrint) {
      setShouldPrint(true);
      // Trigger print after a short delay to ensure content is rendered
      setTimeout(() => {
        window.print();
        // Close the window after printing
        setTimeout(() => {
          window.close();
        }, 1000);
      }, 500);
    }
  }, [currentOrder, loading, shouldPrint]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <div>Loading invoice...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>Order not found</div>
      </div>
    );
  }

  return <InvoicePrintPage order={currentOrder} />;
};

export default InvoicePrintPageWrapper; 