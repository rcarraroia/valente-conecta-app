import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  TestTube, 
  Play, 
  RotateCcw, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Zap
} from 'lucide-react';
import { TestEnvironment } from '@/utils/test-environment';
import { useInstitutoIntegrationRegistration } from '@/hooks/useInstitutoIntegration';
import { toast } from 'sonner';

export const TestEnvironmentControls: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(TestEnvironment.isEnabled());
  const [mockEnabled, setMockEnabled] = useState(TestEnvironment.isMockEnabled());
  const [delayMs, setDelayMs] = useState(1000);
  const [failureRate, setFailureRate] = useState(0);
  const [logRequests, setLogRequests] = useState(true);
  const [forcedResponse, setForcedResponse] = useState<string>('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const { sendRegistrationData } = useInstitutoIntegrationRegistration();

  useEffect(() => {
    // Update test environment when settings change
    TestEnvironment.configure({
      enabled: isEnabled,
      mockResponses: mockEnabled,
      delayMs,
      failureRate: failureRate / 100, // Convert percentage to decimal
      logRequests
    });
  }, [isEnabled, mockEnabled, delayMs, failureRate, logRequests]);

  const handleRunSingleTest = async () => {
    if (!isEnabled) {
      toast.error('Ambiente de teste não está habilitado');
      return;
    }

    setIsRunningTest(true);
    
    try {
      const testData = TestEnvironment.generateTestUserData();
      
      // Force specific response if selected
      if (forcedResponse) {
        TestEnvironment.forceMockResponse(forcedResponse);
      }

      const startTime = Date.now();
      
      let result;
      if (mockEnabled) {
        result = await TestEnvironment.simulateApiResponse(testData);
      } else {
        result = await sendRegistrationData.mutateAsync({
          name: testData.nome,
          email: testData.email,
          phone: testData.telefone,
          cpf: testData.cpf,
          consent_data_sharing: testData.consentimento_data_sharing
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      const testResult = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        testData,
        result,
        duration,
        success: result.success,
        mockUsed: mockEnabled,
        forcedResponse: forcedResponse || null
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 results

      if (result.success) {
        toast.success(`Teste concluído com sucesso em ${duration}ms`);
      } else {
        toast.error(`Teste falhou: ${result.error}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro no teste: ${errorMessage}`);
      
      setTestResults(prev => [{
        id: Date.now(),
        timestamp: new Date().toISOString(),
        testData: TestEnvironment.generateTestUserData(),
        result: { success: false, error: errorMessage },
        duration: 0,
        success: false,
        mockUsed: mockEnabled,
        error: errorMessage
      }, ...prev.slice(0, 9)]);
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleRunBatchTest = async () => {
    if (!isEnabled) {
      toast.error('Ambiente de teste não está habilitado');
      return;
    }

    setIsRunningTest(true);
    const batchSize = 5;
    const results = [];

    try {
      for (let i = 0; i < batchSize; i++) {
        const testData = TestEnvironment.generateTestUserData({
          nome: `Teste Lote ${i + 1}`,
          email: `teste-lote-${i + 1}-${Date.now()}@exemplo.com`
        });

        const startTime = Date.now();
        
        let result;
        if (mockEnabled) {
          result = await TestEnvironment.simulateApiResponse(testData);
        } else {
          result = await sendRegistrationData.mutateAsync({
            name: testData.nome,
            email: testData.email,
            phone: testData.telefone,
            cpf: testData.cpf,
            consent_data_sharing: testData.consentimento_data_sharing
          });
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        results.push({
          id: Date.now() + i,
          timestamp: new Date().toISOString(),
          testData,
          result,
          duration,
          success: result.success,
          mockUsed: mockEnabled,
          batchTest: true,
          batchIndex: i + 1
        });

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setTestResults(prev => [...results, ...prev.slice(0, 5)]);

      const successCount = results.filter(r => r.success).length;
      const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

      toast.success(`Teste em lote concluído: ${successCount}/${batchSize} sucessos, tempo médio: ${Math.round(avgDuration)}ms`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro no teste em lote: ${errorMessage}`);
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleReset = () => {
    TestEnvironment.reset();
    setIsEnabled(TestEnvironment.isEnabled());
    setMockEnabled(TestEnvironment.isMockEnabled());
    setDelayMs(1000);
    setFailureRate(0);
    setLogRequests(true);
    setForcedResponse('');
    setTestResults([]);
    toast.success('Ambiente de teste resetado');
  };

  const handleExportResults = () => {
    const report = {
      testEnvironment: TestEnvironment.generateTestReport(),
      testResults,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instituto-integration-test-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Relatório de testes exportado');
  };

  const mockResponseTypes = TestEnvironment.getMockResponseTypes();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Controles do Ambiente de Teste
          </CardTitle>
          <CardDescription>
            Configure e execute testes da integração com o Instituto Coração Valente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Environment Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
              <div>
                <p className="font-medium">Status do Ambiente</p>
                <p className="text-sm text-gray-600">
                  {isEnabled ? 'Habilitado' : 'Desabilitado'} • {process.env.NODE_ENV}
                </p>
              </div>
            </div>
            <Badge variant={isEnabled ? 'default' : 'secondary'}>
              {isEnabled ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mock-enabled">Usar Respostas Simuladas</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="mock-enabled"
                  checked={mockEnabled}
                  onCheckedChange={setMockEnabled}
                  disabled={!isEnabled}
                />
                <span className="text-sm text-gray-600">
                  {mockEnabled ? 'Simulado' : 'API Real'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-requests">Log de Requisições</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="log-requests"
                  checked={logRequests}
                  onCheckedChange={setLogRequests}
                  disabled={!isEnabled}
                />
                <span className="text-sm text-gray-600">
                  {logRequests ? 'Habilitado' : 'Desabilitado'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delay">Delay (ms)</Label>
              <Input
                id="delay"
                type="number"
                value={delayMs}
                onChange={(e) => setDelayMs(parseInt(e.target.value) || 0)}
                min="0"
                max="10000"
                disabled={!isEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="failure-rate">Taxa de Falha (%)</Label>
              <Input
                id="failure-rate"
                type="number"
                value={failureRate}
                onChange={(e) => setFailureRate(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                min="0"
                max="100"
                disabled={!isEnabled}
              />
            </div>
          </div>

          {/* Force Response */}
          {mockEnabled && (
            <div className="space-y-2">
              <Label htmlFor="forced-response">Forçar Resposta Específica</Label>
              <Select value={forcedResponse} onValueChange={setForcedResponse}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma resposta (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Automático</SelectItem>
                  {mockResponseTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Test Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              onClick={handleRunSingleTest}
              disabled={!isEnabled || isRunningTest}
              className="flex-1 min-w-[200px]"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunningTest ? 'Executando...' : 'Teste Único'}
            </Button>

            <Button
              onClick={handleRunBatchTest}
              disabled={!isEnabled || isRunningTest}
              variant="outline"
              className="flex-1 min-w-[200px]"
            >
              <Zap className="h-4 w-4 mr-2" />
              Teste em Lote (5x)
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              disabled={isRunningTest}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>

            <Button
              onClick={handleExportResults}
              variant="outline"
              disabled={testResults.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
            <CardDescription>
              Últimos {testResults.length} testes executados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 rounded-md border ${
                    result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">
                        {result.batchTest ? `Lote ${result.batchIndex}` : 'Teste Único'}
                      </span>
                      <Badge variant={result.mockUsed ? 'secondary' : 'default'} className="text-xs">
                        {result.mockUsed ? 'Mock' : 'Real'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.duration}ms • {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p><strong>Email:</strong> {result.testData.email}</p>
                    <p><strong>Nome:</strong> {result.testData.nome}</p>
                    {result.success ? (
                      <p className="text-green-700">
                        <strong>Resultado:</strong> {JSON.stringify(result.result.data)}
                      </p>
                    ) : (
                      <p className="text-red-700">
                        <strong>Erro:</strong> {result.result.error || result.error}
                      </p>
                    )}
                    {result.forcedResponse && (
                      <p className="text-blue-700">
                        <strong>Resposta Forçada:</strong> {result.forcedResponse}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning for Production */}
      {process.env.NODE_ENV === 'production' && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Atenção:</strong> Você está em ambiente de produção. 
            Use os controles de teste com cuidado e evite enviar dados reais para APIs externas.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};