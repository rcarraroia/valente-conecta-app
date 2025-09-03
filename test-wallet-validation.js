// Teste para validar se as wallet IDs estão corretas
const testWalletValidation = async () => {
  console.log('=== TESTE DE VALIDAÇÃO DAS WALLET IDs ===');
  
  const WALLET_IDS = {
    renum: 'f9c7d1dd-9e52-4e81-8194-8b666f276405',        // Renum - Dona do sistema (10% sempre)
    noAmbassador: 'c0c31b6a-2481-4e3f-a6de-91c3ff834d1f'  // Para doações sem embaixador (20%)
  };

  const paymentData = {
    amount: 1000, // R$ 10,00
    type: 'donation',
    paymentMethod: 'CREDIT_CARD',
    donor: {
      name: 'Teste Usuario',
      email: 'teste@exemplo.com',
      document: '11144477735'
    }
    // SEM ambassadorCode para testar split sem embaixador
  };

  try {
    console.log('Testando split SEM embaixador:');
    console.log('- Renum (10%):', WALLET_IDS.renum);
    console.log('- Sem Embaixador (20%):', WALLET_IDS.noAmbassador);
    console.log('- Instituto (70%): recebe automaticamente via API Key');
    
    const response = await fetch('https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/process-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw'
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();
    console.log('Status:', response.status);
    
    if (response.ok) {
      console.log('✅ SUCESSO! Split funcionando');
      console.log('Split aplicado:', result.split);
      console.log('Payment ID:', result.payment.id);
    } else {
      console.error('❌ ERRO:', result.error);
      
      if (result.error.includes('split para sua própria carteira')) {
        console.error('🚨 PROBLEMA: Uma das wallet IDs ainda é da conta principal!');
      }
    }
    
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
};

testWalletValidation();