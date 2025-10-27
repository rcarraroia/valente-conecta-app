# 🔑 ATUALIZAR RESEND API KEY NO SUPABASE

**Data:** 27/10/2025  
**Status:** URGENTE - Fazer agora

---

## 🎉 DOMÍNIO VERIFICADO!

✅ Domínio `coracaovalente.org.br` verificado no Resend  
✅ Todos os registros DNS configurados  
✅ Pronto para enviar emails

---

## 🔐 NOVA API KEY DO RESEND

```
re_eNfrBTqu_L6MbSJ3yxQNAr2f4MWqhGWbG
```

---

## 📧 NOVO EMAIL REMETENTE

**Remetente:** `Instituto Coração Valente <no-reply@coracaovalente.org.br>`  
**Reply-To:** `contato@coracaovalente.org.br`

---

## 🚀 COMO ATUALIZAR NO SUPABASE

### Opção 1: Via Dashboard (RECOMENDADO)

1. **Acessar Settings:**
   ```
   https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/settings/vault
   ```

2. **Ir em "Secrets" ou "Environment Variables"**

3. **Atualizar ou criar:**
   - Nome: `RESEND_API_KEY`
   - Valor: `re_eNfrBTqu_L6MbSJ3yxQNAr2f4MWqhGWbG`

4. **Salvar**

### Opção 2: Via CLI

```bash
# Fazer login
supabase login

# Linkar ao projeto
supabase link --project-ref corrklfwxfuqusfzwbls

# Atualizar secret
supabase secrets set RESEND_API_KEY=re_eNfrBTqu_L6MbSJ3yxQNAr2f4MWqhGWbG

# Verificar
supabase secrets list
```

---

## 📋 DEPLOY DAS EDGE FUNCTIONS

Após atualizar a API Key, fazer deploy das funções:

### 1. Deploy generate-receipt

**Via Dashboard:**
1. Acessar: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/functions
2. Clicar em "generate-receipt"
3. Deploy new version
4. Colar código atualizado de `supabase/functions/generate-receipt/index.ts`
5. Deploy

**Via CLI:**
```bash
supabase functions deploy generate-receipt
```

### 2. Deploy asaas-webhook-v2

**Via Dashboard:**
1. Clicar em "asaas-webhook-v2"
2. Deploy new version
3. Colar código atualizado de `supabase/functions/asaas-webhook-v2/index.ts`
4. Deploy

**Via CLI:**
```bash
supabase functions deploy asaas-webhook-v2
```

---

## ✅ VERIFICAR SE FUNCIONOU

### Teste 1: Reenviar Emails dos Recibos

```bash
python reenviar_emails_recibos.py
```

**Deve mostrar:**
- ✅ Emails enviados com sucesso
- ✅ Remetente: `no-reply@coracaovalente.org.br`

### Teste 2: Verificar Logs

```bash
supabase functions logs generate-receipt --tail
```

**Procurar por:**
```
📧 Enviando email: {..., from: "Instituto Coração Valente <no-reply@coracaovalente.org.br>"}
✅ Email enviado com sucesso
```

### Teste 3: Verificar Caixa de Entrada

Verificar se os 4 doadores receberam os emails:
- dudacarraro2017@gmail.com
- bia.aguilar@hotmail.com
- rcarraro2015@gmail.com (2 recibos)

---

## 📊 RECIBOS PENDENTES DE ENVIO

| Número | Doador | Email | Valor |
|--------|--------|-------|-------|
| RCB-2025-00002 | Maria Eduarda Carraro | dudacarraro2017@gmail.com | R$ 15,00 |
| RCB-2025-00004 | Beatriz Fatima Almeida Carraro | bia.aguilar@hotmail.com | R$ 15,00 |
| RCB-2025-00006 | Renato Magno C Alves | rcarraro2015@gmail.com | R$ 5,00 |
| RCB-2025-00008 | Renato Magno C Alves | rcarraro2015@gmail.com | R$ 5,00 |

---

## 🎯 ORDEM DE EXECUÇÃO

1. ✅ **Atualizar RESEND_API_KEY no Supabase** ⬅️ FAZER PRIMEIRO
2. ✅ **Deploy generate-receipt** ⬅️ FAZER SEGUNDO
3. ✅ **Deploy asaas-webhook-v2** ⬅️ FAZER TERCEIRO
4. ✅ **Executar reenviar_emails_recibos.py** ⬅️ FAZER POR ÚLTIMO
5. ✅ **Verificar emails recebidos** ⬅️ VALIDAR

---

## 💡 VANTAGENS DO DOMÍNIO PRÓPRIO

✅ **Mais profissional** - Email institucional  
✅ **Melhor reputação** - Menos chance de spam  
✅ **Sem limites** - Não depende de Gmail  
✅ **Branding** - Reforça identidade da ONG  
✅ **Confiança** - Doadores confiam mais  

---

## 📞 LINKS ÚTEIS

**Supabase:**
- Secrets: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/settings/vault
- Functions: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/functions

**Resend:**
- Dashboard: https://resend.com/
- Domains: https://resend.com/domains
- Logs: https://resend.com/logs

---

## ⚠️ IMPORTANTE

**NÃO ESQUECER:**
- Atualizar API Key ANTES de fazer deploy
- Fazer deploy das 2 funções (generate-receipt E asaas-webhook-v2)
- Testar com reenvio de emails
- Validar que emails chegaram

---

**Última atualização:** 27/10/2025 02:30  
**Status:** Pronto para atualizar
