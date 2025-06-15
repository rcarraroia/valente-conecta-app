
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, User, Clock, Calendar } from 'lucide-react';

type ActiveTab = 'overview' | 'profile' | 'schedule' | 'appointments';

interface ProfessionalDashboardNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const ProfessionalDashboardNavigation = ({ activeTab, onTabChange }: ProfessionalDashboardNavigationProps) => {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto">
      <Button
        variant={activeTab === 'overview' ? 'default' : 'outline'}
        onClick={() => onTabChange('overview')}
        className="flex items-center gap-2"
      >
        <Eye className="w-4 h-4" />
        Visão Geral
      </Button>
      <Button
        variant={activeTab === 'profile' ? 'default' : 'outline'}
        onClick={() => onTabChange('profile')}
        className="flex items-center gap-2"
      >
        <User className="w-4 h-4" />
        Perfil
      </Button>
      <Button
        variant={activeTab === 'schedule' ? 'default' : 'outline'}
        onClick={() => onTabChange('schedule')}
        className="flex items-center gap-2"
      >
        <Clock className="w-4 h-4" />
        Horários
      </Button>
      <Button
        variant={activeTab === 'appointments' ? 'default' : 'outline'}
        onClick={() => onTabChange('appointments')}
        className="flex items-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        Agendamentos
      </Button>
    </div>
  );
};

export default ProfessionalDashboardNavigation;
