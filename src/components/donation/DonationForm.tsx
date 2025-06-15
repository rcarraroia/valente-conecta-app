
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { calculatePaymentSplit } from '@/utils/paymentSplit';
import AmountSelector from './AmountSelector';
import AmbassadorCodeInput from './AmbassadorCodeInput';
import PaymentMethodSelector from './PaymentMethodSelector';
import DonorInformationForm from './DonorInformationForm';

interface DonationFormProps {
  onBack: () => void;
}

const DonationForm = ({ onBack }: DonationFormProps) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO'>('PIX');
  const [ambassadorCode, setAmbassadorCode] = useState('');
  const [donorData, setDonorData] = useState({
    name: '',
    email: '',
    phone: '',
    document: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    return formattedValue;
  };

  const calculateSplitPreview = () => {
    if (!amount) return null;
    const amountInCents = parseInt(amount);
    const split = calculatePaymentSplit(amountInCents, ambassadorCode || undefined);
    return split;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const amountInCents = parseInt(amount);
      const split = calculatePaymentSplit(amountInCents, ambassadorCode || undefined);

      console.log('Dados da doação:', {
        amount: amountInCents / 100,
        paymentMethod,
        donorData,
        ambassadorCode: ambassadorCode || null,
        split
      });

      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A integração com o gateway de pagamento será implementada em breve.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua doação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const splitPreview = calculateSplitPreview();

  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-cv-gray-light hover:text-cv-gray-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-heading font-bold text-cv-gray-dark">
            Fazer uma Doação
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AmountSelector 
            amount={amount}
            onAmountChange={setAmount}
          />

          <AmbassadorCodeInput
            ambassadorCode={ambassadorCode}
            onAmbassadorCodeChange={setAmbassadorCode}
            splitPreview={splitPreview}
          />

          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />

          <DonorInformationForm
            donorData={donorData}
            onDonorDataChange={setDonorData}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={!amount || !donorData.name || !donorData.email || isProcessing}
            className="w-full h-12 bg-cv-coral hover:bg-cv-coral/90"
          >
            {isProcessing ? 'Processando...' : `Doar ${amount ? formatCurrency(amount) : 'R$ 0,00'}`}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DonationForm;
