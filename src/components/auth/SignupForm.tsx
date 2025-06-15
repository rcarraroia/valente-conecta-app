
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserIcon, Mail, Phone, MapPin, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import UserTypeSelector from './UserTypeSelector';
import ProfessionalFields from './ProfessionalFields';

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

      // 2. Se for profissional, criar perfil na tabela partners
      if (userType === 'parceiro') {
        console.log('=== CRIANDO PERFIL PROFISSIONAL ===');
        
        // Fazer login para ter uma sessão válida
        const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          console.error('Erro no login automático:', loginError);
          toast({
            title: 'Conta criada, mas...',
            description: 'Faça login manualmente para acessar seu painel profissional.',
            variant: 'destructive',
          });
          return;
        }

        console.log('Login realizado, usuário:', sessionData.user?.id);

        // Aguardar para garantir que a sessão esteja estabelecida
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verificar sessão atual
        const { data: currentSession } = await supabase.auth.getSession();
        console.log('Sessão atual verificada:', currentSession.session?.user?.id);

        if (!currentSession.session?.user) {
          console.error('Nenhuma sessão válida encontrada após login');
          toast({
            title: 'Problema de autenticação',
            description: 'Faça login manualmente para completar seu perfil profissional.',
            variant: 'destructive',
          });
          return;
        }

        // Preparar dados do parceiro
        const specialtiesArray = professionalData.specialties
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        const partnerData = {
          user_id: currentSession.session.user.id,
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
          toast({
            title: 'Perfil profissional não criado',
            description: 'Sua conta foi criada, mas houve um problema ao criar o perfil profissional. Entre em contato conosco.',
            variant: 'destructive',
          });
          return;
        }

        console.log('Perfil de parceiro criado com sucesso:', partnerResult);

        // Atualizar o user_type no perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ user_type: 'parceiro' })
          .eq('id', currentSession.session.user.id);

        if (profileError) {
          console.error('Erro ao atualizar tipo de usuário no perfil:', profileError);
        }

        toast({
          title: 'Perfil profissional criado!',
          description: 'Redirecionando para seu painel...',
        });

        setTimeout(() => {
          window.location.href = '/';
        }, 1500);

      } else {
        // Para usuários comuns, apenas fazer login
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          console.error('Erro no login automático:', loginError);
          toast({
            title: 'Conta criada!',
            description: 'Faça login com suas credenciais.',
          });
        } else {
          toast({
            title: 'Conta criada com sucesso!',
            description: 'Redirecionando...',
          });
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
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

          {/* Common fields */}
          <div className="space-y-2">
            <Label htmlFor="full-name">Nome Completo</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
              <Input
                id="full-name"
                type="text"
                placeholder="Seu nome completo"
                className="pl-10"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
              <Input
                id="signup-email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                className="pl-10"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
              <Input
                id="city"
                type="text"
                placeholder="Sua cidade"
                className="pl-10"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          {/* Professional-specific fields */}
          {userType === 'parceiro' && (
            <ProfessionalFields
              data={professionalData}
              onChange={setProfessionalData}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="signup-password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
              <Input
                id="signup-password"
                type="password"
                placeholder="Crie uma senha segura"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>
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
