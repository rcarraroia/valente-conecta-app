import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, CreditCard, Gift } from 'lucide-react';
import DonationForm from './donation/DonationForm';
import SupporterForm from './donation/SupporterForm';

interface DonationScreenProps {
  onBack: () => void;
}

const DonationScreen = ({ onBack }: DonationScreenProps) => {
  const [selectedOption, setSelectedOption] = useState<'donation' | 'supporter' | null>(null);

  const handleBack = () => {
    if (selectedOption) {
      setSelectedOption(null);
    } else {
      onBack();
    }
  };

  if (selectedOption === 'donation') {
    return <DonationForm onBack={handleBack} />;
  }

  if (selectedOption === 'supporter') {
    return <SupporterForm onBack={handleBack} />;
  }

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
            Apoie Nossa Causa
          </h1>
        </div>

        {/* Hero */}
        <Card className="bg-gradient-to-br from-cv-coral to-cv-purple-soft text-white border-none">
          <CardContent className="p-6 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-white" />
            <h2 className="text-xl font-bold mb-2">Sua Doação Faz a Diferença</h2>
            <p className="opacity-90">
              Ajude o Instituto Coração Valente a continuar acolhendo famílias em momentos difíceis.
            </p>
          </CardContent>
        </Card>

        {/* Options */}
        <div className="space-y-4">
          <Card 
            className="border-none shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedOption('donation')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-cv-green-mint p-3 rounded-full">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-cv-gray-dark mb-1">
                    Fazer uma Doação
                  </h3>
                  <p className="text-sm text-cv-gray-light">
                    Contribua com qualquer valor de forma única
                  </p>
                </div>
                <div className="text-cv-coral">
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-none shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedOption('supporter')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-cv-blue-heart p-3 rounded-full">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-cv-gray-dark mb-1">
                    Ser um Mantenedor
                  </h3>
                  <p className="text-sm text-cv-gray-light">
                    Apoie mensalmente com valores fixos
                  </p>
                </div>
                <div className="text-cv-coral">
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="border-cv-gray-light/20 bg-cv-off-white">
          <CardContent className="p-4">
            <p className="text-sm text-cv-gray-light text-center">
              Todas as doações são processadas de forma segura através do Asaas. 
              Você receberá um comprovante por e-mail.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonationScreen;
