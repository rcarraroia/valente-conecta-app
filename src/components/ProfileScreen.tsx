
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { User, Settings, Heart, Users, LogOut, Star, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileScreenProps {
  onNavigate?: (screen: string) => void;
}

const ProfileScreen = ({ onNavigate }: ProfileScreenProps) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(profileData);
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: "Erro ao carregar perfil",
        description: "Não foi possível carregar suas informações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: "Não foi possível fazer logout. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleNavigation = (screen: string) => {
    console.log('Navegando para:', screen);
    if (onNavigate) {
      onNavigate(screen);
    }
  };

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
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-cv-coral text-white text-lg font-bold">
                  {getInitials(profile?.full_name || user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-cv-gray-dark">
                  {profile?.full_name || 'Usuário'}
                </h2>
                <p className="text-cv-gray-light">{user?.email}</p>
                {profile?.is_volunteer && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600 font-medium">Embaixador</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Options */}
        <div className="space-y-3">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleNavigation('my-data')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-cv-blue-heart p-2 rounded-full">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cv-gray-dark">Meus Dados</h3>
                    <p className="text-sm text-cv-gray-light">Editar informações pessoais</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-cv-gray-light" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleNavigation('my-donations')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-cv-green-mint p-2 rounded-full">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cv-gray-dark">Minhas Doações</h3>
                    <p className="text-sm text-cv-gray-light">Histórico de contribuições</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-cv-gray-light" />
              </div>
            </CardContent>
          </Card>

          {profile?.is_volunteer && (
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigation('ambassador')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-cv-coral p-2 rounded-full">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-cv-gray-dark">Painel do Embaixador</h3>
                      <p className="text-sm text-cv-gray-light">Gerencie seus links e comissões</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-cv-gray-light" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleSignOut}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-500 p-2 rounded-full">
                  <LogOut className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-cv-gray-dark">Sair</h3>
                  <p className="text-sm text-cv-gray-light">Fazer logout da conta</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
