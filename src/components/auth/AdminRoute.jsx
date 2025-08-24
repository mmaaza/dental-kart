import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!currentUser.isEmailVerified) {
    localStorage.setItem('pendingVerificationEmail', currentUser.email);
    return <Navigate to="/verify-email" />;
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

export default AdminRoute;