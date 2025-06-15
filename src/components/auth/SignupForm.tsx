
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import UserTypeSelector from './UserTypeSelector';
import ProfessionalFields from './ProfessionalFields';
import CommonFormFields from './CommonFormFields';

const SignupForm = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [userType, setUserType] = useState<'comum' | 'parceiro'>('comum');

  // Professional fields
  const [professionalData, setProfessionalData] = useState({
    specialty: '',
    bio: '',
    contactEmail: '',
    contactPhone: '',
    crmCrpRegister: '',
    specialties: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('=== INICIANDO CADASTRO ===');
      console.log('Email:', email);
      console.log('Tipo de usuário:', userType);
      console.log('Dados profissionais:', professionalData);

      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            city: city,
            user_type: userType,
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
        email,
        password,
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
          user_type: userType,
          full_name: fullName,
          phone: phone,
          city: city
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
      if (userType === 'parceiro') {
        console.log('=== CRIANDO PERFIL PROFISSIONAL ===');
        
        // Preparar dados do parceiro
        const specialtiesArray = professionalData.specialties
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        const partnerData = {
          user_id: sessionData.user.id,
          full_name: fullName,
          specialty: professionalData.specialty || 'Não especificado',
          specialties: specialtiesArray,
          bio: professionalData.bio || null,
          contact_email: professionalData.contactEmail || email,
          contact_phone: professionalData.contactPhone || phone,
          crm_crp_register: professionalData.crmCrpRegister || null,
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

        setTimeout(() => {
          window.location.href = '/';
        }, 1500);

      } else {
        // Para usuários comuns
        toast({
          title: 'Conta criada com sucesso!',
          description: 'Redirecionando...',
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Conta</CardTitle>
        <CardDescription>
          Cadastre-se para começar a cuidar da sua saúde
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <UserTypeSelector value={userType} onChange={setUserType} />

          <CommonFormFields
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            city={city}
            setCity={setCity}
            password={password}
            setPassword={setPassword}
          />

          {userType === 'parceiro' && (
            <ProfessionalFields
              data={professionalData}
              onChange={setProfessionalData}
            />
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-cv-green-mint hover:bg-cv-green-mint/90"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : userType === 'parceiro' ? 'Criar Perfil Profissional' : 'Criar Conta'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignupForm;
