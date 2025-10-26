-- Migração: Permitir acesso público aos perfis de embaixadores
-- Data: 26/10/2025
-- Objetivo: Permitir que a landing page leia dados dos embaixadores

-- ============================================================================
-- POLÍTICAS RLS PARA EMBAIXADORES
-- ============================================================================

-- 1. Permitir leitura pública de perfis com ambassador_code
CREATE POLICY IF NOT EXISTS "Perfis de embaixadores são públicos"
ON profiles FOR SELECT
USING (ambassador_code IS NOT NULL);

-- 2. Permitir leitura pública de dados de parceiros (para foto profissional)
CREATE POLICY IF NOT EXISTS "Dados de parceiros são públicos para leitura"
ON partners FOR SELECT
USING (true);

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON POLICY "Perfis de embaixadores são públicos" ON profiles IS 
'Permite que qualquer pessoa (incluindo usuários não autenticados) 
visualize perfis que possuem código de embaixador. 
Necessário para exibir o card do embaixador na landing page.';

COMMENT ON POLICY "Dados de parceiros são públicos para leitura" ON partners IS 
'Permite leitura pública dos dados de parceiros, incluindo foto profissional.
Necessário para exibir a foto do embaixador na landing page.';
