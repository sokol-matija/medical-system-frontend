import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Props for the PrivateRoute component
 */
interface PrivateRouteProps {
  children?: React.ReactNode;
}

/**
 * PrivateRoute component for protecting routes that require authentication
 * Redirects to login page if user is not authenticated
 * 
 * @param children - Optional children to render instead of Outlet
 * @returns The protected route component or redirect to login
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render children or outlet
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute; 