import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AmountSelector from './AmountSelector';
import PaymentMethodSelector from './PaymentMethodSelector';
import DonorInformationForm from './DonorInformationForm';
import CreditCardForm from './CreditCardForm';
import { PixCheckout } from './PixCheckout';
import { usePixCheckout } from '@/hooks/usePixCheckout';
import { PAYMENT_CONSTANTS } from '@/constants/payment';

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
  const [creditCardData, setCreditCardData] = useState({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // 🚀 FEATURE FLAG - PIX Checkout Transparente
  const ENABLE_PIX_CHECKOUT = true; // Alterar para false para desabilitar

  // Hook do PIX Checkout Transparente
  const {
    isOpen: isPixCheckoutOpen,
    openPixCheckout,
    closePixCheckout,
    checkoutProps
  } = usePixCheckout({
    onSuccess: (paymentId) => {
      console.log('✅ Doação PIX confirmada:', paymentId);
      toast({
        title: "🎉 Doação confirmada!",
        description: "Sua doação foi recebida com sucesso. Muito obrigado!",
      });
      // Opcional: redirecionar para página de agradecimento
    },
    onError: (error) => {
      console.error('❌ Erro na doação PIX:', error);
    },
    onClose: () => {
      console.log('🔒 Checkout PIX fechado pelo usuário');
    }
  });

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
      
      // Validação de valor mínimo
      if (amountInCents < PAYMENT_CONSTANTS.MIN_DONATION_CENTS) {
        toast({
          title: "Valor mínimo",
          description: PAYMENT_CONSTANTS.ERROR_MESSAGES.MIN_VALUE,
          variant: "destructive"
        });
        return;
      }

      if (!donorData.name.trim() || !donorData.email.trim()) {
        toast({
          title: "Dados obrigatórios",
          description: PAYMENT_CONSTANTS.ERROR_MESSAGES.REQUIRED_FIELDS,
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
            description: PAYMENT_CONSTANTS.ERROR_MESSAGES.CREDIT_CARD_REQUIRED,
            variant: "destructive"
          });
          return;
        }
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
        creditCard: paymentMethod === 'CREDIT_CARD' ? {
          holderName: creditCardData.holderName.trim(),
          number: creditCardData.number.replace(/\s/g, ''), // Remove espaços
          expiryMonth: creditCardData.expiryMonth,
          expiryYear: creditCardData.expiryYear,
          ccv: creditCardData.ccv
        } : undefined
      };

      console.log('=== INICIANDO DOAÇÃO ===');
      console.log('Dados enviados:', {
        amount: paymentData.amount,
        ambassadorCode: paymentData.ambassadorCode,
        donor: paymentData.donor.name,
        paymentMethod: paymentData.paymentMethod
      });

      const { data, error } = await supabase.functions.invoke('process-payment-v2', {
        body: paymentData
      });

      console.log('Resposta da Edge Function v2:', { data, error });

      if (error) {
        console.error('Erro da Edge Function v2:', error);
        // Tratamento específico para diferentes tipos de erro
        if (error.message?.includes('ASAAS_API_KEY')) {
          throw new Error('Configuração de pagamento não encontrada. Entre em contato com o suporte.');
        } else if (error.message?.includes('Valor mínimo')) {
          throw new Error(PAYMENT_CONSTANTS.ERROR_MESSAGES.MIN_VALUE);
        } else if (error.message?.includes('obrigatórios')) {
          throw new Error(PAYMENT_CONSTANTS.ERROR_MESSAGES.REQUIRED_FIELDS);
        } else {
          throw new Error(error.message || 'Erro na comunicação com o servidor de pagamentos');
        }
      }

      if (data.success) {
        // Log do split para debug
        if (data.split?.ambassador) {
          console.log('Split aplicado:', data.split);
          toast({
            title: "Embaixador vinculado!",
            description: `${data.split.ambassador.name} receberá comissão desta doação.`,
          });
        }

        // 🚀 CHECKOUT TRANSPARENTE PIX (com feature flag)
        if (paymentMethod === 'PIX' && ENABLE_PIX_CHECKOUT && data.pixQrCode) {
          console.log('🎯 Iniciando checkout PIX transparente');
          
          // Extrair código PIX copia-e-cola se disponível
          let pixCopyPaste = '';
          try {
            // Tentar extrair do objeto payment se existir
            if (data.payment?.pixQrCodeId) {
              pixCopyPaste = data.payment.pixQrCodeId;
            }
          } catch (e) {
            console.warn('Não foi possível extrair código PIX copia-e-cola');
          }

          // Abrir checkout transparente
          openPixCheckout({
            id: data.payment?.id || `pix_${Date.now()}`,
            value: amountInCents,
            pixQrCode: data.pixQrCode,
            pixCopyPaste: pixCopyPaste,
            invoiceUrl: data.paymentUrl,
            externalReference: paymentData.ambassadorCode
          });

          toast({
            title: "Pagamento PIX criado!",
            description: "Use o QR Code ou código PIX para finalizar sua doação.",
          });

        } else {
          // 📱 FLUXO TRADICIONAL (Cartão de Crédito ou PIX sem checkout transparente)
          toast({
            title: "Pagamento criado com sucesso!",
            description: paymentMethod === 'PIX' 
              ? "Use o QR Code ou cole o código PIX para pagar."
              : "Você será redirecionado para completar o pagamento.",
          });

          // Redirecionar para pagamento externo
          if (data.paymentUrl) {
            window.open(data.paymentUrl, '_blank');
          }
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

          {/* Campos do Cartão de Crédito */}
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
                O embaixador receberá uma comissão desta doação automaticamente.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={!amount || parseInt(amount) < PAYMENT_CONSTANTS.MIN_DONATION_CENTS || !donorData.name || !donorData.email || isProcessing}
            className="w-full h-12 bg-cv-coral hover:bg-cv-coral/90"
          >
            {isProcessing ? 'Processando...' : 'Doar Agora'}
          </Button>
        </form>
      </div>

      {/* 🚀 PIX Checkout Transparente */}
      {isPixCheckoutOpen && checkoutProps && (
        <PixCheckout {...checkoutProps} />
      )}
    </div>
  );
};

export default DonationForm;
