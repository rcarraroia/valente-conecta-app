
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { calculatePaymentSplit } from '@/utils/paymentSplit';
import PlanSelector from './PlanSelector';
import SupporterAmountSelector from './SupporterAmountSelector';
import AmbassadorCodeInput from './AmbassadorCodeInput';
import SupporterInformationForm from './SupporterInformationForm';
import SupporterBenefits from './SupporterBenefits';

interface SupporterFormProps {
  onBack: () => void;
}

const SupporterForm = ({ onBack }: SupporterFormProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [amount, setAmount] = useState('');
  const [ambassadorCode, setAmbassadorCode] = useState('');
  const [supporterData, setSupporterData] = useState({
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
      
      const subscriptionData = {
        amount: amountInCents,
        type: 'subscription' as const,
        frequency: selectedPlan,
        paymentMethod: 'CREDIT_CARD' as const, // Assinaturas geralmente são por cartão
        donor: supporterData,
        ambassadorCode: ambassadorCode || undefined,
      };

      console.log('Enviando dados de assinatura:', subscriptionData);

      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: subscriptionData
      });

      if (error) {
        throw error;
      }

      console.log('Resposta da assinatura:', data);

      if (data.success) {
        toast({
          title: "Assinatura criada com sucesso!",
          description: "Você será redirecionado para completar o pagamento.",
        });

        if (data.paymentUrl) {
          window.open(data.paymentUrl, '_blank');
        }
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro na assinatura:', error);
      toast({
        title: "Erro na assinatura",
        description: error.message || "Ocorreu um erro ao processar sua assinatura. Tente novamente.",
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
            Seja um Mantenedor
          </h1>
        </div>

        {/* Hero */}
        <Card className="bg-gradient-to-br from-cv-blue-heart to-cv-purple-soft text-white border-none">
          <CardContent className="p-6 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-white" />
            <h2 className="text-xl font-bold mb-2">Apoio Contínuo</h2>
            <p className="opacity-90">
              Torne-se um mantenedor e ajude o instituto de forma recorrente.
            </p>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PlanSelector 
            selectedPlan={selectedPlan}
            onPlanChange={setSelectedPlan}
          />

          <SupporterAmountSelector 
            amount={amount}
            selectedPlan={selectedPlan}
            onAmountChange={setAmount}
          />

          <AmbassadorCodeInput 
            ambassadorCode={ambassadorCode}
            onAmbassadorCodeChange={setAmbassadorCode}
            splitPreview={splitPreview}
          />

          <SupporterInformationForm 
            supporterData={supporterData}
            onSupporterDataChange={setSupporterData}
          />

          <SupporterBenefits />

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={!amount || !supporterData.name || !supporterData.email || !supporterData.phone || !supporterData.document || isProcessing}
            className="w-full h-12 bg-cv-blue-heart hover:bg-cv-blue-heart/90"
          >
            {isProcessing ? 'Processando...' : 
              `Apoiar ${selectedPlan === 'monthly' ? 'Mensalmente' : 'Anualmente'} ${
                amount ? (selectedPlan === 'monthly' 
                  ? formatCurrency(amount) 
                  : formatCurrency((parseInt(amount) * 10).toString())
                ) : 'R$ 0,00'
              }`
            }
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SupporterForm;
