
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ChevronRight } from 'lucide-react';

interface QuickAppointmentCardProps {
  onBookAppointment: () => void;
}

const QuickAppointmentCard = ({ onBookAppointment }: QuickAppointmentCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-r from-cv-coral to-cv-coral/80 border-0 text-white"
      onClick={onBookAppointment}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white text-sm">Agendar Consulta</h3>
              <p className="text-xs text-white/80">Conecte-se com nossos profissionais</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/80" />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickAppointmentCard;
