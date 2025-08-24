import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children, requireVerification = false }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (requireVerification && !currentUser.isEmailVerified) {
    // Store email for resending verification if needed
    localStorage.setItem('pendingVerificationEmail', currentUser.email);
    return <Navigate to="/verify-email" />;
  }
  
  return children;
};

export default PrivateRoute;