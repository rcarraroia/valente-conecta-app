import React from 'react';
import { useInstitutoIntegrationAdmin } from '@/hooks/useInstitutoIntegration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play
} from 'lucide-react';

export const IntegrationDashboard: React.FC = () => {
  const {
    stats,
    isLoadingStats,
    statsError,
    queueStats,
    isLoadingQueueStats,
    queueStatsError,
    refreshStats,
    processQueueNow,
    isProcessingQueue
  } = useInstitutoIntegrationAdmin();

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateIcon = (rate: number) => {
    if (rate >= 90) return <TrendingUp className="h-4 w-4" />;
    if (rate >= 70) return <Activity className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR');
  };

  if (statsError || queueStatsError) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do dashboard: {statsError?.message || queueStatsError?.message}
          </AlertDescription>
        </Alert>
        <Button onClick={refreshStats} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Integração</h2>
          <p className="text-gray-600">
            Monitoramento em tempo real da integração com o Instituto Coração Valente
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refreshStats}
            variant="outline"
            size="sm"
            disabled={isLoadingStats || isLoadingQueueStats}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(isLoadingStats || isLoadingQueueStats) ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            onClick={() => processQueueNow.mutate()}
            variant="outline"
            size="sm"
            disabled={isProcessingQueue}
          >
            <Play className={`h-4 w-4 mr-2 ${isProcessingQueue ? 'animate-spin' : ''}`} />
            Processar Fila
          </Button>
        </div>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tentativas</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? '...' : formatNumber(stats?.total_attempts || 0)}
            </div>
            <p className="text-xs text-gray-600">
              Todas as tentativas de envio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Envios Bem-sucedidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoadingStats ? '...' : formatNumber(stats?.successful_sends || 0)}
            </div>
            <p className="text-xs text-gray-600">
              Dados enviados com sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Envios Falhados</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoadingStats ? '...' : formatNumber(stats?.failed_sends || 0)}
            </div>
            <p className="text-xs text-gray-600">
              Tentativas que falharam
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {isLoadingStats ? '...' : formatNumber(stats?.pending_retries || 0)}
            </div>
            <p className="text-xs text-gray-600">
              Aguardando retry
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Success Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Taxa de Sucesso Geral
              {stats && getSuccessRateIcon(stats.success_rate)}
            </CardTitle>
            <CardDescription>
              Percentual de envios bem-sucedidos (todos os tempos)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats ? getSuccessRateColor(stats.success_rate) : ''}`}>
              {isLoadingStats ? '...' : formatPercentage(stats?.success_rate || 0)}
            </div>
            <div className="mt-2">
              <Badge variant={stats && stats.success_rate >= 90 ? 'default' : 'secondary'}>
                {stats && stats.success_rate >= 90 ? 'Excelente' : 
                 stats && stats.success_rate >= 70 ? 'Bom' : 'Precisa Atenção'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Taxa de Sucesso (24h)
              {stats && getSuccessRateIcon(stats.last_24h_success_rate)}
            </CardTitle>
            <CardDescription>
              Percentual de envios bem-sucedidos nas últimas 24 horas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats ? getSuccessRateColor(stats.last_24h_success_rate) : ''}`}>
              {isLoadingStats ? '...' : formatPercentage(stats?.last_24h_success_rate || 0)}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {isLoadingStats ? '...' : formatNumber(stats?.last_24h_attempts || 0)} tentativas
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Statistics */}
      {queueStats && (
        <Card>
          <CardHeader>
            <CardTitle>Status da Fila de Retry</CardTitle>
            <CardDescription>
              Informações sobre a fila de processamento de tentativas falhadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {isLoadingQueueStats ? '...' : formatNumber(queueStats.total_items)}
                </div>
                <p className="text-sm text-gray-600">Total na Fila</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {isLoadingQueueStats ? '...' : formatNumber(queueStats.ready_to_process)}
                </div>
                <p className="text-sm text-gray-600">Prontos para Processar</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {isLoadingQueueStats ? '...' : formatNumber(queueStats.failed_items)}
                </div>
                <p className="text-sm text-gray-600">Falharam Definitivamente</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {isLoadingQueueStats ? '...' : `${Math.round(queueStats.average_wait_time / 60)}min`}
                </div>
                <p className="text-sm text-gray-600">Tempo Médio de Espera</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      <div className="space-y-4">
        {stats && stats.success_rate < 70 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> A taxa de sucesso está abaixo de 70%. 
              Verifique a configuração da API e a conectividade.
            </AlertDescription>
          </Alert>
        )}

        {queueStats && queueStats.ready_to_process > 10 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Fila Acumulada:</strong> Há {queueStats.ready_to_process} itens 
              prontos para processamento na fila. Considere processar manualmente.
            </AlertDescription>
          </Alert>
        )}

        {stats && stats.pending_retries > 20 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Muitos Retries:</strong> Há {stats.pending_retries} tentativas 
              pendentes de retry. Isso pode indicar problemas na API externa.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Last Update Info */}
      <div className="text-center text-sm text-gray-500">
        Última atualização: {new Date().toLocaleString('pt-BR')}
        <br />
        Os dados são atualizados automaticamente a cada 15 segundos
      </div>
    </div>
  );
};