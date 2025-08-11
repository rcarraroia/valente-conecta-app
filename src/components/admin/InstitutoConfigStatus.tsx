import React from 'react';
import { useInstitutoConfig } from '@/hooks/useInstitutoConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Settings,
  Globe,
  Shield,
  Clock,
  Repeat
} from 'lucide-react';

interface InstitutoConfigStatusProps {
  onConfigureClick?: () => void;
}

export const InstitutoConfigStatus: React.FC<InstitutoConfigStatusProps> = ({
  onConfigureClick
}) => {
  const { config, isLoading, error, refetch } = useInstitutoConfig();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Carregando status da configuração...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Erro na Configuração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error.message}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            {onConfigureClick && (
              <Button onClick={onConfigureClick} size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Integração Não Configurada
          </CardTitle>
          <CardDescription>
            A integração com o Instituto Coração Valente ainda não foi configurada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Configure a integração para permitir o envio automático de dados de cadastro 
            para o Instituto Coração Valente.
          </p>
          {onConfigureClick && (
            <Button onClick={onConfigureClick}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar Integração
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (!config.is_active) return 'text-gray-500';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (!config.is_active) return <XCircle className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  const getStatusText = () => {
    if (!config.is_active) return 'Inativa';
    return 'Ativa';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${getStatusColor()}`}>
          {getStatusIcon()}
          Status da Integração: {getStatusText()}
        </CardTitle>
        <CardDescription>
          Configuração atual da integração com o Instituto Coração Valente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Ambiente</p>
              <Badge variant={config.is_sandbox ? 'secondary' : 'default'}>
                {config.is_sandbox ? 'Sandbox' : 'Produção'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">Autenticação</p>
              <Badge variant="outline">
                {config.auth_type === 'api_key' && 'API Key'}
                {config.auth_type === 'bearer' && 'Bearer Token'}
                {config.auth_type === 'basic' && 'Basic Auth'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Tentativas</p>
              <p className="text-sm text-gray-600">{config.retry_attempts}x</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Delay</p>
              <p className="text-sm text-gray-600">{config.retry_delay / 1000}s</p>
            </div>
          </div>
        </div>

        {/* Configuration Details */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Detalhes da Configuração</h4>
          <div className="bg-gray-50 p-3 rounded-md space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Endpoint:</span>
              <span className="font-mono text-xs break-all">
                {config.is_sandbox && config.sandbox_endpoint 
                  ? config.sandbox_endpoint 
                  : config.endpoint
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Método:</span>
              <Badge variant="outline" className="text-xs">
                {config.method}
              </Badge>
            </div>
            {config.created_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Criado em:</span>
                <span className="text-xs">{formatDate(config.created_at)}</span>
              </div>
            )}
            {config.updated_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Atualizado em:</span>
                <span className="text-xs">{formatDate(config.updated_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Warning for inactive integration */}
        {!config.is_active && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              A integração está desativada. Os dados de cadastro não serão enviados 
              para o Instituto Coração Valente.
            </AlertDescription>
          </Alert>
        )}

        {/* Warning for sandbox mode */}
        {config.is_active && config.is_sandbox && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              A integração está em modo sandbox. Certifique-se de alterar para 
              produção quando necessário.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onConfigureClick && (
            <Button onClick={onConfigureClick} variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Editar Configuração
            </Button>
          )}
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};