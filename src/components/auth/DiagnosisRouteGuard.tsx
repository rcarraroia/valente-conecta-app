// Route guard component for diagnosis features

import React, { useEffect } from 'react';
import { useDiagnosisAuth } from '@/hooks/useDiagnosisAuth';
import { Loader2 } from 'lucide-react';

interface DiagnosisRouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * Route guard component that protects diagnosis routes
 * Handles authentication checks and redirects
 */
export const DiagnosisRouteGuard: React.FC<DiagnosisRouteGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo,
  fallback,
}) => {
  const { state, actions } = useDiagnosisAuth();

  useEffect(() => {
    if (requireAuth && !state.isLoading) {
      const hasAccess = actions.requireAuth(redirectTo);
      if (hasAccess) {
        // Update last access when user successfully accesses diagnosis features
        actions.updateLastAccess();
      }
    }
  }, [requireAuth, state.isLoading, actions, redirectTo]);

  // Show loading state while checking authentication
  if (state.isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-cv-off-white">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cv-blue" />
            <p className="text-gray-600">Verificando autenticação...</p>
          </div>
        </div>
      )
    );
  }

  // If authentication is required but user is not authenticated,
  // the requireAuth function will handle the redirect
  if (requireAuth && !state.isAuthenticated) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-cv-off-white">
          <div className="text-center">
            <p className="text-gray-600">Redirecionando para login...</p>
          </div>
        </div>
      )
    );
  }

  // If authentication is required but user doesn't have access to diagnosis,
  // the requireAuth function will handle the redirect
  if (requireAuth && state.isAuthenticated && !state.canAccessDiagnosis) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-cv-off-white">
          <div className="text-center">
            <p className="text-gray-600">Acesso negado. Redirecionando...</p>
          </div>
        </div>
      )
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default DiagnosisRouteGuard;