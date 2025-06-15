
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AmountSelectorProps {
  amount: string;
  onAmountChange: (amount: string) => void;
}

const AmountSelector = ({ amount, onAmountChange }: AmountSelectorProps) => {
  const predefinedAmounts = [25, 50, 100, 200, 500];

  const handleAmountSelect = (value: number) => {
    onAmountChange((value * 100).toString());
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    return formattedValue;
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    onAmountChange(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Valor da Doação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {predefinedAmounts.map((value) => (
            <Button
              key={value}
              type="button"
              variant={amount === (value * 100).toString() ? "default" : "outline"}
              onClick={() => handleAmountSelect(value)}
              className="h-12"
            >
              R$ {value}
            </Button>
          ))}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="custom-amount">Ou digite outro valor</Label>
          <Input
            id="custom-amount"
            type="text"
            placeholder="R$ 0,00"
            value={amount ? formatCurrency(amount) : ''}
            onChange={handleAmountInputChange}
            className="text-lg text-center"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AmountSelector;
