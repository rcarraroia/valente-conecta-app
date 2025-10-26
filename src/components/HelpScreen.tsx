
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, Users, Gift } from 'lucide-react';

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
      action: () => onNavigate ? onNavigate('volunteers') : alert('Funcionalidade de voluntariado em desenvolvimento')
    }
  ];

  return (
    <div className="min-h-screen bg-cv-off-white">
      {/* Header Mobile-First */}
      <div className="bg-cv-purple-soft text-white px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20 w-10 h-10 p-0"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-heading font-bold">
            Como Ajudar
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Hero Card */}
        <Card className="bg-gradient-to-br from-cv-purple-soft to-cv-blue-heart text-white border-none">
          <CardContent className="p-4 text-center">
            <Heart className="w-10 h-10 mx-auto mb-3 text-white" />
            <h2 className="text-lg font-bold mb-2">Faça a Diferença</h2>
            <p className="text-sm opacity-90 leading-relaxed">
              Existem várias formas de apoiar a ONG Coração Valente em nossa missão de acolher famílias.
            </p>
          </CardContent>
        </Card>

        {/* Options */}
        <div className="space-y-3">
          {helpOptions.map((option, index) => (
            <Card 
              key={option.title}
              className="border-none shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={option.action}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`${option.color} p-2.5 rounded-full flex-shrink-0`}>
                    <option.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-cv-gray-dark text-base mb-1">
                      {option.title}
                    </h3>
                    <p className="text-sm text-cv-gray-light leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ambassador Info Card */}
        <Card className="border-cv-purple-soft border-2">
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 mx-auto mb-3 text-cv-purple-soft" />
            <h3 className="font-semibold text-cv-gray-dark text-base mb-2">
              Programa de Embaixadores
            </h3>
            <p className="text-sm text-cv-gray-light mb-4 leading-relaxed">
              Compartilhe nossa causa e ganhe recompensas! Acesse o programa completo em seu perfil.
            </p>
            <Button
              variant="outline"
              className="border-cv-purple-soft text-cv-purple-soft hover:bg-cv-purple-soft hover:text-white w-full"
              onClick={() => onNavigate ? onNavigate('perfil') : null}
            >
              Ir para Perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpScreen;
