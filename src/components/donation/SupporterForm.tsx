
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Calendar, Heart, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { calculatePaymentSplit } from '@/utils/paymentSplit';

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

  const monthlyPlans = [
    { value: 2500, label: 'R$ 25/mês', description: 'Apoiador Bronze' },
    { value: 5000, label: 'R$ 50/mês', description: 'Apoiador Prata' },
    { value: 10000, label: 'R$ 100/mês', description: 'Apoiador Ouro' },
    { value: 20000, label: 'R$ 200/mês', description: 'Apoiador Diamante' }
  ];

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

      console.log('Dados da assinatura:', {
        amount: amountInCents / 100,
        frequency: selectedPlan,
        supporterData,
        ambassadorCode: ambassadorCode || null,
        split
      });

      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A integração com assinaturas será implementada em breve.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua assinatura. Tente novamente.",
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
          {/* Plan Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Frequência de Apoio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={selectedPlan === 'monthly' ? "default" : "outline"}
                  onClick={() => setSelectedPlan('monthly')}
                  className="h-20 flex-col"
                >
                  <span className="font-semibold">Mensal</span>
                  <span className="text-sm opacity-80">Cobrança todo mês</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedPlan === 'yearly' ? "default" : "outline"}
                  onClick={() => setSelectedPlan('yearly')}
                  className="h-20 flex-col"
                >
                  <span className="font-semibold">Anual</span>
                  <span className="text-sm opacity-80">Desconto especial</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Amount Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Valor do Apoio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {monthlyPlans.map((plan) => (
                  <div
                    key={plan.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      amount === plan.value.toString()
                        ? 'border-cv-blue-heart bg-cv-blue-heart/5'
                        : 'border-gray-200 hover:border-cv-blue-heart/50'
                    }`}
                    onClick={() => setAmount(plan.value.toString())}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-lg">{plan.label}</div>
                      <div className="text-sm text-cv-blue-heart">{plan.description}</div>
                      {selectedPlan === 'yearly' && (
                        <div className="text-xs text-green-600 mt-1">
                          Anual: {formatCurrency((plan.value * 10).toString())} (2 meses grátis)
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-amount">Ou digite outro valor mensal</Label>
                <Input
                  id="custom-amount"
                  type="text"
                  placeholder="R$ 0,00"
                  value={amount && !monthlyPlans.find(p => p.value.toString() === amount) 
                    ? formatCurrency(amount) : ''}
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
                  <h4 className="font-medium text-blue-900 mb-2">
                    Divisão do Apoio {selectedPlan === 'monthly' ? 'Mensal' : 'Anual'}:
                  </h4>
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

          {/* Supporter Information */}
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
                  value={supporterData.name}
                  onChange={(e) => setSupporterData({...supporterData, name: e.target.value})}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={supporterData.email}
                  onChange={(e) => setSupporterData({...supporterData, email: e.target.value})}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={supporterData.phone}
                    onChange={(e) => setSupporterData({...supporterData, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">CPF *</Label>
                  <Input
                    id="document"
                    type="text"
                    required
                    value={supporterData.document}
                    onChange={(e) => setSupporterData({...supporterData, document: e.target.value})}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="border-cv-blue-heart/20 bg-cv-blue-heart/5">
            <CardHeader>
              <CardTitle className="text-lg text-cv-blue-heart">Benefícios do Mantenedor</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-cv-coral" />
                  Relatórios mensais sobre o impacto das doações
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-cv-coral" />
                  Acesso prioritário a eventos do instituto
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-cv-coral" />
                  Certificado de apoiador para dedução fiscal
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-cv-coral" />
                  Cancelamento a qualquer momento
                </li>
              </ul>
            </CardContent>
          </Card>

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
