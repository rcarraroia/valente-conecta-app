import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RequestLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  payload: any;
  response?: any;
  status?: number;
  error?: string;
  duration?: number;
}

export const WebhookDebugger: React.FC = () => {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!isCapturing) return;

    // Intercept fetch requests
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options] = args;
      const startTime = Date.now();
      
      // Only log webhook proxy requests
      if (typeof url === 'string' && url.includes('/api/webhook-proxy')) {
        const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const requestLog: RequestLog = {
          id: logId,
          timestamp: new Date().toISOString(),
          method: options?.method || 'GET',
          url: url,
          payload: options?.body ? JSON.parse(options.body as string) : null,
        };

        setLogs(prev => [requestLog, ...prev.slice(0, 49)]); // Keep last 50 logs

        try {
          const response = await originalFetch(...args);
          const duration = Date.now() - startTime;
          
          // Clone response to read it without consuming the original
          const responseClone = response.clone();
          const responseText = await responseClone.text();
          
          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = responseText;
          }

          setLogs(prev => prev.map(log => 
            log.id === logId 
              ? { 
                  ...log, 
                  response: responseData, 
                  status: response.status,
                  duration 
                }
              : log
          ));

          return response;
        } catch (error: any) {
          const duration = Date.now() - startTime;
          
          setLogs(prev => prev.map(log => 
            log.id === logId 
              ? { 
                  ...log, 
                  error: error.message,
                  duration 
                }
              : log
          ));

          throw error;
        }
      }

      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isCapturing]);

  const testWebhook = async () => {
    const testPayload = {
      chatInput: "Teste de conectividade do debugger",
      user_id: "debug_user_123",
      session_id: "debug_session_456",
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/webhook-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      console.log('Teste do webhook concluído:', response.status);
    } catch (error) {
      console.error('Erro no teste do webhook:', error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatusColor = (status?: number, error?: string) => {
    if (error) return 'destructive';
    if (!status) return 'secondary';
    if (status >= 200 && status < 300) return 'default';
    if (status >= 400) return 'destructive';
    return 'secondary';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Webhook Debugger</span>
          <div className="flex gap-2">
            <Button
              variant={isCapturing ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsCapturing(!isCapturing)}
            >
              {isCapturing ? 'Parar Captura' : 'Iniciar Captura'}
            </Button>
            <Button variant="outline" size="sm" onClick={testWebhook}>
              Testar Webhook
            </Button>
            <Button variant="outline" size="sm" onClick={clearLogs}>
              Limpar Logs
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Badge variant={isCapturing ? "default" : "secondary"}>
            {isCapturing ? `Capturando (${logs.length} logs)` : 'Captura Pausada'}
          </Badge>
        </div>
        
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum log capturado ainda. {isCapturing ? 'Envie uma mensagem no chat para ver os logs.' : 'Clique em "Iniciar Captura" para começar.'}
              </p>
            ) : (
              logs.map((log) => (
                <Card key={log.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.method}</Badge>
                        <Badge variant={getStatusColor(log.status, log.error)}>
                          {log.error ? 'ERROR' : log.status || 'PENDING'}
                        </Badge>
                        {log.duration && (
                          <Badge variant="secondary">{log.duration}ms</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>URL:</strong> {log.url}
                      </div>
                      
                      {log.payload && (
                        <div>
                          <strong>Payload:</strong>
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {log.response && (
                        <div>
                          <strong>Response:</strong>
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.response, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {log.error && (
                        <div>
                          <strong>Error:</strong>
                          <pre className="bg-destructive/10 p-2 rounded text-xs text-destructive">
                            {log.error}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};