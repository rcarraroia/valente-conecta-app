
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Heart, 
  Gift, 
  LogOut, 
  Settings,
  Database,
  Stethoscope,
  ChevronRight,
  Calendar,
  Clock
} from 'lucide-react';

interface ProfileScreenProps {
  onNavigate?: (screen: string) => void;
}

interface Profile {
  full_name: string | null;
  user_type: string | null;
}

interface Partner {
  id: string;
  full_name: string;
  specialty: string;
}

const ProfileScreen = ({ onNavigate }: ProfileScreenProps) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      console.log('=== CARREGANDO PERFIL ===');
      console.log('User ID:', user?.id);

      // Carregar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, user_type')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error('Erro ao carregar perfil:', profileError);
      } else {
        console.log('Perfil carregado:', profileData);
        setProfile(profileData);

        // Se for um parceiro, carregar dados da tabela partners
        if (profileData?.user_type === 'parceiro') {
          console.log('Usuário é parceiro, carregando dados profissionais...');
          
          const { data: partnerData, error: partnerError } = await supabase
            .from('partners')
            .select('id, full_name, specialty')
            .eq('user_id', user?.id)
            .single();

          if (partnerError) {
            console.error('Erro ao carregar dados do parceiro:', partnerError);
            console.log('Parceiro não encontrado, mas perfil indica que é parceiro');
          } else {
            console.log('Dados do parceiro carregados:', partnerData);
            setPartner(partnerData);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleBookAppointment = () => {
    if (onNavigate) {
      onNavigate('partners');
    }
  };

  const menuItems = [
    {
      id: 'my-data',
      icon: User,
      title: 'Meus Dados',
      description: 'Editar informações pessoais'
    },
    {
      id: 'my-donations',
      icon: Gift,
      title: 'Minhas Doações',
      description: 'Histórico de contribuições'
    },
    {
      id: 'ambassador',
      icon: Heart,
      title: 'Seja um Embaixador',
      description: 'Divulgue nossa causa e ganhe recompensas'
    }
  ];

  // Adicionar item do painel profissional se for um parceiro
  if (profile?.user_type === 'parceiro') {
    menuItems.unshift({
      id: 'professional-dashboard',
      icon: Stethoscope,
      title: 'Painel Profissional',
      description: 'Gerencie seus horários e agendamentos'
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cv-coral"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cv-off-white p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Avatar className="w-16 h-16 mx-auto mb-3">
                <AvatarImage src="" />
                <AvatarFallback className="bg-cv-coral text-white text-lg font-bold">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <h1 className="text-lg font-heading font-bold text-cv-gray-dark mb-1">
                {profile?.full_name || 'Usuário'}
              </h1>
              
              <p className="text-cv-gray-light text-sm">
                {user?.email}
              </p>

              {profile?.user_type === 'parceiro' && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cv-blue-heart text-white">
                    <Stethoscope className="w-3 h-3 mr-1" />
                    Profissional Parceiro
                    {partner && ` - ${partner.specialty}`}
                  </span>
                  {!partner && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ Perfil profissional incompleto
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Debug Info for Professionals */}
        {profile?.user_type === 'parceiro' && !partner && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Perfil Profissional Não Encontrado
                </h3>
                <p className="text-xs text-red-600 mb-3">
                  Seu perfil indica que você é um profissional, mas não encontramos seus dados na tabela de parceiros.
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => console.log('Profile:', profile, 'Partner:', partner, 'User:', user)}
                  className="text-xs"
                >
                  Debug Info (Console)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item) => (
            <Card 
              key={item.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onNavigate?.(item.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cv-off-white rounded-lg">
                      <item.icon className="w-5 h-5 text-cv-coral" />
                    </div>
                    <div>
                      <h3 className="font-medium text-cv-gray-dark text-sm">{item.title}</h3>
                      <p className="text-xs text-cv-gray-light">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-cv-gray-light" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Appointment Card */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-r from-cv-coral to-cv-coral/80 border-0 text-white"
          onClick={handleBookAppointment}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm">Agendar Consulta</h3>
                  <p className="text-xs text-white/80">Conecte-se com nossos profissionais</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/80" />
            </div>
          </CardContent>
        </Card>

        {/* Sign Out Button */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da Conta
        </Button>
      </div>
    </div>
  );
};

export default ProfileScreen;
