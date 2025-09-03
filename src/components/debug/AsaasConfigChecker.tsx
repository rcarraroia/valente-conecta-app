import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, Settings, Wallet } from 'lucide-react';

interface ConfigResult {
  success: boolean;
  config?: {
    asaas: {
      hasApiKey: boolean;
      apiKeyLength: number;
      apiKeyPrefix: string;
    };
    supabase: {
      hasUrl: boolean;
      hasServiceKey: boolean;
      url: string;
    };
    wallets: {
      instituto: string;
      renum: string;
      especial: string;
    };
  };
  asaasTest?: {
    status: number;
    statusText: string;
    isValid: boolean;
    error?: string;
  };
  recommendations: string[];
  error?: string;
}

export const AsaasConfigChecker = () => {
  const [result, setResult] = useState<ConfigResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkConfiguration = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-asaas-config');
      
      if (error) {
        setResult({
          success: false,
          error: error.message,
          recommendations: ['❌ Erro ao verificar configuração']
        });
      } else {
        setResult(data);
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        recommendations: ['❌ Erro de conexão com o Supabase']
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Verificador de Configuração Asaas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={checkConfiguration} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Verificando...' : 'Verificar Configuração'}
        </Button>

        {result && (
          <div className="space-y-4">
            {/* Status Geral */}
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                {result.success ? 'Verificação Concluída' : 'Erro na Verificação'}
              </span>
            </div>

            {/* Configuração Asaas */}
            {result.config && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">API Key Asaas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Configurada:</span>
                        <Badge variant={result.config.asaas.hasApiKey ? 'default' : 'destructive'}>
                          {result.config.asaas.hasApiKey ? 'Sim' : 'Não'}
                        </Badge>
                      </div>
                      {result.config.asaas.hasApiKey && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Tamanho:</span>
                            <span className="text-sm font-mono">{result.config.asaas.apiKeyLength} chars</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Prefixo:</span>
                            <span className="text-sm font-mono">{result.config.asaas.apiKeyPrefix}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Teste de Conexão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.asaasTest ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Status:</span>
                          <Badge variant={result.asaasTest.isValid ? 'default' : 'destructive'}>
                            {result.asaasTest.status} {result.asaasTest.statusText}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Válida:</span>
                          <Badge variant={result.asaasTest.isValid ? 'default' : 'destructive'}>
                            {result.asaasTest.isValid ? 'Sim' : 'Não'}
                          </Badge>
                        </div>
                        {result.asaasTest.error && (
                          <div className="text-xs text-red-600 mt-2">
                            {result.asaasTest.error}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Não testado</span>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Wallets Configuradas */}
            {result.config && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Wallets Configuradas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Instituto:</span>
                      <span className="text-xs font-mono">{result.config.wallets.instituto}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Renum:</span>
                      <span className="text-xs font-mono">{result.config.wallets.renum}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Especial:</span>
                      <span className="text-xs font-mono">{result.config.wallets.especial}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recomendações */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recomendações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm">
                      {rec}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Erro */}
            {result.error && (
              <Card className="border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-red-600">Erro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-red-600">
                    {result.error}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};