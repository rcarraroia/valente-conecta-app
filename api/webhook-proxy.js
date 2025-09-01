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
    const timestamp = new Date().toISOString();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`� [$q{requestId}] [${timestamp}] Proxying request to:`, webhookUrl);
    console.log(`� R[${requestId}] Request method:`, req.method);
    console.log(`📦 [${requestId}] Request body:`, JSON.stringify(req.body, null, 2));
    console.log(`📋 [${requestId}] Request headers (filtered):`, {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'content-length': req.headers['content-length'],
      'origin': req.headers['origin'],
      'referer': req.headers['referer']
    });
    
    // Log the specific message content for debugging
    if (req.body && req.body.chatInput) {
      console.log(`💬 [${requestId}] Message content:`, req.body.chatInput);
      console.log(`👤 [${requestId}] User ID:`, req.body.user_id);
      console.log(`🔗 [${requestId}] Session ID:`, req.body.session_id);
      console.log(`⏰ [${requestId}] Timestamp:`, req.body.timestamp);
    }

    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      console.error('❌ Invalid request body:', req.body);
      return res.status(400).json({
        error: 'invalid_request',
        message: 'Request body must be a valid JSON object'
      });
    }

    if (!req.body.chatInput) {
      console.error('❌ Missing chatInput in request body');
      return res.status(400).json({
        error: 'missing_chat_input',
        message: 'chatInput field is required'
      });
    }

    // Forward the request to the actual webhook
    const startTime = Date.now();
    console.log(`🔄 [${requestId}] Forwarding to n8n webhook at ${startTime}`);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Valente-Conecta-Proxy/1.0',
        'Accept': 'application/json',
        'X-Request-ID': requestId,
      },
      body: JSON.stringify(req.body),
      timeout: 30000, // 30 second timeout
    });

    const responseTime = Date.now() - startTime;

    console.log(`📡 [${requestId}] Webhook response:`, {
      status: response.status,
      statusText: response.statusText,
      responseTime: `${responseTime}ms`,
      headers: {
        'content-type': response.headers.get('content-type'),
        'content-length': response.headers.get('content-length')
      }
    });
    
    // Always try to get response as text first
    const responseText = await response.text();
    console.log(`📄 [${requestId}] Webhook response text (first 500 chars):`, responseText.substring(0, 500));
    console.log(`📊 [${requestId}] Full response length:`, responseText.length);
    
    // If response is empty, return a default message to prevent frontend errors
    if (!responseText || responseText.trim() === '') {
      console.log(`⚠️ [${requestId}] N8N returned empty response, using fallback`);
      const fallbackResponse = {
        message: "Desculpe, o sistema de IA está temporariamente indisponível. Tente novamente em alguns minutos.",
        session_id: req.body.session_id || 'unknown',
        error: 'empty_response_from_n8n',
        timestamp: new Date().toISOString()
      };
      return res.status(200).json(fallbackResponse);
    }

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

    console.log(`✅ [${requestId}] Webhook response data:`, data);
    console.log(`🏁 [${requestId}] Request completed successfully in ${responseTime}ms`);

    // Return the response
    return res.status(200).json(data);

  } catch (error) {
    const errorTimestamp = new Date().toISOString();
    console.error(`💥 [${requestId || 'unknown'}] [${errorTimestamp}] Proxy error:`, {
      message: error.message,
      name: error.name,
      stack: error.stack,
      requestBody: req.body ? JSON.stringify(req.body) : 'undefined',
      url: webhookUrl
    });
    
    // Handle specific error types
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return res.status(408).json({
        error: 'request_timeout',
        message: 'Request to n8n webhook timed out',
        user_message: 'O sistema está demorando para responder. Tente novamente em alguns segundos.'
      });
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return res.status(503).json({
        error: 'service_unavailable',
        message: 'Unable to connect to n8n webhook service',
        user_message: 'O serviço de pré-diagnóstico está temporariamente indisponível.'
      });
    }
    
    return res.status(500).json({
      error: 'proxy_error',
      message: error.message,
      user_message: 'Erro interno do servidor. Tente novamente em alguns minutos.',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}