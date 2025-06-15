
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MyDonationsScreenProps {
  onBack: () => void;
}

interface Donation {
  id: string;
  amount: number;
  currency: string;
  donated_at: string;
  status: string;
  payment_method: string;
  transaction_id: string;
}

const MyDonationsScreen = ({ onBack }: MyDonationsScreenProps) => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_amount: 0,
    total_donations: 0,
    last_donation: null as string | null
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadDonations();
    }
  }, [user]);

  const loadDonations = async () => {
    try {
      const { data: donationsData, error } = await supabase
        .from('donations')
        .select('*')
        .eq('user_id', user?.id)
        .order('donated_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDonations(donationsData || []);
      
      // Calculate stats
      const totalAmount = donationsData?.reduce((sum, donation) => sum + Number(donation.amount), 0) || 0;
      const totalDonations = donationsData?.length || 0;
      const lastDonation = donationsData?.[0]?.donated_at || null;

      setStats({
        total_amount: totalAmount,
        total_donations: totalDonations,
        last_donation: lastDonation
      });
    } catch (error: any) {
      console.error('Erro ao carregar doações:', error);
      toast({
        title: "Erro ao carregar doações",
        description: "Não foi possível carregar seu histórico de doações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
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
            Minhas Doações
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-cv-coral" />
              <p className="text-2xl font-bold text-cv-gray-dark">
                {formatCurrency(stats.total_amount)}
              </p>
              <p className="text-sm text-cv-gray-light">Total Doado</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="w-8 h-8 mx-auto mb-2 text-cv-green-mint" />
              <p className="text-2xl font-bold text-cv-gray-dark">
                {stats.total_donations}
              </p>
              <p className="text-sm text-cv-gray-light">Doações</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-cv-blue-heart" />
              <p className="text-sm font-bold text-cv-gray-dark">
                {stats.last_donation ? formatDate(stats.last_donation) : 'Nenhuma'}
              </p>
              <p className="text-sm text-cv-gray-light">Última Doação</p>
            </CardContent>
          </Card>
        </div>

        {/* Donations List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Doações</CardTitle>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 mx-auto mb-4 text-cv-gray-light" />
                <p className="text-cv-gray-light">Você ainda não fez nenhuma doação.</p>
                <p className="text-sm text-cv-gray-light mt-2">
                  Que tal fazer sua primeira contribuição?
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="border border-cv-gray-light rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold text-cv-gray-dark">
                              {formatCurrency(donation.amount, donation.currency)}
                            </p>
                            <p className="text-sm text-cv-gray-light">
                              {formatDate(donation.donated_at)}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(donation.status)}`}
                            >
                              {getStatusText(donation.status)}
                            </span>
                          </div>
                        </div>
                        {donation.payment_method && (
                          <p className="text-sm text-cv-gray-light mt-1">
                            Método: {donation.payment_method}
                          </p>
                        )}
                      </div>
                      {donation.transaction_id && (
                        <div className="text-right">
                          <p className="text-xs text-cv-gray-light">ID:</p>
                          <p className="text-xs font-mono text-cv-gray-dark">
                            {donation.transaction_id.slice(-8)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyDonationsScreen;
