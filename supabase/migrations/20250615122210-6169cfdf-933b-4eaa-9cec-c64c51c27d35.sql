
-- Corrigir políticas RLS para permitir visualização adequada dos parceiros
DROP POLICY IF EXISTS "Anyone can view active partners" ON public.partners;

-- Criar política mais específica para visualização de parceiros
CREATE POLICY "Anyone can view active partners" ON public.partners
  FOR SELECT USING (is_active = true);

-- Permitir que parceiros vejam seus próprios dados independente do status
CREATE POLICY "Partners can view their own profile" ON public.partners
  FOR SELECT USING (auth.uid() = user_id);

-- Garantir que as políticas de atualização estejam corretas
DROP POLICY IF EXISTS "Partners can update their own profile" ON public.partners;
CREATE POLICY "Partners can update their own profile" ON public.partners
  FOR UPDATE USING (auth.uid() = user_id);

-- Garantir que as políticas de inserção estejam corretas
DROP POLICY IF EXISTS "Partners can insert their own profile" ON public.partners;
CREATE POLICY "Partners can insert their own profile" ON public.partners
  FOR INSERT WITH CHECK (auth.uid() = user_id);
