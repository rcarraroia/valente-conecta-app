
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
    <Card className="mx-4 mb-4 bg-gradient-to-r from-cv-coral to-cv-coral/80 border-0 text-white">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 flex-shrink-0" />
            <h3 className="font-heading font-bold text-lg">Agende sua Consulta</h3>
          </div>
          
          <p className="text-white/90 text-sm leading-relaxed">
            Conecte-se com nossos profissionais parceiros e cuide da sua saúde cardiovascular
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>Agendamento rápido</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Horários flexíveis</span>
            </div>
          </div>
          
          <Button
            onClick={handleBookAppointment}
            variant="secondary"
            className="bg-white text-cv-coral hover:bg-white/90 font-medium w-full touch-target"
          >
            Agendar Agora
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickAppointment;
