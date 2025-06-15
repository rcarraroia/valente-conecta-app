
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useProfessionalDashboard } from '@/hooks/useProfessionalDashboard';
import ProfessionalDashboardHeader from './ProfessionalDashboardHeader';
import ProfessionalDashboardNavigation from './ProfessionalDashboardNavigation';
import ProfessionalDashboardOverview from './ProfessionalDashboardOverview';
import ProfessionalProfile from './ProfessionalProfile';
import ProfessionalSchedule from './ProfessionalSchedule';
import ProfessionalAppointments from './ProfessionalAppointments';

interface ProfessionalDashboardProps {
  onBack: () => void;
}

type ActiveTab = 'overview' | 'profile' | 'schedule' | 'appointments';

const ProfessionalDashboard = ({ onBack }: ProfessionalDashboardProps) => {
  const { partner, loading, stats, toggleProfileStatus, loadProfessionalData } = useProfessionalDashboard();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

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
          <p className="text-cv-gray-light">Perfil profissional não encontrado.</p>
          <Button onClick={onBack} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        <ProfessionalDashboardHeader 
          onBack={onBack}
          partner={partner}
          onToggleProfileStatus={toggleProfileStatus}
        />

        <ProfessionalDashboardNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'overview' && (
          <ProfessionalDashboardOverview partner={partner} stats={stats} />
        )}

        {activeTab === 'profile' && (
          <ProfessionalProfile 
            partner={partner} 
            onUpdate={loadProfessionalData} 
          />
        )}

        {activeTab === 'schedule' && (
          <ProfessionalSchedule 
            partnerId={partner.id} 
          />
        )}

        {activeTab === 'appointments' && (
          <ProfessionalAppointments />
        )}
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
