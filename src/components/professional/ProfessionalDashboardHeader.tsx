
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

interface Partner {
  id: string;
  full_name: string;
  specialty: string;
  bio: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  crm_crp_register: string | null;
  is_active: boolean;
}

interface ProfessionalDashboardHeaderProps {
  onBack: () => void;
  partner: Partner;
  onToggleProfileStatus: () => void;
}

const ProfessionalDashboardHeader = ({ onBack, partner, onToggleProfileStatus }: ProfessionalDashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-cv-gray-light hover:text-cv-gray-dark"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold text-cv-gray-dark">
            Painel Profissional
          </h1>
          <p className="text-cv-gray-light">Gerencie seu perfil e agendamentos</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={partner.is_active ? 'default' : 'secondary'}>
          {partner.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleProfileStatus}
        >
          {partner.is_active ? 'Desativar' : 'Ativar'} Perfil
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalDashboardHeader;
