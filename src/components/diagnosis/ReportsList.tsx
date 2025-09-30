import React, { useState, useMemo } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileText, 
  Filter, 
  Search, 
  Calendar,
  SortAsc,
  SortDesc,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReportItem } from './ReportItem';
import { useReports } from '@/hooks/useReports';
import { DiagnosisReport } from '@/types/diagnosis';

interface ReportsListProps {
  onViewReport?: (report: DiagnosisReport) => void;
  onDownloadReport?: (report: DiagnosisReport) => void;
  className?: string;
}

type SortOption = 'date-desc' | 'date-asc' | 'severity-desc' | 'severity-asc';
type FilterOption = 'all' | 'today' | 'week' | 'month' | 'completed' | 'processing' | 'error';

export const ReportsList: React.FC<ReportsListProps> = ({
  onViewReport,
  onDownloadReport,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  const { 
    state: { reports, isLoading, error },
    actions: { fetchReports, refreshReports }
  } = useReports();

  // Filter and sort reports
  const filteredAndSortedReports = useMemo(() => {
    let filtered = [...reports];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.title?.toLowerCase().includes(search) ||
        report.summary?.toLowerCase().includes(search)
      );
    }

    // Apply date/status filters
    const now = new Date();
    switch (filterBy) {
      case 'today':
        filtered = filtered.filter(report => {
          const reportDate = new Date(report.created_at);
          return reportDate >= startOfDay(now) && reportDate <= endOfDay(now);
        });
        break;
      case 'week':
        filtered = filtered.filter(report => {
          const reportDate = new Date(report.created_at);
          return reportDate >= startOfDay(subDays(now, 7));
        });
        break;
      case 'month':
        filtered = filtered.filter(report => {
          const reportDate = new Date(report.created_at);
          return reportDate >= startOfDay(subDays(now, 30));
        });
        break;
      case 'completed':
        filtered = filtered.filter(report => report.status === 'completed');
        break;
      case 'processing':
        filtered = filtered.filter(report => report.status === 'processing');
        break;
      case 'error':
        filtered = filtered.filter(report => report.status === 'error');
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'severity-desc':
          return (b.severity_level || 0) - (a.severity_level || 0);
        case 'severity-asc':
          return (a.severity_level || 0) - (b.severity_level || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [reports, searchTerm, sortBy, filterBy]);

  const handleRefresh = async () => {
    try {
      await refreshReports();
    } catch (error) {
      console.error('Erro ao atualizar relatórios:', error);
    }
  };

  const getSortIcon = () => {
    return sortBy.includes('desc') ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />;
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Tentar Novamente
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Meus Relatórios
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3 mr-1" />
            )}
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar relatórios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter */}
          <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="completed">Concluídos</SelectItem>
              <SelectItem value="processing">Processando</SelectItem>
              <SelectItem value="error">Com erro</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-48">
              {getSortIcon()}
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Mais recente</SelectItem>
              <SelectItem value="date-asc">Mais antigo</SelectItem>
              <SelectItem value="severity-desc">Maior severidade</SelectItem>
              <SelectItem value="severity-asc">Menor severidade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports Count */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {filteredAndSortedReports.length} de {reports.length} relatórios
          </span>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
            >
              Limpar busca
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && reports.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Carregando relatórios...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAndSortedReports.length === 0 && reports.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Nenhum relatório encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Você ainda não possui relatórios de diagnóstico.
            </p>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Iniciar Nova Triagem
            </Button>
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredAndSortedReports.length === 0 && reports.length > 0 && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Nenhum resultado encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar os filtros ou termo de busca.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Limpar busca
              </Button>
              <Button variant="outline" onClick={() => setFilterBy('all')}>
                Remover filtros
              </Button>
            </div>
          </div>
        )}

        {/* Reports List */}
        {filteredAndSortedReports.length > 0 && (
          <div className="space-y-3">
            {filteredAndSortedReports.map((report) => (
              <ReportItem
                key={report.id}
                report={report}
                onView={onViewReport}
                onDownload={onDownloadReport}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};