
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MessageCircle, Mail, Phone } from 'lucide-react';

interface Partner {
  id: string;
  full_name: string;
  contact_email: string | null;
  contact_phone: string | null;
}

interface ProfessionalActionsProps {
  partner: Partner;
  onBookingClick: () => void;
}

const ProfessionalActions = ({ partner, onBookingClick }: ProfessionalActionsProps) => {
  const handleWhatsApp = () => {
    if (partner?.contact_phone) {
      const phone = partner.contact_phone.replace(/\D/g, '');
      const message = `Olá, ${partner.full_name}! Vi seu perfil no Coração Valente Conecta e gostaria de conversar.`;
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (partner?.contact_email) {
      window.open(`mailto:${partner.contact_email}`, '_blank');
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Button
        onClick={onBookingClick}
        className="bg-cv-coral hover:bg-cv-coral/90 flex items-center justify-center"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Agendar Consulta
      </Button>

      {partner.contact_phone && (
        <Button
          onClick={handleWhatsApp}
          variant="outline"
          className="flex items-center justify-center"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
      )}

      {partner.contact_email && (
        <Button
          onClick={handleEmail}
          variant="outline"
          className="flex items-center justify-center"
        >
          <Mail className="w-4 h-4 mr-2" />
          E-mail
        </Button>
      )}

      {partner.contact_phone && (
        <Button
          onClick={() => window.open(`tel:${partner.contact_phone}`, '_blank')}
          variant="outline"
          className="flex items-center justify-center"
        >
          <Phone className="w-4 h-4 mr-2" />
          Ligar
        </Button>
      )}
    </div>
  );
};

export default ProfessionalActions;
