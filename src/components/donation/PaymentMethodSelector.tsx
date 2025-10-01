
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, QrCode } from 'lucide-react';

interface PaymentMethodSelectorProps {
  paymentMethod: 'PIX' | 'CREDIT_CARD';
  onPaymentMethodChange: (method: 'PIX' | 'CREDIT_CARD') => void;
  showPix?: boolean; // Prop opcional para mostrar/ocultar PIX
}

const PaymentMethodSelector = ({ paymentMethod, onPaymentMethodChange, showPix = true }: PaymentMethodSelectorProps) => {
  const allPaymentMethods = [
    { value: 'PIX', label: 'PIX', icon: QrCode, description: 'Instantâneo' },
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: CreditCard, description: 'À vista' }
  ];
  
  // Filtrar métodos baseado na prop showPix
  const paymentMethods = showPix ? allPaymentMethods : allPaymentMethods.filter(method => method.value !== 'PIX');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Forma de Pagamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <div
              key={method.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                paymentMethod === method.value
                  ? 'border-cv-coral bg-cv-coral/5'
                  : 'border-gray-200 hover:border-cv-coral/50'
              }`}
              onClick={() => onPaymentMethodChange(method.value as any)}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${
                  paymentMethod === method.value ? 'text-cv-coral' : 'text-gray-500'
                }`} />
                <div className="flex-1">
                  <div className="font-medium">{method.label}</div>
                  <div className="text-sm text-gray-500">{method.description}</div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
