# 🚨 CORREÇÃO URGENTE - Audit Log RLS

**Problema Real Identificado:**
```
new row violates row-level security policy for table "audit_log"
```

O erro NÃO é na tabela `profiles`, é na tabela `audit_log`!

---

## ⚡ APLICAR IMEDIATAMENTE

### SQL para Executar:

```sql
-- Habilitar RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Allow system inserts to audit_log" ON public.audit_log;

-- Criar política que permite triggers inserirem
CREATE POLICY "Allow system inserts to audit_log"
  ON public.audit_log
  FOR INSERT
  WITH CHECK (true);

-- Política para usuários verem seus logs
DROP POLICY IF EXISTS "Users can view their own audit log" ON public.audit_log;
CREATE POLICY "Users can view their own audit log"
  ON public.audit_log
  FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- Service role acesso total
DROP POLICY IF EXISTS "Service role can manage audit log" ON public.audit_log;
CREATE POLICY "Service role can manage audit log"
  ON public.audit_log
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

---

## 🎯 O QUE ESTAVA ACONTECENDO

1. Você tenta atualizar `profiles` ✅
2. Trigger de auditoria tenta inserir em `audit_log` 🔄
3. RLS da `audit_log` bloqueia o INSERT ❌
4. Erro 403 retorna para você ❌

---

## ✅ APÓS APLICAR

1. Você atualiza `profiles` ✅
2. Trigger insere em `audit_log` ✅
3. Wallet ID é salvo ✅
4. Sem erro 403 ✅

---

**Copie o SQL acima e execute no SQL Editor agora!**
