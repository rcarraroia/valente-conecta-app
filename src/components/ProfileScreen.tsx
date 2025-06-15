
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
  ChevronRight
} from 'lucide-react';

interface ProfileScreenProps {
  onNavigate?: (screen: string) => void;
}

interface Profile {
  full_name: string | null;
  user_type: string | null;
}

const ProfileScreen = ({ onNavigate }: ProfileScreenProps) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, user_type')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
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
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src="" />
                <AvatarFallback className="bg-cv-coral text-white text-lg font-bold">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <h1 className="text-xl font-heading font-bold text-cv-gray-dark mb-1">
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
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-cv-off-white rounded-lg">
                      <item.icon className="w-5 h-5 text-cv-coral" />
                    </div>
                    <div>
                      <h3 className="font-medium text-cv-gray-dark">{item.title}</h3>
                      <p className="text-sm text-cv-gray-light">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-cv-gray-light" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
