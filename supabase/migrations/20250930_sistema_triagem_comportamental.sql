-- =====================================================
-- MIGRAÇÃO: SISTEMA DE TRIAGEM COMPORTAMENTAL (STC)
-- Data: 30/09/2025
-- Descrição: Implementa persistência e adequa nomenclatura
-- =====================================================

-- 1.1 COMPLEMENTAR TABELA user_consent
-- Adicionar campos para compliance LGPD e rastreabilidade
ALTER TABLE user_consent 
ADD COLUMN IF NOT EXISTS consent_type VARCHAR(50) NOT NULL DEFAULT 'triagem_comportamental',
ADD COLUMN IF NOT EXISTS consent_version VARCHAR(20) NOT NULL DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS accepted_terms JSONB DEFAULT '{}';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_consent_user_id ON user_consent(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consent_consent_date ON user_consent(consent_date DESC);

-- Comentários para documentação
COMMENT ON COLUMN user_consent.consent_type IS 'Tipo de consentimento: triagem_comportamental, compartilhamento_dados, etc';
COMMENT ON COLUMN user_consent.consent_version IS 'Versão do termo aceito pelo usuário';
COMMENT ON COLUMN user_consent.ip_address IS 'IP do usuário no momento do aceite';
COMMENT ON COLUMN user_consent.accepted_terms IS 'JSON com detalhes dos termos aceitos';

-- 1.2 AJUSTAR TABELA relatorios_diagnostico
-- Alterar session_id para UUID e criar FK
ALTER TABLE relatorios_diagnostico 
ALTER COLUMN session_id TYPE UUID USING session_id::uuid;

-- Adicionar FK (só se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_relatorios_session'
    ) THEN
        ALTER TABLE relatorios_diagnostico
        ADD CONSTRAINT fk_relatorios_session
        FOREIGN KEY (session_id)
        REFERENCES diagnosis_chat_sessions(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Adicionar campos para dados estruturados dos sub-agentes
ALTER TABLE relatorios_diagnostico 
ADD COLUMN IF NOT EXISTS sub_agents_analysis JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS screening_metadata JSONB DEFAULT '{}';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_relatorios_session_id ON relatorios_diagnostico(session_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_user_id ON relatorios_diagnostico(user_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_created_at ON relatorios_diagnostico(created_at DESC);

-- Comentários
COMMENT ON COLUMN relatorios_diagnostico.sub_agents_analysis IS 'Análises estruturadas dos sub-agentes: TEA, TDAH, Linguagem, Síndromes';
COMMENT ON COLUMN relatorios_diagnostico.screening_metadata IS 'Metadados da triagem: duração, perguntas respondidas, etc';

-- 1.3 EXPANDIR TABELA diagnostics
-- Adicionar campos específicos para triagem comportamental
ALTER TABLE diagnostics 
ADD COLUMN IF NOT EXISTS screening_type VARCHAR(50) DEFAULT 'comportamental',
ADD COLUMN IF NOT EXISTS behavioral_score INTEGER CHECK (behavioral_score BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS risk_indicators JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS sub_agent_tea JSONB,
ADD COLUMN IF NOT EXISTS sub_agent_tdah JSONB,
ADD COLUMN IF NOT EXISTS sub_agent_linguagem JSONB,
ADD COLUMN IF NOT EXISTS sub_agent_sindromes JSONB,
ADD COLUMN IF NOT EXISTS session_id UUID,
ADD COLUMN IF NOT EXISTS interview_duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS completed_steps JSONB DEFAULT '[]';

-- Adicionar FK para session (só se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_diagnostics_session'
    ) THEN
        ALTER TABLE diagnostics
        ADD CONSTRAINT fk_diagnostics_session
        FOREIGN KEY (session_id)
        REFERENCES diagnosis_chat_sessions(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_diagnostics_session_id ON diagnostics(session_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_user_id ON diagnostics(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_status ON diagnostics(status);

-- Comentários
COMMENT ON COLUMN diagnostics.screening_type IS 'Tipo de triagem: comportamental, desenvolvimentos, etc';
COMMENT ON COLUMN diagnostics.behavioral_score IS 'Score geral da triagem (0-100)';
COMMENT ON COLUMN diagnostics.risk_indicators IS 'Array de indicadores de risco identificados';
COMMENT ON COLUMN diagnostics.sub_agent_tea IS 'Análise completa do sub-agente TEA';
COMMENT ON COLUMN diagnostics.sub_agent_tdah IS 'Análise completa do sub-agente TDAH';
COMMENT ON COLUMN diagnostics.sub_agent_linguagem IS 'Análise completa do sub-agente Linguagem';
COMMENT ON COLUMN diagnostics.sub_agent_sindromes IS 'Análise completa do sub-agente Síndromes';
COMMENT ON COLUMN diagnostics.interview_duration_minutes IS 'Duração total da entrevista em minutos';
COMMENT ON COLUMN diagnostics.completed_steps IS 'Array com etapas concluídas da entrevista';

-- 1.4 ATUALIZAR TABELA diagnosis_chat_sessions
-- Adicionar campos para melhor rastreamento
ALTER TABLE diagnosis_chat_sessions 
ADD COLUMN IF NOT EXISTS consent_recorded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS total_messages INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar função para atualizar last_activity_at automaticamente
CREATE OR REPLACE FUNCTION update_last_activity() 
RETURNS TRIGGER AS $$ 
BEGIN 
  NEW.last_activity_at = NOW(); 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Criar trigger (só se não existir)
DROP TRIGGER IF EXISTS trigger_update_last_activity ON diagnosis_chat_sessions;
CREATE TRIGGER trigger_update_last_activity 
BEFORE UPDATE ON diagnosis_chat_sessions 
FOR EACH ROW EXECUTE FUNCTION update_last_activity();

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON diagnosis_chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON diagnosis_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON diagnosis_chat_sessions(session_id);

-- Comentários
COMMENT ON COLUMN diagnosis_chat_sessions.consent_recorded IS 'Indica se o consentimento foi registrado para esta sessão';
COMMENT ON COLUMN diagnosis_chat_sessions.total_messages IS 'Contador de mensagens na sessão';

-- 1.5 CRIAR VIEW PARA CONSULTAS CONSOLIDADAS
-- View para facilitar consultas de triagem completa
CREATE OR REPLACE VIEW v_triagem_completa AS
SELECT 
  dc.id AS session_id,
  dc.session_id AS session_code,
  dc.user_id,
  p.full_name AS user_name,
  dc.status AS session_status,
  dc.updated_at AS started_at,
  dc.completed_at,
  dc.consent_recorded,
  d.id AS diagnostic_id,
  d.behavioral_score,
  d.recommendations,
  d.sub_agent_tea,
  d.sub_agent_tdah,
  d.sub_agent_linguagem,
  d.sub_agent_sindromes,
  r.id AS report_id,
  r.pdf_url,
  r.title AS report_title,
  uc.consent_date,
  uc.consent_version
FROM diagnosis_chat_sessions dc
LEFT JOIN profiles p ON dc.user_id = p.id
LEFT JOIN diagnostics d ON dc.id = d.session_id
LEFT JOIN relatorios_diagnostico r ON dc.id = r.session_id
LEFT JOIN user_consent uc ON dc.user_id = uc.user_id
WHERE uc.updated_at IS NULL OR uc.updated_at IS NULL;

COMMENT ON VIEW v_triagem_completa IS 'View consolidada com todas as informações de uma triagem comportamental';

-- =====================================================
-- VALIDAÇÕES PÓS-MIGRAÇÃO
-- =====================================================

-- Verificar se todas as tabelas foram alteradas corretamente
DO $$
DECLARE
    table_count INTEGER;
    column_count INTEGER;
BEGIN
    -- Verificar user_consent
    SELECT COUNT(*) INTO column_count 
    FROM information_schema.columns 
    WHERE table_name = 'user_consent' AND column_name = 'consent_type';
    
    IF column_count = 0 THEN
        RAISE EXCEPTION 'Falha na migração: coluna consent_type não foi criada em user_consent';
    END IF;
    
    -- Verificar diagnostics
    SELECT COUNT(*) INTO column_count 
    FROM information_schema.columns 
    WHERE table_name = 'diagnostics' AND column_name = 'behavioral_score';
    
    IF column_count = 0 THEN
        RAISE EXCEPTION 'Falha na migração: coluna behavioral_score não foi criada em diagnostics';
    END IF;
    
    -- Verificar view
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.views 
    WHERE table_name = 'v_triagem_completa';
    
    IF table_count = 0 THEN
        RAISE EXCEPTION 'Falha na migração: view v_triagem_completa não foi criada';
    END IF;
    
    RAISE NOTICE 'Migração concluída com sucesso! Todas as validações passaram.';
END $$;