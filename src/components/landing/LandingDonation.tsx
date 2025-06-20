
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, CreditCard, QrCode, FileText } from 'lucide-react';

interface LandingDonationProps {
  ambassadorCode?: string;
}

const LandingDonation = ({ ambassadorCode }: LandingDonationProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorData, setDonorData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO'>('PIX');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const predefinedAmounts = [50, 100, 250, 500];

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numericValue = parseInt(value) / 100;
    setCustomAmount(numericValue.toString());
    setSelectedAmount(numericValue);
  };

  const getCurrentAmount = () => {
    return selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
  };

  const handleDonation = async () => {
    const amount = getCurrentAmount();
    
    if (amount < 5) {
      toast({
        title: 'Valor mínimo',
        description: 'O valor mínimo para doação é R$ 5,00.',
        variant: 'destructive',
      });
      return;
    }

    if (!donorData.name || !donorData.email) {
      toast({
        title: 'Dados obrigatórios',
        description: 'Por favor, preencha seu nome e email.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const paymentData = {
        amount: amount * 100, // Converter para centavos
        type: 'donation' as const,
        paymentMethod,
        donor: donorData,
        ambassadorCode: ambassadorCode, // Código vem como prop da landing page
      };

      console.log('Processando doação na landing:', paymentData);

      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: paymentData
      });

      if (error) {
        throw error;
      }

      console.log('Resposta do pagamento:', data);

      if (data.success) {
        toast({
          title: "Doação criada com sucesso!",
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

        // Redirecionar para página de sucesso ou abrir link de pagamento
        if (data.paymentUrl) {
          window.open(data.paymentUrl, '_blank');
        }
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Ocorreu um erro ao processar sua doação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="donation-section" className="py-20 bg-cv-off-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-cv-gray-dark mb-6">
            Faça Sua Doação e Ajude a Construir um Futuro Melhor
          </h2>
          <p className="text-xl text-cv-gray-light max-w-2xl mx-auto leading-relaxed">
            Sua contribuição vai diretamente para o atendimento das crianças e famílias que precisam do nosso apoio.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
          {/* Seleção de valor */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-cv-gray-dark mb-4">Escolha o valor da sua doação</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {predefinedAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  onClick={() => handleAmountSelect(amount)}
                  className={`h-12 ${selectedAmount === amount ? 'bg-cv-coral hover:bg-cv-coral/90' : 'border-cv-coral text-cv-coral hover:bg-cv-coral hover:text-white'}`}
                >
                  {formatCurrency(amount)}
                </Button>
              ))}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cv-gray-dark mb-2">Ou digite outro valor:</label>
              <Input
                type="text"
                placeholder="R$ 0,00"
                value={customAmount ? formatCurrency(parseFloat(customAmount)) : ''}
                onChange={handleCustomAmountChange}
                className="text-center text-lg"
              />
            </div>
          </div>

          {/* Dados do doador */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-cv-gray-dark mb-4">Seus dados</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cv-gray-dark mb-2">Nome completo *</label>
                <Input
                  type="text"
                  value={donorData.name}
                  onChange={(e) => setDonorData({...donorData, name: e.target.value})}
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-cv-gray-dark mb-2">Email *</label>
                <Input
                  type="email"
                  value={donorData.email}
                  onChange={(e) => setDonorData({...donorData, email: e.target.value})}
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-cv-gray-dark mb-2">Telefone (opcional)</label>
                <Input
                  type="tel"
                  value={donorData.phone}
                  onChange={(e) => setDonorData({...donorData, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Forma de pagamento */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-cv-gray-dark mb-4">Forma de pagamento</h3>
            
            <div className="space-y-3">
              {[
                { value: 'PIX', label: 'PIX', icon: QrCode, description: 'Instantâneo' },
                { value: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: CreditCard, description: 'À vista' },
                { value: 'BOLETO', label: 'Boleto Bancário', icon: FileText, description: 'Vencimento em 3 dias' }
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <div
                    key={method.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === method.value
                        ? 'border-cv-coral bg-cv-coral/5'
                        : 'border-gray-200 hover:border-cv-coral/50'
                    }`}
                    onClick={() => setPaymentMethod(method.value as any)}
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
            </div>
          </div>

          {/* Informação sobre embaixador se aplicável */}
          {ambassadorCode && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                💜 Você está apoiando através do embaixador: <strong>{ambassadorCode}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                O embaixador receberá uma comissão desta doação automaticamente.
              </p>
            </div>
          )}

          {/* Botão de doação */}
          <Button
            onClick={handleDonation}
            disabled={getCurrentAmount() < 5 || !donorData.name || !donorData.email || isProcessing}
            className="w-full h-14 bg-cv-coral hover:bg-cv-coral/90 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Heart className="w-5 h-5 mr-2" />
            {isProcessing ? 'Processando...' : `Doar ${formatCurrency(getCurrentAmount())}`}
          </Button>

          {/* Informações de segurança */}
          <div className="mt-6 text-center text-sm text-cv-gray-light">
            <p>🔒 Pagamento 100% seguro • Seus dados estão protegidos</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingDonation;
