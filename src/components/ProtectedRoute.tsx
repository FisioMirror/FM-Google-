import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { Rol } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: Rol | Rol[];
  requireEmailVerification?: boolean;
}

export function ProtectedRoute({ children, role, requireEmailVerification = true }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const isEmailVerified = useAuthStore((s) => s.isEmailVerified);
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Cargando">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  
  // Check email verification for non-demo users
  if (requireEmailVerification && !isEmailVerified()) {
    return <Navigate to="/verify-email" replace state={{ from: location }} />;
  }
  
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) {
      return <Navigate to={user.role === 'fisioterapeuta' ? '/dashboard-fisio' : '/dashboard-paciente'} replace />;
    }
  }
  return <>{children}</>;
}
