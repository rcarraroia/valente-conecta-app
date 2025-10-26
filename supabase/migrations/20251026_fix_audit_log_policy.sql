-- ============================================
-- CORREÇÃO: Política RLS para tabela audit_log
-- Data: 2025-10-26
-- Problema: Trigger de auditoria bloqueado por RLS
-- ============================================

-- 1. Verificar se a tabela audit_log existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'audit_log') THEN
    RAISE NOTICE '✅ Tabela audit_log encontrada';
  ELSE
    RAISE NOTICE '⚠️  Tabela audit_log não existe - criando...';
    
    -- Criar tabela se não existir
    CREATE TABLE IF NOT EXISTS public.audit_log (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      table_name text NOT NULL,
      record_id uuid,
      action text NOT NULL,
      old_data jsonb,
      new_data jsonb,
      user_id uuid REFERENCES auth.users(id),
      created_at timestamptz DEFAULT now()
    );
    
    -- Criar índices
    CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
    CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON public.audit_log(record_id);
    CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);
  END IF;
END $$;

-- 2. Habilitar RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas
DROP POLICY IF EXISTS "Service role can manage audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Users can view their own audit log" ON public.audit_log;
DROP POLICY IF EXISTS "System can insert audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Allow system inserts to audit_log" ON public.audit_log;

-- 4. Criar política para permitir INSERT via triggers/functions
-- Esta política permite que o sistema (via triggers) insira registros de auditoria
CREATE POLICY "Allow system inserts to audit_log"
  ON public.audit_log
  FOR INSERT
  WITH CHECK (true);  -- Permite qualquer INSERT (necessário para triggers)

-- 5. Criar política para SELECT (usuários podem ver seus próprios logs)
CREATE POLICY "Users can view their own audit log"
  ON public.audit_log
  FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- 6. Criar política para service_role (acesso total)
CREATE POLICY "Service role can manage audit log"
  ON public.audit_log
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- 7. Comentário explicativo
COMMENT ON TABLE public.audit_log IS 
'Tabela de auditoria para rastrear alterações em tabelas críticas. Populada automaticamente via triggers.';

COMMENT ON POLICY "Allow system inserts to audit_log" ON public.audit_log IS 
'Permite triggers e functions do sistema inserirem registros de auditoria sem restrições de RLS.';

-- 8. Verificação de sucesso
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'audit_log';
  
  IF policy_count >= 3 THEN
    RAISE NOTICE '✅ Políticas RLS criadas com sucesso para audit_log!';
    RAISE NOTICE '   - Total de políticas: %', policy_count;
    RAISE NOTICE '   - Triggers podem inserir registros livremente';
    RAISE NOTICE '   - Usuários podem ver seus próprios logs';
  ELSE
    RAISE WARNING '⚠️  Apenas % política(s) criada(s)', policy_count;
  END IF;
END $$;
