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
  WITH CHECK (auth.uid() = id);

-- 3. Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Comentário explicativo
COMMENT ON POLICY "Users can update their own profile" ON public.profiles IS 
'Permite usuários atualizarem seu próprio perfil incluindo wallet_id, nome, telefone, cidade, estado e foto. Usuário só pode atualizar seu próprio registro.';

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
    RAISE NOTICE '   - Usuários podem atualizar seu próprio perfil';
    RAISE NOTICE '   - Incluindo: wallet_id, nome, telefone, cidade, estado, foto';
  ELSE
    RAISE EXCEPTION '❌ Erro: Política não foi criada!';
  END IF;
END $$;
