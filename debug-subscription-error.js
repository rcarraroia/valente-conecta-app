#!/usr/bin/env node

/**
 * Debug do erro 500 na criação de assinatura
 * Simula exatamente os dados enviados pelo frontend
 */

const SUPABASE_URL = 'https://corrklfwxfuqusfzwbls.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw';

async function debugSubscriptionError() {
  console.log('🔍 DEBUG - ERRO 500 NA ASSINATURA');
  console.log('==================================\n');

  // Dados exatos que o frontend está enviando (baseado nos logs)
  const subscriptionPayload = {
    amount: 2500, // R$ 25,00 (valor em centavos)
    type: 'subscription',
    frequency: 'monthly',
    paymentMethod: 'CREDIT_CARD',
    donor: {
      name: 'RENATO MAGNO C ALVES',
      email: 'rcarraroia2015@gmail.com',
      phone: '33998384177',
      document: '715.961.006-72'
    }
    // ❌ PROBLEMA: Não tem creditCard mas paymentMethod é CREDIT_CARD
  };

  console.log('📊 Dados enviados pelo frontend:');
  console.log(JSON.stringify(subscriptionPayload, null, 2));

  console.log('\n🚨 PROBLEMA IDENTIFICADO:');
  console.log('- paymentMethod: CREDIT_CARD');
  console.log('- creditCard: AUSENTE');
  console.log('- Validação na Edge Function: "Dados do cartão de crédito são obrigatórios"');

  try {
    console.log('\n📡 Testando chamada para Edge Function...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-payment-v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionPayload)
    });

    console.log(`Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sucesso:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Erro:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log('\n🎯 ERRO ESPECÍFICO:', errorJson.error);
      } catch {
        console.log('\n🎯 ERRO RAW:', errorText);
      }
    }

  } catch (error) {
    console.error('💥 Erro na requisição:', error.message);
  }

  console.log('\n🔧 SOLUÇÕES POSSÍVEIS:');
  console.log('1. ✅ Alterar frontend para não exigir cartão em assinaturas');
  console.log('2. ✅ Modificar Edge Function para aceitar assinatura sem cartão');
  console.log('3. ✅ Implementar fluxo PIX para assinaturas');
  
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Verificar como o frontend está enviando paymentMethod');
  console.log('2. Ajustar validação na Edge Function');
  console.log('3. Testar novamente');
}

// Executar debug
debugSubscriptionError().then(() => {
  console.log('\n🏁 Debug concluído');
}).catch(error => {
  console.error('💥 Erro no debug:', error);
});