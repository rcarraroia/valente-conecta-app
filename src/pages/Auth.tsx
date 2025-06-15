import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Mail, Lock, User as UserIcon, Phone, MapPin, Briefcase, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Estados para login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados para cadastro comum
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  // Estados para tipo de usuário
  const [userType, setUserType] = useState<'comum' | 'parceiro'>('comum');

  // Estados específicos para parceiros (profissionais)
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [crmCrpRegister, setCrmCrpRegister] = useState('');
  const [specialties, setSpecialties] = useState('');

  useEffect(() => {
    // Verificar se já existe uma sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        window.location.href = '/';
      }
    });

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          window.location.href = '/';
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'Erro no login',
            description: 'Email ou senha incorretos. Verifique suas credenciais.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro no login',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else if (data.user) {
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Redirecionando...',
        });
        window.location.href = '/';
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            city: city,
            user_type: userType,
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: 'Email já cadastrado',
            description: 'Este email já possui uma conta. Tente fazer login.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro no cadastro',
            description: error.message,
            variant: 'destructive',
          });
        }
        return;
      } 

      if (data.user) {
        // Se for um parceiro, criar o registro na tabela partners
        if (userType === 'parceiro') {
          const specialtiesArray = specialties.split(',').map(s => s.trim()).filter(s => s.length > 0);
          
          const { error: partnerError } = await supabase
            .from('partners')
            .insert({
              user_id: data.user.id,
              full_name: fullName,
              specialty: specialty,
              specialties: specialtiesArray,
              bio: bio,
              contact_email: contactEmail || signupEmail,
              contact_phone: contactPhone || phone,
              crm_crp_register: crmCrpRegister,
              is_active: true
            });

          if (partnerError) {
            console.error('Erro ao criar perfil de parceiro:', partnerError);
            toast({
              title: 'Conta criada, mas...',
              description: 'Houve um problema ao criar seu perfil profissional. Entre em contato conosco.',
              variant: 'destructive',
            });
            return;
          }
        }

        // Fazer login automaticamente após o cadastro
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: signupEmail,
          password: signupPassword,
        });

        if (loginError) {
          toast({
            title: 'Conta criada!',
            description: 'Faça login com suas credenciais.',
          });
        } else {
          toast({
            title: userType === 'parceiro' ? 'Perfil profissional criado!' : 'Conta criada e login realizado!',
            description: 'Redirecionando...',
          });
          window.location.href = '/';
        }
      }
    } catch (error) {
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
    <div className="min-h-screen bg-cv-off-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cv-coral rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-h1 font-heading font-bold text-cv-gray-dark">Valente Conecta</h1>
          <p className="text-body text-cv-gray-light">Cuidando do seu coração</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Fazer Login</CardTitle>
                <CardDescription>
                  Entre com suas credenciais para acessar sua conta
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Sua senha"
                        className="pl-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-cv-coral hover:bg-cv-coral/90"
                    disabled={loading}
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>
                  Cadastre-se para começar a cuidar da sua saúde
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  {/* Seleção do tipo de usuário */}
                  <div className="space-y-2">
                    <Label htmlFor="user-type">Tipo de Cadastro</Label>
                    <Select value={userType} onValueChange={(value: 'comum' | 'parceiro') => setUserType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de cadastro" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comum">Usuário Comum</SelectItem>
                        <SelectItem value="parceiro">Profissional de Saúde</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campos comuns */}
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
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
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

                  {/* Campos específicos para profissionais */}
                  {userType === 'parceiro' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Especialidade Principal</Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
                          <Input
                            id="specialty"
                            type="text"
                            placeholder="Ex: Cardiologista, Psicólogo"
                            className="pl-10"
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            required={userType === 'parceiro'}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="specialties">Outras Especialidades</Label>
                        <Input
                          id="specialties"
                          type="text"
                          placeholder="Separe por vírgulas: Ex: Hipertensão, Diabetes"
                          value={specialties}
                          onChange={(e) => setSpecialties(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="crm-crp">CRM/CRP/Registro Profissional</Label>
                        <Input
                          id="crm-crp"
                          type="text"
                          placeholder="Ex: CRM-SP 123456"
                          value={crmCrpRegister}
                          onChange={(e) => setCrmCrpRegister(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Email de Contato Profissional</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
                          <Input
                            id="contact-email"
                            type="email"
                            placeholder="contato@profissional.com (opcional)"
                            className="pl-10"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact-phone">Telefone de Contato Profissional</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
                          <Input
                            id="contact-phone"
                            type="tel"
                            placeholder="(11) 99999-9999 (opcional)"
                            className="pl-10"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Apresentação Profissional</Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
                          <Textarea
                            id="bio"
                            placeholder="Conte um pouco sobre sua experiência e abordagem..."
                            className="pl-10 min-h-[80px]"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                          />
                        </div>
                      </div>
                    </>
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
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
