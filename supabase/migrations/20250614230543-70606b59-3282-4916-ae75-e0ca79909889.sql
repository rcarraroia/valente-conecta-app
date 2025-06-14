
-- Criar tabela para telas de onboarding dinâmicas
CREATE TABLE public.onboarding_screens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_position INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  animation_asset_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para categorias da biblioteca
CREATE TABLE public.library_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon_name TEXT,
  description TEXT,
  order_position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para recursos da biblioteca
CREATE TABLE public.library_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('article', 'video', 'guide', 'infographic')),
  file_url TEXT,
  thumbnail_url TEXT,
  category_id UUID REFERENCES public.library_categories(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  author TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para sessões de pré-diagnóstico
CREATE TABLE public.pre_diagnosis_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  diagnosis_result JSONB,
  session_status TEXT NOT NULL DEFAULT 'started' CHECK (session_status IN ('started', 'in_progress', 'completed', 'cancelled')),
  total_questions INTEGER,
  answered_questions INTEGER DEFAULT 0,
  notes TEXT
);

-- Criar tabela para perguntas do pré-diagnóstico
CREATE TABLE public.pre_diagnosis_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text_input', 'single_choice', 'multi_choice', 'yes_no')),
  options JSONB,
  order_position INTEGER NOT NULL,
  next_question_logic JSONB,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para campanhas de embaixadores
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  goal_amount DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para links personalizados dos embaixadores
CREATE TABLE public.ambassador_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  generated_url TEXT NOT NULL UNIQUE,
  short_url TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

-- Criar tabela para rastrear cliques nos links
CREATE TABLE public.link_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES public.ambassador_links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT
);

-- Criar tabela para doações
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ambassador_link_id UUID REFERENCES public.ambassador_links(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  payment_method TEXT,
  transaction_id TEXT UNIQUE,
  donated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  donor_name TEXT,
  donor_email TEXT
);

-- Criar tabela para performance dos embaixadores
CREATE TABLE public.ambassador_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_donations_count INTEGER NOT NULL DEFAULT 0,
  total_donations_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  points INTEGER NOT NULL DEFAULT 0,
  current_level TEXT NOT NULL DEFAULT 'Iniciante',
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para serviços
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  image_url TEXT,
  contact_info TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para aplicações de voluntários
CREATE TABLE public.volunteer_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  area_of_interest TEXT,
  experience TEXT,
  availability TEXT,
  notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Atualizar tabela de perfis para incluir campos de embaixador
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_volunteer BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ambassador_opt_in_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ambassador_code TEXT UNIQUE;

-- Habilitar RLS para todas as tabelas
ALTER TABLE public.onboarding_screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_diagnosis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_diagnosis_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para conteúdo público (onboarding, biblioteca, serviços)
CREATE POLICY "Anyone can view onboarding screens" ON public.onboarding_screens FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view library categories" ON public.library_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view library resources" ON public.library_resources FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (is_active = true);

-- Políticas RLS para dados do usuário
CREATE POLICY "Users can view their own diagnosis sessions" ON public.pre_diagnosis_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own diagnosis sessions" ON public.pre_diagnosis_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own diagnosis sessions" ON public.pre_diagnosis_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own ambassador links" ON public.ambassador_links FOR SELECT USING (auth.uid() = ambassador_user_id);
CREATE POLICY "Users can create their own ambassador links" ON public.ambassador_links FOR INSERT WITH CHECK (auth.uid() = ambassador_user_id);

CREATE POLICY "Users can view their own performance" ON public.ambassador_performance FOR SELECT USING (auth.uid() = ambassador_user_id);
CREATE POLICY "Users can view their own volunteer applications" ON public.volunteer_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create volunteer applications" ON public.volunteer_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para visualização pública de dados agregados
CREATE POLICY "Anyone can view diagnosis questions" ON public.pre_diagnosis_questions FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view campaigns" ON public.campaigns FOR SELECT USING (is_active = true);

-- Inserir dados iniciais para as telas de onboarding
INSERT INTO public.onboarding_screens (order_position, title, description, image_url) VALUES
(1, 'Coração Valente Conecta', 'Juntos Pela Inclusão\n\nUm espaço de acolhimento, apoio e orientação para famílias que vivenciam o neurodesenvolvimento.', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop'),
(2, 'Acolhimento e Apoio', 'Nossa missão é oferecer suporte especializado e orientação para famílias, criando uma rede de cuidado e compreensão.', 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop'),
(3, 'Funcionalidades Completas', 'Pré-Diagnóstico com IA, Biblioteca de Recursos, Conexão com Especialistas e muito mais.', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop'),
(4, 'Sua Jornada Começa Agora!', 'Junte-se à nossa comunidade e descubra como podemos ajudar você e sua família nesta caminhada.', 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=400&h=300&fit=crop');

-- Inserir categorias iniciais para a biblioteca
INSERT INTO public.library_categories (name, icon_name, description, order_position) VALUES
('Transtorno do Espectro Autista', 'brain', 'Informações sobre TEA, sinais precoces e estratégias de apoio', 1),
('TDAH', 'activity', 'Recursos sobre Transtorno do Déficit de Atenção e Hiperatividade', 2),
('Desenvolvimento Infantil', 'users', 'Marcos do desenvolvimento e estimulação precoce', 3),
('Família e Cuidadores', 'users', 'Orientações para famílias e cuidadores', 4),
('Educação Inclusiva', 'book', 'Estratégias para inclusão educacional', 5);

-- Inserir serviços iniciais
INSERT INTO public.services (name, description, detailed_description, order_position) VALUES
('Orientação Familiar', 'Suporte especializado para famílias', 'Oferecemos orientação personalizada para famílias que vivenciam o neurodesenvolvimento, com profissionais especializados.', 1),
('Avaliação Multidisciplinar', 'Avaliação completa com equipe especializada', 'Nossa equipe multidisciplinar realiza avaliações abrangentes para identificar necessidades específicas e elaborar planos de intervenção.', 2),
('Grupos de Apoio', 'Encontros com outras famílias', 'Participe de grupos de apoio onde famílias compartilham experiências e recebem suporte mútuo.', 3),
('Capacitação Profissional', 'Treinamentos para educadores e terapeutas', 'Oferecemos cursos e workshops para capacitar profissionais na área do neurodesenvolvimento.', 4);
