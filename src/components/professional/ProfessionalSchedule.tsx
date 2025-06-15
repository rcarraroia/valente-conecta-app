
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Clock, Calendar } from 'lucide-react';

interface Schedule {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_appointments: number;
}

interface ProfessionalScheduleProps {
  partnerId: string;
}

const daysOfWeek = [
  { value: 'Monday', label: 'Segunda-feira' },
  { value: 'Tuesday', label: 'Terça-feira' },
  { value: 'Wednesday', label: 'Quarta-feira' },
  { value: 'Thursday', label: 'Quinta-feira' },
  { value: 'Friday', label: 'Sexta-feira' },
  { value: 'Saturday', label: 'Sábado' },
  { value: 'Sunday', label: 'Domingo' }
];

const ProfessionalSchedule = ({ partnerId }: ProfessionalScheduleProps) => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSchedule, setNewSchedule] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    max_appointments: 1
  });

  useEffect(() => {
    loadSchedules();
  }, [partnerId]);

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('partner_id', partnerId)
        .order('day_of_week');

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = async () => {
    if (!newSchedule.day_of_week || !newSchedule.start_time || !newSchedule.end_time) {
      toast({
        title: 'Dados incompletos',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('schedules')
        .insert({
          partner_id: partnerId,
          day_of_week: newSchedule.day_of_week,
          start_time: newSchedule.start_time,
          end_time: newSchedule.end_time,
          max_appointments: newSchedule.max_appointments,
          is_available: true
        });

      if (error) throw error;

      toast({
        title: 'Horário adicionado',
        description: 'Novo horário de atendimento criado com sucesso.'
      });

      setNewSchedule({
        day_of_week: '',
        start_time: '',
        end_time: '',
        max_appointments: 1
      });
      
      loadSchedules();
    } catch (error) {
      console.error('Erro ao adicionar horário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o horário.',
        variant: 'destructive'
      });
    }
  };

  const toggleScheduleAvailability = async (scheduleId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .update({ is_available: !isAvailable })
        .eq('id', scheduleId);

      if (error) throw error;

      setSchedules(schedules.map(s => 
        s.id === scheduleId ? { ...s, is_available: !isAvailable } : s
      ));

      toast({
        title: 'Horário atualizado',
        description: `Horário ${!isAvailable ? 'ativado' : 'desativado'} com sucesso.`
      });
    } catch (error) {
      console.error('Erro ao atualizar horário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o horário.',
        variant: 'destructive'
      });
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este horário?')) return;

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      setSchedules(schedules.filter(s => s.id !== scheduleId));
      toast({
        title: 'Horário excluído',
        description: 'Horário removido com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao excluir horário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o horário.',
        variant: 'destructive'
      });
    }
  };

  const getDayLabel = (dayValue: string) => {
    return daysOfWeek.find(d => d.value === dayValue)?.label || dayValue;
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
      {/* Adicionar novo horário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Horário de Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day_of_week">Dia da Semana</Label>
              <select
                id="day_of_week"
                value={newSchedule.day_of_week}
                onChange={(e) => setNewSchedule({ ...newSchedule, day_of_week: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Selecione...</option>
                {daysOfWeek.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Horário Início</Label>
              <Input
                id="start_time"
                type="time"
                value={newSchedule.start_time}
                onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">Horário Fim</Label>
              <Input
                id="end_time"
                type="time"
                value={newSchedule.end_time}
                onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_appointments">Máx. Consultas</Label>
              <Input
                id="max_appointments"
                type="number"
                min="1"
                value={newSchedule.max_appointments}
                onChange={(e) => setNewSchedule({ ...newSchedule, max_appointments: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <Button onClick={addSchedule} className="w-full bg-cv-coral hover:bg-cv-coral/90">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Horário
          </Button>
        </CardContent>
      </Card>

      {/* Lista de horários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Seus Horários de Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-cv-gray-light mx-auto mb-4" />
              <p className="text-cv-gray-light">Nenhum horário cadastrado ainda.</p>
              <p className="text-sm text-cv-gray-light">Adicione seus horários de atendimento acima.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{getDayLabel(schedule.day_of_week)}</p>
                        <p className="text-sm text-cv-gray-light">
                          {schedule.start_time} - {schedule.end_time}
                        </p>
                      </div>
                      <div className="text-sm text-cv-gray-light">
                        Máx: {schedule.max_appointments} consulta(s)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`available-${schedule.id}`} className="text-sm">
                        {schedule.is_available ? 'Ativo' : 'Inativo'}
                      </Label>
                      <Switch
                        id={`available-${schedule.id}`}
                        checked={schedule.is_available}
                        onCheckedChange={() => toggleScheduleAvailability(schedule.id, schedule.is_available)}
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSchedule(schedule.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalSchedule;
