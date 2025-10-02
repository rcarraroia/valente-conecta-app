
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SupporterAmountSelector from './SupporterAmountSelector';
import SupporterInformationForm from './SupporterInformationForm';
import SupporterBenefits from './SupporterBenefits';
import PaymentMethodSelector from './PaymentMethodSelector';
import CreditCardForm from './CreditCardForm';

interface SupporterFormProps {
  onBack: () => void;
}

const SupporterForm = ({ onBack }: SupporterFormProps) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('CREDIT_CARD'); // Padrão cartão para assinaturas
  const [supporterData, setSupporterData] = useState({
    name: '',
    email: '',
    phone: '',
    document: ''
  });
  const [creditCardData, setCreditCardData] = useState({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: ''
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
      
      // Valor mínimo para assinaturas
      if (amountInCents < 500) {
        toast({
          title: "Valor mínimo",
          description: "O valor mínimo para assinatura é R$ 5,00.",
          variant: "destructive"
        });
        return;
      }

      if (!supporterData.name.trim() || !supporterData.email.trim()) {
        toast({
          title: "Dados obrigatórios",
          description: "Nome e email são obrigatórios.",
          variant: "destructive"
        });
        return;
      }

      // Validar dados do cartão se método for CREDIT_CARD
      if (paymentMethod === 'CREDIT_CARD') {
        if (!creditCardData.holderName.trim() || !creditCardData.number.trim() || 
            !creditCardData.expiryMonth.trim() || !creditCardData.expiryYear.trim() || 
            !creditCardData.ccv.trim()) {
          toast({
            title: "Dados do cartão obrigatórios",
            description: "Preencha todos os dados do cartão de crédito.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Obter código do embaixador automaticamente
      const ambassadorCode = getAmbassadorCode();
      
      const subscriptionData = {
        amount: amountInCents,
        type: 'subscription' as const,
        frequency: 'monthly' as const,
        paymentMethod,
        donor: {
          name: supporterData.name.trim(),
          email: supporterData.email.trim(),
          phone: supporterData.phone.trim() || undefined,
          document: supporterData.document.trim() || undefined,
        },
        ambassadorCode: ambassadorCode,
        creditCard: paymentMethod === 'CREDIT_CARD' ? {
          holderName: creditCardData.holderName.trim(),
          number: creditCardData.number.replace(/\s/g, ''), // Remove espaços
          expiryMonth: creditCardData.expiryMonth,
          expiryYear: creditCardData.expiryYear,
          ccv: creditCardData.ccv
        } : undefined
      };

      console.log('Enviando dados de assinatura:', subscriptionData);

      const { data, error } = await supabase.functions.invoke('process-payment-v2', {
        body: subscriptionData
      });

      console.log('Resposta da Edge Function v2 (assinatura):', { data, error });

      if (error) {
        console.error('Erro da Edge Function v2 (assinatura):', error);
        // Tratamento específico para diferentes tipos de erro
        if (error.message?.includes('ASAAS_API_KEY')) {
          throw new Error('Configuração de pagamento não encontrada. Entre em contato com o suporte.');
        } else if (error.message?.includes('Valor mínimo')) {
          throw new Error('Valor mínimo para assinatura é R$ 5,00');
        } else if (error.message?.includes('obrigatórios')) {
          throw new Error('Preencha todos os campos obrigatórios');
        } else {
          throw new Error(error.message || 'Erro na comunicação com o servidor de pagamentos');
        }
      }

      console.log('Resposta da assinatura:', data);

      if (data.success) {
        toast({
          title: "Assinatura criada com sucesso!",
          description: "Você será redirecionado para completar o pagamento.",
        });

        // Log do split para debug
        if (data.split?.ambassador) {
          console.log('Split aplicado:', data.split);
          toast({
            title: "Embaixador vinculado!",
            description: `${data.split.ambassador.name} receberá comissão desta assinatura.`,
          });
        }

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
            <h2 className="text-xl font-bold mb-2">Apoio Mensal</h2>
            <p className="opacity-90">
              Torne-se um mantenedor e ajude o instituto mensalmente.
            </p>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <SupporterAmountSelector 
            amount={amount}
            selectedPlan="monthly"
            onAmountChange={setAmount}
          />

          <PaymentMethodSelector 
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            showPix={false} // Assinaturas só por cartão
          />

          <SupporterInformationForm 
            supporterData={supporterData}
            onSupporterDataChange={setSupporterData}
          />

          {paymentMethod === 'CREDIT_CARD' && (
            <CreditCardForm 
              creditCardData={creditCardData}
              onCreditCardDataChange={setCreditCardData}
            />
          )}

          {/* Informação sobre embaixador se aplicável */}
          {getAmbassadorCode() && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                💜 Você está apoiando através do embaixador: <strong>{getAmbassadorCode()}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                O embaixador receberá uma comissão desta assinatura automaticamente.
              </p>
            </div>
          )}

          <SupporterBenefits />

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={
              !amount || 
              !supporterData.name || 
              !supporterData.email || 
              (paymentMethod === 'CREDIT_CARD' && (
                !creditCardData.holderName || 
                !creditCardData.number || 
                !creditCardData.expiryMonth || 
                !creditCardData.expiryYear || 
                !creditCardData.ccv
              )) ||
              isProcessing
            }
            className="w-full h-12 bg-cv-blue-heart hover:bg-cv-blue-heart/90"
          >
            {isProcessing ? 'Processando...' : 
              `Apoiar Mensalmente ${amount ? formatCurrency(amount) : 'R$ 0,00'}`
            }
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SupporterForm;
