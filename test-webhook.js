// Script para testar o webhook do Railway
const WEBHOOK_URL = 'https://primary-production-b7fe.up.railway.app/webhook/multiagente-ia-diagnostico';

async function testWebhook() {
  console.log('🚀 Testando webhook do Railway...');
  console.log('URL:', WEBHOOK_URL);
  
  // Teste 1: Requisição básica
  const testRequest = {
    user_id: 'test-user-123',
    session_id: 'session_test_' + Date.now(),
    message: 'Olá, este é um teste do webhook',
    timestamp: new Date().toISOString(),
    message_history: []
  };

  await testBasicRequest(testRequest);
  
  // Teste 2: Verificar se é um problema de estrutura de dados
  console.log('\n🔄 Testando com estrutura alternativa...');
  const alternativeRequest = {
    userId: 'test-user-123',
    sessionId: 'session_test_' + Date.now(),
    text: 'Olá, este é um teste alternativo',
    timestamp: new Date().toISOString()
  };
  
  await testBasicRequest(alternativeRequest);
}

async function testBasicRequest(testRequest) {

  try {
    console.log('\n📤 Enviando requisição de teste...');
    console.log('Payload:', JSON.stringify(testRequest, null, 2));
    
    const startTime = Date.now();
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Valente-Conecta-Test/1.0',
      },
      body: JSON.stringify(testRequest),
    });

    const responseTime = Date.now() - startTime;
    
    console.log('\n📥 Resposta recebida:');
    console.log('Status:', response.status, response.statusText);
    console.log('Tempo de resposta:', responseTime + 'ms');
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ Sucesso! Dados da resposta:');
      console.log(JSON.stringify(data, null, 2));
      
      // Validar estrutura da resposta
      if (data.message && data.session_id) {
        console.log('\n🎯 Webhook está funcionando corretamente!');
        console.log('- Mensagem recebida:', data.message.substring(0, 100) + '...');
        console.log('- Session ID:', data.session_id);
        console.log('- Diagnóstico completo:', data.diagnosis_complete || false);
      } else {
        console.log('\n⚠️ Resposta recebida mas estrutura inesperada');
      }
    } else {
      const errorText = await response.text();
      console.log('\n❌ Erro na resposta:');
      console.log('Corpo da resposta:', errorText);
      
      // Analisar o erro específico
      if (response.status === 500) {
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message && errorData.message.includes('Workflow could not be started')) {
            console.log('\n🔍 Diagnóstico do erro:');
            console.log('- O webhook está acessível (Railway funcionando)');
            console.log('- O workflow N8N não está ativo ou configurado corretamente');
            console.log('- Verifique se o workflow está publicado e ativo no N8N');
            console.log('- Confirme se a URL do webhook está correta');
          }
        } catch (parseError) {
          console.log('- Erro interno do servidor (500)');
        }
      }
    }
    
  } catch (error) {
    console.log('\n💥 Erro ao testar webhook:');
    console.error('Erro:', error.message);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('\n🔍 Possíveis causas:');
      console.log('- Problema de conectividade de rede');
      console.log('- URL do webhook incorreta');
      console.log('- Serviço do Railway indisponível');
    }
  }
}

// Executar teste
testWebhook().then(() => {
  console.log('\n🏁 Teste concluído');
}).catch(error => {
  console.error('Erro fatal:', error);
});