-- Migração: Validação de Wallet ID única para embaixadores
-- Previne duplicidade e uso de wallets do sistema

-- 1. Limpar possíveis duplicatas existentes (manter apenas a mais recente por wallet)
WITH wallet_duplicates AS (
  SELECT 
    ambassador_wallet_id,
    MAX(created_at) as latest_created
  FROM profiles 
  WHERE ambassador_wallet_id IS NOT NULL 
    AND ambassador_wallet_id != ''
  GROUP BY ambassador_wallet_id 
  HAVING COUNT(*) > 1
)
UPDATE profiles 
SET ambassador_wallet_id = NULL,
    updated_at = NOW()
WHERE ambassador_wallet_id IN (
  SELECT ambassador_wallet_id FROM wallet_duplicates
) 
AND created_at NOT IN (
  SELECT latest_created 
  FROM wallet_duplicates 
  WHERE wallet_duplicates.ambassador_wallet_id = profiles.ambassador_wallet_id
);

-- 2. Remover wallets do sistema se alguém as estiver usando
UPDATE profiles 
SET ambassador_wallet_id = NULL,
    updated_at = NOW()
WHERE ambassador_wallet_id IN (
  'eff311bc-7737-4870-93cd-16080c00d379', -- Instituto Coração Valente
  'f9c7d1dd-9e52-4e81-8194-8b666f276405', -- Renum (Administrador)
  'c0c31b6a-2481-4e3f-a6de-91c3ff834d1f'  -- Wallet Especial
);

-- 3. Adicionar constraint de unicidade (apenas para wallets não nulas)
CREATE UNIQUE INDEX IF NOT EXISTS unique_ambassador_wallet_id 
ON profiles (ambassador_wallet_id) 
WHERE ambassador_wallet_id IS NOT NULL AND ambassador_wallet_id != '';

-- 4. Criar função para validar wallet ID
CREATE OR REPLACE FUNCTION validate_ambassador_wallet_id()
RETURNS TRIGGER AS $$
DECLARE
  system_wallets TEXT[] := ARRAY[
    'eff311bc-7737-4870-93cd-16080c00d379', -- Instituto Coração Valente
    'f9c7d1dd-9e52-4e81-8194-8b666f276405', -- Renum (Administrador)
    'c0c31b6a-2481-4e3f-a6de-91c3ff834d1f'  -- Wallet Especial
  ];
  uuid_pattern TEXT := '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
BEGIN
  -- Pular validação se wallet for nula ou vazia
  IF NEW.ambassador_wallet_id IS NULL OR NEW.ambassador_wallet_id = '' THEN
    RETURN NEW;
  END IF;

  -- Verificar se não é uma wallet do sistema
  IF NEW.ambassador_wallet_id = ANY(system_wallets) THEN
    RAISE EXCEPTION 'Esta Wallet ID (%) é reservada para o sistema e não pode ser usada por embaixadores', 
      NEW.ambassador_wallet_id;
  END IF;
  
  -- Verificar formato UUID (case insensitive)
  IF NOT (lower(NEW.ambassador_wallet_id) ~ uuid_pattern) THEN
    RAISE EXCEPTION 'Wallet ID deve estar no formato UUID válido (ex: f9c7d1dd-9e52-4e81-8194-8b666f276405)';
  END IF;
  
  -- Normalizar para lowercase para consistência
  NEW.ambassador_wallet_id := lower(NEW.ambassador_wallet_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger para validação automática
DROP TRIGGER IF EXISTS validate_ambassador_wallet_trigger ON profiles;
CREATE TRIGGER validate_ambassador_wallet_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.ambassador_wallet_id IS NOT NULL AND NEW.ambassador_wallet_id != '')
  EXECUTE FUNCTION validate_ambassador_wallet_id();

-- 6. Criar função para auditoria de mudanças de wallet
CREATE OR REPLACE FUNCTION log_wallet_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log apenas mudanças significativas
  IF (OLD.ambassador_wallet_id IS DISTINCT FROM NEW.ambassador_wallet_id) THEN
    INSERT INTO audit_log (
      table_name,
      record_id,
      action,
      old_values,
      new_values,
      user_id,
      created_at
    ) VALUES (
      'profiles',
      NEW.id,
      'wallet_change',
      jsonb_build_object('old_wallet', OLD.ambassador_wallet_id),
      jsonb_build_object('new_wallet', NEW.ambassador_wallet_id),
      NEW.id,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar tabela de auditoria se não existir
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Criar trigger de auditoria
DROP TRIGGER IF EXISTS log_wallet_changes_trigger ON profiles;
CREATE TRIGGER log_wallet_changes_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_wallet_changes();

-- 9. Adicionar comentários para documentação
COMMENT ON INDEX unique_ambassador_wallet_id IS 
'Índice único que garante que cada Wallet ID seja usada por apenas um embaixador, prevenindo conflitos de pagamento';

COMMENT ON FUNCTION validate_ambassador_wallet_id() IS 
'Valida Wallet IDs de embaixadores: impede uso de wallets do sistema, valida formato UUID e normaliza para lowercase';

COMMENT ON FUNCTION log_wallet_changes() IS 
'Registra mudanças de Wallet ID para auditoria e rastreamento de alterações';

COMMENT ON TABLE audit_log IS 
'Tabela de auditoria para rastrear mudanças importantes no sistema, especialmente alterações de Wallet ID';

-- 10. Criar política RLS para audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs" 
  ON audit_log 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage audit logs" 
  ON audit_log 
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');