import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '../../api/auth';
import { useAuth } from './auth-context';

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <main className="loading-screen">Restoring session…</main>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'MANAGER' ? '/dashboard' : '/my-schedule'} replace />;
  }
  return children;
}
