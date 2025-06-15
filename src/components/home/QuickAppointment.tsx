
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Heart } from 'lucide-react';

interface QuickAppointmentProps {
  onNavigate?: (screen: string) => void;
}

const QuickAppointment = ({ onNavigate }: QuickAppointmentProps) => {
  const handleBookAppointment = () => {
    if (onNavigate) {
      onNavigate('partners');
    }
  };

  return (
    <Card className="mx-6 mb-6 bg-gradient-to-r from-cv-coral to-cv-coral/80 border-0 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5" />
              <h3 className="font-heading font-bold text-lg">Agende sua Consulta</h3>
            </div>
            <p className="text-white/90 text-sm mb-4">
              Conecte-se com nossos profissionais parceiros e cuide da sua saúde cardiovascular
            </p>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Agendamento rápido</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Horários flexíveis</span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleBookAppointment}
            variant="secondary"
            className="bg-white text-cv-coral hover:bg-white/90 font-medium"
          >
            Agendar Agora
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickAppointment;
