
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AppointmentBooking from './partner/AppointmentBooking';
import { useProfessionalData } from '@/hooks/useProfessionalData';
import ProfessionalHeader from './professional/ProfessionalHeader';
import ProfessionalCard from './professional/ProfessionalCard';
import ProfessionalBio from './professional/ProfessionalBio';
import ProfessionalActions from './professional/ProfessionalActions';

interface ProfessionalProfileScreenProps {
  onBack: () => void;
  partnerId?: string;
}

const ProfessionalProfileScreen = ({ onBack, partnerId }: ProfessionalProfileScreenProps) => {
  const { partner, loading } = useProfessionalData(partnerId);
  const [showBooking, setShowBooking] = useState(false);

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
          <p className="text-cv-gray-light">Profissional não encontrado.</p>
          <Button onClick={onBack} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  if (showBooking) {
    return (
      <AppointmentBooking
        partnerId={partner.id}
        partnerName={partner.full_name}
        onBack={() => setShowBooking(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        <ProfessionalHeader onBack={onBack} />
        <ProfessionalCard partner={partner} />
        {partner.bio && <ProfessionalBio bio={partner.bio} />}
        <ProfessionalActions 
          partner={partner} 
          onBookingClick={() => setShowBooking(true)} 
        />
      </div>
    </div>
  );
};

export default ProfessionalProfileScreen;
