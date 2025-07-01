
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, TrendingUp, Users, Link as LinkIcon, DollarSign, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LinkGenerator from './LinkGenerator';
import AmbassadorWalletSetup from './AmbassadorWalletSetup';

interface PerformanceData {
  total_clicks: number;
  total_donations_count: number;
  total_donations_amount: number;
  points: number;
  current_level: string;
}

interface AmbassadorDashboardProps {
  onBack: () => void;
}

const AmbassadorDashboard = ({ onBack }: AmbassadorDashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Carregar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Carregar dados de performance
      const { data: perfData, error: perfError } = await supabase
        .from('ambassador_performance')
        .select('*')
        .eq('ambassador_user_id', user?.id)
        .single();

      if (perfError && perfError.code !== 'PGRST116') {
        console.error('Erro ao carregar performance:', perfError);
      } else {
        setPerformance(perfData);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do dashboard.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWalletUpdated = (walletId: string) => {
    setProfile(prev => ({ ...prev, ambassador_wallet_id: walletId }));
    toast({
      title: "Configuração salva!",
      description: "Sua Wallet ID foi configurada com sucesso.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cv-off-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-cv-gray-dark">
              Dashboard do Embaixador
            </h1>
            <p className="text-cv-gray-light">
              Bem-vindo, {profile?.full_name}! Código: {profile?.ambassador_code}
            </p>
          </div>
          {!profile?.ambassador_wallet_id && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
                ⚠️ Configure sua Wallet ID para receber comissões
              </p>
            </div>
          )}
        </div>

        {/* Cards de Performance */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
              <Users className="h-4 w-4 text-cv-coral" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance?.total_clicks || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doações Geradas</CardTitle>
              <Heart className="h-4 w-4 text-cv-coral" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance?.total_donations_count || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Arrecadado</CardTitle>
              <DollarSign className="h-4 w-4 text-cv-coral" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performance?.total_donations_amount 
                  ? `R$ ${performance.total_donations_amount.toFixed(2)}`
                  : 'R$ 0,00'
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nível</CardTitle>
              <TrendingUp className="h-4 w-4 text-cv-coral" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance?.current_level || 'Iniciante'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="links" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="links" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Meus Links
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Configurar Wallet
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links">
            <LinkGenerator />
          </TabsContent>

          <TabsContent value="wallet">
            <AmbassadorWalletSetup
              userId={user?.id || ''}
              currentWalletId={profile?.ambassador_wallet_id}
              onWalletUpdated={handleWalletUpdated}
            />
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-cv-blue-heart/10 rounded-lg">
                      <h4 className="font-semibold text-cv-gray-dark mb-2">Comissões Estimadas</h4>
                      <p className="text-2xl font-bold text-cv-blue-heart">
                        R$ {performance?.total_donations_amount 
                          ? (performance.total_donations_amount * 0.1).toFixed(2)
                          : '0,00'
                        }
                      </p>
                      <p className="text-sm text-cv-gray-light">10% das doações geradas</p>
                    </div>
                    
                    <div className="p-4 bg-cv-purple-soft/10 rounded-lg">
                      <h4 className="font-semibold text-cv-gray-dark mb-2">Status da Wallet</h4>
                      <p className="text-lg font-semibold">
                        {profile?.ambassador_wallet_id ? (
                          <span className="text-green-600">✅ Configurada</span>
                        ) : (
                          <span className="text-yellow-600">⚠️ Pendente</span>
                        )}
                      </p>
                      <p className="text-sm text-cv-gray-light">
                        {profile?.ambassador_wallet_id 
                          ? 'Pronto para receber comissões'
                          : 'Configure para receber comissões'
                        }
                      </p>
                    </div>
                  </div>

                  {profile?.ambassador_wallet_id && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">✅ Split de Pagamentos Ativo</h4>
                      <p className="text-sm text-green-800">
                        Suas comissões serão depositadas automaticamente na sua conta Asaas sempre que uma doação for realizada através do seu link.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AmbassadorDashboard;
