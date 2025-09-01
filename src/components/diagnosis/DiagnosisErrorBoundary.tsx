// Global error boundary for diagnosis features

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * Error boundary specifically for diagnosis features
 * Provides graceful error handling with recovery options
 */
export class DiagnosisErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `diag_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error for monitoring
    this.logError(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      retryCount: this.retryCount,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Diagnosis Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Data:', errorData);
      console.groupEnd();
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToMonitoring(errorData);
    }

    // Store error locally for debugging
    try {
      const storedErrors = JSON.parse(localStorage.getItem('diagnosis_errors') || '[]');
      storedErrors.push(errorData);
      
      // Keep only last 10 errors
      if (storedErrors.length > 10) {
        storedErrors.splice(0, storedErrors.length - 10);
      }
      
      localStorage.setItem('diagnosis_errors', JSON.stringify(storedErrors));
    } catch (e) {
      console.warn('Failed to store error locally:', e);
    }
  };

  private sendErrorToMonitoring = (errorData: any) => {
    // In a real application, this would send to a monitoring service
    // like Sentry, LogRocket, or custom error tracking
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      }).catch(() => {
        // Silently fail if error reporting fails
      });
    } catch (e) {
      // Silently fail if error reporting fails
    }
  };

  private getUserId = (): string | null => {
    try {
      // Try to get user ID from various sources
      const user = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
      return user?.user?.id || null;
    } catch {
      return null;
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const errorData = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      timestamp: new Date().toISOString(),
    };

    const subject = encodeURIComponent(`Bug Report - Diagnosis Error ${this.state.errorId}`);
    const body = encodeURIComponent(`
Erro encontrado no sistema de pré-diagnóstico:

ID do Erro: ${errorData.errorId}
Mensagem: ${errorData.message}
Timestamp: ${errorData.timestamp}

Por favor, descreva o que você estava fazendo quando o erro ocorreu:
[Descreva aqui]

Dados técnicos:
${JSON.stringify(errorData, null, 2)}
    `);

    window.open(`mailto:suporte@coracaovalente.org?subject=${subject}&body=${body}`);
  };

  private getErrorType = (error: Error): string => {
    if (error.message.includes('ChunkLoadError')) return 'chunk_load';
    if (error.message.includes('Network')) return 'network';
    if (error.message.includes('timeout')) return 'timeout';
    if (error.message.includes('Supabase')) return 'database';
    if (error.message.includes('PDF')) return 'pdf_generation';
    return 'unknown';
  };

  private getErrorMessage = (error: Error): { title: string; description: string } => {
    const errorType = this.getErrorType(error);

    switch (errorType) {
      case 'chunk_load':
        return {
          title: 'Erro de Carregamento',
          description: 'Houve um problema ao carregar parte da aplicação. Isso pode acontecer após atualizações.',
        };
      case 'network':
        return {
          title: 'Erro de Conexão',
          description: 'Não foi possível conectar com o servidor. Verifique sua conexão com a internet.',
        };
      case 'timeout':
        return {
          title: 'Tempo Esgotado',
          description: 'A operação demorou mais que o esperado. Tente novamente.',
        };
      case 'database':
        return {
          title: 'Erro no Banco de Dados',
          description: 'Houve um problema ao acessar seus dados. Tente novamente em alguns instantes.',
        };
      case 'pdf_generation':
        return {
          title: 'Erro na Geração de PDF',
          description: 'Não foi possível gerar o relatório PDF. Tente novamente ou entre em contato com o suporte.',
        };
      default:
        return {
          title: 'Erro Inesperado',
          description: 'Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.',
        };
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { title, description } = this.getErrorMessage(this.state.error!);
      const canRetry = this.retryCount < this.maxRetries;
      const errorType = this.getErrorType(this.state.error!);

      return (
        <div className="min-h-screen bg-cv-off-white flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center">{description}</p>

              {/* Error ID for support */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 text-center">
                  ID do Erro: <code className="font-mono">{this.state.errorId}</code>
                </p>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    className="w-full bg-cv-blue hover:bg-cv-blue/90 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente ({this.maxRetries - this.retryCount} tentativas restantes)
                  </Button>
                )}

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>

                <Button
                  onClick={this.handleReportBug}
                  variant="ghost"
                  size="sm"
                  className="w-full text-gray-500 hover:text-gray-700"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Reportar Problema
                </Button>
              </div>

              {/* Additional info for specific error types */}
              {errorType === 'chunk_load' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Dica:</strong> Recarregue a página (Ctrl+F5) para resolver este problema.
                  </p>
                </div>
              )}

              {errorType === 'network' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>Dica:</strong> Verifique sua conexão com a internet e tente novamente.
                  </p>
                </div>
              )}

              {/* Development info */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-gray-100 rounded-lg p-3">
                  <summary className="text-sm font-medium cursor-pointer">
                    Detalhes Técnicos (Desenvolvimento)
                  </summary>
                  <pre className="text-xs mt-2 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DiagnosisErrorBoundary;