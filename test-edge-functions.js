// Teste das Edge Functions - Instituto Coração Valente
const SUPABASE_URL = 'https://corrklfwxfuqusfzwbls.supabase.co';

// Teste básico da função process-payment
async function testProcessPayment() {
  console.log('🧪 Testando process-payment...');
  
  const testData = {
    amount: 1000, // R$ 10,00 em centavos
    type: 'donation',
    paymentMethod: 'PIX',
    donor: {
      name: 'João Teste',
      email: 'joao@teste.com',
      phone: '11999999999'
    }
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ANON_KEY_HERE'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('✅ Resultado process-payment:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro process-payment:', error);
    return null;
  }
}
// Te
ste da função process-payment-v2
async function testProcessPaymentV2() {
  console.log('🧪 Testando process-payment-v2...');
  
  const testData = {
    amount: 1500, // R$ 15,00 em centavos
    type: 'donation',
    paymentMethod: 'PIX',
    donor: {
      name: 'Maria Teste',
      email: 'maria@teste.com',
      phone: '11888888888'
    },
    ambassadorCode: 'AMB123' // Teste com embaixador
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-payment-v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ANON_KEY_HERE'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('✅ Resultado process-payment-v2:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro process-payment-v2:', error);
    return null;
  }
}// Tes
te com cartão de crédito
async function testCreditCard() {
  console.log('🧪 Testando pagamento com cartão...');
  
  const testData = {
    amount: 2000, // R$ 20,00 em centavos
    type: 'subscription',
    frequency: 'monthly',
    paymentMethod: 'CREDIT_CARD',
    donor: {
      name: 'Carlos Teste',
      email: 'carlos@teste.com',
      phone: '11777777777',
      document: '12345678901'
    },
    creditCard: {
      holderName: 'CARLOS TESTE',
      number: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2025',
      ccv: '123'
    }
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-payment-v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ANON_KEY_HERE'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('✅ Resultado cartão:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro cartão:', error);
    return null;
  }
}// Ex
ecutar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes das Edge Functions...\n');
  
  console.log('IMPORTANTE: Substitua YOUR_ANON_KEY_HERE pela sua chave anônima do Supabase!\n');
  
  // Teste 1: Doação PIX simples
  await testProcessPayment();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 2: Doação PIX com embaixador
  await testProcessPaymentV2();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 3: Assinatura com cartão
  await testCreditCard();
  
  console.log('\n🎉 Testes concluídos!');
}

// Executar se chamado diretamente
if (typeof window === 'undefined') {
  runAllTests();
}

// Exportar para uso no browser
if (typeof module !== 'undefined') {
  module.exports = { testProcessPayment, testProcessPaymentV2, testCreditCard, runAllTests };
}