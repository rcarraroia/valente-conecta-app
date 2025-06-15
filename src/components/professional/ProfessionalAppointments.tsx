import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  profiles?: {
    full_name: string;
    phone: string;
  } | null;
}

interface ProfessionalAppointmentsProps {
  partnerId: string;
  onUpdate: () => void;
}

const ProfessionalAppointments = ({ partnerId, onUpdate }: ProfessionalAppointmentsProps) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    loadAppointments();
  }, [partnerId]);

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_user_id_fkey (
            full_name,
            phone
          )
        `)
        .eq('partner_id', partnerId)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      
      // Filter out any appointments with profile errors and ensure type safety
      const validAppointments = (data || []).map(appointment => ({
        ...appointment,
        profiles: appointment.profiles && 
                 typeof appointment.profiles === 'object' && 
                 'full_name' in appointment.profiles 
          ? appointment.profiles as { full_name: string; phone: string }
          : null
      }));
      
      setAppointments(validAppointments);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status } : apt
      ));

      toast({
        title: 'Agendamento atualizado',
        description: `Agendamento ${status === 'confirmed' ? 'confirmado' : 'cancelado'} com sucesso.`
      });

      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o agendamento.',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'outline' as const, color: 'text-yellow-600' },
      confirmed: { label: 'Confirmado', variant: 'default' as const, color: 'text-green-600' },
      cancelled: { label: 'Cancelado', variant: 'secondary' as const, color: 'text-red-600' },
      completed: { label: 'Concluído', variant: 'outline' as const, color: 'text-blue-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const handleWhatsApp = (phone: string, patientName: string, date: string, time: string) => {
    if (!phone) return;
    
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Olá ${patientName}! Confirmando nossa consulta para ${date} às ${time}. Qualquer dúvida, entre em contato.`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cv-coral"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Filtrar Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todos ({appointments.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pendentes ({appointments.filter(apt => apt.status === 'pending').length})
            </Button>
            <Button
              variant={filter === 'confirmed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('confirmed')}
            >
              Confirmados ({appointments.filter(apt => apt.status === 'confirmed').length})
            </Button>
            <Button
              variant={filter === 'cancelled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('cancelled')}
            >
              Cancelados ({appointments.filter(apt => apt.status === 'cancelled').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de agendamentos */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-cv-gray-light mx-auto mb-4" />
              <p className="text-cv-gray-light">
                {filter === 'all' 
                  ? 'Nenhum agendamento encontrado.' 
                  : `Nenhum agendamento ${filter === 'pending' ? 'pendente' : filter === 'confirmed' ? 'confirmado' : 'cancelado'} encontrado.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-cv-gray-light" />
                        <span className="font-medium">
                          {appointment.profiles?.full_name || 'Nome não informado'}
                        </span>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cv-gray-light" />
                        <span>
                          {format(new Date(appointment.appointment_date), 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cv-gray-light" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-cv-gray-light mb-1">Observações:</p>
                        <p className="text-sm bg-cv-off-white p-2 rounded">{appointment.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {appointment.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      </>
                    )}

                    {appointment.profiles?.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleWhatsApp(
                          appointment.profiles?.phone || '',
                          appointment.profiles?.full_name || '',
                          format(new Date(appointment.appointment_date), 'dd/MM/yyyy'),
                          appointment.appointment_time
                        )}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfessionalAppointments;
