// Diagnosis chat page

import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DiagnosisChat as DiagnosisChatComponent } from '@/components/diagnosis/DiagnosisChat';
import { DiagnosisRouteGuard } from '@/components/auth/DiagnosisRouteGuard';
import { SystemStatus } from '@/components/diagnosis/SystemStatus';
import { AuthLoadingSpinner } from '@/components/ui/AuthLoadingSpinner';
import { useDiagnosisAuth } from '@/hooks/useDiagnosisAuth';
import { useDiagnosisChat } from '@/hooks/useDiagnosisChat';
import { useResponsive, useMobileKeyboard } from '@/hooks/useResponsive';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';

/**
 * Diagnosis Chat Page
 * Protected route for the diagnosis chat interface
 */
const DiagnosisChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const authContext = useDiagnosisAuth();
  const { state: chatState, actions: chatActions } = useDiagnosisChat();
  const { isMobile, isTablet, isTouchDevice } = useResponsive();
  const { isKeyboardVisible, viewportHeight } = useMobileKeyboard();

  const sessionId = searchParams.get('session');

  // Initialize or resume session - only after auth is ready
  useEffect(() => {
    if (!authContext.state.isLoading && authContext.state.isAuthenticated && !chatState.session) {
      console.log('Starting chat session for authenticated user');
      chatActions.startSession();
    }
  }, [authContext.state.isLoading, authContext.state.isAuthenticated, chatState.session, chatActions]);

  // Update last access when chat is active
  useEffect(() => {
    if (chatState.session) {
      authContext.actions.updateLastAccess();

      // Store session ID for persistence
      localStorage.setItem('diagnosis_session_id', chatState.session.id);
    }
  }, [chatState.session, authContext.actions]);

  const handleBackToDashboard = () => {
    authContext.actions.redirectToDashboard();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleNavigate = (screen: string) => {
    if (screen === 'diagnosis') {
      // Já estamos na página de diagnóstico
      return;
    }
    // Redirecionar para a página principal com o screen desejado
    localStorage.setItem('redirect_to', screen);
    window.location.href = '/';
  };

  const handleSessionComplete = (sessionId: string) => {
    // Clear session but don't redirect automatically
    authContext.actions.clearDiagnosisSession();
    console.log('Session completed:', sessionId);
    // Don't redirect automatically - let user decide when to leave
  };

  const handleError = (error: any) => {
    console.error('Diagnosis chat error:', error);
    // Error handling is already done in the chat component
  };

  // Show loading while auth is being checked
  if (authContext.state.isLoading) {
    return <AuthLoadingSpinner message="Carregando Sistema de Triagem Comportamental..." />;
  }

  return (
    <DiagnosisRouteGuard requireAuth={true}>
      <div className="min-h-screen bg-cv-off-white flex flex-col relative">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">
                Sistema de Triagem Comportamental
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <SystemStatus autoCheck={true} />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoHome}
                className="text-gray-600 hover:text-gray-900"
              >
                <Home className="w-4 h-4 mr-1" />
                Início
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 max-w-4xl mx-auto w-full pb-16">
          <DiagnosisChatComponent
            sessionId={sessionId || undefined}
            onSessionComplete={handleSessionComplete}
            onError={handleError}
            className="h-full"
          />
        </div>

        {/* Session Status - Only show report generation */}
        {chatState.session && chatState.isGeneratingReport && (
          <div className="bg-blue-50 border-t border-blue-200 px-4 py-3 mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Gerando relatório...</span>
              </div>
            </div>
          </div>
        )}

        <BottomNavigation 
          currentTab="diagnosis" 
          onTabChange={handleNavigate}
        />
      </div>
    </DiagnosisRouteGuard>
  );
};

export default DiagnosisChatPage;