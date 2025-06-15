
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfessionalDashboardStats from './ProfessionalDashboardStats';

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

interface Stats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  todayAppointments: number;
}

interface ProfessionalDashboardOverviewProps {
  partner: Partner;
  stats: Stats;
}

const ProfessionalDashboardOverview = ({ partner, stats }: ProfessionalDashboardOverviewProps) => {
  return (
    <div className="space-y-6">
      <ProfessionalDashboardStats stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle>Informações do Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-cv-gray-light">Nome</p>
              <p className="font-medium">{partner.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-cv-gray-light">Especialidade</p>
              <p className="font-medium">{partner.specialty}</p>
            </div>
            <div>
              <p className="text-sm text-cv-gray-light">Email</p>
              <p className="font-medium">{partner.contact_email || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm text-cv-gray-light">Telefone</p>
              <p className="font-medium">{partner.contact_phone || 'Não informado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalDashboardOverview;
