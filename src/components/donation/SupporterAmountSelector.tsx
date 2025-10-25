
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PAYMENT_CONSTANTS } from '@/constants/payment';

interface SupporterAmountSelectorProps {
  amount: string;
  selectedPlan: 'monthly' | 'yearly';
  onAmountChange: (amount: string) => void;
}

const SupporterAmountSelector = ({ amount, selectedPlan, onAmountChange }: SupporterAmountSelectorProps) => {
  const monthlyPlans = PAYMENT_CONSTANTS.SUBSCRIPTION_PLANS;

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

  const handlePlanClick = (planValue: number) => {
    console.log('Plan clicked:', planValue);
    onAmountChange(planValue.toString());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Valor do Apoio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {monthlyPlans.map((plan) => (
            <Button
              key={plan.value}
              type="button"
              variant={amount === plan.value.toString() ? "default" : "outline"}
              onClick={() => handlePlanClick(plan.value)}
              className={`p-4 h-auto text-left justify-start ${
                amount === plan.value.toString()
                  ? 'bg-cv-blue-heart hover:bg-cv-blue-heart/90 text-white border-cv-blue-heart'
                  : 'border-gray-200 hover:border-cv-blue-heart/50 hover:bg-cv-blue-heart/5'
              }`}
            >
              <div className="w-full">
                <div className="font-semibold text-lg">{plan.label}</div>
                <div className={`text-sm ${
                  amount === plan.value.toString() ? 'text-white/80' : 'text-cv-blue-heart'
                }`}>
                  {plan.description}
                </div>
                {selectedPlan === 'yearly' && (
                  <div className={`text-xs mt-1 ${
                    amount === plan.value.toString() ? 'text-white/70' : 'text-green-600'
                  }`}>
                    Anual: {formatCurrency((plan.value * 10).toString())} (2 meses grátis)
                  </div>
                )}
              </div>
            </Button>
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
