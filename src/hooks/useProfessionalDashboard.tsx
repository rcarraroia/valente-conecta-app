
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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

interface Stats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  todayAppointments: number;
}

export const useProfessionalDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
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

  return {
    partner,
    loading,
    stats,
    toggleProfileStatus,
    loadProfessionalData
  };
};
