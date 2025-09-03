// Teste para identificar a wallet ID da conta principal e validar as outras
const API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjU2NTNkZmMxLTJlZjItNDk4Yy05NjZkLTQ4MTRhYmUwNDNkZDo6JGFhY2hfOGMxNDJmNWItZGYyMi00MjIzLThjYjEtNjg0ZjNjYmRlZjNi';

const WALLET_IDS = {
  renum: 'f9c7d1dd-9e52-4e81-8194-8b666f276405',
  special: 'c0c31b6a-2481-4e3f-a6de-91c3ff834d1f'
};

async function getAccountInfo() {
  console.log('=== VERIFICANDO INFORMAÇÕES DA CONTA ===');
  
  try {
    const response = await fetch('https://www.asaas.com/api/v3/myAccount', {
      method: 'GET',
      headers: {
        'access_token': API_KEY,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro ao buscar conta:', response.status, errorData);
      return;
    }

    const accountData = await response.json();
    console.log('Dados da conta:', JSON.stringify(accountData, null, 2));
    
    if (accountData.walletId) {
      console.log('🔍 WALLET ID DA CONTA PRINCIPAL:', accountData.walletId);
      
      // Verificar se alguma das nossas wallets é igual à principal
      if (accountData.walletId === WALLET_IDS.renum) {
        console.log('❌ PROBLEMA: Wallet Renum é igual à conta principal!');
      } else if (accountData.walletId === WALLET_IDS.special) {
        console.log('❌ PROBLEMA: Wallet Special é igual à conta principal!');
      } else {
        console.log('✅ Nenhuma wallet duplicada encontrada');
      }
    }
    
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
}

async function validateWallets() {
  console.log('\n=== VALIDANDO WALLETS ===');
  
  for (const [name, walletId] of Object.entries(WALLET_IDS)) {
    try {
      console.log(`\nTestando wallet ${name}: ${walletId}`);
      
      // Tentar fazer uma operação que use a wallet para ver se é válida
      const testPayload = {
        customer: 'test',
        billingType: 'CREDIT_CARD',
        value: 10,
        dueDate: new Date().toISOString().split('T')[0],
        description: 'Teste de validação de wallet',
        split: [{
          walletId: walletId,
          fixedValue: 5
        }]
      };
      
      const response = await fetch('https://www.asaas.com/api/v3/payments', {
        method: 'POST',
        headers: {
          'access_token': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });
      
      const result = await response.text();
      console.log(`Status: ${response.status}`);
      console.log(`Response: ${result}`);
      
      if (result.includes('sua própria carteira')) {
        console.log(`❌ PROBLEMA: Wallet ${name} é a mesma da conta principal!`);
      } else if (result.includes('invalid_customer')) {
        console.log(`✅ Wallet ${name} é válida (erro esperado de customer inválido)`);
      } else {
        console.log(`⚠️ Resposta inesperada para wallet ${name}`);
      }
      
    } catch (error) {
      console.error(`Erro ao testar wallet ${name}:`, error);
    }
  }
}

async function main() {
  await getAccountInfo();
  await validateWallets();
}

main();