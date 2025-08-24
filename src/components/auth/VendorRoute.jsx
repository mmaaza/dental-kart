import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const VendorRoute = ({ children }) => {
  const location = useLocation();
  const vendorToken = localStorage.getItem('vendorToken');
  const vendorData = JSON.parse(localStorage.getItem('vendorData') || '{}');

  if (!vendorToken) {
    // Redirect to vendor login if not authenticated
    return <Navigate to="/vendor/login" state={{ from: location }} replace />;
  }

  // Check if vendor login is allowed
  if (!vendorData.isLoginAllowed && !vendorData.adminAccess) {
    return <Navigate to="/vendor/login" state={{ error: 'Your login access has been disabled. Please contact support.' }} replace />;
  }

  return children;
};

export default VendorRoute;