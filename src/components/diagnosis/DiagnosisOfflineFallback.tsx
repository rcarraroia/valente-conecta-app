// Offline fallback component for diagnosis features

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, Download, AlertCircle } from 'lucide-react';
import { useDiagnosisErrorHandler } from '@/hooks/useDiagnosisErrorHandler';

interface DiagnosisOfflineFallbackProps {
  children: React.ReactNode;
  showOfflineMessage?: boolean;
  enableOfflineMode?: boolean;
}

/**
 * Offline fallback component that provides graceful degradation
 * when network connectivity is lost
 */
export const DiagnosisOfflineFallback: React.FC<DiagnosisOfflineFallbackProps> = ({
  children,
  showOfflineMessage = true,
  enableOfflineMode = true,
}) => {
  const { state } = useDiagnosisErrorHandler();
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [offlineData, setOfflineData] = useState<any>(null);

  // Monitor online status
  useEffect(() => {
    if (!state.isOnline && showOfflineMessage) {
      setShowOfflineBanner(true);
      loadOfflineData();
    } else {
      setShowOfflineBanner(false);
    }
  }, [state.isOnline, showOfflineMessage]);

  /**
   * Load cached data for offline mode
   */
  const loadOfflineData = () => {
    try {
      const cached = localStorage.getItem('diagnosis_offline_data');
      if (cached) {
        setOfflineData(JSON.parse(cached));
      }
    } catch (error) {
      console.warn('Failed to load offline data:', error);
    }
  };

  /**
   * Save data for offline access
   */
  const saveOfflineData = (data: any) => {
    try {
      localStorage.setItem('diagnosis_offline_data', JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      console.warn('Failed to save offline data:', error);
    }
  };

  /**
   * Retry connection
   */
  const handleRetryConnection = () => {
    window.location.reload();
  };

  /**
   * Download offline data
   */
  const handleDownloadOfflineData = () => {
    if (!offlineData) return;

    const dataStr = JSON.stringify(offlineData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagnosis-offline-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  // If online, render children normally
  if (state.isOnline) {
    return <>{children}</>;
  }

  // If offline and offline mode is disabled, show full offline screen
  if (!enableOfflineMode) {
    return (
      <div className="min-h-screen bg-cv-off-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-8 h-8 text-gray-400" />
            </div>
            <CardTitle className="text-xl text-gray-900">Sem Conexão</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-center">
              Você está offline. O pré-diagnóstico requer conexão com a internet para funcionar.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Funcionalidades Indisponíveis:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Chat de pré-diagnóstico</li>
                    <li>Geração de relatórios PDF</li>
                    <li>Sincronização de dados</li>
                    <li>Acesso a relatórios salvos</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleRetryConnection}
              className="w-full bg-cv-blue hover:bg-cv-blue/90 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Reconectar
            </Button>

            {offlineData && (
              <Button
                onClick={handleDownloadOfflineData}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Dados Salvos
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // If offline but offline mode is enabled, show children with banner
  return (
    <div className="min-h-screen bg-cv-off-white">
      {/* Offline Banner */}
      {showOfflineBanner && (
        <div className="bg-yellow-500 text-white px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">
                Você está offline. Algumas funcionalidades podem não funcionar.
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRetryConnection}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-yellow-600 h-8"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reconectar
              </Button>
              
              <Button
                onClick={() => setShowOfflineBanner(false)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-yellow-600 h-8 px-2"
              >
                ×
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with Offline Limitations */}
      <div className={showOfflineBanner ? 'pt-0' : ''}>
        {children}
      </div>

      {/* Offline Data Cache Info */}
      {offlineData && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="w-80 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Download className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Dados Offline Disponíveis
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    Salvos em: {new Date(offlineData.timestamp).toLocaleString('pt-BR')}
                  </p>
                  <Button
                    onClick={handleDownloadOfflineData}
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                  >
                    Baixar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DiagnosisOfflineFallback;