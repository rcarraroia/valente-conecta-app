# 📋 RELATÓRIO FINAL - PROBLEMA COM RECIBOS

**Data:** 2025-10-26  
**Problema:** Doação realizada mas recibo não foi recebido por email

---

## ✅ VERIFICAÇÕES REALIZADAS

### 1. Sistema de Recibos
- ✅ Tabela `receipts` existe e está configurada
- ✅ Edge function `generate-receipt` implementada e deployada
- ✅ Serviço de email (Resend) configurado com API key válida
- ✅ Webhook Asaas V2 implementado com geração automática de recibos
- ✅ Templates de email criados

### 2. Webhook Asaas
- ✅ Webhook está funcionando (status 200 confirmado)
- ✅ Eventos estão sendo recebidos corretamente
- ✅ URL configurada: `https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/asaas-webhook-v2`

### 3. Banco de Dados
- ❌ **0 doações** registradas na tabela `donations`
- ❌ **0 recibos** gerados na tabela `receipts`
- ❌ Tabela `asaas_webhook_logs` não existe

---

## 🚨 CAUSA RAIZ IDENTIFICADA

**A doação NÃO foi registrada na tabela `donations` do banco de dados.**

### Por que isso aconteceu?

Analisando o código da edge function `process-payment-v2`, linha 356-365:

```typescript
// Salvar no banco
console.log('8. Salvando no banco...');
const { error: dbError } = await supabase.from('donations').insert({
  amount: paymentData.amount / 100,
  donor_name: paymentData.donor.name,
  donor_email: paymentData.donor.email,
  payment_method: paymentData.paymentMethod,
  transaction_id: result.id,
  status: 'pending',
  ambassador_link_id: ambassadorLinkId,
  currency: 'BRL'
});

if (dbError) {
  console.warn('Erro ao salvar no banco:', dbError);  // ⚠️ APENAS WARNING!
}
```

### ⚠️ PROBLEMA CRÍTICO:

**O código apenas registra um WARNING se falhar ao salvar no banco, mas NÃO interrompe o processo!**

Isso significa:
1. Pagamento é criado no Asaas ✅
2. Erro ao salvar no banco ❌
3. Função retorna sucesso para o usuário ✅
4. Webhook é recebido ✅
5. Webhook tenta gerar recibo ❌ (não encontra doação)
6. Recibo não é gerado ❌
7. Email não é enviado ❌

---

## 🔍 POSSÍVEIS CAUSAS DO ERRO AO SALVAR

### 1. Problema de RLS (Row Level Security)
- Edge function usa `SUPABASE_SERVICE_ROLE_KEY` (bypass RLS) ✅
- Mas pode haver problema na política de INSERT

### 2. Problema de Schema
- Campos obrigatórios faltando
- Tipos de dados incompatíveis
- Constraints violadas

### 3. Problema de Permissões
- Service role sem permissão de INSERT
- Tabela com permissões restritivas

### 4. Problema de Dados
- `user_id` não está sendo enviado (pode ser obrigatório)
- `donated_at` não está sendo definido (pode ser obrigatório)

---

## 🛠️ SOLUÇÕES PROPOSTAS

### Solução 1: Corrigir Tratamento de Erro (URGENTE)

**Problema atual:**
```typescript
if (dbError) {
  console.warn('Erro ao salvar no banco:', dbError);  // ⚠️ Apenas warning
}
```

**Correção:**
```typescript
if (dbError) {
  console.error('❌ ERRO CRÍTICO ao salvar no banco:', dbError);
  throw new Error(`Falha ao registrar doação: ${dbError.message}`);
}
```

### Solução 2: Adicionar Campos Obrigatórios

**Problema:** Campos `user_id` e `donated_at` podem ser obrigatórios

**Correção:**
```typescript
const { error: dbError } = await supabase.from('donations').insert({
  amount: paymentData.amount / 100,
  donor_name: paymentData.donor.name,
  donor_email: paymentData.donor.email,
  donor_phone: paymentData.donor.phone,
  donor_document: paymentData.donor.document,
  payment_method: paymentData.paymentMethod,
  transaction_id: result.id,
  status: 'pending',
  ambassador_link_id: ambassadorLinkId,
  currency: 'BRL',
  user_id: null,  // ⬅️ Adicionar explicitamente
  donated_at: new Date().toISOString()  // ⬅️ Adicionar timestamp
});
```

### Solução 3: Verificar Schema da Tabela

**Executar no SQL Editor:**
```sql
-- Ver estrutura da tabela donations
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'donations'
ORDER BY ordinal_position;

-- Ver constraints
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  col.attname AS column_name
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_attribute col ON col.attrelid = rel.oid AND col.attnum = ANY(con.conkey)
WHERE rel.relname = 'donations';
```

### Solução 4: Criar Tabela de Log de Erros

**Para rastrear falhas:**
```sql
CREATE TABLE IF NOT EXISTS payment_processing_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_data JSONB,
  error_message TEXT,
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**No código:**
```typescript
if (dbError) {
  // Registrar erro
  await supabase.from('payment_processing_errors').insert({
    payment_data: paymentData,
    error_message: dbError.message,
    error_details: dbError
  });
  
  throw new Error(`Falha ao registrar doação: ${dbError.message}`);
}
```

---

## 📋 PLANO DE AÇÃO IMEDIATO

### Passo 1: Verificar Schema da Tabela Donations
```sql
-- Executar no SQL Editor
\d donations
```

### Passo 2: Verificar Logs da Edge Function
```bash
# Ver logs da função de processamento
supabase functions logs process-payment-v2 --tail
```

**Procurar por:**
- "Erro ao salvar no banco"
- Mensagens de erro relacionadas a INSERT
- Stack traces

### Passo 3: Testar Inserção Manual
```sql
-- Testar INSERT na tabela donations
INSERT INTO donations (
  amount,
  donor_name,
  donor_email,
  payment_method,
  transaction_id,
  status,
  currency,
  donated_at
) VALUES (
  100.00,
  'Teste',
  'teste@email.com',
  'PIX',
  'test_' || gen_random_uuid(),
  'pending',
  'BRL',
  NOW()
) RETURNING *;
```

Se falhar, o erro mostrará qual campo está causando problema.

### Passo 4: Corrigir Edge Function

Após identificar o problema, atualizar `process-payment-v2/index.ts`:

1. Adicionar campos obrigatórios
2. Mudar `console.warn` para `throw new Error`
3. Adicionar log de auditoria
4. Testar novamente

---

## 🎯 SOBRE A PERGUNTA DO VENCIMENTO

**Pergunta:** "Tem alguma regra para colocar o vencimento das cobranças com cartão de crédito para dia seguinte?"

**Resposta:** Criei análise completa em `ANALISE_VENCIMENTO_COBRANÇAS.md`

**Resumo:**
- ❌ Não há regra específica no código
- ⚠️ Código usa sempre data atual para todos os métodos
- ✅ Recomendo implementar vencimento diferenciado:
  - **Cartão/PIX:** Imediato (data atual)
  - **Boleto:** D+3 (3 dias úteis)

---

## 📊 STATUS ATUAL

| Componente | Status | Observação |
|------------|--------|------------|
| Tabela receipts | ✅ OK | Criada e configurada |
| Edge function generate-receipt | ✅ OK | Deployada |
| Serviço de email | ✅ OK | Resend configurado |
| Webhook Asaas | ✅ OK | Funcionando (200) |
| Tabela donations | ❌ VAZIA | Nenhum registro |
| Geração de recibos | ❌ NÃO FUNCIONA | Sem doações para processar |
| Envio de emails | ❌ NÃO FUNCIONA | Sem recibos para enviar |

---

## ✅ PRÓXIMOS PASSOS (AGUARDANDO AUTORIZAÇÃO)

1. **URGENTE:** Verificar logs da edge function `process-payment-v2`
2. **URGENTE:** Verificar schema da tabela `donations`
3. **URGENTE:** Corrigir tratamento de erro na edge function
4. **IMPORTANTE:** Adicionar campos obrigatórios no INSERT
5. **IMPORTANTE:** Criar tabela de log de erros
6. **MÉDIO:** Implementar vencimento diferenciado por método
7. **MÉDIO:** Criar tabela `asaas_webhook_logs` para auditoria

---

## 📞 INFORMAÇÕES NECESSÁRIAS DO USUÁRIO

Para continuar a investigação, preciso que você:

1. **Acesse o Dashboard do Supabase:**
   - Functions: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/functions
   - Clique em `process-payment-v2`
   - Veja os logs recentes
   - Procure por erros relacionados a "Erro ao salvar no banco"

2. **Forneça informações da doação:**
   - Horário aproximado que fez a doação
   - Valor doado
   - Método de pagamento usado
   - Se estava logado ou não

3. **Verifique no Asaas:**
   - Se o pagamento foi criado
   - Qual o ID da transação
   - Status do pagamento

---

**Última atualização:** 2025-10-26  
**Status:** Aguardando logs e autorização para implementar correções
