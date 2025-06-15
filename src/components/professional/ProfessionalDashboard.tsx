
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Settings, 
  CheckCircle, 
  XCircle,
  Eye
} from 'lucide-react';
import ProfessionalProfile from './ProfessionalProfile';
import ProfessionalSchedule from './ProfessionalSchedule';
import ProfessionalAppointments from './ProfessionalAppointments';

interface Partner {
  id: string;
  full_name: string;
  specialty: string;
  bio: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  crm_crp_register: string | null;
  is_active: boolean;
}

interface ProfessionalDashboardProps {
  onBack: () => void;
}

const ProfessionalDashboard = ({ onBack }: ProfessionalDashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'schedule' | 'appointments'>('overview');
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    todayAppointments: 0
  });

  useEffect(() => {
    if (user) {
      loadProfessionalData();
      loadStats();
    }
  }, [user]);

  const loadProfessionalData = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setPartner(data);
    } catch (error) {
      console.error('Erro ao carregar dados do profissional:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus dados profissionais.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      // Buscar dados do parceiro primeiro
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (partnerError || !partnerData) return;

      // Buscar estatísticas de agendamentos
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('status, appointment_date')
        .eq('partner_id', partnerData.id);

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      
      setStats({
        totalAppointments: appointments?.length || 0,
        pendingAppointments: appointments?.filter(apt => apt.status === 'pending').length || 0,
        confirmedAppointments: appointments?.filter(apt => apt.status === 'confirmed').length || 0,
        todayAppointments: appointments?.filter(apt => apt.appointment_date === today).length || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const toggleProfileStatus = async () => {
    if (!partner) return;

    try {
      const { error } = await supabase
        .from('partners')
        .update({ is_active: !partner.is_active })
        .eq('id', partner.id);

      if (error) throw error;

      setPartner({ ...partner, is_active: !partner.is_active });
      toast({
        title: 'Status atualizado',
        description: `Seu perfil está agora ${!partner.is_active ? 'ativo' : 'inativo'}.`
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do perfil.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cv-coral"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-cv-gray-light">Perfil profissional não encontrado.</p>
          <Button onClick={onBack} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-cv-gray-light hover:text-cv-gray-dark"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-heading font-bold text-cv-gray-dark">
                Painel Profissional
              </h1>
              <p className="text-cv-gray-light">Gerencie seu perfil e agendamentos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={partner.is_active ? 'default' : 'secondary'}>
              {partner.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleProfileStatus}
            >
              {partner.is_active ? 'Desativar' : 'Ativar'} Perfil
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Visão Geral
          </Button>
          <Button
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Perfil
          </Button>
          <Button
            variant={activeTab === 'schedule' ? 'default' : 'outline'}
            onClick={() => setActiveTab('schedule')}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Horários
          </Button>
          <Button
            variant={activeTab === 'appointments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('appointments')}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Agendamentos
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-cv-gray-light">Total de Agendamentos</p>
                      <p className="text-2xl font-bold text-cv-gray-dark">{stats.totalAppointments}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-cv-coral" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-cv-gray-light">Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-cv-gray-light">Confirmados</p>
                      <p className="text-2xl font-bold text-green-600">{stats.confirmedAppointments}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-cv-gray-light">Hoje</p>
                      <p className="text-2xl font-bold text-cv-blue-heart">{stats.todayAppointments}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-cv-blue-heart" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-cv-gray-light">Nome</p>
                    <p className="font-medium">{partner.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-cv-gray-light">Especialidade</p>
                    <p className="font-medium">{partner.specialty}</p>
                  </div>
                  <div>
                    <p className="text-sm text-cv-gray-light">Email</p>
                    <p className="font-medium">{partner.contact_email || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-cv-gray-light">Telefone</p>
                    <p className="font-medium">{partner.contact_phone || 'Não informado'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <ProfessionalProfile 
            partner={partner} 
            onUpdate={() => loadProfessionalData()} 
          />
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <ProfessionalSchedule 
            partnerId={partner.id} 
          />
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <ProfessionalAppointments />
        )}
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
