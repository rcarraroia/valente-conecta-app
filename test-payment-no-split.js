// Teste de pagamento SEM split para verificar se funciona
const testPayment = async () => {
  const paymentData = {
    amount: 1000, // R$ 10,00
    type: 'donation',
    paymentMethod: 'CREDIT_CARD',
    donor: {
      name: 'Beatriz F A Carraro',
      email: 'bia.aguilar@hotmail.com',
      phone: '33998563758',
      document: '10806099623'
    }
    // SEM ambassadorCode para não gerar split
  };

  try {
    console.log('Testando pagamento SEM split:', paymentData);
    
    const response = await fetch('https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/process-payment-debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw'
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ SUCESSO! Pagamento criado sem split');
    } else {
      console.error('❌ ERRO:', result.error);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
};

testPayment();