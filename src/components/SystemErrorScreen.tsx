
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Settings, ArrowLeft, RefreshCw } from 'lucide-react';

interface SystemErrorScreenProps {
  error: {
    message: string;
    details?: string;
    hint?: string;
  };
  onBack: () => void;
  onRetry?: () => void;
}

const SystemErrorScreen = ({ error, onBack, onRetry }: SystemErrorScreenProps) => {
  return (
    <div className="min-h-screen bg-cv-off-white p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-cv-gray-light hover:text-cv-gray-dark p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-heading font-bold text-cv-gray-dark">
            Erro de Sistema
          </h1>
        </div>

        {/* Erro Principal */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-red-700 text-base">
              <AlertTriangle className="w-5 h-5" />
              Erro no Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-red-800 text-sm">
              {error.message}
            </p>
            
            {error.details && (
              <div className="bg-red-100 p-3 rounded-lg">
                <p className="text-xs text-red-700">
                  <strong>Detalhes:</strong> {error.details}
                </p>
              </div>
            )}

            {error.hint && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Sugestão:</strong> {error.hint}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="space-y-3">
          {onRetry && (
            <Button 
              onClick={onRetry} 
              className="w-full bg-cv-blue-heart hover:bg-cv-blue-heart/90"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={onBack}
            className="w-full border-cv-gray-light text-cv-gray-dark"
            size="lg"
          >
            Voltar ao Menu
          </Button>
        </div>

        {/* Informação adicional */}
        <Card className="border-cv-yellow-soft bg-cv-yellow-soft/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Settings className="w-4 h-4 text-cv-coral mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-cv-coral mb-1 text-sm">Sistema em Desenvolvimento</h4>
                <p className="text-xs text-cv-gray-dark">
                  Este recurso ainda está sendo configurado. As tabelas foram criadas 
                  e o sistema deve funcionar normalmente agora.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemErrorScreen;
