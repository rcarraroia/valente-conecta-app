#!/usr/bin/env node

/**
 * Script para testar a Edge Function process-payment (v1)
 * Para comparar com a v2 e ver se o problema é a chave API
 */

const SUPABASE_URL = 'https://corrklfwxfuqusfzwbls.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw';

async function testPaymentV1() {
  console.log('🧪 Testando Edge Function process-payment (v1)...\n');

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

    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-payment`, {
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
        console.log('✅ Edge Function v1 está funcionando!');
        console.log('📊 Dados retornados:', JSON.stringify(data, null, 2));
        
        if (data.success) {
          console.log('🎉 Pagamento de teste criado com sucesso na v1!');
        } else {
          console.log('⚠️ Pagamento não foi criado na v1:', data.error);
        }
      } catch (parseError) {
        console.log('⚠️ Resposta não é JSON válido:', parseError.message);
      }
    } else {
      console.log('❌ Edge Function v1 retornou erro:', response.status);
      console.log('📄 Conteúdo do erro:', responseText);
    }

  } catch (error) {
    console.error('💥 Erro ao testar Edge Function v1:', error.message);
  }
}

// Executar teste
testPaymentV1().then(() => {
  console.log('\n🏁 Teste v1 concluído');
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});