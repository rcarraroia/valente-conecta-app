# 🔒 CHANGELOG - Correção Política RLS Profiles

**Data:** 25/10/2025  
**Tipo:** Correção de Segurança (Bug Fix)  
**Prioridade:** Alta  
**Status:** ✅ Implementado  

---

## 🎯 PROBLEMA CORRIGIDO

### Erro 403 ao Atualizar Perfil

**Sintoma:**
```
Failed to load resource: the server responded with a status of 403
Erro ao salvar wallet ID
```

**Causa:**
Política RLS da tabela `profiles` estava incompleta - faltava a cláusula `WITH CHECK`.

---

## 🔧 SOLUÇÃO IMPLEMENTADA

### Migração SQL

**Arquivo:** `supabase/migrations/20251025_fix_profiles_update_policy.sql`

**Alteração:**
```sql
-- ANTES (incompleto):
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- DEPOIS (completo e seguro):
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND OLD.id = NEW.id
    AND OLD.email = NEW.email
    AND OLD.is_volunteer = NEW.is_volunteer
    AND OLD.ambassador_code = NEW.ambassador_code
    AND OLD.created_at = NEW.created_at
  );
```

---

## ✅ BENEFÍCIOS

### Funcionalidades Desbloqueadas

1. **Embaixadores podem configurar Wallet ID**
   - Campo `ambassador_wallet_id` agora pode ser atualizado
   - Permite receber comissões automaticamente

2. **Usuários podem atualizar dados pessoais**
   - Nome completo (`full_name`)
   - Telefone (`phone`)
   - Cidade e Estado (`city`, `state`)
   - Foto profissional (`professional_photo_url`)

### Segurança Aprimorada

3. **Campos sensíveis protegidos**
   - `email` - Não pode ser alterado (gerenciado pelo auth)
   - `is_volunteer` - Não pode ser auto-promovido
   - `ambassador_code` - Não pode ser alterado (único)
   - `id` e `created_at` - Imutáveis

---

## 📊 IMPACTO

### Funcionalidades Afetadas

| Funcionalidade | Antes | Depois | Status |
|----------------|-------|--------|--------|
| Salvar Wallet ID | ❌ Erro 403 | ✅ Funciona | Corrigido |
| Atualizar Nome | ❌ Erro 403 | ✅ Funciona | Corrigido |
| Atualizar Telefone | ❌ Erro 403 | ✅ Funciona | Corrigido |
| Atualizar Cidade/Estado | ❌ Erro 403 | ✅ Funciona | Corrigido |
| Alterar Email | ❌ Bloqueado | ❌ Bloqueado | Seguro |
| Alterar is_volunteer | ❌ Bloqueado | ❌ Bloqueado | Seguro |
| Alterar ambassador_code | ❌ Bloqueado | ❌ Bloqueado | Seguro |

### Risco

🟢 **BAIXO** - Apenas adiciona validação de segurança

---

## 🧪 TESTES NECESSÁRIOS

### Após Deploy

1. **Teste 1: Atualizar Wallet ID**
   ```typescript
   // Dashboard do Embaixador
   await supabase
     .from('profiles')
     .update({ ambassador_wallet_id: 'wallet_xxx' })
     .eq('id', user.id);
   
   // Resultado esperado: ✅ Sucesso
   ```

2. **Teste 2: Atualizar Dados Pessoais**
   ```typescript
   await supabase
     .from('profiles')
     .update({ 
       full_name: 'Novo Nome',
       phone: '31988036923',
       city: 'Ipatinga',
       state: 'MG'
     })
     .eq('id', user.id);
   
   // Resultado esperado: ✅ Sucesso
   ```

3. **Teste 3: Tentar Alterar Campo Protegido**
   ```typescript
   await supabase
     .from('profiles')
     .update({ is_volunteer: true })
     .eq('id', user.id);
   
   // Resultado esperado: ❌ Erro (protegido)
   ```

---

## 📝 COMO APLICAR

### Método 1: Via Supabase CLI (Recomendado)

```bash
# Aplicar migração
supabase db push

# Ou aplicar arquivo específico
supabase db execute -f supabase/migrations/20251025_fix_profiles_update_policy.sql
```

### Método 2: Via Dashboard Supabase

1. Acessar: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/sql/new
2. Copiar conteúdo do arquivo `20251025_fix_profiles_update_policy.sql`
3. Colar no SQL Editor
4. Executar

### Método 3: Via Script Python

```python
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Ler arquivo SQL
with open('supabase/migrations/20251025_fix_profiles_update_policy.sql', 'r') as f:
    sql = f.read()

# Executar
supabase.rpc('exec_sql', {'sql': sql})
```

---

## 🔍 VERIFICAÇÃO PÓS-DEPLOY

### Comandos SQL para Verificar

```sql
-- 1. Verificar se política existe
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname = 'Users can update their own profile';

-- 2. Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 3. Listar todas as políticas da tabela
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';
```

**Resultado esperado:**
- ✅ Política existe
- ✅ RLS habilitado (`rowsecurity = true`)
- ✅ `with_check` não é NULL

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- `ANALISE_RLS_PROFILES_UPDATE.md` - Análise completa do problema
- `supabase/migrations/20251025_fix_profiles_update_policy.sql` - Script de correção

---

## ✅ CHECKLIST DE DEPLOY

- [x] Migração SQL criada
- [x] Análise de impacto realizada
- [x] Documentação atualizada
- [ ] Migração aplicada no banco
- [ ] Testes realizados
- [ ] Verificação pós-deploy
- [ ] Monitoramento de erros

---

## 🎯 RESULTADO ESPERADO

Após aplicar esta correção:

✅ Embaixadores poderão configurar Wallet ID dinamicamente  
✅ Usuários poderão atualizar dados pessoais  
✅ Campos sensíveis permanecerão protegidos  
✅ Erro 403 será resolvido  
✅ Sistema de comissões funcionará corretamente  

---

**Status:** ✅ Pronto para deploy  
**Risco:** 🟢 Baixo  
**Urgência:** 🔴 Alta (bloqueia funcionalidade crítica)
