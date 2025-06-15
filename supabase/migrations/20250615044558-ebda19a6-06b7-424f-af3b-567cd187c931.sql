
-- Atualizar a política RLS para permitir que usuários criem seus próprios perfis de parceiro
DROP POLICY IF EXISTS "Partners can insert their own profile" ON public.partners;

CREATE POLICY "Partners can insert their own profile" ON public.partners
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Garantir que a política de visualização também está correta
DROP POLICY IF EXISTS "Anyone can view active partners" ON public.partners;

CREATE POLICY "Anyone can view active partners" ON public.partners
  FOR SELECT USING (is_active = true);

-- Garantir que parceiros podem atualizar seus próprios perfis
DROP POLICY IF EXISTS "Partners can update their own profile" ON public.partners;

CREATE POLICY "Partners can update their own profile" ON public.partners
  FOR UPDATE USING (auth.uid() = user_id);
