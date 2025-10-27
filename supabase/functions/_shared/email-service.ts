/**
 * Email Service - Instituto Coração Valente
 * Serviço centralizado para envio de emails via Resend
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string; // Base64
    contentType: string;
  }>;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const DEFAULT_FROM = 'Instituto Coração Valente <no-reply@coracaovalente.org.br>';
const RESEND_API_URL = 'https://api.resend.com/emails';

export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY não configurada');
    return {
      success: false,
      error: 'Email service not configured'
    };
  }

  try {
    console.log('📧 Enviando email:', {
      to: options.to,
      subject: options.subject,
      from: options.from || DEFAULT_FROM
    });

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || DEFAULT_FROM,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
        attachments: options.attachments,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erro ao enviar email:', data);
      return {
        success: false,
        error: data.message || 'Failed to send email'
      };
    }

    console.log('✅ Email enviado com sucesso:', data.id);
    return {
      success: true,
      messageId: data.id
    };

  } catch (error: any) {
    console.error('💥 Erro no serviço de email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envia email com retry automático
 */
export async function sendEmailWithRetry(
  options: EmailOptions,
  maxRetries: number = 3
): Promise<EmailResponse> {
  let lastError: string = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`📧 Tentativa ${attempt}/${maxRetries} de envio de email`);

    const result = await sendEmail(options);

    if (result.success) {
      return result;
    }

    lastError = result.error || 'Unknown error';
    console.warn(`⚠️ Tentativa ${attempt} falhou:`, lastError);

    // Aguardar antes de tentar novamente (exponential backoff)
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`⏳ Aguardando ${delay}ms antes de tentar novamente...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries} attempts: ${lastError}`
  };
}
