
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock } from 'lucide-react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Schedule {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  max_appointments: number;
}

interface AppointmentBookingProps {
  partnerId: string;
  partnerName: string;
  onBack: () => void;
}

const AppointmentBooking = ({ partnerId, partnerName, onBack }: AppointmentBookingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const dayMapping = {
    'Sunday': 'Domingo',
    'Monday': 'Segunda',
    'Tuesday': 'Terça',
    'Wednesday': 'Quarta',
    'Thursday': 'Quinta',
    'Friday': 'Sexta',
    'Saturday': 'Sábado'
  };

  useEffect(() => {
    loadSchedules();
  }, [partnerId]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableTimes();
    }
  }, [selectedDate, schedules]);

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('partner_id', partnerId)
        .eq('is_available', true);

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    }
  };

  const loadAvailableTimes = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      const dayName = format(selectedDate, 'EEEE', { locale: ptBR });
      const dayNameEn = Object.keys(dayMapping).find(
        key => dayMapping[key as keyof typeof dayMapping] === dayName
      );

      const daySchedules = schedules.filter(
        schedule => schedule.day_of_week === dayNameEn
      );

      if (daySchedules.length === 0) {
        setAvailableTimes([]);
        return;
      }

      // Verificar agendamentos existentes para a data
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('appointment_time, schedule_id')
        .eq('partner_id', partnerId)
        .eq('appointment_date', format(selectedDate, 'yyyy-MM-dd'))
        .in('status', ['pending', 'confirmed']);

      if (error) throw error;

      // Gerar horários disponíveis
      const times: string[] = [];
      daySchedules.forEach(schedule => {
        const start = parseISO(`2000-01-01T${schedule.start_time}`);
        const end = parseISO(`2000-01-01T${schedule.end_time}`);
        
        let current = start;
        while (current < end) {
          const timeString = format(current, 'HH:mm');
          
          // Verificar se o horário já está ocupado
          const isOccupied = existingAppointments?.some(
            apt => apt.appointment_time === timeString && apt.schedule_id === schedule.id
          );

          if (!isOccupied) {
            times.push(timeString);
          }

          // Avançar 30 minutos
          current = new Date(current.getTime() + 30 * 60 * 1000);
        }
      });

      setAvailableTimes(times.sort());
    } catch (error) {
      console.error('Erro ao carregar horários disponíveis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user || !selectedDate || !selectedTime) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, selecione uma data e horário.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Encontrar o schedule_id para o horário selecionado
      const dayName = format(selectedDate, 'EEEE', { locale: ptBR });
      const dayNameEn = Object.keys(dayMapping).find(
        key => dayMapping[key as keyof typeof dayMapping] === dayName
      );

      const matchingSchedule = schedules.find(
        schedule => schedule.day_of_week === dayNameEn
      );

      if (!matchingSchedule) {
        throw new Error('Horário não disponível');
      }

      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          partner_id: partnerId,
          schedule_id: matchingSchedule.id,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: selectedTime,
          notes: notes.trim() || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Agendamento solicitado!",
        description: `Sua solicitação foi enviada para ${partnerName}. Você receberá uma confirmação em breve.`
      });

      onBack();
    } catch (error: any) {
      console.error('Erro ao fazer agendamento:', error);
      toast({
        title: "Erro ao agendar",
        description: "Não foi possível fazer o agendamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isDateAvailable = (date: Date) => {
    const dayName = format(date, 'EEEE', { locale: ptBR });
    const dayNameEn = Object.keys(dayMapping).find(
      key => dayMapping[key as keyof typeof dayMapping] === dayName
    );
    
    return schedules.some(schedule => schedule.day_of_week === dayNameEn);
  };

  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
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
          <h1 className="text-xl font-heading font-bold text-cv-gray-dark">
            Agendar com {partnerName}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selecione uma data</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => 
                date < addDays(new Date(), 1) || !isDateAvailable(date)
              }
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Horários disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : availableTimes.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map(time => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="text-sm"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-cv-gray-light text-center py-4">
                  Nenhum horário disponível para esta data.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Observações (opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Descreva brevemente o motivo da consulta ou alguma observação importante..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        <Button
          onClick={handleBooking}
          disabled={!selectedDate || !selectedTime || submitting}
          className="w-full bg-cv-coral hover:bg-cv-coral/90"
        >
          {submitting ? 'Agendando...' : 'Confirmar Agendamento'}
        </Button>
      </div>
    </div>
  );
};

export default AppointmentBooking;
