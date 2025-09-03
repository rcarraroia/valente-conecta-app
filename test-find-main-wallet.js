// Teste para encontrar a wallet ID da conta principal
const API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjU2NTNkZmMxLTJlZjItNDk4Yy05NjZkLTQ4MTRhYmUwNDNkZDo6JGFhY2hfOGMxNDJmNWItZGYyMi00MjIzLThjYjEtNjg0ZjNjYmRlZjNi';

async function findMainWallet() {
  console.log('=== BUSCANDO WALLET ID DA CONTA PRINCIPAL ===');
  
  try {
    // Criar um pagamento simples sem split para ver se conseguimos identificar a wallet
    const testCustomer = {
      name: 'Teste Wallet',
      email: 'teste@wallet.com',
      cpfCnpj: '11144477735'
    };
    
    console.log('1. Criando cliente de teste...');
    const customerResponse = await fetch('https://www.asaas.com/api/v3/customers', {
      method: 'POST',
      headers: {
        'access_token': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCustomer)
    });
    
    if (!customerResponse.ok) {
      const errorData = await customerResponse.text();
      console.error('Erro ao criar cliente:', errorData);
      return;
    }
    
    const customer = await customerResponse.json();
    console.log('Cliente criado:', customer.id);
    
    // Agora vamos testar com a wallet que estava causando problema
    const suspectedWalletId = 'eff311bc-7737-4870-93cd-16080c00d379';
    
    console.log('2. Testando wallet suspeita:', suspectedWalletId);
    
    const testPayload = {
      customer: customer.id,
      billingType: 'CREDIT_CARD',
      value: 10,
      dueDate: new Date().toISOString().split('T')[0],
      description: 'Teste de wallet',
      split: [{
        walletId: suspectedWalletId,
        fixedValue: 5
      }]
    };
    
    const paymentResponse = await fetch('https://www.asaas.com/api/v3/payments', {
      method: 'POST',
      headers: {
        'access_token': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    const result = await paymentResponse.text();
    console.log('Status:', paymentResponse.status);
    console.log('Response:', result);
    
    if (result.includes('sua própria carteira')) {
      console.log('🎯 ENCONTRADO! A wallet', suspectedWalletId, 'é a mesma da conta principal!');
    } else {
      console.log('✅ Wallet', suspectedWalletId, 'não é a conta principal');
    }
    
    // Vamos tentar buscar informações de transferências para ver se conseguimos a wallet principal
    console.log('\n3. Buscando transferências para identificar wallet principal...');
    
    const transfersResponse = await fetch('https://www.asaas.com/api/v3/transfers', {
      method: 'GET',
      headers: {
        'access_token': API_KEY,
        'Content-Type': 'application/json',
      }
    });
    
    if (transfersResponse.ok) {
      const transfers = await transfersResponse.json();
      console.log('Transferências:', JSON.stringify(transfers, null, 2));
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

findMainWallet();