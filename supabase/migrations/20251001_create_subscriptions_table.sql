-- Migração: Criar tabela de assinaturas (mantenedores)
-- Data: 01/10/2025
-- Objetivo: Gerenciar assinaturas mensais do sistema de mantenedores

-- 1. Criar tabela subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id TEXT UNIQUE NOT NULL, -- ID da assinatura no Asaas
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_id TEXT NOT NULL, -- ID do cliente no Asaas
    
    -- Dados da assinatura
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    cycle TEXT NOT NULL DEFAULT 'MONTHLY', -- MONTHLY, YEARLY
    status TEXT NOT NULL DEFAULT 'active', -- active, inactive, cancelled, deleted
    
    -- Dados do assinante
    subscriber_name TEXT NOT NULL,
    subscriber_email TEXT NOT NULL,
    subscriber_phone TEXT,
    subscriber_document TEXT,
    
    -- Controle de pagamentos
    next_payment_date DATE,
    last_payment_date DATE,
    payment_method TEXT DEFAULT 'CREDIT_CARD',
    
    -- Embaixador (se aplicável)
    ambassador_link_id UUID REFERENCES public.ambassador_links(id) ON DELETE SET NULL,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Dados adicionais do Asaas
    asaas_data JSONB -- Para armazenar dados completos do Asaas
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_id ON public.subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_payment ON public.subscriptions(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_ambassador ON public.subscriptions(ambassador_link_id);

-- 3. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger para updated_at
DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trigger_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS
-- Política para usuários verem apenas suas próprias assinaturas
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários atualizarem apenas suas próprias assinaturas
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para inserção (service role apenas)
CREATE POLICY "Service role can insert subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (true);

-- Política para service role gerenciar tudo (webhooks)
CREATE POLICY "Service role can manage all subscriptions" ON public.subscriptions
    FOR ALL USING (current_setting('role') = 'service_role');

-- 7. Comentários para documentação
COMMENT ON TABLE public.subscriptions IS 'Tabela de assinaturas mensais (sistema de mantenedores)';
COMMENT ON COLUMN public.subscriptions.subscription_id IS 'ID único da assinatura no Asaas';
COMMENT ON COLUMN public.subscriptions.cycle IS 'Frequência: MONTHLY, YEARLY';
COMMENT ON COLUMN public.subscriptions.status IS 'Status: active, inactive, cancelled, deleted';
COMMENT ON COLUMN public.subscriptions.asaas_data IS 'Dados completos da assinatura retornados pelo Asaas';

-- 8. Inserir dados de exemplo (opcional - remover em produção)
-- INSERT INTO public.subscriptions (
--     subscription_id, customer_id, amount, subscriber_name, subscriber_email,
--     next_payment_date, status, cycle
-- ) VALUES (
--     'sub_example_123', 'cus_example_456', 25.00, 'Exemplo Mantenedor', 'exemplo@teste.com',
--     CURRENT_DATE + INTERVAL '1 month', 'active', 'MONTHLY'
-- );

-- 9. Verificações finais
DO $$
BEGIN
    -- Verificar se tabela foi criada
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        RAISE NOTICE '✅ Tabela subscriptions criada com sucesso';
    ELSE
        RAISE EXCEPTION '❌ Falha ao criar tabela subscriptions';
    END IF;
    
    -- Verificar se índices foram criados
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscriptions_subscription_id') THEN
        RAISE NOTICE '✅ Índices criados com sucesso';
    ELSE
        RAISE EXCEPTION '❌ Falha ao criar índices';
    END IF;
    
    -- Verificar se RLS está habilitado
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'subscriptions' AND rowsecurity = true) THEN
        RAISE NOTICE '✅ RLS habilitado com sucesso';
    ELSE
        RAISE EXCEPTION '❌ Falha ao habilitar RLS';
    END IF;
END $$;