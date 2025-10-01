#!/usr/bin/env node

/**
 * Script para testar a Edge Function process-payment-v2
 * Testa se a função está deployada e funcionando corretamente
 */

const SUPABASE_URL = 'https://corrklfwxfuqusfzwbls.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw';

async function testPaymentV2() {
  console.log('🧪 Testando Edge Function process-payment-v2...\n');

  const testPayload = {
    amount: 1000, // R$ 10,00 em centavos
    type: 'donation',
    paymentMethod: 'PIX',
    donor: {
      name: 'Teste Usuario',
      email: 'teste@exemplo.com',
      phone: '11999999999',
      document: '12345678901'
    }
  };

  try {
    console.log('📤 Enviando dados de teste:', JSON.stringify(testPayload, null, 2));

    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-payment-v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`📡 Status da resposta: ${response.status} ${response.statusText}`);

    const responseText = await response.text();
    console.log(`📄 Resposta bruta (primeiros 500 chars):`, responseText.substring(0, 500));

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Edge Function v2 está funcionando!');
        console.log('📊 Dados retornados:', JSON.stringify(data, null, 2));
        
        if (data.success) {
          console.log('🎉 Pagamento de teste criado com sucesso!');
          if (data.paymentUrl) {
            console.log('🔗 URL de pagamento:', data.paymentUrl);
          }
          if (data.pixQrCode) {
            console.log('📱 QR Code PIX disponível');
          }
        } else {
          console.log('⚠️ Pagamento não foi criado:', data.error);
        }
      } catch (parseError) {
        console.log('⚠️ Resposta não é JSON válido:', parseError.message);
      }
    } else {
      console.log('❌ Edge Function v2 retornou erro:', response.status);
      console.log('📄 Conteúdo do erro:', responseText);
      
      // Verificar se é erro de função não encontrada
      if (response.status === 404) {
        console.log('🚨 PROBLEMA: Edge Function process-payment-v2 não foi encontrada!');
        console.log('💡 Solução: Fazer deploy da função no Supabase');
      } else if (response.status === 500) {
        console.log('🚨 PROBLEMA: Erro interno na Edge Function');
        console.log('💡 Verificar logs no painel do Supabase');
      }
    }

  } catch (error) {
    console.error('💥 Erro ao testar Edge Function:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('🚨 PROBLEMA: Erro de conectividade');
      console.log('💡 Verificar se o Supabase está acessível');
    }
  }
}

// Executar teste
testPaymentV2().then(() => {
  console.log('\n🏁 Teste concluído');
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});