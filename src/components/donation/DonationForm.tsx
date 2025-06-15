
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, QrCode, FileText, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { calculatePaymentSplit } from '@/utils/paymentSplit';

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

  const predefinedAmounts = [25, 50, 100, 200, 500];

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
  };

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
    setAmount(value);
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
          {/* Amount Selection */}
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
                  onChange={handleAmountChange}
                  className="text-lg text-center"
                />
              </div>
            </CardContent>
          </Card>

          {/* Ambassador Code */}
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
                  onChange={(e) => setAmbassadorCode(e.target.value.toUpperCase())}
                  className="uppercase"
                />
              </div>
              
              {splitPreview && ambassadorCode && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Divisão da Doação:</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Instituto Coração Valente:</span>
                      <span className="font-medium">
                        {formatCurrency(splitPreview.instituteShare.toString())}
                      </span>
                    </div>
                    {splitPreview.ambassadorShare > 0 && (
                      <div className="flex justify-between">
                        <span>Comissão Embaixador ({ambassadorCode}):</span>
                        <span className="font-medium">
                          {formatCurrency(splitPreview.ambassadorShare.toString())}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Donor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seus Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={donorData.name}
                  onChange={(e) => setDonorData({...donorData, name: e.target.value})}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={donorData.email}
                  onChange={(e) => setDonorData({...donorData, email: e.target.value})}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={donorData.phone}
                    onChange={(e) => setDonorData({...donorData, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">CPF</Label>
                  <Input
                    id="document"
                    type="text"
                    value={donorData.document}
                    onChange={(e) => setDonorData({...donorData, document: e.target.value})}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
