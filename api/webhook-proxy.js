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
    
    console.log('Proxying request to:', webhookUrl);
    console.log('Request body:', req.body);

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error:', errorText);
      
      return res.status(response.status).json({
        error: 'Webhook request failed',
        status: response.status,
        message: errorText,
      });
    }

    const data = await response.json();
    console.log('Webhook response data:', data);

    // Return the response
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    
    return res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
    });
  }
}