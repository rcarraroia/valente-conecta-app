
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Link, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AmbassadorWalletForm from './AmbassadorWalletForm';

interface AmbassadorDashboardProps {
  onBack: () => void;
}

const AmbassadorDashboard = ({ onBack }: AmbassadorDashboardProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAmbassadorData();
    }
  }, [user]);

  const loadAmbassadorData = async () => {
    try {
      // Carregar perfil do embaixador
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      setProfile(profileData);

      // Carregar performance do embaixador
      const { data: performanceData } = await supabase
        .from('ambassador_performance')
        .select('*')
        .eq('ambassador_user_id', user?.id)
        .single();

      setPerformance(performanceData);
    } catch (error) {
      console.error('Erro ao carregar dados do embaixador:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletUpdated = (walletId: string) => {
    setProfile({ ...profile, ambassador_wallet_id: walletId });
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-cv-gray-light hover:text-cv-gray-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-heading font-bold text-cv-gray-dark">
            Painel do Embaixador
          </h1>
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Link className="w-8 h-8 mx-auto mb-2 text-cv-blue-heart" />
              <p className="text-2xl font-bold text-cv-gray-dark">
                {performance?.total_clicks || 0}
              </p>
              <p className="text-sm text-cv-gray-light">Cliques</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-cv-green-mint" />
              <p className="text-2xl font-bold text-cv-gray-dark">
                {performance?.total_donations_count || 0}
              </p>
              <p className="text-sm text-cv-gray-light">Doações</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-cv-coral" />
              <p className="text-2xl font-bold text-cv-gray-dark">
                R$ {(performance?.total_donations_amount || 0).toFixed(2)}
              </p>
              <p className="text-sm text-cv-gray-light">Total Arrecadado</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-cv-purple-soft" />
              <p className="text-2xl font-bold text-cv-gray-dark">
                {performance?.points || 0}
              </p>
              <p className="text-sm text-cv-gray-light">Pontos</p>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Configuration */}
        <AmbassadorWalletForm 
          currentWalletId={profile?.ambassador_wallet_id}
          onWalletUpdated={handleWalletUpdated}
        />

        {/* Ambassador Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Embaixador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-cv-gray-light">Código do Embaixador</p>
                <p className="font-semibold text-cv-gray-dark">{profile?.ambassador_code}</p>
              </div>
              <div>
                <p className="text-sm text-cv-gray-light">Nível Atual</p>
                <p className="font-semibold text-cv-gray-dark">{performance?.current_level || 'Iniciante'}</p>
              </div>
              <div>
                <p className="text-sm text-cv-gray-light">Membro desde</p>
                <p className="font-semibold text-cv-gray-dark">
                  {profile?.ambassador_opt_in_at ? 
                    new Date(profile.ambassador_opt_in_at).toLocaleDateString('pt-BR') : 
                    'N/A'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-cv-gray-light">Status da Wallet</p>
                <p className={`font-semibold ${profile?.ambassador_wallet_id ? 'text-green-600' : 'text-red-600'}`}>
                  {profile?.ambassador_wallet_id ? 'Configurada' : 'Não configurada'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AmbassadorDashboard;
