// Route guard component for diagnosis features

import React, { useEffect } from 'react';
import { useDiagnosisAuth } from '@/hooks/useDiagnosisAuth';
import { AuthLoadingSpinner } from '@/components/ui/AuthLoadingSpinner';

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
    if (requireAuth && !state.isLoading && state.user) {
      const hasAccess = actions.requireAuth(redirectTo);
      if (hasAccess) {
        // Update last access when user successfully accesses diagnosis features
        actions.updateLastAccess();
      }
    }
  }, [requireAuth, state.isLoading, state.user, actions, redirectTo]);

  // Show loading state while checking authentication
  if (state.isLoading) {
    return fallback || <AuthLoadingSpinner message="Verificando autenticação..." />;
  }

  // If authentication is required but user is not authenticated,
  // the requireAuth function will handle the redirect
  if (requireAuth && !state.isAuthenticated) {
    return fallback || <AuthLoadingSpinner message="Redirecionando para login..." />;
  }

  // If authentication is required but user doesn't have access to diagnosis,
  // the requireAuth function will handle the redirect
  if (requireAuth && state.isAuthenticated && !state.canAccessDiagnosis) {
    return fallback || <AuthLoadingSpinner message="Acesso negado. Redirecionando..." />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default DiagnosisRouteGuard;