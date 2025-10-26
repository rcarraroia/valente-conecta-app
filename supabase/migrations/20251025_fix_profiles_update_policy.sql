-- ============================================
-- CORREÇÃO: Política RLS para UPDATE em Profiles
-- Data: 2025-10-25
-- Objetivo: Permitir usuários atualizarem wallet_id e dados pessoais
-- Problema: Política existente não tinha WITH CHECK clause
-- ============================================

-- 1. Remover política antiga (incompleta)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 2. Criar política completa e segura
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Protege campos sensíveis contra alteração maliciosa
    AND OLD.id = NEW.id
    AND OLD.email = NEW.email
    AND OLD.is_volunteer = NEW.is_volunteer
    AND OLD.ambassador_code = NEW.ambassador_code
    AND OLD.created_at = NEW.created_at
  );

-- 3. Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Comentário explicativo
COMMENT ON POLICY "Users can update their own profile" ON public.profiles IS 
'Permite usuários atualizarem seu próprio perfil (wallet_id, nome, telefone, etc) mas protege campos sensíveis (email, is_volunteer, ambassador_code) contra alteração.';

-- 5. Verificação de sucesso
DO $$
DECLARE
  policy_exists boolean;
BEGIN
  -- Verifica se a política foi criada
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) INTO policy_exists;
  
  IF policy_exists THEN
    RAISE NOTICE '✅ Política RLS criada com sucesso!';
    RAISE NOTICE '   - Usuários podem atualizar: wallet_id, nome, telefone, cidade, estado';
    RAISE NOTICE '   - Campos protegidos: email, is_volunteer, ambassador_code';
  ELSE
    RAISE EXCEPTION '❌ Erro: Política não foi criada!';
  END IF;
END $$;
