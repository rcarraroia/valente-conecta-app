
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import { PaymentSplit } from '@/types/payment';

interface AmbassadorCodeInputProps {
  ambassadorCode: string;
  onAmbassadorCodeChange: (code: string) => void;
  splitPreview: PaymentSplit | null;
}

const AmbassadorCodeInput = ({ 
  ambassadorCode, 
  onAmbassadorCodeChange, 
  splitPreview 
}: AmbassadorCodeInputProps) => {
  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    return formattedValue;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          Código do Embaixador (Opcional)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ambassador-code">
            Se você foi indicado por um embaixador, digite o código dele
          </Label>
          <Input
            id="ambassador-code"
            type="text"
            placeholder="Ex: AMB001"
            value={ambassadorCode}
            onChange={(e) => onAmbassadorCodeChange(e.target.value.toUpperCase())}
            className="uppercase"
          />
        </div>
        
        {splitPreview && ambassadorCode && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Divisão da Doação:</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Instituto Coração Valente (70%):</span>
                <span className="font-medium">
                  {formatCurrency(splitPreview.instituteShare.toString())}
                </span>
              </div>
              {splitPreview.ambassadorShare > 0 && (
                <div className="flex justify-between">
                  <span>Comissão Embaixador ({ambassadorCode}) (20%):</span>
                  <span className="font-medium">
                    {formatCurrency(splitPreview.ambassadorShare.toString())}
                  </span>
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                * {splitPreview.ambassadorShare > 0 ? '10%' : '30%'} destinado à manutenção da plataforma
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AmbassadorCodeInput;
