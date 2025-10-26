# 🚀 GUIA RÁPIDO - Aplicar Migração RLS

**Migração:** `20251025_fix_profiles_update_policy.sql`  
**Objetivo:** Corrigir erro 403 ao atualizar perfil  
**Urgência:** 🔴 Alta  

---

## ⚡ MÉTODO RÁPIDO (Dashboard Supabase)

### Passo 1: Acessar SQL Editor
```
https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/sql/new
```

### Passo 2: Copiar e Colar o SQL

```sql
-- Remover política antiga
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Criar política completa
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Garantir RLS habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### Passo 3: Executar (RUN)

Clicar no botão "RUN" ou pressionar `Ctrl + Enter`

### Passo 4: Verificar Sucesso

Deve aparecer: `✅ Success. No rows returned`

---

## ✅ TESTAR IMEDIATAMENTE

1. **Ir para Dashboard do Embaixador:**
   ```
   https://www.coracaovalente.org.br/ambassador
   ```

2. **Clicar em "Configurar Wallet"**

3. **Inserir Wallet ID do Asaas**

4. **Salvar**

**Resultado esperado:** ✅ Sucesso (sem erro 403)

---

## 🔍 VERIFICAR SE FUNCIONOU

### Console do Navegador (F12)

**Antes da correção:**
```
❌ Failed to load resource: 403
❌ Erro ao salvar wallet ID
```

**Depois da correção:**
```
✅ Wallet ID salvo com sucesso
✅ Perfil atualizado
```

---

## 📞 SUPORTE

Se ainda der erro 403 após aplicar:

1. Limpar cache do navegador (Ctrl + Shift + R)
2. Fazer logout e login novamente
3. Verificar se a migração foi aplicada:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'profiles' 
   AND policyname = 'Users can update their own profile';
   ```

---

**Tempo estimado:** 2 minutos  
**Dificuldade:** Fácil  
**Risco:** Baixo
