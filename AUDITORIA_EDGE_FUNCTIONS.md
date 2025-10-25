# ⚡ AUDITORIA DE EDGE FUNCTIONS - INSTITUTO CORAÇÃO VALENTE

**Data**: 25/10/2025
**Auditor**: Claude Code (Especialista em Segurança)
**Total de Functions**: 14

---

## 📊 SUMÁRIO EXECUTIVO

### Problemas Críticos Encontrados 🔴
1. **Duplicação de Functions** - 3 versões de process-payment
2. **CORS Aberto** - `Access-Control-Allow-Origin: '*'` em todas
3. **JWT Desabilitado** - `verify_jwt = false` em functions críticas
4. **Logs Sensíveis** - Dados de pagamento em logs

### Score de Segurança: **6.5/10** ⚠️

---

## 🔍 ANÁLISE DETALHADA POR FUNCTION

### 1. Process Payment Functions (❌ PROBLEMA)

**Versões Encontradas**:
- `process-payment` (v1)
- `process-payment-v2` (atualizada)
- `process-payment-debug` (debug)

#### Diferenças Entre v1 e v2

| Aspecto | v1 | v2 |
|---------|----|----|
| **Tipagem** | Básica | Interface completa |
| **Validação Cartão** | Não valida | Valida dados do cartão |
| **Split de Pagamento** | Manual | Função dedicada `configureSplit()` |
| **Assinaturas** | Limitado | Suporte completo |
| **Error Handling** | Básico | Melhorado |
| **Logs** | Verboso | Estruturado |

#### Problemas Identificados

**1. CORS Aberto (🔴 CRÍTICO)**
```typescript
// ❌ PROBLEMA: Permite requests de qualquer origem
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

**Recomendação**:
```typescript
// ✅ CORRETO: Apenas domínios autorizados
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://institutovalente.org',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Ou em desenvolvimento:
const allowedOrigins = [
  'https://institutovalente.org',
  'https://staging.institutovalente.org',
  'http://localhost:5173' // apenas em dev
];

const origin = req.headers.get('origin');
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
  // ...
};
```

**2. Logs Sensíveis (🔴 CRÍTICO)**
```typescript
// ❌ PROBLEMA: Dados sensíveis em logs
console.log('Dados do pagamento recebidos:', {
  amount: paymentData.amount,
  type: paymentData.type,
  frequency: paymentData.frequency,
  paymentMethod: paymentData.paymentMethod,
  ambassadorCode: paymentData.ambassadorCode,
  donorName: paymentData.donor.name  // ❌ Dados pessoais
});
```

**Recomendação**:
```typescript
// ✅ CORRETO: Sanitizar logs
console.log('Dados do pagamento recebidos:', {
  amount: paymentData.amount,
  type: paymentData.type,
  paymentMethod: paymentData.paymentMethod,
  donorName: paymentData.donor.name.slice(0, 3) + '***', // Mascarar
  // Não logar: email, phone, document
});
```

**3. Validação Fraca (🟡 MÉDIO)**
```typescript
// ❌ PROBLEMA: Validação básica
if (!paymentData.amount || paymentData.amount < 500) {
  throw new Error('Valor mínimo para doação é R$ 5,00');
}
```

**Recomendação**:
```typescript
// ✅ CORRETO: Validação com Zod
import { z } from 'https://deno.land/x/zod/mod.ts';

const PaymentSchema = z.object({
  amount: z.number().min(500).max(100000000), // R$ 5 a R$ 1.000.000
  type: z.enum(['donation', 'subscription']),
  paymentMethod: z.enum(['PIX', 'CREDIT_CARD', 'BOLETO']),
  donor: z.object({
    name: z.string().min(3).max(100),
    email: z.string().email(),
    phone: z.string().regex(/^\d{10,11}$/).optional(),
    document: z.string().regex(/^\d{11}$|^\d{14}$/).optional(),
  }),
  ambassadorCode: z.string().optional(),
  creditCard: z.object({
    holderName: z.string(),
    number: z.string().regex(/^\d{16}$/),
    expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
    expiryYear: z.string().regex(/^\d{4}$/),
    ccv: z.string().regex(/^\d{3,4}$/),
  }).optional(),
});

// Uso
try {
  const validData = PaymentSchema.parse(paymentData);
} catch (error) {
  return new Response(
    JSON.stringify({ error: 'Dados inválidos', details: error.errors }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

**4. Error Handling Fraco (🟡 MÉDIO)**
```typescript
// ❌ PROBLEMA: Mensagens genéricas
catch (error) {
  console.error('Erro crítico ao buscar embaixador:', error);
  // Continuar sem embaixador em caso de erro
}
```

**Recomendação**:
```typescript
// ✅ CORRETO: Error handling robusto
catch (error) {
  // Log detalhado internamente
  console.error('Erro ao buscar embaixador:', {
    code: error.code,
    message: error.message,
    ambassadorCode: paymentData.ambassadorCode,
    timestamp: new Date().toISOString()
  });

  // Retornar erro genérico ao cliente
  return new Response(
    JSON.stringify({
      error: 'Erro ao processar embaixador',
      // NÃO expor detalhes internos
    }),
    { status: 500, headers: corsHeaders }
  );
}
```

**5. Falta Rate Limiting (🔴 CRÍTICO)**

Não há proteção contra abuso/DoS.

**Recomendação**:
```typescript
// ✅ Implementar rate limiting
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimiter.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimiter.set(ip, { count: 1, resetAt: now + 60000 }); // 1 minuto
    return true;
  }

  if (limit.count >= 10) { // 10 requests por minuto
    return false;
  }

  limit.count++;
  return true;
}

// No handler
const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
if (!checkRateLimit(clientIP)) {
  return new Response(
    JSON.stringify({ error: 'Muitas requisições. Tente novamente em 1 minuto.' }),
    { status: 429, headers: corsHeaders }
  );
}
```

---

### 2. Asaas Webhook Functions

**Versões**: `asaas-webhook`, `asaas-webhook-v2`

#### Análise de Segurança

**1. Validação de Webhook (🔴 CRÍTICO)**

```typescript
// ❌ PROBLEMA: Sem validação de origem
const handler = async (req: Request): Promise<Response> => {
  // Aceita qualquer webhook sem verificar
  const webhookData = await req.json();
  // ...
}
```

**Recomendação**:
```typescript
// ✅ CORRETO: Validar assinatura do Asaas
const ASAAS_WEBHOOK_SECRET = Deno.env.get('ASAAS_WEBHOOK_SECRET');

function validateWebhook(signature: string, body: string): boolean {
  const expectedSignature = hmac256(ASAAS_WEBHOOK_SECRET, body);
  return signature === expectedSignature;
}

const handler = async (req: Request): Promise<Response> => {
  const signature = req.headers.get('asaas-signature');
  const body = await req.text();

  if (!validateWebhook(signature, body)) {
    console.warn('Webhook inválido detectado:', {
      ip: req.headers.get('x-forwarded-for'),
      timestamp: new Date().toISOString()
    });
    return new Response('Unauthorized', { status: 401 });
  }

  const webhookData = JSON.parse(body);
  // ...
}
```

**2. verify_jwt = false (✅ OK para webhooks)**

Para webhooks externos, é correto desabilitar JWT, mas a validação de assinatura é obrigatória.

---

### 3. Diagnóstico Functions

**Functions**: `diagnostico-iniciar`, `diagnostico-resposta`

#### Problemas

**1. Sem Validação JWT (🔴 CRÍTICO)**

```toml
# ❌ PROBLEMA: Sem autenticação
verify_jwt = false
```

**Impacto**: Qualquer pessoa pode iniciar diagnósticos sem estar autenticada.

**Recomendação**:
```toml
# ✅ CORRETO: Exigir autenticação
[[edge_runtime.functions]]
name = "diagnostico-iniciar"
verify_jwt = true  # Apenas usuários autenticados
```

**2. Validação de Input (🟡 MÉDIO)**

Falta validação dos sintomas e respostas do usuário.

---

### 4. Appointment Functions

**Functions**: `schedule-appointment`, `manage-appointment`

#### Análise

**1. JWT Correto** (✅ BOM)

Requer autenticação para agendamentos.

**2. Falta Validação de Disponibilidade** (🟡 MÉDIO)

Não verifica se o horário está realmente disponível (possível double-booking).

**Recomendação**:
```typescript
// ✅ Verificar disponibilidade com transação
const { data: existingAppointment } = await supabase
  .from('appointments')
  .select('id')
  .eq('partner_id', partnerId)
  .eq('appointment_date', date)
  .eq('appointment_time', time)
  .not('status', 'eq', 'cancelled')
  .maybeSingle();

if (existingAppointment) {
  throw new Error('Horário não disponível');
}

// Usar transação para evitar race condition
await supabase.rpc('create_appointment_safe', {
  partner_id: partnerId,
  appointment_date: date,
  appointment_time: time,
  user_id: userId
});
```

---

### 5. Ambassador Functions

**Functions**: `links-generate`, `link-redirect`, `generate-existing-ambassador-links`

#### Análise

**1. link-redirect sem Rate Limit** (🟡 MÉDIO)

Pode ser abusado para inflar métricas de cliques.

**Recomendação**:
```typescript
// Rate limit por IP
// Detectar cliques suspeitos (múltiplos do mesmo IP em curto período)
```

---

## 📋 CHECKLIST DE SEGURANÇA

### Crítico (Fazer AGORA) 🔴

- [ ] **Restringir CORS** em production
  ```typescript
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://institutovalente.org'
  };
  ```

- [ ] **Habilitar JWT** em functions internas
  ```toml
  verify_jwt = true
  ```

- [ ] **Implementar Rate Limiting**
  ```typescript
  // 10 req/min por IP
  ```

- [ ] **Validar Webhooks** com assinatura
  ```typescript
  validateWebhook(signature, body)
  ```

- [ ] **Remover Logs Sensíveis**
  ```typescript
  // Mascarar: email, phone, document, card
  ```

### Alto (Antes do lançamento) 🟡

- [ ] **Validação com Zod** em todas functions
- [ ] **Error Handling** padronizado
- [ ] **Consolidar Functions** (remover v1, debug)
- [ ] **Adicionar Monitoring** (Sentry/similar)
- [ ] **Testes Automatizados**

### Médio (Melhorias) 🟢

- [ ] **Timeout em External APIs**
  ```typescript
  const timeout = 10000; // 10s
  ```

- [ ] **Retry Logic** para APIs externas
- [ ] **Circuit Breaker** para Asaas API
- [ ] **Structured Logging**
- [ ] **Health Check Endpoint**

---

## 🔧 RECOMENDAÇÕES DE REFATORAÇÃO

### 1. Consolidar Process Payment Functions

```bash
# Manter apenas v2
supabase functions deploy process-payment-v2

# Deprecar v1 e debug
# Atualizar frontend para usar v2
# Remover v1 após migração completa
```

### 2. Criar Function Base Comum

```typescript
// supabase/functions/_shared/base.ts
export class EdgeFunction {
  protected supabase: SupabaseClient;
  protected headers: Record<string, string>;

  constructor(req: Request) {
    this.supabase = createClient(/*...*/);
    this.headers = this.getCorsHeaders(req);
  }

  protected getCorsHeaders(req: Request) {
    // CORS restritivo
  }

  protected validateRequest(schema: z.Schema, data: unknown) {
    // Validação padronizada
  }

  protected handleError(error: Error) {
    // Error handling padronizado
  }

  protected checkRateLimit(req: Request) {
    // Rate limiting
  }
}
```

### 3. Implementar Observabilidade

```typescript
// Logging estruturado
const logger = {
  info: (message: string, meta: Record<string, any>) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      meta,
      timestamp: new Date().toISOString(),
      function: Deno.env.get('FUNCTION_NAME')
    }));
  },
  error: (message: string, error: Error, meta?: Record<string, any>) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      meta,
      timestamp: new Date().toISOString(),
      function: Deno.env.get('FUNCTION_NAME')
    }));
  }
};
```

---

## 📊 SCORE DETALHADO

| Aspecto | Score | Comentário |
|---------|-------|------------|
| **Segurança** | 5/10 | CORS aberto, JWT desabilitado |
| **Validação** | 6/10 | Básica, sem schema validation |
| **Error Handling** | 7/10 | Funcional mas pode melhorar |
| **Performance** | 7/10 | OK, mas sem otimizações |
| **Observabilidade** | 5/10 | Logs básicos |
| **Testes** | 2/10 | Sem testes automatizados |
| **Documentação** | 6/10 | Comentários básicos |

**MÉDIA: 6.5/10** ⚠️

---

## 🚀 PLANO DE AÇÃO

### Semana 1 (CRÍTICO)
1. Restringir CORS para produção
2. Habilitar JWT em functions internas
3. Validar webhooks Asaas
4. Remover logs sensíveis
5. Implementar rate limiting básico

### Semana 2 (ALTO)
6. Consolidar functions (remover duplicatas)
7. Adicionar validação Zod
8. Melhorar error handling
9. Adicionar timeout em APIs externas
10. Implementar testes unitários

### Semana 3 (MÉDIO)
11. Monitoring (Sentry)
12. Structured logging
13. Circuit breaker
14. Health checks
15. Documentação de API

---

*Auditoria realizada por: Claude Code - Especialista em Segurança*
*Data: 25/10/2025*
