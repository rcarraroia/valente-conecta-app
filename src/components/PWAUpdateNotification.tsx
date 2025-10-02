import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const PWAUpdateNotification = () => {
  const { needRefresh, updateAvailable, updateSW } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  const handleUpdate = async () => {
    try {
      await updateSW();
      // A página será recarregada automaticamente
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!needRefresh || !updateAvailable || dismissed) {
    return null;
  }

  return (
    <Card className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm border-green-500 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-cv-gray-dark mb-1">
              Nova versão disponível
            </h3>
            <p className="text-sm text-cv-gray-light mb-3">
              Uma atualização do Valente Conecta está pronta para ser instalada.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="flex-1"
              >
                Depois
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Atualizar
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAUpdateNotification;