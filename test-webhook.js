// Script para testar o webhook proxy
const testWebhook = async (messageContent = null) => {
  const timestamp = new Date().toISOString();
  const testMessage = {
    chatInput: messageContent || `Teste de conectividade - ${timestamp}`,
    user_id: "test_user_123",
    session_id: "test_session_456",
    timestamp: timestamp
  };

  console.log('🧪 Testando webhook proxy...');
  console.log('📦 Payload de teste:', JSON.stringify(testMessage, null, 2));
  console.log('⏰ Timestamp do teste:', timestamp);

  const startTime = Date.now();

  try {
    const response = await fetch('http://localhost:8080/api/webhook-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0',
      },
      body: JSON.stringify(testMessage)
    });

    const duration = Date.now() - startTime;

    console.log('📡 Status da resposta:', response.status);
    console.log('⏱️ Tempo de resposta:', `${duration}ms`);
    console.log('📋 Headers da resposta:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📄 Texto da resposta (primeiros 500 chars):', responseText.substring(0, 500));
    console.log('📊 Tamanho da resposta:', responseText.length, 'caracteres');

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Resposta JSON:', data);
        
        // Verificar se a resposta contém os campos esperados
        if (data.message) {
          console.log('✅ Campo "message" encontrado:', data.message.substring(0, 100) + '...');
        } else {
          console.log('⚠️ Campo "message" não encontrado na resposta');
        }
        
        if (data.session_id) {
          console.log('✅ Campo "session_id" encontrado:', data.session_id);
        } else {
          console.log('⚠️ Campo "session_id" não encontrado na resposta');
        }
        
      } catch (e) {
        console.log('⚠️ Resposta não é JSON válido:', e.message);
        console.log('📄 Resposta raw:', responseText);
      }
    } else {
      console.log('❌ Erro na requisição:', response.status, response.statusText);
      
      try {
        const errorData = JSON.parse(responseText);
        console.log('❌ Detalhes do erro:', errorData);
      } catch (e) {
        console.log('❌ Erro raw:', responseText);
      }
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('💥 Erro ao testar webhook:', error);
    console.error('⏱️ Tempo até erro:', `${duration}ms`);
    console.error('🔍 Tipo do erro:', error.name);
    console.error('📝 Mensagem do erro:', error.message);
  }
};

// Função para testar múltiplas mensagens em sequência
const testMultipleMessages = async (count = 3, delay = 2000) => {
  console.log(`🔄 Testando ${count} mensagens com delay de ${delay}ms...`);
  
  for (let i = 1; i <= count; i++) {
    console.log(`\n--- Teste ${i}/${count} ---`);
    await testWebhook(`Mensagem de teste ${i} - ${new Date().toISOString()}`);
    
    if (i < count) {
      console.log(`⏳ Aguardando ${delay}ms antes do próximo teste...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log('\n✅ Todos os testes concluídos!');
};

// Função para testar conectividade básica
const testConnectivity = async () => {
  console.log('🔍 Testando conectividade básica...');
  
  try {
    const response = await fetch('http://localhost:8080/api/webhook-proxy', {
      method: 'HEAD',
    });
    
    console.log('📡 Status HEAD:', response.status);
    console.log('✅ Proxy está respondendo');
    
    return true;
  } catch (error) {
    console.error('❌ Proxy não está respondendo:', error.message);
    return false;
  }
};

// Executar teste se chamado diretamente
if (typeof window === 'undefined') {
  // Node.js environment
  const args = process.argv.slice(2);
  
  if (args.includes('--multiple')) {
    const count = parseInt(args.find(arg => arg.startsWith('--count='))?.split('=')[1]) || 3;
    const delay = parseInt(args.find(arg => arg.startsWith('--delay='))?.split('=')[1]) || 2000;
    testMultipleMessages(count, delay);
  } else if (args.includes('--connectivity')) {
    testConnectivity();
  } else {
    const message = args.find(arg => arg.startsWith('--message='))?.split('=')[1];
    testWebhook(message);
  }
}

// Exportar para uso no browser
if (typeof window !== 'undefined') {
  window.testWebhook = testWebhook;
  window.testMultipleMessages = testMultipleMessages;
  window.testConnectivity = testConnectivity;
  
  console.log('🌐 Funções de teste disponíveis no window:');
  console.log('- testWebhook(message)');
  console.log('- testMultipleMessages(count, delay)');
  console.log('- testConnectivity()');
}