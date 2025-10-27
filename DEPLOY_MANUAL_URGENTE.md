# 🚨 DEPLOY MANUAL URGENTE - 3 PASSOS RÁPIDOS

**Tempo estimado:** 5 minutos

---

## ⚡ PASSO 1: Atualizar API Key (2 minutos)

1. Abra: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/settings/vault

2. Procure `RESEND_API_KEY` ou clique em **"New secret"**

3. Configure:
   - **Nome:** `RESEND_API_KEY`
   - **Valor:** `re_eNfrBTqu_L6MbSJ3yxQNAr2f4MWqhGWbG`

4. **Salve**

---

## ⚡ PASSO 2: Deploy generate-receipt (2 minutos)

1. Abra: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/functions

2. Clique em **"generate-receipt"**

3. Clique em **"Deploy new version"** ou **"Edit"**

4. **Copie TODO o conteúdo** de: `supabase/functions/generate-receipt/index.ts`

5. **Cole** no editor

6. Clique em **"Deploy"**

---

## ⚡ PASSO 3: Deploy asaas-webhook-v2 (1 minuto)

1. Na mesma página de Functions

2. Clique em **"asaas-webhook-v2"**

3. Clique em **"Deploy new version"**

4. **Copie TODO o conteúdo** de: `supabase/functions/asaas-webhook-v2/index.ts`

5. **Cole** no editor

6. Clique em **"Deploy"**

---

## ✅ VALIDAR (30 segundos)

Execute:
```bash
python reenviar_emails_recibos.py
```

**Deve mostrar:**
- ✅ Emails enviados com sucesso: 4
- ❌ Erros: 0

---

## 📋 ARQUIVOS PARA COPIAR

### Arquivo 1: generate-receipt/index.ts
**Localização:** `E:\PROJETOS SITE\repositorios\valente-conecta-app\supabase\functions\generate-receipt\index.ts`

### Arquivo 2: asaas-webhook-v2/index.ts
**Localização:** `E:\PROJETOS SITE\repositorios\valente-conecta-app\supabase\functions\asaas-webhook-v2\index.ts`

---

## 🎯 RESULTADO ESPERADO

Após os 3 passos:
- ✅ API Key atualizada
- ✅ Email remetente: `no-reply@coracaovalente.org.br`
- ✅ Recibos enviados automaticamente
- ✅ Sistema 100% funcional

---

**FAÇA AGORA - 5 MINUTOS!** ⏱️
