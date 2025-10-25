-- =====================================================
-- MIGRATION: Sistema de Recibos - Instituto Coração Valente
-- Data: 2025-10-25
-- Descrição: Cria tabela de recibos com numeração sequencial
-- =====================================================

-- 1. Criar sequence para numeração automática
CREATE SEQUENCE IF NOT EXISTS receipts_number_seq START WITH 1;

-- 2. Criar tabela de recibos
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Numeração sequencial (formato: RCB-2025-00001)
  receipt_number TEXT UNIQUE NOT NULL,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  sequence_number INTEGER NOT NULL DEFAULT nextval('receipts_number_seq'),
  
  -- Relacionamentos
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Dados do doador (snapshot no momento da emissão)
  donor_name TEXT NOT NULL,
  donor_document TEXT, -- CPF/CNPJ
  donor_email TEXT NOT NULL,
  donor_phone TEXT,
  
  -- Dados da doação
  amount DECIMAL(10,2) NOT NULL,
  amount_in_words TEXT NOT NULL, -- "cem reais"
  currency TEXT DEFAULT 'BRL',
  payment_method TEXT, -- PIX, Cartão de Crédito, etc
  payment_date TIMESTAMPTZ NOT NULL,
  transaction_id TEXT,
  
  -- Dados da ONG (fixos, mas armazenados para histórico)
  org_name TEXT DEFAULT 'ORGANIZAÇÃO DA SOCIEDADE CIVIL CORAÇÃO VALENTE',
  org_cnpj TEXT DEFAULT '42.044.102/0001-59',
  org_address TEXT DEFAULT 'Rua Primeiro de Janeiro, nº 35, Sala 401 - Centro',
  org_city TEXT DEFAULT 'Timóteo',
  org_state TEXT DEFAULT 'MG',
  org_cep TEXT DEFAULT '35.180-032',
  org_phone TEXT DEFAULT '(31) 8600-9095',
  org_email TEXT DEFAULT 'contato@coracaovalente.org.br',
  
  -- Assinaturas (dados fixos)
  president_name TEXT DEFAULT 'Adriane Aparecida Carraro Alves',
  president_cpf TEXT DEFAULT '059.514.586-84',
  treasurer_name TEXT DEFAULT 'Roberto Cirilo',
  treasurer_cpf TEXT DEFAULT '458.379.106-20',
  
  -- Arquivos gerados
  pdf_url TEXT, -- URL do PDF no Supabase Storage
  pdf_storage_path TEXT, -- Caminho no storage
  
  -- Hash de verificação (SHA256)
  verification_hash TEXT UNIQUE,
  
  -- Status de envio
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  email_attempts INTEGER DEFAULT 0,
  last_email_error TEXT,
  
  -- Metadados
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_receipts_donation_id ON receipts(donation_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_verification_hash ON receipts(verification_hash);
CREATE INDEX IF NOT EXISTS idx_receipts_year ON receipts(year);
CREATE INDEX IF NOT EXISTS idx_receipts_email_sent ON receipts(email_sent);
CREATE INDEX IF NOT EXISTS idx_receipts_generated_at ON receipts(generated_at DESC);

-- 4. Função para gerar número do recibo automaticamente
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
  current_year INTEGER;
  next_seq INTEGER;
BEGIN
  -- Obter ano atual
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Obter próximo número da sequência
  next_seq := nextval('receipts_number_seq');
  
  -- Gerar número do recibo (formato: RCB-2025-00001)
  NEW.receipt_number := 'RCB-' || current_year || '-' || LPAD(next_seq::TEXT, 5, '0');
  NEW.year := current_year;
  NEW.sequence_number := next_seq;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para gerar número automaticamente
CREATE TRIGGER trigger_generate_receipt_number
  BEFORE INSERT ON receipts
  FOR EACH ROW
  WHEN (NEW.receipt_number IS NULL)
  EXECUTE FUNCTION generate_receipt_number();

-- 6. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_receipts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para updated_at
CREATE TRIGGER trigger_update_receipts_updated_at
  BEFORE UPDATE ON receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_receipts_updated_at();

-- 8. Função para gerar hash de verificação
CREATE OR REPLACE FUNCTION generate_receipt_verification_hash()
RETURNS TRIGGER AS $$
BEGIN
  -- Gerar hash SHA256 baseado em dados únicos do recibo
  NEW.verification_hash := encode(
    digest(
      NEW.receipt_number || 
      NEW.donor_document || 
      NEW.amount::TEXT || 
      NEW.payment_date::TEXT ||
      NEW.transaction_id,
      'sha256'
    ),
    'hex'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para gerar hash automaticamente
CREATE TRIGGER trigger_generate_verification_hash
  BEFORE INSERT ON receipts
  FOR EACH ROW
  WHEN (NEW.verification_hash IS NULL)
  EXECUTE FUNCTION generate_receipt_verification_hash();

-- 10. RLS Policies
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios recibos
CREATE POLICY "Users can view their own receipts"
  ON receipts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role pode fazer tudo
CREATE POLICY "Service role has full access"
  ON receipts
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- 11. Comentários para documentação
COMMENT ON TABLE receipts IS 'Tabela de recibos de doações - Instituto Coração Valente';
COMMENT ON COLUMN receipts.receipt_number IS 'Número único do recibo (formato: RCB-YYYY-NNNNN)';
COMMENT ON COLUMN receipts.verification_hash IS 'Hash SHA256 para verificação de autenticidade';
COMMENT ON COLUMN receipts.amount_in_words IS 'Valor por extenso (ex: cem reais)';
COMMENT ON COLUMN receipts.pdf_url IS 'URL pública do PDF no Supabase Storage';
COMMENT ON COLUMN receipts.email_sent IS 'Indica se o email com o recibo foi enviado';

-- 12. Grant permissions
GRANT SELECT ON receipts TO authenticated;
GRANT ALL ON receipts TO service_role;
GRANT USAGE ON SEQUENCE receipts_number_seq TO service_role;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
