// Teste direto do proxy local
const testProxyDirect = async () => {
  const testPayload = {
    chatInput: "Olá, teste do proxy",
    user_id: "test_user_123",
    session_id: "test_session_456",
    timestamp: new Date().toISOString()
  };

  console.log('🧪 Testando proxy local...');
  console.log('📦 Payload:', testPayload);

  try {
    // Teste local (assumindo que você está rodando npm run dev)
    const response = await fetch('http://localhost:8080/api/webhook-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📄 Response text:', responseText);

    if (responseText) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Parsed response:', data);
      } catch (e) {
        console.log('⚠️ Could not parse as JSON');
      }
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
};

testProxyDirect();