
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface PlanSelectorProps {
  selectedPlan: 'monthly' | 'yearly';
  onPlanChange: (plan: 'monthly' | 'yearly') => void;
}

const PlanSelector = ({
  selectedPlan,
  onPlanChange
}: PlanSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Frequência de Apoio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-cv-blue-heart/10 p-4 rounded-lg text-center">
          <h3 className="font-semibold text-cv-blue-heart mb-2">Apoio Mensal</h3>
          <p className="text-sm text-cv-gray-light">
            Sua contribuição mensal nos ajuda a manter nossos serviços funcionando continuamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanSelector;
