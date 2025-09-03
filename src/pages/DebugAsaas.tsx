import React from 'react';
import { AsaasConfigChecker } from '@/components/debug/AsaasConfigChecker';

const DebugAsaas = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Debug - Configuração Asaas
          </h1>
          <p className="text-gray-600">
            Verificação de API Key e configurações do sistema de pagamentos
          </p>
        </div>
        
        <AsaasConfigChecker />
        
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Como Configurar a API Key</h2>
            <div className="text-left space-y-2 text-sm text-gray-600">
              <p><strong>1.</strong> Acesse o dashboard do Supabase</p>
              <p><strong>2.</strong> Vá em Settings → Edge Functions → Environment Variables</p>
              <p><strong>3.</strong> Adicione a variável: <code className="bg-gray-100 px-2 py-1 rounded">ASAAS_API_KEY</code></p>
              <p><strong>4.</strong> Cole sua API Key do Asaas (obtida no dashboard do Asaas)</p>
              <p><strong>5.</strong> Salve e redeploy as Edge Functions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAsaas;