// Componente de status do sistema para mostrar em outras páginas

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Settings } from 'lucide-react';
import { chatService } from '@/services/chat.service';
import { isFeatureEnabled } from '@/lib/diagnosis-config';
import { useNavigate } from 'react-router-dom';

interface SystemStatusProps {
  showDetails?: boolean;
  autoCheck?: boolean;
  className?: string;
}

interface SystemHealth {
  chatService: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastChecked?: Date;
  error?: string;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({
  showDetails = false,
  autoCheck = false,
  className = '',
}) => {
  const [health, setHealth] = useState<SystemHealth>({ chatService: 'unknown' });
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();

  const checkSystemHealth = async () => {
    setIsChecking(true);
    
    try {
      if (!chatService) {
        setHealth({
          chatService: 'unhealthy',
          lastChecked: new Date(),
          error: 'Serviço de chat não configurado',
        });
        return;
      }

      const healthResult = await chatService.healthCheck();
      
      setHealth({
        chatService: healthResult.healthy ? 'healthy' : 'degraded',
        lastChecked: new Date(),
        error: healthResult.error,
      });
    } catch (error: any) {
      setHealth({
        chatService: 'unhealthy',
        lastChecked: new Date(),
        error: error.message || 'Erro desconhecido',
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (autoCheck) {
      checkSystemHealth();
    }
  }, [autoCheck]);

  const getStatusIcon = () => {
    if (isChecking) return <RefreshCw className="h-4 w-4 animate-spin" />;
    
    switch (health.chatService) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (isChecking) return 'Verificando...';
    
    switch (health.chatService) {
      case 'healthy':
        return 'Sistema funcionando';
      case 'degraded':
        return 'Sistema com limitações';
      case 'unhealthy':
        return 'Sistema indisponível';
      default:
        return 'Status desconhecido';
    }
  };

  const getStatusVariant = () => {
    switch (health.chatService) {
      case 'healthy':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'unhealthy':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const shouldShowAlert = () => {
    return health.chatService === 'unhealthy' || health.chatService === 'degraded';
  };

  const getAlertVariant = () => {
    return health.chatService === 'unhealthy' ? 'destructive' : 'default';
  };

  if (!isFeatureEnabled('chatEnabled') && !showDetails) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Status badge */}
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <Badge variant={getStatusVariant() as any}>
          {getStatusText()}
        </Badge>
        {health.lastChecked && (
          <span className="text-xs text-muted-foreground">
            {health.lastChecked.toLocaleTimeString('pt-BR')}
          </span>
        )}
      </div>

      {/* Alert para problemas */}
      {shouldShowAlert() && (
        <Alert variant={getAlertVariant() as any}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {health.chatService === 'unhealthy' ? (
              <>
                <strong>Sistema indisponível:</strong> O pré-diagnóstico não está funcionando no momento.
                {health.error && (
                  <div className="mt-1 text-sm">
                    Erro: {health.error}
                  </div>
                )}
              </>
            ) : (
              <>
                <strong>Funcionalidade limitada:</strong> O sistema está funcionando com limitações.
                {health.error && (
                  <div className="mt-1 text-sm">
                    Detalhes: {health.error}
                  </div>
                )}
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Detalhes adicionais */}
      {showDetails && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkSystemHealth}
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-3 w-3" />
                Verificar
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/system-diagnostic')}
          >
            <Settings className="mr-2 h-3 w-3" />
            Diagnóstico
          </Button>
        </div>
      )}
    </div>
  );
};