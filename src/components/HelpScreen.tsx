
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, Users, Gift, HandHeart } from 'lucide-react';

interface HelpScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

const HelpScreen = ({ onBack, onNavigate }: HelpScreenProps) => {
  const helpOptions = [
    {
      title: "Faça uma Doação",
      description: "Contribua financeiramente para nossos projetos",
      icon: Gift,
      color: "bg-cv-green-mint",
      action: () => onNavigate ? onNavigate('donation') : alert('Funcionalidade de doação em desenvolvimento')
    },
    {
      title: "Seja Voluntário", 
      description: "Dedique seu tempo para ajudar nossas famílias",
      icon: Users,
      color: "bg-cv-blue-heart",
      action: () => alert('Formulário de voluntariado em desenvolvimento')
    },
    {
      title: "Torne-se Embaixador",
      description: "Compartilhe nossa causa em suas redes",
      icon: HandHeart,
      color: "bg-cv-coral",
      action: () => alert('Programa de embaixadores em desenvolvimento')
    }
  ];

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
            Como Ajudar
          </h1>
        </div>

        {/* Hero */}
        <Card className="bg-gradient-to-br from-cv-purple-soft to-cv-blue-heart text-white border-none">
          <CardContent className="p-6 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-white" />
            <h2 className="text-xl font-bold mb-2">Faça a Diferença</h2>
            <p className="opacity-90">
              Existem várias formas de apoiar o Instituto Coração Valente em nossa missão de acolher famílias.
            </p>
          </CardContent>
        </Card>

        {/* Options */}
        <div className="space-y-4">
          {helpOptions.map((option, index) => (
            <Card 
              key={option.title}
              className="border-none shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={option.action}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`${option.color} p-3 rounded-full`}>
                    <option.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-cv-gray-dark mb-1">
                      {option.title}
                    </h3>
                    <p className="text-sm text-cv-gray-light">
                      {option.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpScreen;
