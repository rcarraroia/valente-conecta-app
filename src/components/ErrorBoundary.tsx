
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RotateCcw, Bug, Home, RefreshCw } from 'lucide-react';
import { ErrorHandler } from '@/utils/error-handler';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with enhanced context
    const report = ErrorHandler.handleError(error, {
      component: 'ErrorBoundary',
      operation: 'component_error',
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });

    this.setState({
      errorInfo,
      errorId: report.id
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: undefined 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        alert('Detalhes do erro copiados para a área de transferência');
      })
      .catch(() => {
        console.error('Falha ao copiar detalhes do erro');
      });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-cv-off-white flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full border-red-200 bg-red-50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" aria-hidden="true" />
              </div>
              <CardTitle className="text-red-800">Ops! Algo deu errado</CardTitle>
              <CardDescription className="text-red-600">
                Encontramos um erro inesperado. Nossa equipe foi notificada automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.errorId && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Bug className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>ID do Erro:</strong> {this.state.errorId}
                    <br />
                    <span className="text-sm">
                      Use este ID ao reportar o problema para nossa equipe de suporte.
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Details (Development Only) */}
              {isDevelopment && this.props.showDetails && this.state.error && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium text-yellow-800">
                        Detalhes do Erro (Desenvolvimento)
                      </summary>
                      <div className="mt-2 text-sm">
                        <p><strong>Mensagem:</strong> {this.state.error.message}</p>
                        {this.state.error.stack && (
                          <div className="mt-2">
                            <strong>Stack Trace:</strong>
                            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {this.state.error.stack}
                            </pre>
                          </div>
                        )}
                        {this.state.errorInfo?.componentStack && (
                          <div className="mt-2">
                            <strong>Component Stack:</strong>
                            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={this.resetError}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  aria-label="Tentar novamente"
                >
                  <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" />
                  Tentar Novamente
                </Button>
                
                <Button 
                  onClick={this.handleReload} 
                  variant="outline" 
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar Página
                </Button>
                
                <Button 
                  onClick={this.handleGoHome} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir para Início
                </Button>
              </div>

              {/* Copy Error Details Button (Development) */}
              {isDevelopment && (
                <div className="pt-2 border-t">
                  <Button 
                    onClick={this.copyErrorDetails} 
                    variant="ghost" 
                    size="sm"
                    className="w-full text-gray-600"
                  >
                    <Bug className="w-4 h-4 mr-2" />
                    Copiar Detalhes do Erro
                  </Button>
                </div>
              )}

              {/* Support Information */}
              <div className="text-center text-sm text-gray-600 pt-4 border-t">
                <p>
                  Se o problema persistir, entre em contato com nosso suporte em{' '}
                  <a 
                    href="mailto:suporte@institutocoracaovalente.org" 
                    className="text-blue-600 hover:underline"
                  >
                    suporte@institutocoracaovalente.org
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
