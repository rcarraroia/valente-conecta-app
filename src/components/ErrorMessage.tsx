import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Wifi, 
  Shield, 
  Clock, 
  Server, 
  RefreshCw,
  X
} from 'lucide-react';
import { IntegrationError, IntegrationErrorType } from '@/types/instituto-integration';

interface ErrorMessageProps {
  error: Error | IntegrationError | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetry?: boolean;
  showDismiss?: boolean;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  onDismiss,
  showRetry = false,
  showDismiss = false,
  className = ''
}) => {
  const getErrorInfo = () => {
    if (typeof error === 'string') {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'Erro',
        message: error,
        variant: 'destructive' as const,
        suggestions: []
      };
    }

    if (error instanceof IntegrationError) {
      switch (error.type) {
        case IntegrationErrorType.NETWORK_ERROR:
          return {
            icon: <Wifi className="h-4 w-4" />,
            title: 'Erro de Conexão',
            message: error.message,
            variant: 'destructive' as const,
            suggestions: [
              'Verifique sua conexão com a internet',
              'Tente novamente em alguns segundos',
              'Se o problema persistir, entre em contato com o suporte'
            ]
          };

        case IntegrationErrorType.AUTH_ERROR:
          return {
            icon: <Shield className="h-4 w-4" />,
            title: 'Erro de Autenticação',
            message: error.message,
            variant: 'destructive' as const,
            suggestions: [
              'Verifique suas credenciais',
              'Faça logout e login novamente',
              'Entre em contato com o administrador se necessário'
            ]
          };

        case IntegrationErrorType.RATE_LIMIT:
          return {
            icon: <Clock className="h-4 w-4" />,
            title: 'Limite Excedido',
            message: error.message,
            variant: 'default' as const,
            suggestions: [
              'Aguarde alguns minutos antes de tentar novamente',
              'Evite fazer muitas tentativas seguidas'
            ]
          };

        case IntegrationErrorType.SERVER_ERROR:
          return {
            icon: <Server className="h-4 w-4" />,
            title: 'Erro do Servidor',
            message: error.message,
            variant: 'destructive' as const,
            suggestions: [
              'Tente novamente em alguns minutos',
              'O problema pode ser temporário',
              'Nossa equipe foi notificada automaticamente'
            ]
          };

        case IntegrationErrorType.VALIDATION_ERROR:
          return {
            icon: <AlertTriangle className="h-4 w-4" />,
            title: 'Dados Inválidos',
            message: error.message,
            variant: 'default' as const,
            suggestions: [
              'Verifique se todos os campos estão preenchidos corretamente',
              'Certifique-se de que o formato dos dados está correto'
            ]
          };

        case IntegrationErrorType.CONFIG_ERROR:
          return {
            icon: <AlertTriangle className="h-4 w-4" />,
            title: 'Erro de Configuração',
            message: error.message,
            variant: 'destructive' as const,
            suggestions: [
              'Entre em contato com o administrador do sistema',
              'A configuração da integração pode estar incorreta'
            ]
          };

        case IntegrationErrorType.CONSENT_ERROR:
          return {
            icon: <Shield className="h-4 w-4" />,
            title: 'Consentimento Necessário',
            message: error.message,
            variant: 'default' as const,
            suggestions: [
              'Você precisa autorizar o compartilhamento de dados',
              'Marque a opção de consentimento no formulário'
            ]
          };

        default:
          return {
            icon: <AlertTriangle className="h-4 w-4" />,
            title: 'Erro de Integração',
            message: error.message,
            variant: 'destructive' as const,
            suggestions: []
          };
      }
    }

    // Generic Error
    return {
      icon: <AlertTriangle className="h-4 w-4" />,
      title: 'Erro Inesperado',
      message: error.message || 'Ocorreu um erro inesperado',
      variant: 'destructive' as const,
      suggestions: [
        'Tente recarregar a página',
        'Se o problema persistir, entre em contato com o suporte'
      ]
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <Alert variant={errorInfo.variant} className={className}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2 flex-1">
          {errorInfo.icon}
          <div className="flex-1">
            <AlertDescription>
              <div className="font-medium mb-1">{errorInfo.title}</div>
              <div className="text-sm mb-2">{errorInfo.message}</div>
              
              {errorInfo.suggestions.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-medium mb-1">Sugestões:</div>
                  <ul className="text-sm space-y-1">
                    {errorInfo.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(showRetry || showDismiss) && (
                <div className="flex items-center gap-2 mt-3">
                  {showRetry && onRetry && (
                    <Button
                      onClick={onRetry}
                      size="sm"
                      variant="outline"
                      className="h-8"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Tentar Novamente
                    </Button>
                  )}
                  {showDismiss && onDismiss && (
                    <Button
                      onClick={onDismiss}
                      size="sm"
                      variant="ghost"
                      className="h-8"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Dispensar
                    </Button>
                  )}
                </div>
              )}
            </AlertDescription>
          </div>
        </div>
        
        {showDismiss && onDismiss && !showRetry && (
          <Button
            onClick={onDismiss}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 ml-2"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Alert>
  );
};