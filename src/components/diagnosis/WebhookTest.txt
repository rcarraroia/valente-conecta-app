import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Zap } from 'lucide-react';
import { chatService } from '@/services/chat.service';

interface WebhookTestResult {
  success: boolean;
  responseTime: number;
  message?: string;
  error?: string;
  data?: any;
}

export const WebhookTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WebhookTestResult | null>(null);

  const testWebhook = async () => {
    setIsLoading(true);
    setResult(null);

    const startTime = Date.now();

    try {
      // Test with a simple diagnostic request
      const testRequest = {
        user_id: 'test-user-123',
        text: 'iniciar',
        session_id: 'test-session-123'
      };

      console.log('🚀 Testando webhook:', chatService.getConfiguration().webhookUrl);
      console.log('📤 Enviando:', testRequest);

      const response = await chatService.sendMessage(testRequest);
      const responseTime = Date.now() - startTime;

      console.log('📥 Resposta recebida:', response);

      if (response.success && response.data) {
        setResult({
          success: true,
          responseTime,
          message: response.data.message || 'Resposta recebida com sucesso',
          data: response.data
        });
      } else {
        setResult({
          success: false,
          responseTime,
          error: response.error?.message || 'Erro desconhecido'
        });
      }

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error('❌ Erro no teste:', error);
      
      setResult({
        success: false,
        responseTime,
        error: error.message || 'Erro de conexão'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testHealthCheck = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('🏥 Testando health check...');
      const health = await chatService.healthCheck();
      
      setResult({
        success: health.healthy,
        responseTime: health.responseTime || 0,
        message: health.healthy ? 'Webhook está funcionando!' : 'Webhook não está respondendo',
        error: health.error
      });

    } catch (error: any) {
      console.error('❌ Erro no health check:', error);
      setResult({
        success: false,
        responseTime: 0,
        error: error.message || 'Erro de conexão'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Teste de Integração do Webhook
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p><strong>URL:</strong> {chatService.getConfiguration().webhookUrl}</p>
          <p><strong>Timeout:</strong> {chatService.getConfiguration().timeout}ms</p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={testHealthCheck}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              'Health Check'
            )}
          </Button>

          <Button 
            onClick={testWebhook}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              'Testar Diagnóstico'
            )}
          </Button>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
              )}
              
              <div className="flex-1">
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {result.success ? 'Sucesso!' : 'Erro'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {result.responseTime}ms
                      </span>
                    </div>
                    
                    {result.message && (
                      <p className="text-sm">{result.message}</p>
                    )}
                    
                    {result.error && (
                      <p className="text-sm text-red-600">{result.error}</p>
                    )}
                    
                    {result.data && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600">
                          Ver resposta completa
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="text-xs text-gray-500">
          <p>Este teste verifica se o webhook do n8n está respondendo corretamente.</p>
          <p>Abra o console do navegador para ver logs detalhados.</p>
        </div>
      </CardContent>
    </Card>
  );
};