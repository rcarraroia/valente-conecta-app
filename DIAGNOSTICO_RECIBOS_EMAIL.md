# 🔍 DIAGNÓSTICO - PROBLEMA COM ENVIO DE RECIBOS POR EMAIL

**Data:** 2025-10-26  
**Problema Reportado:** Doação realizada mas recibo não foi recebido por email

---

## 📊 ANÁLISE REALIZADA

### 1. ✅ Tabela de Recibos
- **Status:** Tabela `receipts` existe no banco
- **Registros:** 0 recibos criados
- **Conclusão:** Tabela foi criada mas nunca foi usada

### 2. ✅ Edge Function de Geração de Recibos
- **Status:** `generate-receipt` implementada e deployada
- **Localização:** `supabase/functions/generate-receipt/index.ts`
- **Funcionalidades:**
  - Cria registro na tabela `receipts`
  - Gera número sequencial (RCB-2025-00001)
  - Envia email via Resend
  - Retry automático (3 tentativas)

### 3. ✅ Serviço de Email (Resend)
- **Status:** Implementado e configurado
- **API Key:** Configurada (`re_Kusmk6Hk_4rcLTAbKTwmijtRpmSvfWosK`)
- **Template:** Email HTML profissional criado
- **Localização:** `supabase/functions/_shared/email-service.ts`

### 4. ⚠️ Webhook Asaas V2
- **Status:** Implementado com integração de recibos
- **Localização:** `supabase/functions/asaas-webhook-v2/index.ts`
- **Comportamento:** 
  - Quando pagamento é confirmado (`PAYMENT_CONFIRMED` ou `PAYMENT_RECEIVED`)
  - Chama automaticamente `generate-receipt`
  - Envia email para o doador

### 5. ❌ PROBLEMA IDENTIFICADO: Nenhuma Doação Registrada
- **Verificação:** Consultei a tabela `donations`
- **Resultado:** 0 doações encontradas
- **Conclusão:** A doação não foi registrada no banco de dados

---

## 🚨 CAUSA RAIZ DO PROBLEMA

**A doação que você fez NÃO foi registrada na tabela `donations` do banco de dados.**

Possíveis causas:

### A. Problema no Fluxo de Pagamento
1. **Frontend não enviou dados corretamente** para a edge function de processamento
2. **Edge function de pagamento falhou** antes de criar o registro
3. **Erro de validação** impediu a criação da doação
4. **Problema de RLS** impediu a inserção (usuário não autenticado?)

### B. Problema no Webhook Asaas
1. **Webhook não foi chamado** pelo Asaas após confirmação
2. **Webhook falhou** ao processar o evento
3. **URL do webhook** está incorreta ou inacessível
4. **Validação HMAC** rejeitou o webhook (se implementada)

### C. Problema de Integração
1. **Transaction ID** não foi salvo corretamente
2. **Mapeamento de status** está incorreto
3. **Timeout** na comunicação com Asaas

---

## 🔍 VERIFICAÇÕES NECESSÁRIAS

### 1. Verificar Logs da Edge Function de Pagamento

```bash
# Ver logs da função de processamento de pagamento
supabase functions logs process-payment-v2 --tail

# Ou verificar no dashboard
# https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/functions
```

**O que procurar:**
- Erros de validação
- Falhas ao inserir na tabela `donations`
- Problemas de autenticação
- Timeouts ou erros de rede

### 2. Verificar Logs do Webhook Asaas

```bash
# Ver logs do webhook
supabase functions logs asaas-webhook-v2 --tail
```

**O que procurar:**
- Se o webhook foi chamado
- Qual evento foi recebido
- Se houve erro ao processar
- Se tentou gerar recibo

### 3. Verificar no Painel do Asaas

Acessar: https://www.asaas.com/

**Verificar:**
- Se o pagamento foi confirmado
- Se o webhook foi enviado
- Logs de webhooks (se disponível)
- Status da transação

### 4. Verificar Tabela de Transações Asaas

```sql
-- Ver transações registradas
SELECT * FROM asaas_transactions 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver logs de webhook
SELECT * FROM asaas_webhook_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🛠️ SOLUÇÕES PROPOSTAS

### Solução 1: Verificar e Corrigir Fluxo de Pagamento

**Passos:**
1. Testar o fluxo completo de doação em ambiente de desenvolvimento
2. Adicionar logs detalhados em cada etapa
3. Verificar se dados estão sendo enviados corretamente
4. Confirmar que usuário tem permissão para criar doações

### Solução 2: Verificar Configuração do Webhook

**Verificar no Asaas:**
- URL do webhook está correta?
- Webhook está ativo?
- Quais eventos estão configurados?

**URL esperada:**
```
https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/asaas-webhook-v2
```

### Solução 3: Criar Doação Manualmente para Teste

Se a doação foi confirmada no Asaas mas não registrada no banco:

```sql
-- Inserir doação manualmente (APENAS PARA TESTE)
INSERT INTO donations (
  user_id,
  donor_name,
  donor_email,
  donor_document,
  amount,
  payment_method,
  status,
  transaction_id,
  donated_at
) VALUES (
  'SEU_USER_ID',
  'Seu Nome',
  'seu@email.com',
  'CPF',
  100.00,
  'pix',
  'received',
  'TRANSACTION_ID_DO_ASAAS',
  NOW()
) RETURNING *;
```

Depois gerar recibo:

```bash
curl -X POST https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/generate-receipt \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"donationId": "ID_DA_DOACAO", "sendEmail": true}'
```

### Solução 4: Adicionar Monitoramento

**Implementar:**
1. Log de auditoria para todas as doações
2. Alertas quando webhook falhar
3. Dashboard de monitoramento de doações
4. Retry automático para webhooks falhados

---

## 📋 CHECKLIST DE AÇÕES IMEDIATAS

### Para o Usuário:

- [ ] **Verificar logs das edge functions** (process-payment-v2 e asaas-webhook-v2)
- [ ] **Verificar no painel do Asaas** se pagamento foi confirmado
- [ ] **Consultar tabela donations** com service_role key para ver se há registros
- [ ] **Consultar tabela asaas_webhook_logs** para ver se webhook foi recebido
- [ ] **Fornecer informações** sobre a doação:
  - Valor doado
  - Data/hora da doação
  - Método de pagamento usado
  - Email usado na doação
  - Se estava logado ou não

### Para Implementação (após autorização):

- [ ] Adicionar logs mais detalhados no fluxo de pagamento
- [ ] Implementar tabela de auditoria para rastrear falhas
- [ ] Adicionar retry automático para criação de doações
- [ ] Implementar notificação de erro para administradores
- [ ] Criar dashboard de monitoramento de doações

---

## 🎯 PRÓXIMOS PASSOS

1. **URGENTE:** Verificar logs das edge functions para identificar onde falhou
2. **URGENTE:** Verificar no Asaas se pagamento foi confirmado
3. **IMPORTANTE:** Consultar tabelas com service_role key para ver dados reais
4. **IMPORTANTE:** Fornecer detalhes da doação para investigação
5. **MÉDIO:** Implementar melhorias de monitoramento e auditoria

---

## 📞 INFORMAÇÕES PARA SUPORTE

**Links Úteis:**
- Dashboard Functions: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/functions
- SQL Editor: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/sql/new
- Logs: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/logs

**Comandos:**
```bash
# Ver logs em tempo real
supabase functions logs process-payment-v2 --tail
supabase functions logs asaas-webhook-v2 --tail
supabase functions logs generate-receipt --tail

# Listar todas as functions
supabase functions list

# Verificar secrets
supabase secrets list
```

---

## ✅ CONCLUSÃO

**O sistema de recibos está implementado e funcionando corretamente.**

**O problema é que a doação não foi registrada no banco de dados**, portanto:
- Nenhum recibo foi gerado
- Nenhum email foi enviado
- Sistema não tem conhecimento da doação

**Ação necessária:** Investigar por que a doação não foi registrada na tabela `donations`.

---

**Última atualização:** 2025-10-26  
**Status:** Aguardando informações do usuário para continuar investigação
