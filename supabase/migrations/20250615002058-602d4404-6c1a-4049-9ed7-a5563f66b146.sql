
-- Implementação de Políticas RLS Críticas - Versão Corrigida
-- Remove políticas existentes antes de recriar para evitar conflitos

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Users can view their own diagnosis sessions" ON public.pre_diagnosis_sessions;
DROP POLICY IF EXISTS "Users can create their own diagnosis sessions" ON public.pre_diagnosis_sessions;
DROP POLICY IF EXISTS "Users can update their own diagnosis sessions" ON public.pre_diagnosis_sessions;
DROP POLICY IF EXISTS "Users can view their own volunteer applications" ON public.volunteer_applications;
DROP POLICY IF EXISTS "Users can create volunteer applications" ON public.volunteer_applications;
DROP POLICY IF EXISTS "Users can update their own volunteer applications" ON public.volunteer_applications;
DROP POLICY IF EXISTS "Users can view their own performance" ON public.ambassador_performance;

-- 1. Políticas para tabela profiles (dados pessoais sensíveis)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 2. Políticas para pre_diagnosis_sessions (dados médicos sensíveis)
CREATE POLICY "Users can view their own diagnosis sessions" 
  ON public.pre_diagnosis_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diagnosis sessions" 
  ON public.pre_diagnosis_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diagnosis sessions" 
  ON public.pre_diagnosis_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 3. Políticas para diagnostics (dados médicos sensíveis)
DROP POLICY IF EXISTS "Users can view their own diagnostics" ON public.diagnostics;
DROP POLICY IF EXISTS "Users can create their own diagnostics" ON public.diagnostics;
DROP POLICY IF EXISTS "Users can update their own diagnostics" ON public.diagnostics;

CREATE POLICY "Users can view their own diagnostics" 
  ON public.diagnostics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diagnostics" 
  ON public.diagnostics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diagnostics" 
  ON public.diagnostics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 4. Políticas para ambassador_links (dados de embaixadores)
DROP POLICY IF EXISTS "Ambassadors can view their own links" ON public.ambassador_links;
DROP POLICY IF EXISTS "Ambassadors can create their own links" ON public.ambassador_links;
DROP POLICY IF EXISTS "Ambassadors can update their own links" ON public.ambassador_links;

CREATE POLICY "Ambassadors can view their own links" 
  ON public.ambassador_links 
  FOR SELECT 
  USING (auth.uid() = ambassador_user_id);

CREATE POLICY "Ambassadors can create their own links" 
  ON public.ambassador_links 
  FOR INSERT 
  WITH CHECK (auth.uid() = ambassador_user_id);

CREATE POLICY "Ambassadors can update their own links" 
  ON public.ambassador_links 
  FOR UPDATE 
  USING (auth.uid() = ambassador_user_id);

-- 5. Políticas para ambassador_performance (dados de performance)
DROP POLICY IF EXISTS "Ambassadors can view their own performance" ON public.ambassador_performance;
DROP POLICY IF EXISTS "System can update ambassador performance" ON public.ambassador_performance;
DROP POLICY IF EXISTS "System can insert ambassador performance" ON public.ambassador_performance;

CREATE POLICY "Ambassadors can view their own performance" 
  ON public.ambassador_performance 
  FOR SELECT 
  USING (auth.uid() = ambassador_user_id);

CREATE POLICY "System can update ambassador performance" 
  ON public.ambassador_performance 
  FOR UPDATE 
  USING (auth.uid() = ambassador_user_id);

CREATE POLICY "System can insert ambassador performance" 
  ON public.ambassador_performance 
  FOR INSERT 
  WITH CHECK (auth.uid() = ambassador_user_id);

-- 6. Políticas para volunteer_applications (dados pessoais)
CREATE POLICY "Users can view their own volunteer applications" 
  ON public.volunteer_applications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create volunteer applications" 
  ON public.volunteer_applications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own volunteer applications" 
  ON public.volunteer_applications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 7. Políticas para link_clicks (dados de rastreamento - somente para service_role)
DROP POLICY IF EXISTS "Service role can manage link clicks" ON public.link_clicks;
CREATE POLICY "Service role can manage link clicks" 
  ON public.link_clicks 
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- 8. Políticas para donations (dados financeiros sensíveis)
DROP POLICY IF EXISTS "Users can view their own donations" ON public.donations;
DROP POLICY IF EXISTS "Service role can manage donations" ON public.donations;

CREATE POLICY "Users can view their own donations" 
  ON public.donations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage donations" 
  ON public.donations 
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- 9. Políticas para dados públicos (leitura pública permitida)
DROP POLICY IF EXISTS "Anyone can view active onboarding screens" ON public.onboarding_screens;
DROP POLICY IF EXISTS "Anyone can view active library categories" ON public.library_categories;
DROP POLICY IF EXISTS "Anyone can view active library resources" ON public.library_resources;
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
DROP POLICY IF EXISTS "Anyone can view published news articles" ON public.news_articles;
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Anyone can view active pre-diagnosis questions" ON public.pre_diagnosis_questions;

CREATE POLICY "Anyone can view active onboarding screens" 
  ON public.onboarding_screens 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Anyone can view active library categories" 
  ON public.library_categories 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Anyone can view active library resources" 
  ON public.library_resources 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Anyone can view active services" 
  ON public.services 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Anyone can view published news articles" 
  ON public.news_articles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can view active campaigns" 
  ON public.campaigns 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Anyone can view active pre-diagnosis questions" 
  ON public.pre_diagnosis_questions 
  FOR SELECT 
  USING (is_active = true);

-- 10. Criação de índices para otimização de performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_pre_diagnosis_sessions_user_id ON public.pre_diagnosis_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_user_id ON public.diagnostics(user_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_links_user_id ON public.ambassador_links(ambassador_user_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_performance_user_id ON public.ambassador_performance(ambassador_user_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_user_id ON public.volunteer_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON public.link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON public.donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_ambassador_link_id ON public.donations(ambassador_link_id);
CREATE INDEX IF NOT EXISTS idx_library_resources_category_id ON public.library_resources(category_id);
CREATE INDEX IF NOT EXISTS idx_library_resources_published_at ON public.library_resources(published_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON public.news_articles(published_at);

-- 11. Função de segurança para verificar se o usuário é embaixador
DROP FUNCTION IF EXISTS public.is_ambassador(uuid);
CREATE OR REPLACE FUNCTION public.is_ambassador(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id 
    AND is_volunteer = true 
    AND ambassador_code IS NOT NULL
  );
$$;

-- 12. Política adicional para embaixadores visualizarem dados agregados
DROP POLICY IF EXISTS "Ambassadors can view aggregated performance" ON public.ambassador_performance;
CREATE POLICY "Ambassadors can view aggregated performance" 
  ON public.ambassador_performance 
  FOR SELECT 
  USING (public.is_ambassador(auth.uid()));
