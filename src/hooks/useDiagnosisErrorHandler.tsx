// Hook for comprehensive error handling in diagnosis features

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { diagnosisErrorHandler } from '@/utils/diagnosis-error-handler';
import type { DiagnosisError } from '@/types/diagnosis';

export interface ErrorHandlerState {
  lastError: DiagnosisError | null;
  errorCount: number;
  isOnline: boolean;
  hasRecurringErrors: boolean;
}

export interface ErrorHandlerActions {
  handleError: (error: any, context: string, showToast?: boolean) => DiagnosisError;
  retryWithBackoff: <T>(fn: () => Promise<T>, maxAttempts?: number) => Promise<T>;
  clearLastError: () => void;
  getErrorLog: () => DiagnosisError[];
  clearErrorLog: () => void;
  reportError: (error: DiagnosisError) => void;
}

export interface UseDiagnosisErrorHandlerReturn {
  state: ErrorHandlerState;
  actions: ErrorHandlerActions;
}

/**
 * Hook for comprehensive error handling in diagnosis features
 */
export const useDiagnosisErrorHandler = (): UseDiagnosisErrorHandlerReturn => {
  const { toast } = useToast();
  const [lastError, setLastError] = useState<DiagnosisError | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasRecurringErrors, setHasRecurringErrors] = useState(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for diagnosis errors
  useEffect(() => {
    const handleDiagnosisError = (event: CustomEvent) => {
      const { title, message, type, retryable } = event.detail;
      
      toast({
        title,
        description: message,
        variant: type === 'error' ? 'destructive' : 'default',
        action: retryable ? {
          altText: 'Tentar novamente',
          onClick: () => window.location.reload(),
        } : undefined,
      });
    };

    window.addEventListener('diagnosis-error', handleDiagnosisError as EventListener);

    return () => {
      window.removeEventListener('diagnosis-error', handleDiagnosisError as EventListener);
    };
  }, [toast]);

  // Check for recurring errors
  useEffect(() => {
    const errorLog = diagnosisErrorHandler.getErrorLog();
    const recentErrors = errorLog.filter(
      error => Date.now() - error.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    setHasRecurringErrors(recentErrors.length >= 3);
  }, [errorCount]);

  /**
   * Handle error with comprehensive processing
   */
  const handleError = useCallback((
    error: any,
    context: string,
    showToast: boolean = true
  ): DiagnosisError => {
    const diagnosisError = diagnosisErrorHandler.handleError(error, context, {
      showToast,
      logError: true,
    });

    setLastError(diagnosisError);
    setErrorCount(prev => prev + 1);

    // Show offline message if user is offline
    if (!isOnline && showToast) {
      toast({
        title: 'Sem Conexão',
        description: 'Você está offline. Algumas funcionalidades podem não funcionar.',
        variant: 'destructive',
      });
    }

    return diagnosisError;
  }, [isOnline, toast]);

  /**
   * Retry function with exponential backoff
   */
  const retryWithBackoff = useCallback(async <T,>(
    fn: () => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T> => {
    return diagnosisErrorHandler.retryWithBackoff(fn, {
      maxAttempts,
      delay: 1000,
      backoffMultiplier: 2,
      onRetry: (attempt) => {
        toast({
          title: 'Tentando Novamente',
          description: `Tentativa ${attempt} de ${maxAttempts}...`,
        });
      },
    });
  }, [toast]);

  /**
   * Clear last error
   */
  const clearLastError = useCallback(() => {
    setLastError(null);
  }, []);

  /**
   * Get error log
   */
  const getErrorLog = useCallback(() => {
    return diagnosisErrorHandler.getErrorLog();
  }, []);

  /**
   * Clear error log
   */
  const clearErrorLog = useCallback(() => {
    diagnosisErrorHandler.clearErrorLog();
    setErrorCount(0);
    setHasRecurringErrors(false);
  }, []);

  /**
   * Report error to support
   */
  const reportError = useCallback((error: DiagnosisError) => {
    const subject = encodeURIComponent(`Erro no Pré-Diagnóstico - ${error.type}`);
    const body = encodeURIComponent(`
Detalhes do Erro:

Tipo: ${error.type}
Mensagem: ${error.message}
Contexto: ${error.context || 'N/A'}
Timestamp: ${error.timestamp.toISOString()}
ID do Erro: ${error.errorId || 'N/A'}
Retryable: ${error.retryable ? 'Sim' : 'Não'}

Por favor, descreva o que você estava fazendo quando o erro ocorreu:
[Descreva aqui]

Dados técnicos:
${JSON.stringify(error.details, null, 2)}
    `);

    window.open(`mailto:suporte@coracaovalente.org?subject=${subject}&body=${body}`);
  }, []);

  const state: ErrorHandlerState = {
    lastError,
    errorCount,
    isOnline,
    hasRecurringErrors,
  };

  const actions: ErrorHandlerActions = {
    handleError,
    retryWithBackoff,
    clearLastError,
    getErrorLog,
    clearErrorLog,
    reportError,
  };

  return {
    state,
    actions,
  };
};

export default useDiagnosisErrorHandler;