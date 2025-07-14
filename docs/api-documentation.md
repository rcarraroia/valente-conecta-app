
# APIs e Edge Functions

## Visão Geral

O sistema utiliza **Supabase Edge Functions** (Deno runtime) para processamento backend, integrações externas e lógica de negócio complexa. Todas as functions são serverless e auto-escaláveis.

## Edge Functions Implementadas

### 1. `asaas-webhook`
**Propósito**: Processar webhooks do gateway de pagamento Asaas

```typescript
// Endpoint: POST /functions/v1/asaas-webhook
interface AsaasWebhookPayload {
  event: 'PAYMENT_CONFIRMED' | 'PAYMENT_CANCELLED' | 'PAYMENT_FAILED';
  payment: {
    id: string;
    value: number;
    status: string;
    customer: string;
  };
}
```

**Fluxo de Processamento**:
1. Valida assinatura do webhook
2. Atualiza status da doação no banco
3. Processa split de pagamento
4. Atualiza performance do embaixador (se aplicável)
5. Envia confirmação por email (futuro)

**Segurança**:
- Verificação de assinatura HMAC
- Rate limiting por IP
- Logs detalhados para auditoria

### 2. `process-payment`
**Propósito**: Criar cobrança no Asaas e processar pagamento

```typescript
// Endpoint: POST /functions/v1/process-payment
interface PaymentRequest {
  amount: number;           // Em centavos
  donor_name: string;
  donor_email: string;
  payment_method: 'CREDIT_CARD' | 'PIX';
  ambassador_code?: string;
  card_data?: {
    number: string;
    expiry: string;
    cvv: string;
    holder: string;
  };
}

interface PaymentResponse {
  success: boolean;
  payment_id: string;
  pix_qr_code?: string;    // Para pagamento PIX
  invoice_url?: string;    // Para cartão
  splits: AsaasSplit[];
}
```

**Fluxo de Processamento**:
1. Validação dos dados de entrada
2. Cálculo do split de pagamento
3. Criação da cobrança no Asaas
4. Registro da doação no banco
5. Retorno dos dados de pagamento

**Integrações**:
- **Asaas API**: Criação de cobranças
- **Split automático**: Distribuição entre instituto/admin/embaixador
- **Database**: Registro de transações

### 3. `diagnostico-iniciar`
**Propósito**: Iniciar sessão de pré-diagnóstico com IA

```typescript
// Endpoint: POST /functions/v1/diagnostico-iniciar
interface DiagnosisStartRequest {
  user_id: string;
}

interface DiagnosisStartResponse {
  session_id: string;
  first_question: {
    id: string;
    text: string;
    type: 'multiple_choice' | 'yes_no' | 'scale';
    options?: string[];
  };
}
```

**Fluxo de Processamento**:
1. Verifica se usuário tem sessão ativa
2. Cria nova sessão de diagnóstico
3. Carrega primeira pergunta baseada em lógica
4. Retorna estrutura da sessão

### 4. `diagnostico-resposta`
**Propósito**: Processar resposta e determinar próxima pergunta ou resultado final

```typescript
// Endpoint: POST /functions/v1/diagnostico-resposta
interface DiagnosisAnswerRequest {
  session_id: string;
  question_id: string;
  answer: string | number | boolean;
}

interface DiagnosisAnswerResponse {
  next_question?: {
    id: string;
    text: string;
    type: string;
    options?: string[];
  };
  diagnosis_result?: {
    severity_level: 1 | 2 | 3 | 4 | 5;
    recommendations: string[];
    ai_analysis: string;
    suggested_specialties: string[];
  };
  session_complete: boolean;
}
```

**Fluxo de Processamento**:
1. Valida sessão e pergunta
2. Registra resposta no banco
3. Aplica lógica de próxima pergunta
4. Se sessão completa, processa com IA
5. Retorna próxima pergunta ou resultado

**Integração IA**:
- **OpenAI GPT-4**: Análise primária
- **Gemini Pro**: Fallback/validação
- **Prompt engineering**: Especializado em cardiologia

### 5. `schedule-appointment`
**Propósito**: Agendar consulta com profissional

```typescript
// Endpoint: POST /functions/v1/schedule-appointment
interface ScheduleRequest {
  partner_id: string;
  schedule_id: string;
  appointment_date: string;    // YYYY-MM-DD
  appointment_time: string;    // HH:MM
  notes?: string;
}

interface ScheduleResponse {
  appointment_id: string;
  status: 'pending' | 'confirmed';
  confirmation_details: {
    partner_name: string;
    specialty: string;
    datetime: string;
    location?: string;
  };
}
```

**Validações**:
- Data futura (mínimo 24h)
- Horário dentro do schedule do profissional
- Disponibilidade de slots
- Limite de agendamentos por usuário

### 6. `manage-appointment`
**Propósito**: Gerenciar agendamento (confirmar/cancelar)

```typescript
// Endpoint: POST /functions/v1/manage-appointment
interface ManageAppointmentRequest {
  appointment_id: string;
  action: 'confirm' | 'cancel' | 'reschedule';
  new_datetime?: string;       // Para reschedule
  cancellation_reason?: string;
}
```

**Regras de Negócio**:
- Apenas profissional pode confirmar
- Cancelamento até 2h antes do horário
- Reagendamento = cancelar + criar novo
- Notificações automáticas (futuro)

### 7. `links-generate`
**Propósito**: Gerar link de embaixador para campanhas

```typescript
// Endpoint: POST /functions/v1/links-generate
interface LinkGenerateRequest {
  ambassador_user_id: string;
  campaign_id?: string;
  custom_params?: Record<string, string>;
}

interface LinkGenerateResponse {
  link_id: string;
  generated_url: string;
  short_url: string;
  qr_code?: string;           // Base64 encoded
  tracking_enabled: boolean;
}
```

**Funcionalidades**:
- URL única por embaixador/campanha
- Short URL automático
- QR Code gerado
- Tracking de cliques
- Analytics em tempo real

### 8. `link-redirect`
**Propósito**: Processar clique em link de embaixador e redirecionar

```typescript
// Endpoint: GET /functions/v1/link-redirect/{link_id}
interface RedirectRequest {
  link_id: string;
  // Headers: IP, User-Agent, Referrer
}
```

**Fluxo de Processamento**:
1. Valida se link existe e está ativo
2. Registra clique com metadados
3. Atualiza performance do embaixador
4. Redireciona para página de doação
5. Inclui parâmetros de tracking

### 9. `generate-existing-ambassador-links`
**Propósito**: Gerar links em lote para embaixadores existentes

```typescript
// Endpoint: POST /functions/v1/generate-existing-ambassador-links
// Uso administrativo para migração/setup inicial
```

## Padrões Comuns nas Edge Functions

### 1. Estrutura Base
```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Lógica da function
    const result = await processRequest(req);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);
```

### 2. Autenticação JWT
```typescript
const authenticateRequest = async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  const { data: user, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid authentication token');
  }
  
  return user;
};
```

### 3. Validação de Entrada
```typescript
import { z } from 'https://deno.land/x/zod/mod.ts';

const requestSchema = z.object({
  amount: z.number().min(500).max(100000000),
  email: z.string().email(),
  method: z.enum(['CREDIT_CARD', 'PIX'])
});

const validateRequest = (body: unknown) => {
  try {
    return requestSchema.parse(body);
  } catch (error) {
    throw new Error(`Invalid request data: ${error.message}`);
  }
};
```

### 4. Error Handling
```typescript
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

const handleError = (error: unknown): Response => {
  if (error instanceof AppError) {
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        code: error.code 
      }),
      { 
        status: error.statusCode,
        headers: corsHeaders 
      }
    );
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error);
  
  return new Response(
    JSON.stringify({ error: 'Internal server error' }),
    { 
      status: 500,
      headers: corsHeaders 
    }
  );
};
```

### 5. Rate Limiting
```typescript
const rateLimiter = new Map<string, number[]>();

const checkRateLimit = (
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimiter.has(identifier)) {
    rateLimiter.set(identifier, []);
  }
  
  const requests = rateLimiter.get(identifier)!
    .filter(time => time > windowStart);
  
  if (requests.length >= maxRequests) {
    return false;
  }
  
  requests.push(now);
  rateLimiter.set(identifier, requests);
  return true;
};
```

## Integrações Externas

### 1. Asaas (Gateway de Pagamento)
```typescript
interface AsaasConfig {
  baseUrl: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
}

class AsaasClient {
  private config: AsaasConfig;
  
  async createPayment(data: PaymentData): Promise<AsaasPayment> {
    const response = await fetch(`${this.config.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': this.config.apiKey,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Asaas API error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async createSplit(paymentId: string, splits: AsaasSplit[]): Promise<void> {
    // Implementação do split de pagamento
  }
}
```

### 2. OpenAI (Análise de Sintomas)
```typescript
interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

class OpenAIClient {
  private config: OpenAIConfig;
  
  async analyzeSymptoms(symptoms: string[]): Promise<DiagnosisResult> {
    const prompt = this.buildMedicalPrompt(symptoms);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: 'Você é um assistente médico especializado em cardiologia...' },
          { role: 'user', content: prompt }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    });
    
    const result = await response.json();
    return this.parseMedicalResponse(result.choices[0].message.content);
  }
  
  private buildMedicalPrompt(symptoms: string[]): string {
    return `
      Analyze os seguintes sintomas cardiovasculares:
      ${symptoms.join(', ')}
      
      Forneça:
      1. Nível de severidade (1-5)
      2. Possíveis condições (sem diagnóstico definitivo)
      3. Recomendações imediatas
      4. Especialidades médicas sugeridas
      
      IMPORTANTE: Sempre recomendar consulta médica presencial.
    `;
  }
}
```

### 3. Resend (Email - Configurável)
```typescript
interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

class EmailClient {
  private config: EmailConfig;
  
  async sendAppointmentConfirmation(
    to: string, 
    appointmentData: AppointmentData
  ): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: [to],
        subject: 'Confirmação de Agendamento - Instituto Coração Valente',
        html: this.buildAppointmentEmailTemplate(appointmentData),
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Email sending failed: ${response.statusText}`);
    }
  }
}
```

## Configuração e Deploy

### 1. Secrets Management
```toml
# supabase/config.toml
[functions.process-payment]
verify_jwt = true

[functions.asaas-webhook]
verify_jwt = false  # Webhook público

[functions.diagnostico-iniciar]
verify_jwt = true

[functions.link-redirect]
verify_jwt = false  # Redirecionamento público
```

### 2. Environment Variables
```typescript
// Validação na inicialização da function
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'ASAAS_API_KEY',
  'OPENAI_API_KEY'
];

requiredEnvVars.forEach(varName => {
  if (!Deno.env.get(varName)) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

### 3. CORS Configuration
```typescript
// Configuração específica por ambiente
const corsHeaders = {
  'Access-Control-Allow-Origin': 
    Deno.env.get('ENVIRONMENT') === 'production' 
      ? 'https://app.institutovalente.org'
      : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};
```

## Monitoramento e Logs

### 1. Structured Logging
```typescript
const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      data,
      timestamp: new Date().toISOString(),
      function: Deno.env.get('FUNCTION_NAME')
    }));
  },
  
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message || error,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      function: Deno.env.get('FUNCTION_NAME')
    }));
  }
};
```

### 2. Performance Monitoring
```typescript
const withTiming = async (name: string, fn: () => Promise<any>) => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.info(`${name} completed`, { duration_ms: duration });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`${name} failed`, { duration_ms: duration, error });
    throw error;
  }
};
```

### 3. Health Checks
```typescript
// Endpoint para health check
if (req.url.endsWith('/health')) {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    function: Deno.env.get('FUNCTION_NAME'),
    version: '1.0.0'
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
```

## Testes e Qualidade

### 1. Unit Tests (Exemplo)
```typescript
// tests/payment.test.ts
import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { calculatePaymentSplit } from "../utils/paymentSplit.ts";

Deno.test("Payment split calculation", () => {
  const result = calculatePaymentSplit(10000, "AMB123");
  
  assertEquals(result.instituteShare, 8000);
  assertEquals(result.adminShare, 1000);
  assertEquals(result.ambassadorShare, 1000);
});
```

### 2. Integration Tests
```typescript
// tests/integration/payment.test.ts
Deno.test("Complete payment flow", async () => {
  const response = await fetch('http://localhost:8000/functions/v1/process-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    },
    body: JSON.stringify({
      amount: 5000,
      donor_email: 'test@example.com',
      payment_method: 'PIX'
    })
  });
  
  assertEquals(response.status, 200);
  const result = await response.json();
  assert(result.success);
  assert(result.pix_qr_code);
});
```

## Performance e Otimização

### 1. Connection Pooling
```typescript
// Reutilização de conexão Supabase
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    db: {
      schema: 'public',
    },
    global: {
      headers: { 'x-my-custom-header': 'my-app-name' },
    },
  }
);
```

### 2. Caching Strategy
```typescript
const cache = new Map();

const getCachedData = async (key: string, fetchFn: () => Promise<any>, ttl: number = 300000) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = await fetchFn();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};
```

### 3. Batch Operations
```typescript
const batchUpdatePerformance = async (updates: PerformanceUpdate[]) => {
  const batchSize = 100;
  
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    
    await supabase
      .from('ambassador_performance')
      .upsert(batch, { onConflict: 'ambassador_user_id' });
  }
};
```
