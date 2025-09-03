-- Migração para adicionar validação de wallet ID única
-- Previne duplicidade de wallets entre embaixadores e conflitos com wallets do sistema

-- 1. Primeiro, limpar possíveis duplicatas existentes (manter apenas a mais recente)
WITH duplicates AS (
  SELECT 
    ambassador_wallet_id,
    MIN(created_at) as first_created
  FROM profiles 
  WHERE ambassador_wallet_id IS NOT NULL 
    AND ambassador_wallet_id != ''
  GROUP BY ambassador_wallet_id 
  HAVING COUNT(*) > 1
)
UPDATE profiles 
SET ambassador_wallet_id = NULL 
WHERE ambassador_wallet_id IN (
  SELECT ambassador_wallet_id FROM duplicates
) 
AND created_at NOT IN (
  SELECT first_created FROM duplicates WHERE duplicates.ambassador_wallet_id = profiles.ambassador_wallet_id
);

-- 2. Remover wallets do sistema se alguém as estiver usando
UPDATE profiles 
SET ambassador_wallet_id = NULL 
WHERE ambassador_wallet_id IN (
  'eff311bc-7737-4870-93cd-16080c00d379', -- Instituto
  'f9c7d1dd-9e52-4e81-8194-8b666f276405', -- Renum
  'c0c31b6a-2481-4e3f-a6de-91c3ff834d1f'  -- Especial
);

-- 3. Adicionar constraint de unicidade
ALTER TABLE profiles 
ADD CONSTRAINT unique_ambassador_wallet_id 
UNIQUE (ambassador_wallet_id);

-- 4. Criar função para validar wallet ID
CREATE OR REPLACE FUNCTION validate_ambassador_wallet_id()
RETURNS TRIGGER AS $$
DECLARE
  system_wallets TEXT[] := ARRAY[
    'eff311bc-7737-4870-93cd-16080c00d379', -- Instituto
    'f9c7d1dd-9e52-4e81-8194-8b666f276405', -- Renum  
    'c0c31b6a-2481-4e3f-a6de-91c3ff834d1f'  -- Especial
  ];
BEGIN
  -- Verificar se não é uma wallet do sistema
  IF NEW.ambassador_wallet_id = ANY(system_wallets) THEN
    RAISE EXCEPTION 'Esta Wallet ID é reservada para o sistema e não pode ser usada por embaixadores';
  END IF;
  
  -- Verificar formato UUID
  IF NEW.ambassador_wallet_id IS NOT NULL 
     AND NEW.ambassador_wallet_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'Wallet ID deve estar no formato UUID válido';
  END IF;
  
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

-- 6. Adicionar comentários para documentação
COMMENT ON CONSTRAINT unique_ambassador_wallet_id ON profiles IS 
'Garante que cada Wallet ID seja única entre embaixadores, prevenindo conflitos de pagamento';

COMMENT ON FUNCTION validate_ambassador_wallet_id() IS 
'Valida Wallet IDs de embaixadores: impede uso de wallets do sistema e valida formato UUID';