import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';

interface ProtectedRouteProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

export function ProtectedRoute({ children, requireSuperAdmin = false }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { canAccessAdmin, isSuperAdmin, loading: rolesLoading } = useUserRoles();
  
  const loading = authLoading || rolesLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🐑</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user has admin access
  if (!canAccessAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🚫🐑</div>
          <h1 className="text-2xl font-display font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the admin area. 
            Only owners and super admins can enter.
          </p>
          <p className="text-sm text-muted-foreground/70">
            If you believe this is an error, contact the system administrator.
          </p>
        </div>
      </div>
    );
  }

  // Check if super admin is required
  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">⚡🐑</div>
          <h1 className="text-2xl font-display font-bold mb-2">Super Admin Required</h1>
          <p className="text-muted-foreground mb-4">
            This section requires super admin privileges.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}