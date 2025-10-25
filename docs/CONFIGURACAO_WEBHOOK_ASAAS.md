# 🔗 CONFIGURAÇÃO DO WEBHOOK ASAAS
## Instituto Coração Valente - Sistema de Doações

**Data:** 30/09/2025  
**Objetivo:** Configurar webhook para atualização automática de status de pagamentos  

---

## 🎯 VISÃO GERAL

O webhook do Asaas permite que o sistema receba notificações automáticas sobre mudanças no status dos pagamentos (doações), mantendo o banco de dados sempre atualizado.

---

## 📋 PRÉ-REQUISITOS

### ✅ **VERIFICAÇÕES NECESSÁRIAS:**
1. **Edge Function deployada** - `asaas-webhook`
2. **ASAAS_API_KEY configurada** no Supabase
3. **Conta Asaas ativa** com acesso ao painel
4. **Domínio público** para receber webhooks

---

## 🔧 PASSO 1: VERIFICAR EDGE FUNCTION

### **URL da Edge Function:**
```
https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/asaas-webhook
```

### **Testar se está funcionando:**
```bash
curl -X POST https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/asaas-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Resposta esperada:**
```json
{"received": true}
```

---

## 🔧 PASSO 2: CONFIGURAR NO PAINEL ASAAS

### **1. Acessar Configurações:**
1. Entre no painel do Asaas: https://www.asaas.com
2. Vá em **Configurações** → **Webhooks**
3. Clique em **"Adicionar Webhook"**

### **2. Configurar Webhook:**

#### **📝 DADOS PARA PREENCHIMENTO:**

**URL do Webhook:**
```
https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/asaas-webhook
```

**Eventos para Monitorar:**
- ✅ `PAYMENT_CONFIRMED` - Pagamento confirmado
- ✅ `PAYMENT_RECEIVED` - Pagamento recebido
- ✅ `PAYMENT_OVERDUE` - Pagamento vencido
- ✅ `PAYMENT_DELETED` - Pagamento cancelado
- ✅ `PAYMENT_REFUNDED` - Pagamento estornado

**Método HTTP:**
```
POST
```

**Formato:**
```
JSON
```

**Autenticação:**
```
Nenhuma (a Edge Function é pública)
```

### **3. Configuração Avançada:**

#### **Headers Personalizados (Opcional):**
```
Content-Type: application/json
User-Agent: Asaas-Webhook/1.0
```

#### **Timeout:**
```
30 segundos
```

#### **Tentativas:**
```
3 tentativas com intervalo de 5 minutos
```

---

## 🔧 PASSO 3: TESTAR WEBHOOK

### **1. Fazer Doação Teste:**
1. Acesse o sistema: `/diagnosis` → `Ajudar` → `Fazer Doação`
2. Faça uma doação de **R$ 15,00** (valor mínimo)
3. Use dados de teste do Asaas

### **2. Dados de Teste Asaas:**

#### **Cartão de Crédito (Aprovado):**
```
Número: 5162306219378829
Vencimento: 05/2028
CVV: 318
Nome: João da Silva
```

#### **PIX (Aprovado Automaticamente):**
- Qualquer valor acima de R$ 5,00
- Status muda automaticamente após alguns minutos

### **3. Verificar Logs:**
```bash
# No Supabase Dashboard:
# Functions → asaas-webhook → Logs
```

**Logs esperados:**
```
Webhook recebido: {event: "PAYMENT_CONFIRMED", payment: {...}}
Status atualizado para completed no pagamento pay_123456789
```

---

## 📊 EVENTOS DO WEBHOOK

### **Mapeamento de Status:**

| Evento Asaas | Status no Sistema | Descrição |
|--------------|-------------------|-----------|
| `PAYMENT_CONFIRMED` | `completed` | Pagamento confirmado |
| `PAYMENT_RECEIVED` | `completed` | Pagamento recebido |
| `PAYMENT_OVERDUE` | `overdue` | Pagamento vencido |
| `PAYMENT_DELETED` | `cancelled` | Pagamento cancelado |
| `PAYMENT_REFUNDED` | `cancelled` | Pagamento estornado |

### **Estrutura do Payload:**
```json
{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pay_123456789",
    "value": 50.00,
    "status": "CONFIRMED",
    "customer": "cus_123456789",
    "dueDate": "2025-09-30",
    "description": "Doação - Instituto Coração Valente"
  }
}
```

---

## 🔍 TROUBLESHOOTING

### **❌ Problema: Webhook não recebe dados**

#### **Verificações:**
1. **URL correta?**
   ```bash
   curl -I https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/asaas-webhook
   ```

2. **Edge Function ativa?**
   - Verificar no Supabase Dashboard
   - Functions → asaas-webhook → Status

3. **Configuração no Asaas correta?**
   - URL exata
   - Eventos selecionados
   - Método POST

#### **Soluções:**
```bash
# 1. Redeployar Edge Function
supabase functions deploy asaas-webhook

# 2. Verificar logs
supabase functions logs asaas-webhook

# 3. Testar manualmente
curl -X POST [URL_WEBHOOK] -H "Content-Type: application/json" -d '{"test":true}'
```

### **❌ Problema: Status não atualiza no banco**

#### **Verificações:**
1. **SUPABASE_SERVICE_ROLE_KEY configurada?**
2. **Tabela donations existe?**
3. **Campo transaction_id correto?**

#### **Soluções:**
```sql
-- Verificar se doação existe
SELECT * FROM donations WHERE transaction_id = 'pay_123456789';

-- Verificar logs da Edge Function
-- Supabase Dashboard → Functions → asaas-webhook → Logs
```

### **❌ Problema: Erro 500 no webhook**

#### **Verificações:**
1. **Variáveis de ambiente configuradas?**
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Payload válido?**
   - JSON bem formado
   - Campos obrigatórios presentes

#### **Soluções:**
```typescript
// Adicionar mais logs na Edge Function
console.log('Payload recebido:', JSON.stringify(webhookData, null, 2));
console.log('Event:', event);
console.log('Payment ID:', payment?.id);
```

---

## 🔐 SEGURANÇA

### **Validação de Origem (Recomendado):**

#### **1. IP Whitelist:**
IPs do Asaas para webhook:
```
177.54.144.0/20
191.235.112.0/20
```

#### **2. Assinatura do Webhook:**
```typescript
// Adicionar na Edge Function (opcional)
const signature = req.headers.get('asaas-signature');
const expectedSignature = generateSignature(body, secret);

if (signature !== expectedSignature) {
  return new Response('Unauthorized', { status: 401 });
}
```

### **3. Rate Limiting:**
```typescript
// Implementar rate limiting básico
const rateLimitKey = `webhook_${clientIP}`;
// Máximo 100 requests por minuto
```

---

## 📈 MONITORAMENTO

### **Métricas Importantes:**
- ✅ Taxa de sucesso do webhook (> 95%)
- ✅ Tempo de resposta (< 5 segundos)
- ✅ Atualizações de status corretas
- ✅ Logs sem erros críticos

### **Alertas Configurar:**
- 🚨 Webhook falhando > 5 vezes seguidas
- 🚨 Tempo de resposta > 10 segundos
- 🚨 Status não atualizado em 1 hora

### **Dashboard Supabase:**
```
Functions → asaas-webhook → Metrics
- Invocations
- Errors
- Duration
- Success Rate
```

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

### **Pré-Deploy:**
- [ ] Edge Function `asaas-webhook` deployada
- [ ] Variáveis de ambiente configuradas
- [ ] Tabela `donations` criada
- [ ] Teste local funcionando

### **Configuração Asaas:**
- [ ] Webhook criado no painel Asaas
- [ ] URL correta configurada
- [ ] Eventos selecionados
- [ ] Método POST configurado
- [ ] Teste de conectividade OK

### **Pós-Deploy:**
- [ ] Doação teste realizada
- [ ] Status atualizado no banco
- [ ] Logs sem erros
- [ ] Webhook respondendo em < 5s

### **Monitoramento:**
- [ ] Métricas configuradas
- [ ] Alertas ativos
- [ ] Dashboard funcionando
- [ ] Documentação atualizada

---

## 🎯 PRÓXIMOS PASSOS

### **Melhorias Futuras:**
1. **Webhook de Assinaturas** - Para mantenedores mensais
2. **Notificações por Email** - Confirmar doações
3. **Dashboard de Métricas** - Acompanhar performance
4. **Retry Automático** - Para falhas temporárias

### **Integrações Adicionais:**
1. **Split de Pagamentos** - Comissões automáticas
2. **Relatórios Financeiros** - Dashboards em tempo real
3. **Compliance** - Logs para auditoria
4. **Analytics** - Métricas de conversão

---

**Status:** 🟡 **CONFIGURAÇÃO PENDENTE**  
**Prioridade:** 🔴 **ALTA** (necessário para sistema de doações)  
**Tempo Estimado:** 30 minutos  

---

*Guia criado em 30/09/2025 - Sistema de Doações Instituto Coração Valente*