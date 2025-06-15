
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ProfessionalData {
  specialty: string;
  bio: string;
  contactEmail: string;
  contactPhone: string;
  crmCrpRegister: string;
  specialties: string;
}

interface SignupData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  city: string;
  userType: 'comum' | 'parceiro';
  professionalData?: ProfessionalData;
}

export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignup = async (data: SignupData) => {
    setLoading(true);

    try {
      console.log('=== INICIANDO CADASTRO ===');
      console.log('Email:', data.email);
      console.log('Tipo de usuário:', data.userType);
      console.log('Dados profissionais:', data.professionalData);

      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
            city: data.city,
            user_type: data.userType,
          }
        }
      });

      if (authError) {
        console.error('Erro no signup:', authError);
        if (authError.message.includes('User already registered')) {
          toast({
            title: 'Email já cadastrado',
            description: 'Este email já possui uma conta. Tente fazer login.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro no cadastro',
            description: authError.message,
            variant: 'destructive',
          });
        }
        return;
      }

      if (!authData.user) {
        console.error('Usuário não foi criado');
        toast({
          title: 'Erro',
          description: 'Não foi possível criar a conta.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Usuário criado com sucesso:', authData.user.id);

      // 2. Fazer login imediatamente para ter uma sessão válida
      const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (loginError) {
        console.error('Erro no login automático:', loginError);
        toast({
          title: 'Conta criada, mas...',
          description: 'Faça login manualmente para acessar sua conta.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Login realizado com sucesso:', sessionData.user?.id);

      // 3. Aguardar para garantir que a sessão esteja estabelecida
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Atualizar o user_type no perfil primeiro
      console.log('=== ATUALIZANDO PERFIL ===');
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          user_type: data.userType,
          full_name: data.fullName,
          phone: data.phone,
          city: data.city
        })
        .eq('id', sessionData.user.id);

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        toast({
          title: 'Erro ao atualizar perfil',
          description: 'Houve um problema ao atualizar suas informações.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Perfil atualizado com sucesso');

      // 5. Se for profissional, criar perfil na tabela partners
      if (data.userType === 'parceiro' && data.professionalData) {
        console.log('=== CRIANDO PERFIL PROFISSIONAL ===');
        
        // Preparar dados do parceiro
        const specialtiesArray = data.professionalData.specialties
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        const partnerData = {
          user_id: sessionData.user.id,
          full_name: data.fullName,
          specialty: data.professionalData.specialty || 'Não especificado',
          specialties: specialtiesArray,
          bio: data.professionalData.bio || null,
          contact_email: data.professionalData.contactEmail || data.email,
          contact_phone: data.phone, // Usar o telefone principal
          crm_crp_register: data.professionalData.crmCrpRegister || null,
          is_active: true
        };

        console.log('Dados do parceiro para inserção:', partnerData);

        // Inserir dados do parceiro
        const { data: partnerResult, error: partnerError } = await supabase
          .from('partners')
          .insert(partnerData)
          .select()
          .single();

        if (partnerError) {
          console.error('Erro ao criar perfil de parceiro:', partnerError);
          console.error('Detalhes do erro:', partnerError.details);
          console.error('Hint:', partnerError.hint);
          toast({
            title: 'Perfil profissional não criado',
            description: 'Sua conta foi criada, mas houve um problema ao criar o perfil profissional. Entre em contato conosco.',
            variant: 'destructive',
          });
          return;
        }

        console.log('Perfil de parceiro criado com sucesso:', partnerResult);

        toast({
          title: 'Perfil profissional criado!',
          description: 'Redirecionando para seu painel...',
        });

      } else {
        // Para usuários comuns
        toast({
          title: 'Conta criada com sucesso!',
          description: 'Redirecionando...',
        });
      }

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { handleSignup, loading };
};
