import { IntegrationError, IntegrationErrorType } from '@/types/instituto-integration';
import { InputSanitizer } from './input-sanitizer';
import { toast } from 'sonner';

export interface ErrorContext {
  userId?: string;
  operation?: string;
  component?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  error?: Error;
  context?: ErrorContext;
  stack?: string;
  userAgent?: string;
  url?: string;
}

export class ErrorHandler {
  private static errorReports: ErrorReport[] = [];
  private static maxReports = 100;
  private static listeners: ((report: ErrorReport) => void)[] = [];

  /**
   * Handles and logs errors with context
   */
  static handleError(
    error: Error | string,
    context: ErrorContext = {},
    level: 'error' | 'warning' | 'info' = 'error'
  ): ErrorReport {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    const report: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      level,
      message: errorObj.message,
      error: errorObj,
      context: this.sanitizeContext(context),
      stack: errorObj.stack,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };

    // Store report
    this.storeReport(report);

    // Log to console with appropriate level
    this.logToConsole(report);

    // Notify listeners
    this.notifyListeners(report);

    // Show user-friendly message for errors
    if (level === 'error') {
      this.showUserMessage(errorObj, context);
    }

    return report;
  }

  /**
   * Handles integration-specific errors
   */
  static handleIntegrationError(
    error: IntegrationError,
    context: ErrorContext = {}
  ): ErrorReport {
    const enhancedContext = {
      ...context,
      operation: context.operation || 'instituto_integration',
      errorType: error.type,
      retryable: error.retryable,
      statusCode: error.statusCode
    };

    return this.handleError(error, enhancedContext, 'error');
  }

  /**
   * Handles network errors
   */
  static handleNetworkError(
    error: Error,
    context: ErrorContext = {}
  ): ErrorReport {
    const networkContext = {
      ...context,
      operation: context.operation || 'network_request',
      networkError: true
    };

    // Determine if it's a connectivity issue
    const isConnectivityIssue = error.message.includes('fetch') || 
                               error.message.includes('network') ||
                               error.message.includes('timeout');

    if (isConnectivityIssue) {
      networkContext.metadata = {
        ...networkContext.metadata,
        connectivity: 'poor',
        suggestion: 'check_internet_connection'
      };
    }

    return this.handleError(error, networkContext, 'error');
  }

  /**
   * Handles validation errors
   */
  static handleValidationError(
    fieldErrors: Record<string, string>,
    context: ErrorContext = {}
  ): ErrorReport {
    const validationContext = {
      ...context,
      operation: context.operation || 'validation',
      fieldErrors: this.sanitizeFieldErrors(fieldErrors)
    };

    const errorMessage = `Validation failed: ${Object.keys(fieldErrors).join(', ')}`;
    return this.handleError(new Error(errorMessage), validationContext, 'warning');
  }

  /**
   * Logs informational messages
   */
  static logInfo(
    message: string,
    context: ErrorContext = {}
  ): ErrorReport {
    return this.handleError(new Error(message), context, 'info');
  }

  /**
   * Logs warning messages
   */
  static logWarning(
    message: string,
    context: ErrorContext = {}
  ): ErrorReport {
    return this.handleError(new Error(message), context, 'warning');
  }

  /**
   * Gets recent error reports
   */
  static getReports(limit: number = 50): ErrorReport[] {
    return this.errorReports.slice(-limit);
  }

  /**
   * Gets error statistics
   */
  static getStats(): {
    total: number;
    byLevel: Record<string, number>;
    byOperation: Record<string, number>;
    recentErrors: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const byLevel: Record<string, number> = {};
    const byOperation: Record<string, number> = {};
    let recentErrors = 0;

    for (const report of this.errorReports) {
      // Count by level
      byLevel[report.level] = (byLevel[report.level] || 0) + 1;

      // Count by operation
      const operation = report.context?.operation || 'unknown';
      byOperation[operation] = (byOperation[operation] || 0) + 1;

      // Count recent errors
      if (new Date(report.timestamp).getTime() > oneHourAgo && report.level === 'error') {
        recentErrors++;
      }
    }

    return {
      total: this.errorReports.length,
      byLevel,
      byOperation,
      recentErrors
    };
  }

  /**
   * Clears old error reports
   */
  static clearOldReports(olderThanHours: number = 24): number {
    const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;
    const initialLength = this.errorReports.length;

    this.errorReports = this.errorReports.filter(
      report => new Date(report.timestamp).getTime() > cutoffTime
    );

    return initialLength - this.errorReports.length;
  }

  /**
   * Adds error listener
   */
  static addListener(listener: (report: ErrorReport) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Removes error listener
   */
  static removeListener(listener: (report: ErrorReport) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Exports error reports for analysis
   */
  static exportReports(): string {
    const sanitizedReports = this.errorReports.map(report => ({
      ...report,
      context: this.sanitizeContext(report.context || {}),
      stack: report.stack ? this.sanitizeStackTrace(report.stack) : undefined
    }));

    return JSON.stringify(sanitizedReports, null, 2);
  }

  // Private methods

  private static generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static sanitizeContext(context: ErrorContext): ErrorContext {
    return {
      ...context,
      metadata: context.metadata ? InputSanitizer.sanitizeForLogging(context.metadata) : undefined
    };
  }

  private static sanitizeFieldErrors(fieldErrors: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    
    for (const [field, error] of Object.entries(fieldErrors)) {
      sanitized[field] = InputSanitizer.sanitizeUserInput(error, { maxLength: 200 });
    }

    return sanitized;
  }

  private static sanitizeStackTrace(stack: string): string {
    // Remove sensitive file paths and keep only relevant parts
    return stack
      .split('\n')
      .map(line => {
        // Remove full file paths, keep only filename
        return line.replace(/\/.*\//g, '');
      })
      .slice(0, 10) // Limit stack trace length
      .join('\n');
  }

  private static storeReport(report: ErrorReport): void {
    this.errorReports.push(report);

    // Keep only the most recent reports
    if (this.errorReports.length > this.maxReports) {
      this.errorReports = this.errorReports.slice(-this.maxReports);
    }
  }

  private static logToConsole(report: ErrorReport): void {
    const logMessage = InputSanitizer.createSafeLogMessage(
      `[${report.level.toUpperCase()}] ${report.message}`,
      report.context
    );

    switch (report.level) {
      case 'error':
        console.error(logMessage, report.error);
        break;
      case 'warning':
        console.warn(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
    }
  }

  private static notifyListeners(report: ErrorReport): void {
    for (const listener of this.listeners) {
      try {
        listener(report);
      } catch (error) {
        console.error('Error in error handler listener:', error);
      }
    }
  }

  private static showUserMessage(error: Error, context: ErrorContext): void {
    // Don't show toast for certain operations to avoid spam
    const silentOperations = ['background_sync', 'cleanup', 'stats_update'];
    if (context.operation && silentOperations.includes(context.operation)) {
      return;
    }

    let userMessage = 'Ocorreu um erro inesperado';

    // Customize message based on error type
    if (error instanceof IntegrationError) {
      switch (error.type) {
        case IntegrationErrorType.NETWORK_ERROR:
          userMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
          break;
        case IntegrationErrorType.AUTH_ERROR:
          userMessage = 'Erro de autenticação. Verifique suas credenciais.';
          break;
        case IntegrationErrorType.VALIDATION_ERROR:
          userMessage = 'Dados inválidos. Verifique as informações inseridas.';
          break;
        case IntegrationErrorType.RATE_LIMIT:
          userMessage = 'Muitas tentativas. Aguarde um momento antes de tentar novamente.';
          break;
        case IntegrationErrorType.SERVER_ERROR:
          userMessage = 'Erro no servidor. Tente novamente em alguns minutos.';
          break;
        default:
          userMessage = error.message;
      }
    }

    toast.error(userMessage, {
      duration: 5000,
      action: context.operation === 'instituto_integration' ? {
        label: 'Tentar Novamente',
        onClick: () => {
          // Could trigger retry logic here
          console.log('User requested retry for:', context);
        }
      } : undefined
    });
  }
}

// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    ErrorHandler.handleError(event.error || new Error(event.message), {
      operation: 'global_error_handler',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.handleError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        operation: 'unhandled_promise_rejection'
      }
    );
  });
}

// Auto-cleanup old reports every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    const cleaned = ErrorHandler.clearOldReports(24);
    if (cleaned > 0) {
      console.log(`Error handler cleaned up ${cleaned} old reports`);
    }
  }, 3600000); // 1 hour
}