
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SupporterAmountSelectorProps {
  amount: string;
  selectedPlan: 'monthly' | 'yearly';
  onAmountChange: (amount: string) => void;
}

const SupporterAmountSelector = ({ amount, selectedPlan, onAmountChange }: SupporterAmountSelectorProps) => {
  const monthlyPlans = [
    { value: 2500, label: 'R$ 25/mês', description: 'Apoiador Bronze' },
    { value: 5000, label: 'R$ 50/mês', description: 'Apoiador Prata' },
    { value: 10000, label: 'R$ 100/mês', description: 'Apoiador Ouro' },
    { value: 20000, label: 'R$ 200/mês', description: 'Apoiador Diamante' }
  ];

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    return formattedValue;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    onAmountChange(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Valor do Apoio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {monthlyPlans.map((plan) => (
            <div
              key={plan.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                amount === plan.value.toString()
                  ? 'border-cv-blue-heart bg-cv-blue-heart/5'
                  : 'border-gray-200 hover:border-cv-blue-heart/50'
              }`}
              onClick={() => onAmountChange(plan.value.toString())}
            >
              <div className="text-center">
                <div className="font-semibold text-lg">{plan.label}</div>
                <div className="text-sm text-cv-blue-heart">{plan.description}</div>
                {selectedPlan === 'yearly' && (
                  <div className="text-xs text-green-600 mt-1">
                    Anual: {formatCurrency((plan.value * 10).toString())} (2 meses grátis)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="custom-amount">Ou digite outro valor mensal</Label>
          <Input
            id="custom-amount"
            type="text"
            placeholder="R$ 0,00"
            value={amount && !monthlyPlans.find(p => p.value.toString() === amount) 
              ? formatCurrency(amount) : ''}
            onChange={handleAmountChange}
            className="text-lg text-center"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SupporterAmountSelector;
