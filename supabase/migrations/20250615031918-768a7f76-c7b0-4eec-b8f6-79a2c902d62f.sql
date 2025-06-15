
-- Adicionar campo user_type na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN user_type TEXT DEFAULT 'comum' CHECK (user_type IN ('comum', 'parceiro'));

-- Criar tabela de parceiros (profissionais de saúde)
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  specialty TEXT,
  specialties JSONB DEFAULT '[]'::jsonb,
  professional_photo_url TEXT,
  bio TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  crm_crp_register TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Criar tabela de horários disponíveis dos profissionais
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  max_appointments INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de agendamentos
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para partners
CREATE POLICY "Anyone can view active partners" ON public.partners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can update their own profile" ON public.partners
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Partners can insert their own profile" ON public.partners
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para schedules
CREATE POLICY "Anyone can view schedules of active partners" ON public.schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partners p 
      WHERE p.id = partner_id AND p.is_active = true
    )
  );

CREATE POLICY "Partners can manage their own schedules" ON public.schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.partners p 
      WHERE p.id = partner_id AND p.user_id = auth.uid()
    )
  );

-- Políticas RLS para appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Partners can view their appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partners p 
      WHERE p.id = partner_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Partners can update their appointments" ON public.appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.partners p 
      WHERE p.id = partner_id AND p.user_id = auth.uid()
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
