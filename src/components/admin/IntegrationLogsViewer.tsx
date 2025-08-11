import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IntegrationLog {
  id: string;
  user_id: string;
  status: 'success' | 'failed' | 'pending' | 'retry';
  payload: any;
  response?: any;
  error_message?: string;
  attempt_count: number;
  created_at: string;
  updated_at: string;
}

interface LogsFilters {
  status: string;
  search: string;
  dateRange: string;
}

export const IntegrationLogsViewer: React.FC = () => {
  const [filters, setFilters] = useState<LogsFilters>({
    status: 'all',
    search: '',
    dateRange: '24h'
  });
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ['integration-logs', filters],
    queryFn: async (): Promise<IntegrationLog[]> => {
      let query = supabase
        .from('instituto_integration_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply status filter
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply date range filter
      const now = new Date();
      let startDate: Date;
      
      switch (filters.dateRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      query = query.gte('created_at', startDate.toISOString());

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar logs: ${error.message}`);
      }

      // Apply search filter on client side
      let filteredData = data || [];
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(log => 
          log.payload?.email?.toLowerCase().includes(searchLower) ||
          log.payload?.nome?.toLowerCase().includes(searchLower) ||
          log.error_message?.toLowerCase().includes(searchLower) ||
          log.user_id.toLowerCase().includes(searchLower)
        );
      }

      return filteredData;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000 // Consider stale after 15 seconds
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'retry':
        return <RotateCcw className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default' as const,
      failed: 'destructive' as const,
      pending: 'secondary' as const,
      retry: 'outline' as const
    };

    const labels = {
      success: 'Sucesso',
      failed: 'Falhou',
      pending: 'Pendente',
      retry: 'Retry'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
  };

  const handleFilterChange = (key: keyof LogsFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message}
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} className="mt-4" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Logs de Integração
        </CardTitle>
        <CardDescription>
          Histórico detalhado de todas as tentativas de integração
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por email, nome ou erro..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-64"
            />
          </div>

          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="retry">Retry</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hora</SelectItem>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Logs List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 h-16 rounded-md"></div>
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="border rounded-md p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLogExpansion(log.id)}
                      className="p-1 h-auto"
                    >
                      {expandedLogs.has(log.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    {getStatusIcon(log.status)}
                    <div>
                      <div className="font-medium">
                        {log.payload?.nome || 'Nome não disponível'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {log.payload?.email || 'Email não disponível'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(log.status)}
                    <div className="text-sm text-gray-500">
                      {formatDate(log.created_at)}
                    </div>
                    {log.attempt_count > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {log.attempt_count}ª tentativa
                      </Badge>
                    )}
                  </div>
                </div>

                {expandedLogs.has(log.id) && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {/* Payload */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Dados Enviados:</h4>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>

                    {/* Response */}
                    {log.response && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Resposta da API:</h4>
                        <pre className="bg-green-50 p-3 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.response, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Error */}
                    {log.error_message && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-red-600">Erro:</h4>
                        <div className="bg-red-50 p-3 rounded text-sm text-red-800">
                          {log.error_message}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">ID do Log:</span> {log.id}
                      </div>
                      <div>
                        <span className="font-medium">ID do Usuário:</span> {log.user_id}
                      </div>
                      <div>
                        <span className="font-medium">Criado em:</span> {formatDate(log.created_at)}
                      </div>
                      <div>
                        <span className="font-medium">Atualizado em:</span> {formatDate(log.updated_at)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum log encontrado para os filtros selecionados.</p>
            </div>
          )}
        </div>

        {/* Summary */}
        {logs && logs.length > 0 && (
          <div className="text-sm text-gray-600 text-center pt-4 border-t">
            Mostrando {logs.length} logs {filters.dateRange === '24h' ? 'das últimas 24 horas' : 
            filters.dateRange === '7d' ? 'dos últimos 7 dias' : 
            filters.dateRange === '30d' ? 'dos últimos 30 dias' : 'da última hora'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};