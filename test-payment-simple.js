// Teste simples da função de pagamento
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
  };

  try {
    console.log('Testando pagamento com dados:', paymentData);
    
    const response = await fetch('https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/process-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MjY0ODQsImV4cCI6MjA1MTUwMjQ4NH0.cS0102b68c1bd986fe33bd8839e2ba114a31f79216c'
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (!response.ok) {
      console.error('Erro HTTP:', response.status, result);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
};

testPayment();