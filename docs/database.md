
# Estrutura do Banco de Dados

## Visão Geral

O banco de dados utiliza **PostgreSQL** através do Supabase, com **Row Level Security (RLS)** habilitado em todas as tabelas críticas para garantir isolamento de dados por usuário.

## Esquema Principal

### Tabelas de Usuários e Autenticação

#### `profiles`
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
  user_type TEXT DEFAULT 'comum' CHECK (user_type IN ('comum', 'parceiro')),
  is_volunteer BOOLEAN DEFAULT FALSE,
  ambassador_code TEXT UNIQUE,
  ambassador_wallet_id TEXT,
  ambassador_opt_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Propósito**: Perfil completo do usuário com dados pessoais e médicos
**RLS**: Usuários só veem seus próprios dados
**Índices**: `idx_profiles_id`, `idx_profiles_ambassador_code`

#### `partners`
```sql
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  specialty TEXT,
  specialties JSONB DEFAULT '[]'::jsonb,
  professional_photo_url TEXT,
  bio TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  crm_crp_register TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Propósito**: Dados específicos de profissionais de saúde
**RLS**: Parceiros gerenciam próprios dados, público vê apenas ativos
**Relacionamentos**: 1:1 com `auth.users`

### Tabelas de Agendamento

#### `schedules`
```sql
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  day_of_week TEXT CHECK (day_of_week IN ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  max_appointments INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `appointments`
```sql
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fluxo de Agendamento**:
1. Parceiro cria `schedules` (horários disponíveis)
2. Usuário cria `appointment` baseado em `schedule`
3. Parceiro confirma/cancela `appointment`

### Tabelas de Diagnóstico

#### `pre_diagnosis_questions`
```sql
CREATE TABLE public.pre_diagnosis_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  options JSONB,
  order_position INTEGER NOT NULL,
  category TEXT,
  next_question_logic JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `pre_diagnosis_sessions`
```sql
CREATE TABLE public.pre_diagnosis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  session_status TEXT DEFAULT 'started' CHECK (status IN ('started', 'completed', 'abandoned')),
  total_questions INTEGER,
  answered_questions INTEGER DEFAULT 0,
  diagnosis_result JSONB,
  notes TEXT
);
```

#### `diagnostics`
```sql
CREATE TABLE public.diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms TEXT NOT NULL,
  ai_response TEXT,
  severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 5),
  recommendations TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'revisado', 'arquivado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Sistema de Embaixadores

#### `ambassador_links`
```sql
CREATE TABLE public.ambassador_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id),
  generated_url TEXT NOT NULL,
  short_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `ambassador_performance`
```sql
CREATE TABLE public.ambassador_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_clicks INTEGER DEFAULT 0,
  total_donations_count INTEGER DEFAULT 0,
  total_donations_amount NUMERIC DEFAULT 0.00,
  points INTEGER DEFAULT 0,
  current_level TEXT DEFAULT 'Iniciante',
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `link_clicks`
```sql
CREATE TABLE public.link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.ambassador_links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT
);
```

### Sistema de Doações

#### `donations`
```sql
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ambassador_link_id UUID REFERENCES public.ambassador_links(id),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'BRL',
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  donor_name TEXT,
  donor_email TEXT,
  donated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Conteúdo e Biblioteca

#### `library_categories`
```sql
CREATE TABLE public.library_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `library_resources`
```sql
CREATE TABLE public.library_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.library_categories(id),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  author TEXT,
  views INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `news_articles`
```sql
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  image_url TEXT,
  author TEXT,
  category TEXT DEFAULT 'geral' CHECK (category IN ('geral', 'cardiologia', 'prevencao', 'tratamento', 'pesquisa')),
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Funções do Banco de Dados

### `handle_new_user()`
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Propósito**: Cria perfil automaticamente quando usuário se registra

### `is_ambassador()`
```sql
CREATE OR REPLACE FUNCTION public.is_ambassador(user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND is_volunteer = true 
    AND ambassador_code IS NOT NULL
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

**Propósito**: Verifica se usuário é embaixador (usado em RLS)

### `update_updated_at_column()`
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Propósito**: Atualiza automaticamente campo `updated_at`

## Índices de Performance

### Índices Existentes
```sql
-- Perfis
CREATE INDEX idx_profiles_id ON public.profiles(id);
CREATE INDEX idx_profiles_ambassador_code ON public.profiles(ambassador_code);

-- Diagnóstico
CREATE INDEX idx_pre_diagnosis_sessions_user_id ON public.pre_diagnosis_sessions(user_id);
CREATE INDEX idx_diagnostics_user_id ON public.diagnostics(user_id);

-- Embaixadores
CREATE INDEX idx_ambassador_links_user_id ON public.ambassador_links(ambassador_user_id);
CREATE INDEX idx_ambassador_performance_user_id ON public.ambassador_performance(ambassador_user_id);
CREATE INDEX idx_link_clicks_link_id ON public.link_clicks(link_id);

-- Doações
CREATE INDEX idx_donations_user_id ON public.donations(user_id);
CREATE INDEX idx_donations_ambassador_link_id ON public.donations(ambassador_link_id);

-- Biblioteca
CREATE INDEX idx_library_resources_category_id ON public.library_resources(category_id);
CREATE INDEX idx_library_resources_published_at ON public.library_resources(published_at);
CREATE INDEX idx_news_articles_published_at ON public.news_articles(published_at);
```

### Índices Recomendados
```sql
-- Para otimização de queries frequentes
CREATE INDEX idx_appointments_user_date ON public.appointments(user_id, appointment_date);
CREATE INDEX idx_appointments_partner_date ON public.appointments(partner_id, appointment_date);
CREATE INDEX idx_schedules_partner_day ON public.schedules(partner_id, day_of_week);
CREATE INDEX idx_donations_status_date ON public.donations(status, donated_at);
CREATE INDEX idx_partners_active_specialty ON public.partners(is_active, specialty) WHERE is_active = TRUE;
```

## Relacionamentos

### Diagrama de Relacionamentos Principais
```
auth.users (Supabase Auth)
    ├── profiles (1:1)
    ├── partners (1:1, opcional)
    ├── appointments (1:N como user)
    ├── donations (1:N)
    ├── ambassador_links (1:N)
    └── pre_diagnosis_sessions (1:N)

partners
    ├── schedules (1:N)
    └── appointments (1:N como partner)

ambassador_links
    ├── link_clicks (1:N)
    └── donations (1:N)

library_categories
    └── library_resources (1:N)
```

### Integridade Referencial
- **CASCADE DELETE**: Quando usuário é deletado, todos dados relacionados são removidos
- **RESTRICT**: Algumas operações bloqueadas se há dependências
- **SET NULL**: Em casos específicos onde relacionamento é opcional

## Triggers Ativos

```sql
-- Auto-criação de perfil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atualização automática de timestamps
CREATE TRIGGER update_partners_updated_at 
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at 
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Backup e Recovery

### Estratégia de Backup
- **Supabase**: Backup automático diário
- **Point-in-time Recovery**: Últimos 7 dias (plano atual)
- **Manual Snapshots**: Antes de migrations críticas

### Retenção de Dados
- **Logs**: 30 dias
- **Sessions**: 90 dias inativas
- **Analytics**: 1 ano
- **User Data**: Indefinidamente (até delete explícito)

## Migrations e Versionamento

### Arquivos de Migration
```
supabase/migrations/
├── 20250613002916_initial_schema.sql
├── 20250614230543_partners_system.sql
├── 20250615002058_rls_policies.sql
├── 20250615025258_ambassador_wallet.sql
├── 20250615031918_partners_policies.sql
├── 20250615044558_partners_rls_fix.sql
└── 20250615122210_partners_view_policies.sql
```

### Best Practices
1. **Sempre usar migrations**: Nunca alterar schema manualmente
2. **Testar em staging**: Todas migrations testadas antes de produção
3. **Rollback plans**: Sempre ter plano de rollback
4. **Documentar changes**: Comentários explicativos em cada migration

## Monitoramento de Performance

### Queries Lentas
```sql
-- Query para identificar queries lentas
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### Uso de Índices
```sql
-- Verificar índices não utilizados
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_scan = 0;
```

### Tamanho das Tabelas
```sql
-- Verificar tamanho das tabelas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```
