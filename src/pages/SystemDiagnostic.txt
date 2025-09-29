// Página de diagnóstico do sistema

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WebhookDiagnostic } from '@/components/diagnosis/WebhookDiagnostic';
import { Activity, Database, Wifi, Settings } from 'lucide-react';
import { diagnosisConfig, isFeatureEnabled } from '@/lib/diagnosis-config';
import { N8N_CONFIG } from '@/lib/diagnosis-constants';

export const SystemDiagnostic: React.FC = () => {
  const features = [
    {
      name: 'Chat de Diagnóstico',
      enabled: isFeatureEnabled('chatEnabled'),
      key: 'chatEnabled',
      icon: <Activity className="h-4 w-4" />,
      description: 'Sistema de chat com IA para pré-diagnóstico',
    },
    {
      name: 'Geração de PDF',
      enabled: isFeatureEnabled('pdfGenerationEnabled'),
      key: 'pdfGenerationEnabled',
      icon: <Database className="h-4 w-4" />,
      description: 'Geração automática de relatórios em PDF',
    },
    {
      name: 'Analytics',
      enabled: isFeatureEnabled('analyticsEnabled'),
      key: 'analyticsEnabled',
      icon: <Activity className="h-4 w-4" />,
      description: 'Coleta e análise de dados de uso',
    },
    {
      name: 'Monitoramento',
      enabled: isFeatureEnabled('monitoringEnabled'),
      key: 'monitoringEnabled',
      icon: <Activity className="h-4 w-4" />,
      description: 'Monitoramento de performance e saúde do sistema',
    },
    {
      name: 'Modo Offline',
      enabled: isFeatureEnabled('offlineModeEnabled'),
      key: 'offlineModeEnabled',
      icon: <Wifi className="h-4 w-4" />,
      description: 'Funcionalidade offline para casos de conectividade limitada',
    },
  ];

  const configurations = [
    {
      name: 'URL do Webhook N8N',
      value: N8N_CONFIG.WEBHOOK_URL || 'Não configurado',
      status: N8N_CONFIG.WEBHOOK_URL ? 'configured' : 'missing',
    },
    {
      name: 'URL do Supabase',
      value: diagnosisConfig.supabase.url || 'Não configurado',
      status: diagnosisConfig.supabase.url ? 'configured' : 'missing',
    },
    {
      name: 'Timeout de Requisições',
      value: `${N8N_CONFIG.TIMEOUT}ms`,
      status: 'configured',
    },
    {
      name: 'Tentativas de Retry',
      value: N8N_CONFIG.RETRY_ATTEMPTS.toString(),
      status: 'configured',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Diagnóstico do Sistema</h1>
        <p className="text-muted-foreground">
          Verificar status e configurações do sistema de pré-diagnóstico
        </p>
      </div>

      {/* Status das funcionalidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status das Funcionalidades
          </CardTitle>
          <CardDescription>
            Funcionalidades ativas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.key}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <div>
                    <div className="font-medium">{feature.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {feature.description}
                    </div>
                  </div>
                </div>
                <Badge variant={feature.enabled ? 'default' : 'secondary'}>
                  {feature.enabled ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações do sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configurações
          </CardTitle>
          <CardDescription>
            Configurações principais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configurations.map((config, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{config.name}</div>
                  <code className="text-xs text-muted-foreground break-all">
                    {config.value}
                  </code>
                </div>
                <Badge 
                  variant={config.status === 'configured' ? 'default' : 'destructive'}
                >
                  {config.status === 'configured' ? 'Configurado' : 'Faltando'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico do webhook */}
      <WebhookDiagnostic />

      {/* Informações do ambiente */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Ambiente</CardTitle>
          <CardDescription>
            Detalhes técnicos do ambiente atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Modo:</span>
              <div className="text-muted-foreground">
                {import.meta.env.MODE}
              </div>
            </div>
            <div>
              <span className="font-medium">Versão do Vite:</span>
              <div className="text-muted-foreground">
                {import.meta.env.VITE_APP_VERSION || 'Não definida'}
              </div>
            </div>
            <div>
              <span className="font-medium">Base URL:</span>
              <div className="text-muted-foreground">
                {import.meta.env.BASE_URL}
              </div>
            </div>
            <div>
              <span className="font-medium">Timestamp de Build:</span>
              <div className="text-muted-foreground">
                {new Date().toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};