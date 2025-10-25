#!/usr/bin/env node

/**
 * Diagnóstico completo do sistema de pagamentos
 * Verifica todas as Edge Functions e identifica problemas específicos
 */

const SUPABASE_URL = 'https://corrklfwxfuqusfzwbls.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw';

const testPayload = {
  amount: 1500, // R$ 15,00 em centavos (valor mínimo)
  type: 'donation',
  paymentMethod: 'PIX',
  donor: {
    name: 'Renato Magno Carraro Alves',
    email: 'rcarrarocoach@gmail.com',
    phone: '33998384177',
    document: '715.961.006-72'
  }
};

async function testEdgeFunction(functionName, payload) {
  console.log(`\n🧪 Testando ${functionName}...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log(`📡 Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`📄 Resposta (primeiros 1000 chars):`, responseText.substring(0, 1000));

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log(`✅ ${functionName} funcionando!`);
        
        if (data.success) {
          console.log(`🎉 Pagamento criado com sucesso!`);
        } else {
          console.log(`⚠️ Erro no pagamento:`, data.error);
        }
        
        return { success: true, data };
      } catch (parseError) {
        console.log(`⚠️ Resposta não é JSON:`, parseError.message);
        return { success: false, error: 'Invalid JSON response' };
      }
    } else {
      console.log(`❌ ${functionName} com erro ${response.status}`);
      
      try {
        const errorData = JSON.parse(responseText);
        console.log(`🔍 Detalhes do erro:`, errorData);
        return { success: false, error: errorData };
      } catch {
        console.log(`🔍 Erro bruto:`, responseText);
        return { success: false, error: responseText };
      }
    }
  } catch (error) {
    console.log(`💥 Erro de conectividade:`, error.message);
    return { success: false, error: error.message };
  }
}

async function checkAsaasConfig() {
  console.log(`\n🔧 Verificando configuração do Asaas...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/check-asaas-config`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    console.log(`📡 Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`📄 Resposta:`, responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log(`✅ Configuração Asaas:`, data);
      return data;
    } else {
      console.log(`❌ Erro na verificação da configuração`);
      return null;
    }
  } catch (error) {
    console.log(`💥 Erro ao verificar configuração:`, error.message);
    return null;
  }
}

async function runDiagnosis() {
  console.log('🏥 DIAGNÓSTICO COMPLETO DO SISTEMA DE PAGAMENTOS');
  console.log('================================================\n');

  // 1. Verificar configuração do Asaas
  const asaasConfig = await checkAsaasConfig();

  // 2. Testar todas as versões das Edge Functions
  const functions = [
    'process-payment',
    'process-payment-v2',
    'process-payment-debug'
  ];

  const results = {};

  for (const func of functions) {
    results[func] = await testEdgeFunction(func, testPayload);
  }

  // 3. Resumo dos resultados
  console.log('\n📊 RESUMO DOS RESULTADOS');
  console.log('========================');

  for (const [func, result] of Object.entries(results)) {
    if (result.success) {
      console.log(`✅ ${func}: FUNCIONANDO`);
    } else {
      console.log(`❌ ${func}: ERRO - ${result.error?.error || result.error}`);
    }
  }

  // 4. Recomendações
  console.log('\n💡 RECOMENDAÇÕES');
  console.log('================');

  const workingFunctions = Object.entries(results).filter(([_, result]) => result.success);
  
  if (workingFunctions.length === 0) {
    console.log('🚨 NENHUMA EDGE FUNCTION ESTÁ FUNCIONANDO!');
    console.log('💡 Problemas possíveis:');
    console.log('   - API Key do Asaas não configurada ou inválida');
    console.log('   - Edge Functions não deployadas');
    console.log('   - Problema de conectividade com Asaas');
    
    if (asaasConfig) {
      console.log('   - Configuração Asaas encontrada, problema pode ser na API Key');
    } else {
      console.log('   - Configuração Asaas não encontrada');
    }
  } else {
    console.log(`✅ ${workingFunctions.length} função(ões) funcionando:`);
    workingFunctions.forEach(([func]) => {
      console.log(`   - ${func}`);
    });
    
    console.log('\n🎯 AÇÃO RECOMENDADA:');
    console.log(`   Usar: ${workingFunctions[0][0]}`);
  }

  // 5. Próximos passos
  console.log('\n🚀 PRÓXIMOS PASSOS');
  console.log('==================');
  
  if (workingFunctions.length === 0) {
    console.log('1. Verificar se a API Key do Asaas foi deployada');
    console.log('2. Verificar logs das Edge Functions no painel do Supabase');
    console.log('3. Testar API Key diretamente na API do Asaas');
    console.log('4. Re-deployar as Edge Functions se necessário');
  } else {
    console.log('1. Atualizar frontend para usar a função que está funcionando');
    console.log('2. Testar doação real com valor baixo');
    console.log('3. Monitorar logs para garantir estabilidade');
  }
}

// Executar diagnóstico
runDiagnosis().then(() => {
  console.log('\n🏁 Diagnóstico concluído');
}).catch(error => {
  console.error('💥 Erro fatal no diagnóstico:', error);
  process.exit(1);
});