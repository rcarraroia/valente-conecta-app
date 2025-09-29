// Monitoring dashboard component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
  Download,
  BarChart3,
  PieChart,
  LineChart,
} from 'lucide-react';

import { monitoringService, HealthStatus, SystemHealth, AlertEvent } from '@/services/monitoring.service';
import { analyticsService } from '@/services/analytics.service';
import { loggingService, LogLevel, LogCategory } from '@/services/logging.service';

interface MonitoringDashboardProps {
  className?: string;
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  className = '',
}) => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [logs, setLogs] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    try {
      const [healthData, alertsData, analyticsData, logsData] = await Promise.all([
        monitoringService.getHealthStatus(),
        monitoringService.getAlerts(20),
        analyticsService.getAnalyticsSummary(
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          new Date().toISOString()
        ),
        loggingService.getLogStats(
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          new Date().toISOString()
        ),
      ]);

      setSystemHealth(healthData);
      setAlerts(alertsData);
      setAnalytics(analyticsData);
      setLogs(logsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case HealthStatus.HEALTHY:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case HealthStatus.DEGRADED:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case HealthStatus.UNHEALTHY:
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case HealthStatus.HEALTHY:
        return 'bg-green-100 text-green-800 border-green-200';
      case HealthStatus.DEGRADED:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case HealthStatus.UNHEALTHY:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatResponseTime = (time: number) => {
    return time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(1)}s`;
  };

  if (isLoading && !systemHealth) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Monitoramento</h1>
          <p className="text-gray-600">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        
        <Button onClick={loadDashboardData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status Geral</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(systemHealth.overall_status)}
                    <Badge className={getStatusColor(systemHealth.overall_status)}>
                      {systemHealth.overall_status}
                    </Badge>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="text-lg font-semibold mt-1">
                    {formatUptime(systemHealth.uptime)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Alertas Ativos</p>
                  <p className="text-lg font-semibold mt-1">
                    {alerts.filter(a => !a.resolved).length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Versão</p>
                  <p className="text-lg font-semibold mt-1">
                    {systemHealth.version}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="health" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health">Saúde do Sistema</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-4">
          {systemHealth && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Services Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Status dos Serviços
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemHealth.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <p className="font-medium">{service.service}</p>
                          <p className="text-sm text-gray-600">
                            {formatResponseTime(service.response_time)}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Métricas de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemHealth.services.map((service, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{service.service}</span>
                        <span className="text-sm text-gray-600">
                          {formatResponseTime(service.response_time)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            service.response_time < 500 ? 'bg-green-500' :
                            service.response_time < 1000 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min((service.response_time / 2000) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alertas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>Nenhum alerta ativo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <Alert key={index} className={`${getSeverityColor(alert.severity)} border`}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {new Date(alert.timestamp).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <p className="font-medium">{alert.message}</p>
                            {alert.resolved && (
                              <p className="text-sm text-green-600 mt-1">
                                ✓ Resolvido em {new Date(alert.resolved_at!).toLocaleString('pt-BR')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {alert.resolved ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Resumo de Eventos (24h)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{analytics.total_events}</p>
                      <p className="text-sm text-gray-600">Total de Eventos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{analytics.unique_users}</p>
                      <p className="text-sm text-gray-600">Usuários Únicos</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Top Eventos</h4>
                    {analytics.top_events?.slice(0, 5).map((event: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{event.event}</span>
                        <Badge variant="outline">{event.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Eventos por Tipo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.events_by_type || {}).map(([type, count]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{type}</span>
                          <span className="text-sm text-gray-600">{count as number}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{
                              width: `${((count as number) / analytics.total_events) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          {logs && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Estatísticas de Logs (24h)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{logs.total_logs}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{logs.error_rate?.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Taxa de Erro</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{logs.warning_rate?.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Taxa de Aviso</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Logs por Nível</h4>
                    {Object.entries(logs.logs_by_level || {}).map(([level, count]) => (
                      <div key={level} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{level}</span>
                        <Badge 
                          variant="outline"
                          className={
                            level === 'error' || level === 'fatal' ? 'border-red-200 text-red-700' :
                            level === 'warn' ? 'border-yellow-200 text-yellow-700' :
                            'border-gray-200 text-gray-700'
                          }
                        >
                          {count as number}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Logs por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(logs.logs_by_category || {}).map(([category, count]) => (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium capitalize">{category}</span>
                          <span className="text-sm text-gray-600">{count as number}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 bg-purple-500 rounded-full"
                            style={{
                              width: `${((count as number) / logs.total_logs) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};