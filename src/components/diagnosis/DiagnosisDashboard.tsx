// Diagnosis Dashboard Component

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useReports } from '@/hooks/useReports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  FileText, 
  Plus, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DiagnosisDashboardProps {
  className?: string;
}

export const DiagnosisDashboard: React.FC<DiagnosisDashboardProps> = ({ 
  className = '' 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state: reportsState, actions: reportsActions } = useReports();

  // Handle navigation to chat
  const handleStartDiagnosis = () => {
    navigate('/diagnosis/chat');
  };

  // Handle report download
  const handleDownloadReport = (reportId: string) => {
    reportsActions.downloadReport(reportId);
  };

  // Handle report view
  const handleViewReport = (reportId: string) => {
    navigate(`/diagnosis/report/${reportId}`);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'error':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  if (!user) {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você precisa estar logado para acessar o dashboard de diagnóstico.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Pré-Diagnóstico</h1>
        </div>
        <p className="text-muted-foreground">
          Realize um pré-diagnóstico médico com inteligência artificial e gerencie seus relatórios.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Start New Diagnosis */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleStartDiagnosis}>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Novo Diagnóstico</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Inicie uma nova sessão de pré-diagnóstico com nossa IA especializada.
            </CardDescription>
            <Button className="w-full">
              Começar Agora
            </Button>
          </CardContent>
        </Card>

        {/* Reports Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Meus Relatórios</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-semibold">{reportsState.totalCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Concluídos</span>
                <span className="font-semibold">
                  {reportsState.reports.filter(r => r.status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pendentes</span>
                <span className="font-semibold">
                  {reportsState.reports.filter(r => r.status === 'pending').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Atividade Recente</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              {reportsState.reports.length > 0 ? (
                <>
                  Último relatório criado{' '}
                  {formatDistanceToNow(new Date(reportsState.reports[0].created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </>
              ) : (
                'Nenhum relatório criado ainda'
              )}
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {reportsState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {reportsState.error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={reportsActions.clearError}
            >
              Dispensar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Reports List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Histórico de Relatórios</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={reportsActions.refreshReports}
              disabled={reportsState.isLoading}
            >
              Atualizar
            </Button>
          </div>
          <CardDescription>
            Visualize e gerencie todos os seus relatórios de pré-diagnóstico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportsState.isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : reportsState.reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum relatório encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não possui relatórios de pré-diagnóstico.
              </p>
              <Button onClick={handleStartDiagnosis}>
                Criar Primeiro Relatório
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reportsState.reports.slice(0, 5).map((report) => (
                <div 
                  key={report.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">{report.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(report.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                        <Badge variant={getStatusBadgeVariant(report.status)}>
                          {getStatusText(report.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReport(report.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    {report.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report.id)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {reportsState.reports.length > 5 && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/diagnosis/reports')}
                  >
                    Ver Todos os Relatórios ({reportsState.totalCount})
                  </Button>
                </div>
              )}
              
              {reportsState.hasMore && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline"
                    onClick={reportsActions.loadMoreReports}
                    disabled={reportsState.isLoading}
                  >
                    Carregar Mais
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiagnosisDashboard;