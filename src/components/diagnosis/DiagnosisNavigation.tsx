// Navigation component for diagnosis features

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiagnosisAuth } from '@/hooks/useDiagnosisAuth';
import { Button } from '@/components/ui/button';
import { Brain, FileText, MessageSquare, Activity } from 'lucide-react';

interface DiagnosisNavigationProps {
  variant?: 'button' | 'card' | 'link';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

/**
 * Navigation component for diagnosis features
 * Handles authentication and routing automatically
 */
export const DiagnosisNavigation: React.FC<DiagnosisNavigationProps> = ({
  variant = 'button',
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const navigate = useNavigate();
  const { state, actions } = useDiagnosisAuth();

  const handleStartDiagnosis = () => {
    if (state.isAuthenticated) {
      actions.redirectToDashboard();
    } else {
      actions.redirectToLogin('/diagnosis');
    }
  };

  const handleViewReports = () => {
    if (state.isAuthenticated) {
      actions.redirectToReports();
    } else {
      actions.redirectToLogin('/diagnosis/reports');
    }
  };

  const handleContinueChat = () => {
    if (state.isAuthenticated) {
      actions.redirectToChat();
    } else {
      actions.redirectToLogin('/diagnosis/chat');
    }
  };

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-cv-blue/10 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-cv-blue" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pré-Diagnóstico</h3>
            <p className="text-sm text-gray-600">Avaliação inicial de saúde mental</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleStartDiagnosis}
            className="w-full bg-cv-blue hover:bg-cv-blue/90 text-white"
            size={size}
          >
            {showIcon && <Brain className="w-4 h-4 mr-2" />}
            {state.hasActiveSession ? 'Continuar Diagnóstico' : 'Iniciar Pré-Diagnóstico'}
          </Button>

          {state.isAuthenticated && (
            <div className="flex gap-2">
              <Button
                onClick={handleViewReports}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-1" />
                Relatórios
              </Button>
              
              {state.hasActiveSession && (
                <Button
                  onClick={handleContinueChat}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Chat
                </Button>
              )}
            </div>
          )}
        </div>

        {state.lastDiagnosisAccess && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Último acesso: {state.lastDiagnosisAccess.toLocaleDateString('pt-BR')} às{' '}
              {state.lastDiagnosisAccess.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'link') {
    return (
      <button
        onClick={handleStartDiagnosis}
        className={`flex items-center gap-2 text-cv-blue hover:text-cv-blue/80 transition-colors ${className}`}
      >
        {showIcon && <Brain className="w-4 h-4" />}
        <span>Pré-Diagnóstico</span>
        {state.hasActiveSession && (
          <div className="w-2 h-2 bg-green-500 rounded-full" title="Sessão ativa" />
        )}
      </button>
    );
  }

  // Default button variant
  return (
    <Button
      onClick={handleStartDiagnosis}
      className={`bg-cv-blue hover:bg-cv-blue/90 text-white ${className}`}
      size={size}
    >
      {showIcon && <Brain className="w-4 h-4 mr-2" />}
      {state.hasActiveSession ? 'Continuar Diagnóstico' : 'Pré-Diagnóstico'}
      {state.hasActiveSession && (
        <div className="w-2 h-2 bg-green-400 rounded-full ml-2" />
      )}
    </Button>
  );
};

export default DiagnosisNavigation;