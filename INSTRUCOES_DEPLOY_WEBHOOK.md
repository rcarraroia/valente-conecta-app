# � INSSTRUÇÕES PARA DEPLOY DO WEBHOOK CORRIGIDO

**Data:** 26/10/2025 (Domingo)  
**Arquivo modificado:** `supabase/functions/asaas-webhook-v2/index.ts`

---

## ✅ CORREÇÕES IMPLEMENTADAS

### 1. Eventos do Asaas Corrigidos

**ANTES (incorreto):**
```typescript
case 'PAYMENT_APPROVED':           // ❌ NÃO EXISTE
case 'PAYMENT_RECEIVED_IN_CASH':   // ❌ NÃO EXISTE
```

**DEPOIS (correto):**
```typescript
case 'PAYMENT_CONFIRMED':                    // ✅ Cobrança confirmada
case 'PAYMENT_RECEIVED':                     // ✅ Cobrança recebida
case 'PAYMENT_APPROVED_BY_RISK_ANALYSIS':    // ✅ Aprovado pela análise de risco
```

### 2. Status Corrigido

**ANTES:**
```typescript
newStatus = 'received';  // ❌ Inconsistente com o banco
```

**DEPOIS:**
```typescript
newStatus = 'completed';  // ✅ Consistente com o banco
```

### 3. Verificação de Recibo Duplicado

Adicionado verificação para evitar gerar recibo duplicado:
```typescript
const { data: existingReceipt } = await supabase
  .from('receipts')
  .select('id, receipt_number')
  .eq('donation_id', updatedDonation.id)
  .maybeSingle();

if (existingReceipt) {
  console.log('ℹ️ Recibo já existe:', existingReceipt.receipt_number);
} else {
  // Gerar recibo
}
```

### 4. Mapeamento Completo de Eventos

Adicionados todos os eventos relevantes do Asaas:
- ✅ `PAYMENT_CONFIRMED` → completed
- ✅ `PAYMENT_RECEIVED` → completed
- ✅ `PAYMENT_APPROVED_BY_RISK_ANALYSIS` → completed
- ✅ `PAYMENT_AUTHORIZED` → pending
- ✅ `PAYMENT_CREATED` → pending
- ✅ `PAYMENT_OVERDUE` → overdue
- ✅ `PAYMENT_DELETED` → cancelled
- ✅ `PAYMENT_REFUNDED` → cancelled
- ✅ `PAYMENT_PARTIALLY_REFUNDED` → cancelled
- ✅ `PAYMENT_AWAITING_RISK_ANALYSIS` → pending
- ✅ `PAYMENT_REPROVED_BY_RISK_ANALYSIS` → cancelled
- ✅ `PAYMENT_CHARGEBACK_REQUESTED` → cancelled
- ✅ `PAYMENT_CHARGEBACK_DISPUTE` → cancelled

---

## 🚀 COMO FAZER O DEPLOY

### Opção 1: Via Dashboard do Supabase (RECOMENDADO)

1. **Acesse o Dashboard:**
   ```
   https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/functions
   ```

2. **Clique em "asaas-webhook-v2"**

3. **Clique em "Deploy new version"**

4. **Cole o conteúdo do arquivo:**
   ```
   supabase/functions/asaas-webhook-v2/index.ts
   ```

5. **Clique em "Deploy"**

6. **Aguarde a confirmação**

### Opção 2: Via CLI (se tiver acesso)

```bash
# Fazer login
supabase login

# Linkar ao projeto
supabase link --project-ref corrklfwxfuqusfzwbls

# Deploy da função
supabase functions deploy asaas-webhook-v2

# Verificar logs
supabase functions logs asaas-webhook-v2 --tail
```

### Opção 3: Via API do Supabase

Se você tiver acesso à API de management do Supabase, pode fazer deploy via API.

---

## 🧪 COMO TESTAR

### Teste 1: Fazer uma Nova Doação

1. Acesse o site e faça uma doação de teste (R$ 5,00 via PIX)
2. Confirme o pagamento
3. Aguarde o webhook ser chamado
4. Verifique se o recibo foi gerado

### Teste 2: Verificar Logs

```bash
# Ver logs do webhook
supabase functions logs asaas-webhook-v2 --tail

# Procurar por:
# - "✅ Pagamento confirmado"
# - "🧾 Gerando recibo automaticamente"
# - "✅ Recibo gerado com sucesso"
```

### Teste 3: Verificar no Banco

```python
from supabase import create_client

supabase = create_client(
    "https://corrklfwxfuqusfzwbls.supabase.co",
    "SERVICE_ROLE_KEY"
)

# Verificar última doação
donations = supabase.table('donations').select('*').order('donated_at', desc=True).limit(1).execute()
print("Última doação:", donations.data)

# Verificar último recibo
receipts = supabase.table('receipts').select('*').order('created_at', desc=True).limit(1).execute()
print("Último recibo:", receipts.data)
```

---

## 📊 GERAR RECIBOS RETROATIVOS

Após fazer o deploy do webhook corrigido, execute o script para gerar recibos das doações antigas:

```bash
python gerar_recibos_retroativos.py
```

**O script irá:**
1. Buscar todas as doações com status "completed" ou "received"
2. Filtrar apenas as que não têm recibo
3. Mostrar a lista de doações
4. Pedir confirmação
5. Gerar recibos e enviar emails

**Doações que receberão recibo:**
- Maria Eduarda Carraro - R$ 15,00 (27/10)
- Beatriz Fatima Almeida Carraro - R$ 15,00 (27/10)
- Renato Magno C Alves - R$ 5,00 (01/10)
- Renato Magno C Alves - R$ 5,00 (01/10)

---

## ✅ CHECKLIST

- [x] Código corrigido com eventos corretos do Asaas
- [x] Status mudado para 'completed'
- [x] Verificação de recibo duplicado adicionada
- [x] Mapeamento completo de eventos
- [x] Script de recibos retroativos criado
- [ ] **Deploy do webhook no Supabase** ⬅️ FAZER AGORA
- [ ] **Executar script de recibos retroativos** ⬅️ FAZER DEPOIS
- [ ] **Testar com nova doação** ⬅️ VALIDAR

---

## 🔍 MONITORAMENTO

Após o deploy, monitore:

1. **Logs do webhook:**
   - Eventos sendo recebidos
   - Status sendo atualizados corretamente
   - Recibos sendo gerados

2. **Tabela donations:**
   - Novas doações com status 'completed'

3. **Tabela receipts:**
   - Recibos sendo criados automaticamente
   - Emails sendo enviados

4. **Emails dos doadores:**
   - Recibos chegando corretamente
   - Template formatado

---

## 📞 SUPORTE

**Se algo der errado:**

1. Verificar logs: `supabase functions logs asaas-webhook-v2`
2. Verificar se função foi deployada: Dashboard > Functions
3. Verificar secrets: `supabase secrets list`
4. Testar função manualmente via curl

**Links úteis:**
- Dashboard: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls
- Functions: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/functions
- Logs: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/logs

---

**Última atualização:** 26/10/2025 23:00  
**Status:** Pronto para deploy
