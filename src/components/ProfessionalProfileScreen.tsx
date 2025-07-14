
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AppointmentBooking from './partner/AppointmentBooking';
import { useProfessionalData } from '@/hooks/useProfessionalData';
import ProfessionalHeader from './professional/ProfessionalHeader';
import ProfessionalCard from './professional/ProfessionalCard';
import ProfessionalBio from './professional/ProfessionalBio';
import ProfessionalActions from './professional/ProfessionalActions';
import { AlertCircle } from 'lucide-react';

interface ProfessionalProfileScreenProps {
  onBack: () => void;
  partnerId?: string;
}

const ProfessionalProfileScreen = ({ onBack, partnerId }: ProfessionalProfileScreenProps) => {
  const { partner, loading, error } = useProfessionalData(partnerId);
  const [showBooking, setShowBooking] = useState(false);

  console.log('ProfessionalProfileScreen - Partner ID:', partnerId);
  console.log('ProfessionalProfileScreen - Partner data:', partner);
  console.log('ProfessionalProfileScreen - Loading:', loading);
  console.log('ProfessionalProfileScreen - Error:', error);

  if (loading) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cv-coral mx-auto mb-4"></div>
          <p className="text-cv-gray-light">Carregando perfil do profissional...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-cv-gray-dark mb-2">
            Erro ao carregar perfil
          </h3>
          <p className="text-cv-gray-light mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={onBack} variant="outline">
              Voltar
            </Button>
            <Button onClick={() => window.location.reload()} className="bg-cv-coral hover:bg-cv-coral/90">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-cv-gray-light" />
          <h3 className="text-lg font-semibold text-cv-gray-dark mb-2">
            Profissional não encontrado
          </h3>
          <p className="text-cv-gray-light mb-4">
            O profissional que você está procurando não foi encontrado ou não está disponível.
          </p>
          <Button onClick={onBack} className="bg-cv-coral hover:bg-cv-coral/90">
            Voltar à lista
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
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-green-100 text-green-800 text-xs rounded">
            Debug: Perfil carregado com sucesso - ID: {partner.id}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalProfileScreen;
