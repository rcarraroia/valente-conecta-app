import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Clock, 
  AlertCircle,
  Loader2,
  ExternalLink,
  Smartphone,
  Tablet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useResponsive } from '@/hooks/useResponsive';
import { DiagnosisReport } from '@/types/diagnosis';
import { SEVERITY_LEVELS } from '@/lib/diagnosis-constants';

interface ReportItemProps {
  report: DiagnosisReport;
  onView?: (report: DiagnosisReport) => void;
  onDownload?: (report: DiagnosisReport) => void;
  className?: string;
  viewMode?: 'list' | 'grid';
  isMobile?: boolean;
}

export const ReportItem: React.FC<ReportItemProps> = ({
  report,
  onView,
  onDownload,
  className = '',
  viewMode = 'list',
  isMobile: propIsMobile
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  
  // Responsive hooks
  const { isMobile, isTablet, isTouchDevice } = useResponsive();
  const actualIsMobile = propIsMobile ?? isMobile;

  const handleView = () => {
    if (onView) {
      onView(report);
    }
  };

  const handleDownload = async () => {
    if (!onDownload) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      await onDownload(report);
    } catch (error: any) {
      setDownloadError(error.message || 'Erro ao baixar o relatório');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return actualIsMobile 
        ? format(date, "dd/MM/yyyy", { locale: ptBR })
        : format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm', { locale: ptBR });
    } catch {
      return '--:--';
    }
  };

  const getSeverityInfo = (severity?: number) => {
    if (!severity || !SEVERITY_LEVELS[severity as keyof typeof SEVERITY_LEVELS]) {
      return { label: 'Não informado', color: 'gray' };
    }
    return SEVERITY_LEVELS[severity as keyof typeof SEVERITY_LEVELS];
  };

  const severityInfo = getSeverityInfo(report.severity_level);

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className} ${
      actualIsMobile ? 'shadow-sm' : ''
    }`}>
      <CardContent className={actualIsMobile ? 'p-3' : 'p-4'}>
        <div className={`${
          actualIsMobile || viewMode === 'grid' 
            ? 'flex flex-col gap-3' 
            : 'flex items-start justify-between gap-4'
        }`}>
          {/* Report Info */}
          <div className="flex-1 min-w-0">
            <div className={`flex items-center gap-2 mb-2 ${actualIsMobile ? 'mb-2' : 'mb-2'}`}>
              <FileText className={`text-blue-600 flex-shrink-0 ${actualIsMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
              <h3 className={`font-medium text-gray-900 truncate ${
                actualIsMobile ? 'text-sm' : 'text-base'
              }`}>
                {actualIsMobile 
                  ? (report.title || 'Relatório').substring(0, 25) + ((report.title || 'Relatório').length > 25 ? '...' : '')
                  : report.title || 'Relatório de Pré-Diagnóstico'
                }
              </h3>
            </div>

            <div className={`space-y-2 ${actualIsMobile ? 'space-y-1.5' : 'space-y-2'}`}>
              {/* Date and Time */}
              <div className={`flex items-center text-gray-600 ${
                actualIsMobile ? 'gap-3 text-xs' : 'gap-4 text-sm'
              }`}>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(report.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(report.created_at)}</span>
                </div>
              </div>

              {/* Severity Level */}
              {report.severity_level && (
                <div className="flex items-center gap-2">
                  <span className={`text-gray-600 ${actualIsMobile ? 'text-xs' : 'text-sm'}`}>
                    Nível:
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      severityInfo.color === 'red' ? 'border-red-200 text-red-700 bg-red-50' :
                      severityInfo.color === 'orange' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                      severityInfo.color === 'yellow' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                      severityInfo.color === 'lime' ? 'border-lime-200 text-lime-700 bg-lime-50' :
                      severityInfo.color === 'green' ? 'border-green-200 text-green-700 bg-green-50' :
                      'border-gray-200 text-gray-700 bg-gray-50'
                    }`}
                  >
                    {actualIsMobile ? severityInfo.label.substring(0, 10) : severityInfo.label}
                  </Badge>
                </div>
              )}

              {/* Summary - Hidden on mobile to save space */}
              {report.summary && !actualIsMobile && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {report.summary}
                </p>
              )}

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className={`text-gray-600 ${actualIsMobile ? 'text-xs' : 'text-sm'}`}>
                  Status:
                </span>
                <Badge 
                  variant={report.status === 'completed' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {report.status === 'completed' ? 'Concluído' : 
                   report.status === 'processing' ? 'Processando' : 'Erro'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions - Responsive Layout */}
          <div className={`flex-shrink-0 ${
            actualIsMobile || viewMode === 'grid'
              ? 'flex flex-row gap-2 justify-end'
              : 'flex flex-col gap-2'
          }`}>
            {report.status === 'completed' && (
              <>
                <Button
                  variant="outline"
                  size={actualIsMobile ? "sm" : "sm"}
                  onClick={handleView}
                  className={actualIsMobile ? 'flex-1' : 'w-full'}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  {actualIsMobile ? 'Ver' : 'Visualizar'}
                </Button>

                <Button
                  variant="outline"
                  size={actualIsMobile ? "sm" : "sm"}
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={actualIsMobile ? 'flex-1' : 'w-full'}
                >
                  {isDownloading ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3 mr-1" />
                  )}
                  {isDownloading ? 'Baixando...' : 'Baixar'}
                </Button>
              </>
            )}

            {report.status === 'processing' && (
              <div className={`flex items-center gap-1 text-gray-500 ${
                actualIsMobile ? 'text-xs' : 'text-sm'
              }`}>
                <Loader2 className="w-3 h-3 animate-spin" />
                Processando...
              </div>
            )}

            {report.status === 'error' && (
              <div className={`flex items-center gap-1 text-red-600 ${
                actualIsMobile ? 'text-xs' : 'text-sm'
              }`}>
                <AlertCircle className="w-3 h-3" />
                Erro
              </div>
            )}
          </div>
        </div>

        {/* Download Error - Responsive */}
        {downloadError && (
          <Alert variant="destructive" className={actualIsMobile ? 'mt-2' : 'mt-3'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className={`${
              actualIsMobile ? 'flex-col gap-2' : 'flex items-center justify-between'
            }`}>
              <span className={actualIsMobile ? 'text-sm' : ''}>{downloadError}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDownloadError(null)}
              >
                Fechar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* File Info - Responsive */}
        {report.pdf_url && (
          <div className={`pt-2 border-t border-gray-100 ${actualIsMobile ? 'mt-2' : 'mt-3'}`}>
            <div className={`flex items-center justify-between text-gray-500 ${
              actualIsMobile ? 'text-xs' : 'text-xs'
            }`}>
              <div className="flex items-center gap-1">
                {actualIsMobile && isTouchDevice && (
                  <Smartphone className="w-3 h-3" />
                )}
                <span>Arquivo PDF disponível</span>
              </div>
              {report.file_size && (
                <span>{Math.round(report.file_size / 1024)} KB</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};