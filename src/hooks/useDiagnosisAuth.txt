// Extended authentication hook for diagnosis features

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import type { User } from '@supabase/supabase-js';

export interface DiagnosisAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  canAccessDiagnosis: boolean;
  hasActiveSession: boolean;
  lastDiagnosisAccess: Date | null;
}

export interface DiagnosisAuthActions {
  requireAuth: (redirectTo?: string) => boolean;
  redirectToLogin: (returnUrl?: string) => void;
  redirectToDashboard: () => void;
  redirectToChat: (sessionId?: string) => void;
  redirectToReports: () => void;
  clearDiagnosisSession: () => void;
  updateLastAccess: () => void;
}

export interface UseDiagnosisAuthReturn {
  state: DiagnosisAuthState;
  actions: DiagnosisAuthActions;
}

/**
 * Extended authentication hook specifically for diagnosis features
 * Provides authentication guards, routing, and session management
 */
export const useDiagnosisAuth = (): UseDiagnosisAuthReturn => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Local state for diagnosis-specific auth features
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [lastDiagnosisAccess, setLastDiagnosisAccess] = useState<Date | null>(null);

  /**
   * Check if user can access diagnosis features
   */
  const canAccessDiagnosis = useCallback((): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }

    // Add any additional checks here (e.g., subscription status, permissions)
    // For now, any authenticated user can access diagnosis
    return true;
  }, [isAuthenticated, user]);

  /**
   * Require authentication for diagnosis features
   */
  const requireAuth = useCallback((redirectTo?: string): boolean => {
    // Still loading auth state, wait
    if (loading) {
      console.log('Auth still loading, waiting...');
      return false;
    }

    // Not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, redirecting to login:', { isAuthenticated, user: !!user });
      const returnUrl = redirectTo || location.pathname + location.search;
      redirectToLogin(returnUrl);
      return false;
    }

    // Check if user can access diagnosis features
    if (!canAccessDiagnosis()) {
      console.log('User cannot access diagnosis features');
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para acessar esta funcionalidade.',
        variant: 'destructive',
      });
      // Only redirect if not already on home page
      if (location.pathname !== '/') {
        navigate('/');
      }
      return false;
    }

    console.log('Auth check passed for user:', user.email);
    return true;
  }, [loading, isAuthenticated, user, canAccessDiagnosis, location, navigate, toast]);

  /**
   * Redirect to login page with return URL
   */
  const redirectToLogin = useCallback((returnUrl?: string) => {
    const url = returnUrl || location.pathname + location.search;
    
    // Store return URL for after login
    if (url !== '/auth') {
      localStorage.setItem('diagnosis_return_url', url);
    }

    toast({
      title: 'Autenticação Necessária',
      description: 'Faça login para acessar o pré-diagnóstico.',
    });

    navigate('/auth');
  }, [location, navigate, toast]);

  /**
   * Redirect to diagnosis dashboard
   */
  const redirectToDashboard = useCallback(() => {
    if (!requireAuth('/diagnosis')) return;
    navigate('/diagnosis');
  }, [requireAuth, navigate]);

  /**
   * Redirect to diagnosis chat
   */
  const redirectToChat = useCallback((sessionId?: string) => {
    if (!requireAuth('/diagnosis/chat')) return;
    
    const url = sessionId ? `/diagnosis/chat?session=${sessionId}` : '/diagnosis/chat';
    navigate(url);
  }, [requireAuth, navigate]);

  /**
   * Redirect to diagnosis reports
   */
  const redirectToReports = useCallback(() => {
    if (!requireAuth('/diagnosis/reports')) return;
    navigate('/diagnosis/reports');
  }, [requireAuth, navigate]);

  /**
   * Clear diagnosis session data
   */
  const clearDiagnosisSession = useCallback(() => {
    setHasActiveSession(false);
    localStorage.removeItem('diagnosis_session_id');
    localStorage.removeItem('diagnosis_last_access');
  }, []);

  /**
   * Update last diagnosis access timestamp
   */
  const updateLastAccess = useCallback(() => {
    const now = new Date();
    setLastDiagnosisAccess(now);
    localStorage.setItem('diagnosis_last_access', now.toISOString());
  }, []);

  // Initialize diagnosis session state from localStorage
  useEffect(() => {
    const sessionId = localStorage.getItem('diagnosis_session_id');
    const lastAccess = localStorage.getItem('diagnosis_last_access');

    if (sessionId) {
      setHasActiveSession(true);
    }

    if (lastAccess) {
      setLastDiagnosisAccess(new Date(lastAccess));
    }
  }, []);

  // Handle post-login redirect - only from auth page
  useEffect(() => {
    if (isAuthenticated && !loading && location.pathname === '/auth') {
      const returnUrl = localStorage.getItem('diagnosis_return_url');
      if (returnUrl) {
        localStorage.removeItem('diagnosis_return_url');
        navigate(returnUrl);
      } else {
        // Default redirect after login
        navigate('/diagnosis');
      }
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  // Auto-clear old sessions (24 hours)
  useEffect(() => {
    if (lastDiagnosisAccess) {
      const hoursSinceLastAccess = (Date.now() - lastDiagnosisAccess.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastAccess > 24) {
        clearDiagnosisSession();
      }
    }
  }, [lastDiagnosisAccess, clearDiagnosisSession]);

  const state: DiagnosisAuthState = {
    user,
    isAuthenticated,
    isLoading: loading,
    canAccessDiagnosis: canAccessDiagnosis(),
    hasActiveSession,
    lastDiagnosisAccess,
  };

  const actions: DiagnosisAuthActions = {
    requireAuth,
    redirectToLogin,
    redirectToDashboard,
    redirectToChat,
    redirectToReports,
    clearDiagnosisSession,
    updateLastAccess,
  };

  return {
    state,
    actions,
  };
};

// Export types for external use
export type { DiagnosisAuthState, DiagnosisAuthActions };