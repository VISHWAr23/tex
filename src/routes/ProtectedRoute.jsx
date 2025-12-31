import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role comparison (handle both uppercase and lowercase)
  const userRole = user.role?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles?.map(r => r.toLowerCase());
  
  if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'owner' || userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'worker') {
      return <Navigate to="/worker/my-work" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;