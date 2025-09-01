import React from 'react';
import { WebhookTest } from '@/components/diagnosis/WebhookTest';

export const WebhookTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teste de Integração
          </h1>
          <p className="text-gray-600">
            Verificar se o webhook do n8n está funcionando corretamente
          </p>
        </div>
        
        <WebhookTest />
      </div>
    </div>
  );
};