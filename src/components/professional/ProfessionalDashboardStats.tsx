
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

interface Stats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  todayAppointments: number;
}

interface ProfessionalDashboardStatsProps {
  stats: Stats;
}

const ProfessionalDashboardStats = ({ stats }: ProfessionalDashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cv-gray-light">Total de Agendamentos</p>
              <p className="text-2xl font-bold text-cv-gray-dark">{stats.totalAppointments}</p>
            </div>
            <Calendar className="w-8 h-8 text-cv-coral" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cv-gray-light">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cv-gray-light">Confirmados</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmedAppointments}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cv-gray-light">Hoje</p>
              <p className="text-2xl font-bold text-cv-blue-heart">{stats.todayAppointments}</p>
            </div>
            <Calendar className="w-8 h-8 text-cv-blue-heart" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalDashboardStats;
