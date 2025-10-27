# 📅 ANÁLISE - VENCIMENTO DE COBRANÇAS

**Data:** 2025-10-26  
**Questão:** Por que cobranças com cartão de crédito têm vencimento para o dia seguinte?

---

## 🔍 CÓDIGO ATUAL

### Localização
`supabase/functions/process-payment-v2/index.ts` - Linha 313

### Implementação Atual
```typescript
const paymentPayload: any = {
  customer: customer.id,
  billingType: paymentData.paymentMethod,
  value: paymentData.amount / 100,
  dueDate: new Date().toISOString().split('T')[0],  // ⚠️ SEMPRE DATA ATUAL
  description: 'Doação - Instituto Coração Valente',
  externalReference: `DONATION_${Date.now()}`,
};
```

---

## ⚠️ PROBLEMA IDENTIFICADO

**A data de vencimento está sendo definida como a data ATUAL para TODOS os métodos de pagamento.**

```javascript
dueDate: new Date().toISOString().split('T')[0]
```

Isso significa:
- Se você criar a cobrança no **sábado (26/10)**, o vencimento será **26/10**
- Se você criar no **domingo (27/10)**, o vencimento será **27/10**

---

## 🎯 COMPORTAMENTO ESPERADO

### Segundo a Documentação do Asaas:

**Para Cartão de Crédito:**
- Vencimento pode ser **imediato** (data atual)
- Cobrança é processada instantaneamente
- Não há necessidade de prazo de vencimento

**Para PIX:**
- Vencimento pode ser **imediato** (data atual)
- QR Code expira em 24h por padrão
- Pagamento é instantâneo quando realizado

**Para Boleto:**
- Vencimento deve ser **no mínimo D+1** (dia seguinte)
- Recomendado: D+3 ou mais
- Boletos não podem vencer no mesmo dia

---

## 🐛 IMPACTO DO FIM DE SEMANA

**Cenário Atual (26/10 - Sábado):**

1. **Cartão de Crédito:**
   - Vencimento: 26/10 (hoje)
   - ✅ Funciona normalmente
   - Processamento é imediato

2. **PIX:**
   - Vencimento: 26/10 (hoje)
   - ✅ Funciona normalmente
   - QR Code válido por 24h

3. **Boleto:**
   - Vencimento: 26/10 (hoje)
   - ⚠️ **PROBLEMA:** Boleto não pode vencer no mesmo dia
   - ⚠️ **PROBLEMA:** Bancos não processam no fim de semana
   - Asaas pode automaticamente ajustar para próximo dia útil

---

## ✅ SOLUÇÃO RECOMENDADA

### Opção 1: Vencimento Diferenciado por Método (RECOMENDADO)

```typescript
// Calcular data de vencimento baseado no método de pagamento
let dueDate: string;
const today = new Date();

switch (paymentData.paymentMethod) {
  case 'CREDIT_CARD':
  case 'PIX':
    // Cartão e PIX: vencimento imediato (hoje)
    dueDate = today.toISOString().split('T')[0];
    break;
    
  case 'BOLETO':
    // Boleto: vencimento em 3 dias úteis
    const dueDateBoleto = new Date(today);
    dueDateBoleto.setDate(today.getDate() + 3);
    dueDate = dueDateBoleto.toISOString().split('T')[0];
    break;
    
  default:
    dueDate = today.toISOString().split('T')[0];
}

const paymentPayload: any = {
  customer: customer.id,
  billingType: paymentData.paymentMethod,
  value: paymentData.amount / 100,
  dueDate: dueDate,
  description: 'Doação - Instituto Coração Valente',
  externalReference: `DONATION_${Date.now()}`,
};
```

### Opção 2: Vencimento Sempre D+1 (Mais Simples)

```typescript
// Vencimento sempre para o dia seguinte
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const dueDate = tomorrow.toISOString().split('T')[0];

const paymentPayload: any = {
  customer: customer.id,
  billingType: paymentData.paymentMethod,
  value: paymentData.amount / 100,
  dueDate: dueDate,
  description: 'Doação - Instituto Coração Valente',
  externalReference: `DONATION_${Date.now()}`,
};
```

### Opção 3: Vencimento Configurável (Mais Flexível)

```typescript
// Permitir configurar vencimento via parâmetro
const daysToAdd = paymentData.daysUntilDue || 0; // Default: hoje
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + daysToAdd);

const paymentPayload: any = {
  customer: customer.id,
  billingType: paymentData.paymentMethod,
  value: paymentData.amount / 100,
  dueDate: dueDate.toISOString().split('T')[0],
  description: 'Doação - Instituto Coração Valente',
  externalReference: `DONATION_${Date.now()}`,
};
```

---

## 📊 COMPARAÇÃO DAS OPÇÕES

| Opção | Vantagens | Desvantagens | Recomendação |
|-------|-----------|--------------|--------------|
| **Opção 1** | Otimizado por método, melhor UX | Mais código | ⭐⭐⭐⭐⭐ |
| **Opção 2** | Simples, funciona para todos | Cartão/PIX não são imediatos | ⭐⭐⭐ |
| **Opção 3** | Máxima flexibilidade | Mais complexo, requer mudança no frontend | ⭐⭐⭐⭐ |

---

## 🎯 RECOMENDAÇÃO FINAL

**Implementar Opção 1** - Vencimento diferenciado por método:

### Benefícios:
1. ✅ **Cartão de Crédito:** Processamento imediato (melhor UX)
2. ✅ **PIX:** QR Code válido imediatamente
3. ✅ **Boleto:** Vencimento adequado (D+3)
4. ✅ **Fim de semana:** Não afeta cartão/PIX
5. ✅ **Conformidade:** Segue boas práticas do Asaas

### Implementação:
```typescript
// Adicionar função auxiliar
function calculateDueDate(paymentMethod: string): string {
  const today = new Date();
  
  switch (paymentMethod) {
    case 'CREDIT_CARD':
    case 'PIX':
      // Imediato
      return today.toISOString().split('T')[0];
      
    case 'BOLETO':
      // D+3 (3 dias úteis)
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + 3);
      return dueDate.toISOString().split('T')[0];
      
    default:
      return today.toISOString().split('T')[0];
  }
}

// Usar na criação do pagamento
const paymentPayload: any = {
  customer: customer.id,
  billingType: paymentData.paymentMethod,
  value: paymentData.amount / 100,
  dueDate: calculateDueDate(paymentData.paymentMethod),
  description: 'Doação - Instituto Coração Valente',
  externalReference: `DONATION_${Date.now()}`,
};
```

---

## 🔄 MESMA LÓGICA PARA ASSINATURAS

Aplicar a mesma lógica na função `createSubscription`:

```typescript
async function createSubscription(...) {
  const subscriptionPayload: any = {
    customer: customer.id,
    billingType: paymentData.paymentMethod,
    value: paymentData.amount / 100,
    cycle: paymentData.frequency === 'monthly' ? 'MONTHLY' : 'YEARLY',
    description: `Apoio ${paymentData.frequency === 'monthly' ? 'Mensal' : 'Anual'} - Instituto Coração Valente`,
    nextDueDate: calculateDueDate(paymentData.paymentMethod), // ⬅️ USAR FUNÇÃO
    externalReference: `SUBSCRIPTION_${Date.now()}`,
  };
  // ...
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar função `calculateDueDate()`
- [ ] Atualizar `createDonation()` para usar a função
- [ ] Atualizar `createSubscription()` para usar a função
- [ ] Testar com cada método de pagamento
- [ ] Testar em fim de semana
- [ ] Verificar comportamento no Asaas
- [ ] Documentar mudança

---

## 🧪 TESTES RECOMENDADOS

### Teste 1: Cartão de Crédito
- Criar doação no sábado
- Verificar vencimento = data atual
- Confirmar processamento imediato

### Teste 2: PIX
- Criar doação no domingo
- Verificar vencimento = data atual
- Confirmar QR Code válido

### Teste 3: Boleto
- Criar doação no sábado
- Verificar vencimento = terça-feira (D+3)
- Confirmar boleto gerado corretamente

---

## 📞 RESPOSTA À PERGUNTA

**"Tem alguma regra para colocar o vencimento das cobranças com cartão de crédito para dia seguinte ou isso é por causa do fim de semana?"**

**Resposta:**

❌ **NÃO há regra específica no código atual.**

O código está usando **sempre a data atual** para todos os métodos de pagamento:
```typescript
dueDate: new Date().toISOString().split('T')[0]
```

✅ **O que DEVERIA ter:**
- **Cartão/PIX:** Vencimento imediato (data atual) ✅
- **Boleto:** Vencimento D+3 (3 dias úteis) ⚠️

🎯 **Recomendação:**
Implementar a **Opção 1** para otimizar a experiência do usuário e seguir as boas práticas do Asaas.

---

**Última atualização:** 2025-10-26  
**Status:** Aguardando autorização para implementar melhorias
