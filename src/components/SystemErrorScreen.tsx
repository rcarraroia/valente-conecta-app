
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Settings, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-cv-gray-light hover:text-cv-gray-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-h1 font-heading font-bold text-cv-gray-dark">
            Erro de Sistema
          </h1>
        </div>

        {/* Erro */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-6 h-6" />
              Configuração Necessária
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-800">
              {error.message}
            </p>
            
            {error.details && (
              <div className="bg-red-100 p-3 rounded-lg">
                <p className="text-sm text-red-700">
                  <strong>Detalhes:</strong> {error.details}
                </p>
              </div>
            )}

            {error.hint && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Sugestão:</strong> {error.hint}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-4">
              {onRetry && (
                <Button onClick={onRetry} className="bg-cv-blue-heart hover:bg-cv-blue-heart/90">
                  Tentar Novamente
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={onBack}
                className="border-cv-gray-light text-cv-gray-dark"
              >
                Voltar ao Menu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informação adicional */}
        <Card className="border-cv-yellow-soft bg-cv-yellow-soft/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-cv-coral mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-cv-coral mb-1">Sistema em Desenvolvimento</h4>
                <p className="text-sm text-cv-gray-dark">
                  Este recurso ainda está sendo configurado. Por favor, tente novamente mais tarde 
                  ou entre em contato com o suporte se o problema persistir.
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
