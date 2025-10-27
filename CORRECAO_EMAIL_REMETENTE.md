# 📧 CORREÇÃO DO EMAIL REMETENTE

**Data:** 27/10/2025  
**Problema:** Domínio `coracaovalente.org.br` não verificado no Resend

---

## ❌ ERRO IDENTIFICADO

```
Failed after 3 attempts: The coracaovalente.org.br domain is not verified. 
Please, add and verify your domain on https://resend.com/domains
```

**Causa:** O Resend exige que o domínio do email remetente seja verificado.

---

## ✅ CORREÇÃO APLICADA

### Email Remetente Alterado:

**ANTES:**
```
Instituto Coração Valente <contato@coracaovalente.org.br>
```

**DEPOIS:**
```
Instituto Coração Valente <coracaovalenteorg@gmail.com>
```

### Arquivos Modificados:

1. ✅ `supabase/functions/_shared/email-service.ts`
   - Linha 26: `DEFAULT_FROM` alterado

2. ✅ `supabase/functions/generate-receipt/index.ts`
   - Linha 156: `replyTo` alterado

---

## 🚀 PRÓXIMOS PASSOS

### 1. URGENTE - Deploy das Correções

**Você precisa fazer deploy de 2 edge functions:**

#### A. Deploy do email-service (shared)
Como é um arquivo compartilhado, precisa fazer deploy das funções que o usam:

```bash
# Via CLI (se tiver acesso)
supabase functions deploy generate-receipt
```

**OU via Dashboard:**
1. Acesse: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/functions
2. Clique em "generate-receipt"
3. Clique em "Deploy new version"
4. Cole o conteúdo atualizado
5. Deploy

#### B. Verificar se asaas-webhook-v2 também precisa
Se o webhook também envia emails diretamente, fazer deploy dele também.

### 2. IMPORTANTE - Reenviar Emails dos Recibos

**Após o deploy, execute:**
```bash
python reenviar_emails_recibos.py
```

**Isso irá:**
1. Buscar todos os recibos com `email_sent = false`
2. Mostrar a lista (4 recibos)
3. Pedir confirmação
4. Reenviar os emails usando o novo remetente

**Recibos que receberão email:**
- RCB-2025-00002 - Maria Eduarda Carraro - dudacarraro2017@gmail.com
- RCB-2025-00004 - Beatriz Fatima Almeida Carraro - bia.aguilar@hotmail.com
- RCB-2025-00006 - Renato Magno C Alves - rcarraro2015@gmail.com
- RCB-2025-00008 - Renato Magno C Alves - rcarraro2015@gmail.com

---

## 📋 VERIFICAÇÃO NO RESEND

### Verificar se Gmail está configurado:

1. Acesse: https://resend.com/domains
2. Verifique se `coracaovalenteorg@gmail.com` está na lista
3. Se não estiver, adicione o domínio `gmail.com` (mas geralmente Gmail funciona direto)

**Nota:** Emails do Gmail geralmente funcionam sem verificação adicional no Resend, mas é bom confirmar.

---

## 🔄 SOLUÇÃO PERMANENTE (FUTURO)

### Opção 1: Verificar Domínio Próprio (RECOMENDADO)

1. Acesse: https://resend.com/domains
2. Adicione o domínio `coracaovalente.org.br`
3. Configure os registros DNS (SPF, DKIM, DMARC)
4. Aguarde verificação (pode levar até 48h)
5. Volte a usar `contato@coracaovalente.org.br`

**Vantagens:**
- ✅ Mais profissional
- ✅ Melhor reputação de email
- ✅ Menos chance de cair em spam

### Opção 2: Continuar com Gmail (TEMPORÁRIO)

- ✅ Funciona imediatamente
- ⚠️ Menos profissional
- ⚠️ Pode ter limites de envio

---

## 🧪 COMO TESTAR

### Teste 1: Verificar Deploy
```bash
# Ver logs da função
supabase functions logs generate-receipt --tail
```

### Teste 2: Reenviar Email de Teste
```python
import requests

response = requests.post(
    "https://corrklfwxfuqusfzwbls.supabase.co/functions/v1/generate-receipt",
    headers={
        'Authorization': 'Bearer SERVICE_ROLE_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'donationId': '339a852b-48cf-4936-a281-167102dd37c3',  # Maria Eduarda
        'sendEmail': True
    }
)

print(response.json())
```

### Teste 3: Verificar Email Recebido
- Verificar caixa de entrada dos doadores
- Verificar pasta de spam
- Confirmar que remetente é `coracaovalenteorg@gmail.com`

---

## ✅ CHECKLIST

- [x] Email remetente corrigido no código
- [x] Script de reenvio criado
- [ ] **Deploy da função generate-receipt** ⬅️ FAZER AGORA
- [ ] **Executar script de reenvio** ⬅️ FAZER DEPOIS
- [ ] **Verificar emails recebidos** ⬅️ VALIDAR
- [ ] (Futuro) Verificar domínio próprio no Resend

---

## 📞 SUPORTE

**Se os emails ainda não chegarem:**

1. Verificar logs: `supabase functions logs generate-receipt`
2. Verificar se deploy foi feito corretamente
3. Verificar configuração do Resend
4. Testar envio manual via Resend dashboard

**Links úteis:**
- Resend Dashboard: https://resend.com/
- Resend Domains: https://resend.com/domains
- Resend Logs: https://resend.com/logs

---

**Última atualização:** 27/10/2025 02:05  
**Status:** Correção aplicada - Aguardando deploy
