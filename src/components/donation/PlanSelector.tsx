import React from 'react';
import { Button } from '@/components/ui/button';
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
  return <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Frequência de Apoio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button type="button" variant={selectedPlan === 'monthly' ? "default" : "outline"} onClick={() => onPlanChange('monthly')} className="h-20 flex-col">
            <span className="font-semibold">Mensal</span>
            <span className="opacity-80 font-extralight px-0 text-xs">Pago por mês</span>
          </Button>
          <Button type="button" variant={selectedPlan === 'yearly' ? "default" : "outline"} onClick={() => onPlanChange('yearly')} className="h-20 flex-col">
            <span className="font-semibold">Anual</span>
            <span className="opacity-80 text-xs">Desconto especial</span>
          </Button>
        </div>
      </CardContent>
    </Card>;
};
export default PlanSelector;