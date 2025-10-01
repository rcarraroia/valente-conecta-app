/**
 * Script de Teste - Webhook Asaas
 * Testa a Edge Function do webhook antes de configurar no Asaas
 */

const WEBHOOK_URL = 'https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/asaas-webhook';

// Payload de teste simulando webhook do Asaas
const testPayloads = {
  paymentConfirmed: {
    event: 'PAYMENT_CONFIRMED',
    payment: {
      id: 'pay_test_123456789',
      value: 50.00,
      status: 'CONFIRMED',
      customer: 'cus_test_123456789',
      dueDate: '2025-09-30',
      description: 'Doação Teste - Instituto Coração Valente',
      billingType: 'PIX',
      confirmedDate: '2025-09-30T19:30:00.000Z'
    }
  },
  
  paymentReceived: {
    event: 'PAYMENT_RECEIVED',
    payment: {
      id: 'pay_test_987654321',
      value: 100.00,
      status: 'RECEIVED',
      customer: 'cus_test_987654321',
      dueDate: '2025-09-30',
      description: 'Doação Teste - Instituto Coração Valente',
      billingType: 'CREDIT_CARD',
      receivedDate: '2025-09-30T19:35:00.000Z'
    }
  },
  
  paymentOverdue: {
    event: 'PAYMENT_OVERDUE',
    payment: {
      id: 'pay_test_555666777',
      value: 25.00,
      status: 'OVERDUE',
      customer: 'cus_test_555666777',
      dueDate: '2025-09-29',
      description: 'Doação Teste - Instituto Coração Valente',
      billingType: 'BOLETO'
    }
  }
};

async function testWebhook(testName, payload) {
  console.log(`\n🧪 Testando: ${testName}`);
  console.log(`📤 Payload:`, JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Asaas-Webhook-Test/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    
    console.log(`📥 Status: ${response.status} ${response.statusText}`);
    console.log(`📄 Response:`, responseText);
    
    if (response.ok) {
      console.log(`✅ ${testName}: SUCESSO`);
    } else {
      console.log(`❌ ${testName}: FALHOU`);
    }
    
    return response.ok;
    
  } catch (error) {
    console.error(`💥 ${testName}: ERRO`, error.message);
    return false;
  }
}

async function testWebhookConnectivity() {
  console.log('🔗 Testando conectividade básica...');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    
    console.log(`📡 Conectividade: ${response.status} ${response.statusText}`);
    return response.ok;
    
  } catch (error) {
    console.error('❌ Falha de conectividade:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 INICIANDO TESTES DO WEBHOOK ASAAS');
  console.log('='.repeat(50));
  
  // Teste de conectividade
  const connectivity = await testWebhookConnectivity();
  if (!connectivity) {
    console.log('\n❌ FALHA: Webhook não está acessível');
    console.log('Verifique se a Edge Function está deployada corretamente');
    return;
  }
  
  // Testes de payload
  const results = [];
  
  for (const [testName, payload] of Object.entries(testPayloads)) {
    const success = await testWebhook(testName, payload);
    results.push({ testName, success });
    
    // Aguardar 1 segundo entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('='.repeat(30));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(({ testName, success }) => {
    console.log(`${success ? '✅' : '❌'} ${testName}`);
  });
  
  console.log(`\n🎯 Resultado: ${passed}/${total} testes passaram`);
  
  if (passed === total) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Webhook está pronto para configuração no Asaas');
  } else {
    console.log('⚠️ ALGUNS TESTES FALHARAM');
    console.log('🔧 Verifique os logs da Edge Function no Supabase');
  }
  
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Configure o webhook no painel do Asaas');
  console.log('2. Use a URL:', WEBHOOK_URL);
  console.log('3. Selecione os eventos: PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE');
  console.log('4. Faça uma doação teste para validar');
}

// Executar testes
runAllTests().catch(console.error);