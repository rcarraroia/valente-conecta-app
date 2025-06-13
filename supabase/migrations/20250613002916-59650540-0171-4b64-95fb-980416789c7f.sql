
-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outro', 'prefiro_nao_dizer')),
  city TEXT,
  state TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_conditions TEXT,
  medications TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver apenas seu próprio perfil" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir apenas seu próprio perfil" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Função para criar perfil automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger para executar a função quando um novo usuário é criado
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tabela para armazenar diagnósticos/consultas
CREATE TABLE public.diagnostics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms TEXT NOT NULL,
  ai_response TEXT,
  severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 5),
  recommendations TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'revisado', 'arquivado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS na tabela diagnostics
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para diagnostics
CREATE POLICY "Usuários podem ver apenas seus próprios diagnósticos" 
  ON public.diagnostics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios diagnósticos" 
  ON public.diagnostics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios diagnósticos" 
  ON public.diagnostics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Tabela para notícias/artigos
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  image_url TEXT,
  author TEXT,
  category TEXT DEFAULT 'geral' CHECK (category IN ('geral', 'cardiologia', 'prevencao', 'tratamento', 'pesquisa')),
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0
);

-- Habilitar RLS na tabela news_articles (público para leitura)
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos vejam artigos publicados
CREATE POLICY "Todos podem ver artigos publicados" 
  ON public.news_articles 
  FOR SELECT 
  USING (TRUE);

-- Inserir alguns artigos de exemplo
INSERT INTO public.news_articles (title, content, summary, category, is_featured) VALUES
('Prevenção de Doenças Cardíacas', 'A prevenção de doenças cardíacas começa com hábitos saudáveis...', 'Dicas essenciais para manter seu coração saudável', 'prevencao', TRUE),
('Novos Tratamentos em Cardiologia', 'Avanços recentes na medicina cardiovascular têm revolucionado...', 'Conheça as últimas inovações em tratamentos cardíacos', 'tratamento', FALSE),
('Exercícios para o Coração', 'A atividade física regular é fundamental para a saúde cardiovascular...', 'Como o exercício pode fortalecer seu coração', 'prevencao', FALSE);
