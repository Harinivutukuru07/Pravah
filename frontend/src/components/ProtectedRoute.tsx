import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Role[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
