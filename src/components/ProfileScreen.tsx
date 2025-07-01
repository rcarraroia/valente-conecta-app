
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileMenuItems from '@/components/profile/ProfileMenuItems';
import QuickAppointmentCard from '@/components/profile/QuickAppointmentCard';
import ProfessionalDebugCard from '@/components/profile/ProfessionalDebugCard';

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
  const { user, signOut, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

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

  const handleBookAppointment = () => {
    if (onNavigate) {
      onNavigate('partners');
    }
  };

  // Se ainda está carregando autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cv-coral"></div>
      </div>
    );
  }

  // Se não há usuário, mostrar tela de login
  if (!user) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-cv-gray-dark mb-4">Acesso Necessário</h2>
          <p className="text-cv-gray-light mb-6">Você precisa fazer login para acessar seu perfil.</p>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="bg-cv-coral hover:bg-cv-coral/90"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
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
        <ProfileHeader 
          profile={profile}
          partner={partner}
          userEmail={user?.email}
        />

        <ProfessionalDebugCard 
          profile={profile}
          partner={partner}
          user={user}
        />

        <ProfileMenuItems 
          userType={profile?.user_type}
          onNavigate={onNavigate}
        />

        <QuickAppointmentCard onBookAppointment={handleBookAppointment} />

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
