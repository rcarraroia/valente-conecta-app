import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInstitutoConfig } from '@/hooks/useInstitutoConfig';
import { institutoApiConfigSchema } from '@/schemas/instituto-integration.schema';
import { InstitutoApiConfig } from '@/types/instituto-integration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, TestTube, Save, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

type ConfigFormData = Omit<InstitutoApiConfig, 'id' | 'created_at' | 'updated_at'>;

export const InstitutoConfigForm: React.FC = () => {
  const {
    config,
    isLoading,
    error,
    saveConfig,
    testConfig,
    deleteConfig,
    isSaving,
    isTesting,
    isDeleting,
    testResult,
    testError,
    getDefaultConfig,
    validateEncryption,
    refetch,
    resetSaveState,
    resetTestState
  } = useInstitutoConfig();

  const form = useForm<ConfigFormData>({
    resolver: zodResolver(institutoApiConfigSchema.omit({ 
      id: true, 
      created_at: true, 
      updated_at: true 
    })),
    defaultValues: getDefaultConfig()
  });

  const { watch, setValue, reset } = form;
  const authType = watch('auth_type');
  const isSandbox = watch('is_sandbox');

  // Load existing config when available
  useEffect(() => {
    if (config) {
      reset({
        endpoint: config.endpoint,
        method: config.method,
        auth_type: config.auth_type,
        sandbox_endpoint: config.sandbox_endpoint || '',
        is_sandbox: config.is_sandbox,
        retry_attempts: config.retry_attempts,
        retry_delay: config.retry_delay,
        is_active: config.is_active,
        // Don't populate credential fields for security
        api_key: '',
        bearer_token: '',
        basic_username: config.basic_username || '',
        basic_password: ''
      });
    }
  }, [config, reset]);

  // Validate encryption on mount
  useEffect(() => {
    validateEncryption();
  }, [validateEncryption]);

  const onSubmit = (data: ConfigFormData) => {
    // Remove empty credential fields
    const cleanData = { ...data };
    if (!cleanData.api_key) delete cleanData.api_key;
    if (!cleanData.bearer_token) delete cleanData.bearer_token;
    if (!cleanData.basic_username) delete cleanData.basic_username;
    if (!cleanData.basic_password) delete cleanData.basic_password;

    saveConfig.mutate(cleanData);
  };

  const handleTest = () => {
    const data = form.getValues();
    testConfig.mutate(data);
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja desativar a configuração da integração?')) {
      deleteConfig.mutate();
    }
  };

  const handleReset = () => {
    reset(getDefaultConfig());
    resetSaveState();
    resetTestState();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Carregando configuração...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Configuração da Integração Instituto Coração Valente
            {config && (
              <Badge variant={config.is_active ? 'default' : 'secondary'}>
                {config.is_active ? 'Ativa' : 'Inativa'}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Configure a integração com a API do Instituto Coração Valente para envio automático de dados de cadastro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar configuração: {error.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Configuração Básica</TabsTrigger>
                <TabsTrigger value="auth">Autenticação</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endpoint">Endpoint da API *</Label>
                    <Input
                      id="endpoint"
                      placeholder="https://api.instituto.com/users"
                      {...form.register('endpoint')}
                    />
                    {form.formState.errors.endpoint && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.endpoint.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="method">Método HTTP</Label>
                    <Select
                      value={watch('method')}
                      onValueChange={(value) => setValue('method', value as 'POST' | 'PUT')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sandbox_endpoint">Endpoint de Sandbox (Opcional)</Label>
                  <Input
                    id="sandbox_endpoint"
                    placeholder="https://sandbox-api.instituto.com/users"
                    {...form.register('sandbox_endpoint')}
                  />
                  {form.formState.errors.sandbox_endpoint && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.sandbox_endpoint.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_sandbox"
                    checked={isSandbox}
                    onCheckedChange={(checked) => setValue('is_sandbox', checked)}
                  />
                  <Label htmlFor="is_sandbox">Usar ambiente de sandbox</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={watch('is_active')}
                    onCheckedChange={(checked) => setValue('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Integração ativa</Label>
                </div>
              </TabsContent>

              <TabsContent value="auth" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auth_type">Tipo de Autenticação</Label>
                  <Select
                    value={authType}
                    onValueChange={(value) => setValue('auth_type', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {authType === 'api_key' && (
                  <div className="space-y-2">
                    <Label htmlFor="api_key">API Key *</Label>
                    <Input
                      id="api_key"
                      type="password"
                      placeholder={config?.api_key ? 'Chave atual configurada' : 'Digite a API Key'}
                      {...form.register('api_key')}
                    />
                    {form.formState.errors.api_key && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.api_key.message}
                      </p>
                    )}
                  </div>
                )}

                {authType === 'bearer' && (
                  <div className="space-y-2">
                    <Label htmlFor="bearer_token">Bearer Token *</Label>
                    <Input
                      id="bearer_token"
                      type="password"
                      placeholder={config?.bearer_token ? 'Token atual configurado' : 'Digite o Bearer Token'}
                      {...form.register('bearer_token')}
                    />
                    {form.formState.errors.bearer_token && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.bearer_token.message}
                      </p>
                    )}
                  </div>
                )}

                {authType === 'basic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basic_username">Usuário *</Label>
                      <Input
                        id="basic_username"
                        placeholder="Nome de usuário"
                        {...form.register('basic_username')}
                      />
                      {form.formState.errors.basic_username && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.basic_username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="basic_password">Senha *</Label>
                      <Input
                        id="basic_password"
                        type="password"
                        placeholder={config?.basic_password ? 'Senha atual configurada' : 'Digite a senha'}
                        {...form.register('basic_password')}
                      />
                      {form.formState.errors.basic_password && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.basic_password.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="retry_attempts">Tentativas de Retry</Label>
                    <Input
                      id="retry_attempts"
                      type="number"
                      min="1"
                      max="10"
                      {...form.register('retry_attempts', { valueAsNumber: true })}
                    />
                    {form.formState.errors.retry_attempts && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.retry_attempts.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retry_delay">Delay entre Retries (ms)</Label>
                    <Input
                      id="retry_delay"
                      type="number"
                      min="1000"
                      max="300000"
                      {...form.register('retry_delay', { valueAsNumber: true })}
                    />
                    {form.formState.errors.retry_delay && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.retry_delay.message}
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Test Results */}
            {testResult !== undefined && (
              <Alert className={testResult ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {testResult ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={testResult ? 'text-green-800' : 'text-red-800'}>
                  {testResult 
                    ? 'Teste de conectividade bem-sucedido! A API está acessível.'
                    : 'Teste de conectividade falhou. Verifique as configurações.'
                  }
                </AlertDescription>
              </Alert>
            )}

            {testError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Erro no teste: {testError.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Configuração
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                disabled={isTesting || !form.formState.isValid}
              >
                {isTesting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Testar Conectividade
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                Resetar
              </Button>

              {config && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Desativar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};