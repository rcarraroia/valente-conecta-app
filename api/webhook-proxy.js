// Vercel serverless function to proxy webhook requests and avoid CORS
export default async function handler(req, res) {
  // Allow POST, HEAD, and OPTIONS requests
  if (!['POST', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle HEAD requests for health checks
  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  try {
    const webhookUrl = 'https://primary-production-b7fe.up.railway.app/webhook/multiagente-ia-diagnostico';
    
    console.log('🚀 Proxying request to:', webhookUrl);
    console.log('📝 Request method:', req.method);
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('📋 Request headers:', req.headers);

    // Forward the request to the actual webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Valente-Conecta-Proxy/1.0',
      },
      body: JSON.stringify(req.body),
    });

    console.log('Webhook response status:', response.status);
    
    // Always try to get response as text first
    const responseText = await response.text();
    console.log('Webhook response text:', responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      data = { message: responseText };
    }

    // Handle n8n specific errors - check data first, then response status
    if ((data && data.message && data.message.includes('Workflow could not be started')) || !response.ok) {
      console.error('N8N Workflow error:', response.status, data);
      
      // Return a user-friendly error for workflow issues
      if (data && data.message && data.message.includes('Workflow could not be started')) {
        return res.status(200).json({
          error: 'service_unavailable',
          message: 'O assistente de pré-diagnóstico está temporariamente indisponível.',
          user_message: 'Tente novamente em alguns minutos. Se o problema persistir, entre em contato conosco.',
        });
      }
      
      return res.status(400).json({
        error: 'webhook_error',
        status: response.status,
        data: data,
        message: data.message || responseText,
      });
    }

    console.log('Webhook response data:', data);

    // Return the response
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    
    return res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}