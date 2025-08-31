-- Migration for Diagnosis Chat Integration
-- Creates tables for n8n chat integration and PDF reports

-- Tabela para armazenar relatórios de diagnóstico em PDF
CREATE TABLE IF NOT EXISTS public.relatorios_diagnostico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id VARCHAR(255) UNIQUE,
  pdf_url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  diagnosis_data JSONB,
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('completed', 'processing', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela para sessões de chat com n8n (diferente da pre_diagnosis_sessions existente)
CREATE TABLE IF NOT EXISTS public.diagnosis_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  messages JSONB DEFAULT '[]' NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'error')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_relatorios_user_id ON public.relatorios_diagnostico(user_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_created_at ON public.relatorios_diagnostico(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_relatorios_session_id ON public.relatorios_diagnostico(session_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.diagnosis_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON public.diagnosis_chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON public.diagnosis_chat_sessions(status);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.relatorios_diagnostico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para relatorios_diagnostico (com DROP IF EXISTS para evitar conflitos)
DROP POLICY IF EXISTS "Users can view their own diagnosis reports" ON public.relatorios_diagnostico;
CREATE POLICY "Users can view their own diagnosis reports" 
  ON public.relatorios_diagnostico 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own diagnosis reports" ON public.relatorios_diagnostico;
CREATE POLICY "Users can insert their own diagnosis reports" 
  ON public.relatorios_diagnostico 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own diagnosis reports" ON public.relatorios_diagnostico;
CREATE POLICY "Users can update their own diagnosis reports" 
  ON public.relatorios_diagnostico 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas RLS para diagnosis_chat_sessions (com DROP IF EXISTS para evitar conflitos)
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.diagnosis_chat_sessions;
CREATE POLICY "Users can view their own chat sessions" 
  ON public.diagnosis_chat_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own chat sessions" ON public.diagnosis_chat_sessions;
CREATE POLICY "Users can insert their own chat sessions" 
  ON public.diagnosis_chat_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.diagnosis_chat_sessions;
CREATE POLICY "Users can update their own chat sessions" 
  ON public.diagnosis_chat_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela relatorios_diagnostico
CREATE TRIGGER update_relatorios_diagnostico_updated_at 
  BEFORE UPDATE ON public.relatorios_diagnostico 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE public.relatorios_diagnostico IS 'Stores PDF diagnosis reports generated from n8n chat sessions';
COMMENT ON TABLE public.diagnosis_chat_sessions IS 'Stores chat session history for n8n diagnosis conversations';

COMMENT ON COLUMN public.relatorios_diagnostico.session_id IS 'Unique identifier linking to the chat session that generated this report';
COMMENT ON COLUMN public.relatorios_diagnostico.pdf_url IS 'URL to the PDF file stored in Supabase Storage';
COMMENT ON COLUMN public.relatorios_diagnostico.diagnosis_data IS 'JSON data containing the full diagnosis information';

COMMENT ON COLUMN public.diagnosis_chat_sessions.session_id IS 'Unique identifier for the chat session with n8n';
COMMENT ON COLUMN public.diagnosis_chat_sessions.messages IS 'Array of chat messages in JSON format';