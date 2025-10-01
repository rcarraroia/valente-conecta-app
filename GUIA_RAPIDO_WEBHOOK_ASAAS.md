# ⚡ GUIA RÁPIDO - CONFIGURAÇÃO WEBHOOK ASAAS

## 🎯 **OBJETIVO**
Configurar webhook do Asaas para atualizar status de doações automaticamente.

---

## 🚀 **PASSO A PASSO (5 MINUTOS)**

### **1. 🧪 TESTAR WEBHOOK (OPCIONAL)**
```bash
node test-asaas-webhook.js
```
**Resultado esperado:** ✅ Todos os testes passaram

### **2. 🔧 CONFIGURAR NO ASAAS**

#### **Acesse:** https://www.asaas.com → **Configurações** → **Webhooks**

#### **Clique:** "Adicionar Webhook"

#### **Preencha:**
```
URL: https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/asaas-webhook
Método: POST
Formato: JSON
```

#### **Selecione Eventos:**
- ✅ PAYMENT_CONFIRMED
- ✅ PAYMENT_RECEIVED  
- ✅ PAYMENT_OVERDUE
- ✅ PAYMENT_DELETED
- ✅ PAYMENT_REFUNDED

#### **Clique:** "Salvar"

### **3. ✅ TESTAR COM DOAÇÃO REAL**

#### **Faça doação teste:**
1. Acesse: `/diagnosis` → `Ajudar` → `Fazer Doação`
2. Valor: R$ 5,00 (mínimo)
3. Use dados de teste do Asaas:
   ```
   Cartão: 5162306219378829
   Vencimento: 05/2028
   CVV: 318
   ```

#### **Verifique:**
1. **Logs do Supabase:** Functions → asaas-webhook → Logs
2. **Banco de dados:** Tabela `donations` → Status atualizado
3. **Tempo:** Webhook deve responder em < 5 segundos

---

## 🔍 **VERIFICAÇÃO RÁPIDA**

### **✅ Webhook Funcionando:**
```
Logs mostram: "✅ Status atualizado: pay_123 → completed"
```

### **❌ Webhook com Problema:**
```
Logs mostram: "❌ Erro ao atualizar status no banco"
```

### **🔧 Solução Rápida:**
1. Verificar se Edge Function está deployada
2. Verificar variáveis de ambiente no Supabase
3. Testar URL manualmente: `curl -X POST [URL]`

---

## 📞 **SUPORTE**

### **Problemas Comuns:**
- **URL não responde:** Edge Function não deployada
- **Status não atualiza:** SUPABASE_SERVICE_ROLE_KEY faltando
- **Erro 500:** Payload inválido ou variáveis faltando

### **Logs Importantes:**
```bash
# Supabase Dashboard:
Functions → asaas-webhook → Logs

# Procurar por:
"🔔 Webhook Asaas recebido"
"✅ Status atualizado"
"❌ Erro ao atualizar"
```

---

**⏱️ Tempo Total:** ~5 minutos  
**🎯 Resultado:** Sistema de doações com status automático  
**📈 Benefício:** Doações atualizadas em tempo real

---

*Guia rápido criado em 30/09/2025*