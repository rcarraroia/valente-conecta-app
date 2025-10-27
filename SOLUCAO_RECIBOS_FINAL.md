# 🎯 SOLUÇÃO FINAL - PROBLEMA COM RECIBOS

**Data:** 26/10/2025 (Domingo, 22:45)  
**Investigação:** Completa com service_role key

---

## ✅ DESCOBERTAS DA INVESTIGAÇÃO

### 1. Doações Existem no Banco
- **Total:** 14 doações registradas
- **Confirmadas:** 4 doações com status "completed"
- **Hoje (27/10 madrugada):** 2 doações confirmadas
  - Maria Eduarda Carraro - R$ 15,00
  - Beatriz Fatima Almeida Carraro - R$ 15,00

### 2. Webhook Está Funcionando
- ✅ Status 200 confirmado
- ✅ Eventos sendo recebidos
- ✅ Doações sendo atualizadas

### 3. Recibos NÃO Estão Sendo Gerados
- ❌ **0 recibos** na tabela `receipts`
- ❌ Nenhuma das 4 doações confirmadas tem recibo
- ❌ Emails não foram enviados

---

## 🐛 CAUSA RAIZ IDENTIFICADA

### Problema 1: Mapeamento de Status Incorreto

**No webhook (`asaas-webhook-v2/index.ts` linha 65-67):**
```typescript
case 'PAYMENT_CONFIRMED':
case 'PAYMENT_RECEIVED':
  newStatus = 'received';  // ⬅️ Define como 'received'
  shouldNotify = true;
```

**Mas no banco, as doações estão com status:**
```
'completed'  // ⬅️ Não é 'received'!
```

**Resultado:**
- Webhook atualiza para `'received'` ✅
- Mas algum outro processo está mudando para `'completed'` ❌
- Ou o Asaas está enviando um evento diferente ❌

### Problema 2: Condição de Geração de Recibo

**O recibo só é gerado se (`linha 105`):**
```typescript
if (shouldNotify && updatedDonation) {
  // Gerar recibo
}
```

**Mas `shouldNotify` só é `true` para:**
- `PAYMENT_CONFIRMED`
- `PAYMENT_RECEIVED`

**Se o Asaas enviar outro evento (ex: `PAYMENT_COMPLETED`), o recibo não é gerado!**

---

## 🔍 VERIFICAÇÃO NECESSÁRIA

### Qual evento o Asaas está enviando?

Precisamos verificar os logs do webhook para ver qual evento está sendo recebido quando o pagamento é confirmado.

**Opções possíveis:**
1. `PAYMENT_CONFIRMED` ✅ (esperado)
2. `PAYMENT_RECEIVED` ✅ (esperado)
3. `PAYMENT_COMPLETED` ❓ (não tratado)
4. `PAYMENT_APPROVED` ❓ (não tratado)

---

## 🛠️ SOLUÇÕES PROPOSTAS

### Solução 1: Adicionar Mais Eventos (RECOMENDADO)

**Atualizar `asaas-webhook-v2/index.ts`:**

```typescript
switch (event) {
  case 'PAYMENT_CONFIRMED':
  case 'PAYMENT_RECEIVED':
  case 'PAYMENT_APPROVED':      // ⬅️ ADICIONAR
  case 'PAYMENT_RECEIVED_IN_CASH':  // ⬅️ ADICIONAR
    newStatus = 'completed';     // ⬅️ MUDAR PARA 'completed'
    shouldNotify = true;
    console.log('✅ Pagamento confirmado - preparando notificação');
    break;
    
  case 'PAYMENT_OVERDUE':
    newStatus = 'overdue';
    break;
    
  case 'PAYMENT_DELETED':
  case 'PAYMENT_REFUNDED':
    newStatus = 'cancelled';
    break;
    
  default:
    console.log('📋 Evento não requer atualização de status:', event);
    // ⬅️ ADICIONAR LOG DO EVENTO DESCONHECIDO
    console.warn('⚠️ Evento desconhecido:', event);
}
```

### Solução 2: Gerar Recibos para Doações Existentes

**Criar script para gerar recibos retroativos:**

```typescript
// Script: gerar-recibos-retroativos.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Buscar doações confirmadas sem recibo
const { data: donations } = await supabase
  .from('donations')
  .select('*')
  .in('status', ['completed', 'received'])
  .execute();

for (const donation of donations || []) {
  // Verificar se já tem recibo
  const { data: existingReceipt } = await supabase
    .from('receipts')
    .select('id')
    .eq('donation_id', donation.id)
    .maybeSingle();
  
  if (!existingReceipt) {
    console.log(`Gerando recibo para doação ${donation.id}...`);
    
    // Chamar função de geração de recibo
    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-receipt`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          donationId: donation.id,
          sendEmail: true
        })
      }
    );
    
    if (response.ok) {
      console.log(`✅ Recibo gerado para ${donation.donor_name}`);
    } else {
      console.error(`❌ Erro ao gerar recibo para ${donation.id}`);
    }
  }
}
```

### Solução 3: Adicionar Fallback para Status 'completed'

**Atualizar webhook para também processar doações com status 'completed':**

```typescript
// Após atualizar a doação, verificar se precisa gerar recibo
if (updatedDonation && (updatedDonation.status === 'completed' || updatedDonation.status === 'received')) {
  // Verificar se já tem recibo
  const { data: existingReceipt } = await supabase
    .from('receipts')
    .select('id')
    .eq('donation_id', updatedDonation.id)
    .maybeSingle();
  
  if (!existingReceipt) {
    console.log('🧾 Gerando recibo automaticamente...');
    // Chamar função de geração de recibo
    // ...
  } else {
    console.log('ℹ️ Recibo já existe para esta doação');
  }
}
```

---

## 📋 PLANO DE AÇÃO IMEDIATO

### Passo 1: Verificar Logs do Webhook (URGENTE)

```bash
# Ver logs do webhook
supabase functions logs asaas-webhook-v2 --tail

# Ou no dashboard
# https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/functions
```

**Procurar por:**
- Qual evento está sendo recebido (`event: 'PAYMENT_...'`)
- Se `shouldNotify` está sendo ativado
- Se está tentando gerar recibo
- Erros ao chamar `generate-receipt`

### Passo 2: Gerar Recibos Retroativos (URGENTE)

**Para as 4 doações confirmadas que não têm recibo:**

```python
# Script Python para gerar recibos
import requests

SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# IDs das doações confirmadas sem recibo
donation_ids = [
    '339a852b-48cf-4936-a281-167102dd37c3',  # Maria Eduarda - R$ 15
    '1b5b3584-902f-482d-b586-1e6de7cc3ff1',  # Beatriz - R$ 15
    '9916da4c-e56e-4666-8b33-a0229283a34a',  # Renato - R$ 5
    '9c5faa37-32b0-49d6-9e7e-dab33bc76d0f',  # Renato - R$ 5
]

for donation_id in donation_ids:
    print(f"Gerando recibo para {donation_id}...")
    
    response = requests.post(
        f"{SUPABASE_URL}/functions/v1/generate-receipt",
        headers={
            'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'donationId': donation_id,
            'sendEmail': True
        }
    )
    
    if response.ok:
        data = response.json()
        print(f"✅ Recibo gerado: {data.get('receipt', {}).get('receipt_number')}")
    else:
        print(f"❌ Erro: {response.text}")
```

### Passo 3: Corrigir Webhook (IMPORTANTE)

**Atualizar `asaas-webhook-v2/index.ts`:**

1. Adicionar mais eventos na condição
2. Mudar status para `'completed'` em vez de `'received'`
3. Adicionar log de eventos desconhecidos
4. Adicionar verificação de recibo existente

### Passo 4: Testar (IMPORTANTE)

1. Fazer uma nova doação de teste
2. Verificar logs do webhook
3. Confirmar que recibo foi gerado
4. Verificar se email foi enviado

---

## 🎯 RESPOSTA FINAL

### Por que os recibos não foram enviados?

**Causa:** O webhook está funcionando, mas:
1. Pode estar recebendo um evento diferente do esperado
2. Ou o status está sendo atualizado para `'completed'` em vez de `'received'`
3. Resultado: condição `shouldNotify` não é ativada
4. Recibo não é gerado
5. Email não é enviado

### O que fazer agora?

**URGENTE (aguardando sua autorização):**
1. ✅ Gerar recibos retroativos para as 4 doações confirmadas
2. ✅ Enviar emails com os recibos
3. ✅ Corrigir webhook para aceitar mais eventos
4. ✅ Testar com nova doação

**Posso executar o script de geração retroativa de recibos?**

---

**Última atualização:** 26/10/2025 22:45  
**Status:** Aguardando autorização para gerar recibos retroativos
