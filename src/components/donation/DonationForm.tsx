
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AmountSelector from './AmountSelector';
import PaymentMethodSelector from './PaymentMethodSelector';
import DonorInformationForm from './DonorInformationForm';

interface DonationFormProps {
  onBack: () => void;
}

const DonationForm = ({ onBack }: DonationFormProps) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
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

  // Função para obter o código do embaixador da URL ou localStorage
  const getAmbassadorCode = () => {
    // Primeiro tenta pegar da URL atual
    const urlParams = new URLSearchParams(window.location.search);
    const refFromUrl = urlParams.get('ref');
    
    // Se não tiver na URL, tenta pegar do localStorage (salvo durante navegação via link de embaixador)
    const refFromStorage = localStorage.getItem('ambassador_ref');
    
    return refFromUrl || refFromStorage || undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const amountInCents = parseInt(amount);
      
      // Valor mínimo aumentado para R$ 5,00 (500 centavos) conforme exigido pela Asaas
      if (amountInCents < 500) {
        toast({
          title: "Valor mínimo",
          description: "O valor mínimo para doação é R$ 5,00.",
          variant: "destructive"
        });
        return;
      }

      if (!donorData.name.trim() || !donorData.email.trim()) {
        toast({
          title: "Dados obrigatórios",
          description: "Nome e email são obrigatórios.",
          variant: "destructive"
        });
        return;
      }

      // Obter código do embaixador automaticamente
      const ambassadorCode = getAmbassadorCode();

      const paymentData = {
        amount: amountInCents,
        type: 'donation' as const,
        paymentMethod,
        donor: {
          name: donorData.name.trim(),
          email: donorData.email.trim(),
          phone: donorData.phone.trim() || undefined,
          document: donorData.document.trim() || undefined,
        },
        ambassadorCode: ambassadorCode,
      };

      console.log('=== INICIANDO DOAÇÃO ===');
      console.log('Dados enviados:', {
        amount: paymentData.amount,
        ambassadorCode: paymentData.ambassadorCode,
        donor: paymentData.donor.name,
        paymentMethod: paymentData.paymentMethod
      });

      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: paymentData
      });

      console.log('Resposta da Edge Function:', { data, error });

      if (error) {
        console.error('Erro da Edge Function:', error);
        throw new Error(error.message || 'Erro na comunicação com o servidor');
      }

      if (data.success) {
        toast({
          title: "Pagamento criado com sucesso!",
          description: paymentMethod === 'PIX' 
            ? "Use o QR Code ou cole o código PIX para pagar."
            : "Você será redirecionado para completar o pagamento.",
        });

        // Log do split para debug
        if (data.split?.ambassador) {
          console.log('Split aplicado:', data.split);
          toast({
            title: "Embaixador vinculado!",
            description: `${data.split.ambassador.name} receberá comissão desta doação.`,
          });
        }

        // Redirecionar para pagamento
        if (data.paymentUrl) {
          window.open(data.paymentUrl, '_blank');
        }
      } else {
        throw new Error(data.error || 'Erro desconhecido no processamento');
      }
    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      
      let errorMessage = "Ocorreu um erro ao processar sua doação. Tente novamente.";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro no pagamento",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

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

          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />

          <DonorInformationForm
            donorData={donorData}
            onDonorDataChange={setDonorData}
          />

          {/* Informação sobre embaixador se aplicável */}
          {getAmbassadorCode() && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                💜 Você está apoiando através do embaixador: <strong>{getAmbassadorCode()}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                O embaixador receberá uma comissão desta doação automaticamente.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={!amount || parseInt(amount) < 500 || !donorData.name || !donorData.email || isProcessing}
            className="w-full h-12 bg-cv-coral hover:bg-cv-coral/90"
          >
            {isProcessing ? 'Processando...' : 
              amount ? `Quanto você pode doar hoje ${formatCurrency(amount)}` : 'Quanto você pode doar hoje'
            }
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DonationForm;
