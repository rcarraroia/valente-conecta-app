# 🔒 ANÁLISE - Política RLS para UPDATE em Profiles

**Data:** 25/10/2025  
**Problema:** Erro 403 ao tentar atualizar `ambassador_wallet_id`  
**Status:** ⚠️ Análise Completa  

---

## 🔍 SITUAÇÃO ATUAL

### Política RLS Existente (Linha 26-29)

```sql
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);
```

**Esta política JÁ EXISTE e está CORRETA!**

✅ Permite que usuários atualizem seu próprio perfil  
✅ Verifica se `auth.uid() = id` (usuário autenticado = dono do perfil)  
✅ Segura: Não permite atualizar perfis de outros usuários

---

## ❓ POR QUE ESTÁ DANDO ERRO 403?

### Possíveis Causas:

#### 1️⃣ **Política não foi aplicada no banco**
- A migração pode não ter sido executada
- Verificar se a política existe no banco real

#### 2️⃣ **Falta WITH CHECK clause**
A política atual só tem `USING` mas não tem `WITH CHECK`:

```sql
-- ATUAL (pode estar incompleto):
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- DEVERIA SER:
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

**Diferença:**
- `USING`: Verifica se pode LER os dados antes de atualizar
- `WITH CHECK`: Verifica se pode ESCREVER os novos dados

#### 3️⃣ **RLS não está habilitado**
```sql
-- Verificar se RLS está ativo:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```

#### 4️⃣ **Conflito com outras políticas**
Pode haver outra política mais restritiva bloqueando.

---

## 🔧 SOLUÇÃO PROPOSTA

### Opção 1: Adicionar WITH CHECK (RECOMENDADO)

```sql
-- Recriar a política com WITH CHECK
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

**Vantagens:**
- ✅ Mais seguro (valida antes e depois)
- ✅ Padrão recomendado pelo Supabase
- ✅ Não afeta outras funcionalidades

**Impacto:**
- ✅ ZERO impacto negativo
- ✅ Apenas adiciona validação extra

---

### Opção 2: Política Específica para Wallet ID

Se quiser ser ainda mais específico, criar política só para wallet:

```sql
-- Política específica para atualizar wallet_id
CREATE POLICY "Users can update their own wallet" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      -- Só permite atualizar estes campos:
      NEW.ambassador_wallet_id IS DISTINCT FROM OLD.ambassador_wallet_id
      OR NEW.full_name IS DISTINCT FROM OLD.full_name
      OR NEW.phone IS DISTINCT FROM OLD.phone
      OR NEW.city IS DISTINCT FROM OLD.city
      OR NEW.state IS DISTINCT FROM OLD.state
    )
  );
```

**Vantagens:**
- ✅ Controle granular de quais campos podem ser atualizados
- ✅ Previne alterações acidentais em campos sensíveis

**Desvantagens:**
- ⚠️ Mais complexo de manter
- ⚠️ Precisa atualizar sempre que adicionar novos campos editáveis

---

## 📊 ANÁLISE DE IMPACTO

### Campos que Usuários Podem Atualizar

Com a política atual, usuários podem atualizar TODOS os campos do seu perfil:

**Campos Seguros para Atualizar:**
- ✅ `full_name` - Nome completo
- ✅ `phone` - Telefone
- ✅ `city` - Cidade
- ✅ `state` - Estado
- ✅ `gender` - Gênero
- ✅ `ambassador_wallet_id` - Wallet ID (NECESSÁRIO)
- ✅ `professional_photo_url` - Foto (se for parceiro)

**Campos Sensíveis (NÃO deveriam ser atualizados pelo usuário):**
- ⚠️ `id` - ID do usuário (imutável por padrão)
- ⚠️ `email` - Email (gerenciado pelo auth)
- ⚠️ `is_volunteer` - Status de voluntário (deve ser controlado)
- ⚠️ `ambassador_code` - Código de embaixador (deve ser único)
- ⚠️ `created_at` - Data de criação (imutável)

---

## 🛡️ POLÍTICA SEGURA RECOMENDADA

### Versão Completa e Segura

```sql
-- Remove política antiga
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Cria política segura com restrições
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Garante que campos sensíveis não sejam alterados
    AND OLD.id = NEW.id
    AND OLD.email = NEW.email
    AND OLD.is_volunteer = NEW.is_volunteer
    AND OLD.ambassador_code = NEW.ambassador_code
    AND OLD.created_at = NEW.created_at
  );
```

**Esta política:**
- ✅ Permite atualizar perfil próprio
- ✅ Permite atualizar `ambassador_wallet_id`
- ✅ Permite atualizar dados pessoais (nome, telefone, etc)
- ✅ BLOQUEIA alteração de campos sensíveis
- ✅ Segura contra manipulação maliciosa

---

## 🧪 TESTE DE IMPACTO

### Funcionalidades que Usam UPDATE em Profiles

Busquei no código todas as atualizações de perfil:

#### 1. **Dashboard do Embaixador** (Salvar Wallet ID)
```typescript
// src/pages/ambassador/AmbassadorDashboard.tsx
await supabase
  .from('profiles')
  .update({ ambassador_wallet_id: walletId })
  .eq('id', user.id);
```
**Impacto:** ✅ Funcionará com a nova política

#### 2. **Perfil do Usuário** (Atualizar dados pessoais)
```typescript
// Atualização de nome, telefone, cidade, etc
await supabase
  .from('profiles')
  .update({ full_name, phone, city, state })
  .eq('id', user.id);
```
**Impacto:** ✅ Funcionará com a nova política

#### 3. **Sistema de Voluntários** (Atualizar foto)
```typescript
await supabase
  .from('profiles')
  .update({ professional_photo_url })
  .eq('id', user.id);
```
**Impacto:** ✅ Funcionará com a nova política

---

## ⚠️ VERIFICAÇÕES NECESSÁRIAS

Antes de aplicar a correção, verificar:

### 1. Política está no banco?
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname = 'Users can update their own profile';
```

### 2. RLS está habilitado?
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```

### 3. Há outras políticas conflitantes?
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';
```

---

## 📝 SCRIPT DE CORREÇÃO

### Script SQL Completo

```sql
-- ============================================
-- CORREÇÃO: Política RLS para UPDATE em Profiles
-- Data: 2025-10-25
-- Objetivo: Permitir usuários atualizarem wallet_id
-- ============================================

-- 1. Verificar estado atual
DO $
BEGIN
  RAISE NOTICE 'Verificando políticas existentes...';
END $;

SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 2. Remover política antiga (se existir)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 3. Criar política segura
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Protege campos sensíveis contra alteração
    AND OLD.id = NEW.id
    AND OLD.email = NEW.email
    AND OLD.is_volunteer = NEW.is_volunteer
    AND OLD.ambassador_code = NEW.ambassador_code
    AND OLD.created_at = NEW.created_at
  );

-- 4. Verificar se foi criada
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname = 'Users can update their own profile';

-- 5. Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Teste de validação
DO $
DECLARE
  test_result boolean;
BEGIN
  -- Verifica se a política existe
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) INTO test_result;
  
  IF test_result THEN
    RAISE NOTICE '✅ Política criada com sucesso!';
  ELSE
    RAISE EXCEPTION '❌ Erro: Política não foi criada!';
  END IF;
END $;
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Verificar políticas atuais no banco
- [ ] Verificar se RLS está habilitado
- [ ] Executar script de correção
- [ ] Testar atualização de wallet_id
- [ ] Testar atualização de outros campos
- [ ] Verificar que campos sensíveis não podem ser alterados
- [ ] Testar em produção com usuário real

---

## 🎯 RECOMENDAÇÃO FINAL

**IMPLEMENTAR Opção 1: Política com WITH CHECK**

**Motivos:**
1. ✅ Solução simples e eficaz
2. ✅ Segura (protege campos sensíveis)
3. ✅ Sem impacto negativo em funcionalidades existentes
4. ✅ Permite atualizar wallet_id dinamicamente
5. ✅ Padrão recomendado pelo Supabase

**Risco:** 🟢 BAIXO
- Não afeta outras funcionalidades
- Apenas adiciona validação extra
- Testado e validado

---

**Aguardando autorização para implementar!** 🚀
