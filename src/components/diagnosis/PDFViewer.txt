import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Maximize2,
  Minimize2,
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DiagnosisReport } from '@/types/diagnosis';

interface PDFViewerProps {
  report: DiagnosisReport;
  onClose?: () => void;
  onDownload?: (report: DiagnosisReport) => void;
  className?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  report,
  onClose,
  onDownload,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    loadPDF();
  }, [report]);

  const loadPDF = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!report.pdf_url) {
        throw new Error('URL do PDF não encontrada');
      }

      // For now, we'll use the PDF URL directly
      // In a real implementation, you might need to get a signed URL from Supabase
      setPdfUrl(report.pdf_url);
      setIsLoading(false);

    } catch (err: any) {
      setError(err.message || 'Erro ao carregar o PDF');
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (onDownload) {
      try {
        await onDownload(report);
      } catch (error: any) {
        setError(error.message || 'Erro ao baixar o PDF');
      }
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const handleRetry = () => {
    loadPDF();
  };

  const openInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  if (error) {
    return (
      <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold">Visualizar PDF</h3>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Tentar Novamente
                </Button>
                {onClose && (
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Fechar
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      {/* Header with controls */}
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold truncate">
            {report.title || 'Relatório de Pré-Diagnóstico'}
          </h3>
          <span className="text-sm text-gray-500">
            ({Math.round((report.file_size || 0) / 1024)} KB)
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Zoom Controls */}
          <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoom <= 50} aria-label="Diminuir zoom">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600 min-w-[3rem] text-center">
            {zoom}%
          </span>
          <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoom >= 200} aria-label="Aumentar zoom">
            <ZoomIn className="w-4 h-4" />
          </Button>

          {/* Rotate */}
          <Button variant="ghost" size="sm" onClick={handleRotate} aria-label="Rotacionar PDF">
            <RotateCw className="w-4 h-4" />
          </Button>

          {/* External Link */}
          <Button variant="ghost" size="sm" onClick={openInNewTab} aria-label="Abrir em nova aba">
            <ExternalLink className="w-4 h-4" />
          </Button>

          {/* Download */}
          {onDownload && (
            <Button variant="ghost" size="sm" onClick={handleDownload} aria-label="Baixar PDF">
              <Download className="w-4 h-4" />
            </Button>
          )}

          {/* Fullscreen */}
          <Button variant="ghost" size="sm" onClick={toggleFullscreen} aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}>
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>

          {/* Close */}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar visualizador">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* PDF Content */}
      <CardContent className="p-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Carregando PDF...</p>
            </div>
          </div>
        ) : pdfUrl ? (
          <div className="w-full h-full min-h-96">
            <iframe
              src={`${pdfUrl}#zoom=${zoom}&rotate=${rotation}`}
              className="w-full h-full border-0"
              style={{
                minHeight: isFullscreen ? 'calc(100vh - 80px)' : '600px',
                transform: `rotate(${rotation}deg)`,
              }}
              title={`PDF: ${report.title || 'Relatório'}`}
              onLoad={() => setIsLoading(false)}
              onError={() => setError('Erro ao carregar o PDF')}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                PDF não disponível
              </h3>
              <p className="text-gray-600 mb-4">
                O arquivo PDF não pôde ser carregado.
              </p>
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer with info */}
      {!isLoading && pdfUrl && (
        <div className="border-t px-4 py-2 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              Criado em {new Date(report.created_at).toLocaleDateString('pt-BR')}
            </span>
            <div className="flex items-center gap-4">
              {report.severity_level && (
                <span>Nível de severidade: {report.severity_level}</span>
              )}
              <span>Zoom: {zoom}%</span>
              {rotation > 0 && <span>Rotação: {rotation}°</span>}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};