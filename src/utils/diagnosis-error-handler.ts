// Comprehensive error handling utilities for diagnosis features

import { DiagnosisError, DiagnosisErrorType } from '@/types/diagnosis';
import { createDiagnosisError } from '@/utils/diagnosis-utils';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  retryable?: boolean;
  fallbackMessage?: string;
}

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number) => void;
}

/**
 * Enhanced error handler for diagnosis features
 */
export class DiagnosisErrorHandler {
  private static instance: DiagnosisErrorHandler;
  private errorLog: DiagnosisError[] = [];
  private maxLogSize = 100;

  static getInstance(): DiagnosisErrorHandler {
    if (!DiagnosisErrorHandler.instance) {
      DiagnosisErrorHandler.instance = new DiagnosisErrorHandler();
    }
    return DiagnosisErrorHandler.instance;
  }

  /**
   * Handle and categorize errors with appropriate user feedback
   */
  handleError(
    error: any,
    context: string,
    options: ErrorHandlerOptions = {}
  ): DiagnosisError {
    const diagnosisError = this.categorizeError(error, context);
    
    // Log error
    if (options.logError !== false) {
      this.logError(diagnosisError, context);
    }

    // Show toast notification
    if (options.showToast) {
      this.showErrorToast(diagnosisError, options.fallbackMessage);
    }

    return diagnosisError;
  }

  /**
   * Categorize error based on type and context
   */
  private categorizeError(error: any, context: string): DiagnosisError {
    const message = this.extractErrorMessage(error);
    const timestamp = new Date();

    // Network errors
    if (this.isNetworkError(error, message)) {
      return createDiagnosisError(
        DiagnosisErrorType.NETWORK_ERROR,
        this.getNetworkErrorMessage(error),
        error,
        true,
        timestamp
      );
    }

    // Timeout errors
    if (this.isTimeoutError(error, message)) {
      return createDiagnosisError(
        DiagnosisErrorType.WEBHOOK_TIMEOUT,
        'A operação demorou mais que o esperado. Tente novamente.',
        error,
        true,
        timestamp
      );
    }

    // Supabase/Database errors
    if (this.isSupabaseError(error, message)) {
      return createDiagnosisError(
        DiagnosisErrorType.SUPABASE_ERROR,
        this.getSupabaseErrorMessage(error),
        error,
        this.isSupabaseRetryable(error),
        timestamp
      );
    }

    // PDF generation errors
    if (this.isPDFError(error, message, context)) {
      return createDiagnosisError(
        DiagnosisErrorType.PDF_GENERATION_ERROR,
        'Erro ao gerar relatório PDF. Tente novamente.',
        error,
        true,
        timestamp
      );
    }

    // Storage errors
    if (this.isStorageError(error, message, context)) {
      return createDiagnosisError(
        DiagnosisErrorType.STORAGE_ERROR,
        'Erro ao salvar arquivo. Verifique sua conexão.',
        error,
        true,
        timestamp
      );
    }

    // Authentication errors
    if (this.isAuthError(error, message)) {
      return createDiagnosisError(
        DiagnosisErrorType.AUTHENTICATION_ERROR,
        'Sessão expirada. Faça login novamente.',
        error,
        false,
        timestamp
      );
    }

    // Unknown error
    return createDiagnosisError(
      DiagnosisErrorType.UNKNOWN_ERROR,
      'Ocorreu um erro inesperado. Tente novamente.',
      error,
      true,
      timestamp
    );
  }

  /**
   * Extract meaningful error message from various error types
   */
  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    if (error?.data?.message) return error.data.message;
    return 'Erro desconhecido';
  }

  /**
   * Check if error is network-related
   */
  private isNetworkError(error: any, message: string): boolean {
    return (
      message.toLowerCase().includes('network') ||
      message.toLowerCase().includes('fetch') ||
      message.toLowerCase().includes('connection') ||
      error?.code === 'NETWORK_ERROR' ||
      error?.name === 'NetworkError'
    );
  }

  /**
   * Check if error is timeout-related
   */
  private isTimeoutError(error: any, message: string): boolean {
    return (
      message.toLowerCase().includes('timeout') ||
      message.toLowerCase().includes('timed out') ||
      error?.code === 'TIMEOUT' ||
      error?.name === 'TimeoutError'
    );
  }

  /**
   * Check if error is Supabase-related
   */
  private isSupabaseError(error: any, message: string): boolean {
    return (
      message.toLowerCase().includes('supabase') ||
      message.toLowerCase().includes('postgresql') ||
      message.toLowerCase().includes('database') ||
      error?.code?.startsWith('PGRST') ||
      error?.hint !== undefined
    );
  }

  /**
   * Check if error is PDF-related
   */
  private isPDFError(error: any, message: string, context: string): boolean {
    return (
      message.toLowerCase().includes('pdf') ||
      message.toLowerCase().includes('jspdf') ||
      context.toLowerCase().includes('pdf') ||
      error?.code === 'PDF_GENERATION_ERROR'
    );
  }

  /**
   * Check if error is storage-related
   */
  private isStorageError(error: any, message: string, context: string): boolean {
    return (
      message.toLowerCase().includes('storage') ||
      message.toLowerCase().includes('upload') ||
      message.toLowerCase().includes('download') ||
      context.toLowerCase().includes('storage') ||
      error?.statusCode === 413 // Payload too large
    );
  }

  /**
   * Check if error is authentication-related
   */
  private isAuthError(error: any, message: string): boolean {
    return (
      message.toLowerCase().includes('unauthorized') ||
      message.toLowerCase().includes('forbidden') ||
      message.toLowerCase().includes('authentication') ||
      error?.status === 401 ||
      error?.status === 403
    );
  }

  /**
   * Get user-friendly network error message
   */
  private getNetworkErrorMessage(error: any): string {
    if (error?.status === 0) {
      return 'Sem conexão com a internet. Verifique sua conexão.';
    }
    if (error?.status >= 500) {
      return 'Servidor temporariamente indisponível. Tente novamente.';
    }
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  /**
   * Get user-friendly Supabase error message
   */
  private getSupabaseErrorMessage(error: any): string {
    if (error?.code === 'PGRST116') {
      return 'Dados não encontrados.';
    }
    if (error?.code === 'PGRST301') {
      return 'Acesso negado. Verifique suas permissões.';
    }
    if (error?.message?.includes('duplicate key')) {
      return 'Este registro já existe.';
    }
    return 'Erro no banco de dados. Tente novamente.';
  }

  /**
   * Check if Supabase error is retryable
   */
  private isSupabaseRetryable(error: any): boolean {
    const nonRetryableCodes = ['PGRST116', 'PGRST301'];
    return !nonRetryableCodes.includes(error?.code);
  }

  /**
   * Show error toast notification
   */
  private showErrorToast(error: DiagnosisError, fallbackMessage?: string) {
    // This would integrate with your toast system
    const message = fallbackMessage || error.message;
    
    // Emit custom event for toast display
    window.dispatchEvent(new CustomEvent('diagnosis-error', {
      detail: {
        title: this.getErrorTitle(error.type),
        message,
        type: error.retryable ? 'warning' : 'error',
        retryable: error.retryable,
      }
    }));
  }

  /**
   * Get error title based on type
   */
  private getErrorTitle(type: DiagnosisErrorType): string {
    switch (type) {
      case DiagnosisErrorType.NETWORK_ERROR:
        return 'Erro de Conexão';
      case DiagnosisErrorType.WEBHOOK_TIMEOUT:
        return 'Tempo Esgotado';
      case DiagnosisErrorType.SUPABASE_ERROR:
        return 'Erro no Banco de Dados';
      case DiagnosisErrorType.PDF_GENERATION_ERROR:
        return 'Erro na Geração de PDF';
      case DiagnosisErrorType.STORAGE_ERROR:
        return 'Erro de Armazenamento';
      case DiagnosisErrorType.AUTHENTICATION_ERROR:
        return 'Erro de Autenticação';
      default:
        return 'Erro Inesperado';
    }
  }

  /**
   * Log error for monitoring and debugging
   */
  private logError(error: DiagnosisError, context: string) {
    const logEntry = {
      ...error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
    };

    // Add to in-memory log
    this.errorLog.push(error);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Diagnosis Error [${error.type}]`);
      console.error('Context:', context);
      console.error('Error:', error);
      console.error('Original:', error.details);
      console.groupEnd();
    }

    // Send to monitoring in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(logEntry);
    }
  }

  /**
   * Get current user ID for error tracking
   */
  private getCurrentUserId(): string | null {
    try {
      const authData = localStorage.getItem('supabase.auth.token');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.user?.id || null;
      }
    } catch {
      // Ignore parsing errors
    }
    return null;
  }

  /**
   * Send error to monitoring service
   */
  private sendToMonitoring(errorData: any) {
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      }).catch(() => {
        // Silently fail if monitoring is unavailable
      });
    } catch {
      // Silently fail if monitoring is unavailable
    }
  }

  /**
   * Retry function with exponential backoff
   */
  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoffMultiplier = 2,
      onRetry,
    } = options;

    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts) {
          throw this.handleError(error, 'retry-exhausted');
        }

        if (onRetry) {
          onRetry(attempt);
        }

        // Wait before retry with exponential backoff
        const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw lastError;
  }

  /**
   * Check if user is online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Get error log for debugging
   */
  getErrorLog(): DiagnosisError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }
}

// Export singleton instance
export const diagnosisErrorHandler = DiagnosisErrorHandler.getInstance();