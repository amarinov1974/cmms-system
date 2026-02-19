/**
 * Protected Route
 * Redirects to entry screen if not authenticated
 */

import { Navigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  const sessionRole = String(session.role ?? '').trim();
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(sessionRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Access Denied</div>
      </div>
    );
  }

  return <>{children}</>;
}
