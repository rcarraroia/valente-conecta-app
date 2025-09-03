// Script para debug direto do n8n
import https from 'https';

const testN8nDirect = () => {
  const data = JSON.stringify({
    chatInput: "teste debug direto",
    user_id: "debug_user",
    session_id: "debug_session",
    timestamp: new Date().toISOString()
  });

  const options = {
    hostname: 'primary-production-b7fe.up.railway.app',
    port: 443,
    path: '/webhook/multiagente-ia-diagnostico',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'User-Agent': 'Debug-Script/1.0'
    }
  };

  console.log('🔍 Testando n8n diretamente...');
  console.log('📦 Payload:', data);

  const req = https.request(options, (res) => {
    console.log('📡 Status:', res.statusCode);
    console.log('📋 Headers:', res.headers);

    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('📄 Response length:', responseData.length);
      console.log('📄 Response data:', responseData || '(empty)');
      
      if (responseData) {
        try {
          const parsed = JSON.parse(responseData);
          console.log('✅ Parsed JSON:', parsed);
        } catch (e) {
          console.log('⚠️ Not valid JSON');
        }
      } else {
        console.log('❌ Empty response - workflow não está retornando dados');
      }
    });
  });

  req.on('error', (e) => {
    console.error('💥 Erro:', e.message);
  });

  req.write(data);
  req.end();
};

testN8nDirect();