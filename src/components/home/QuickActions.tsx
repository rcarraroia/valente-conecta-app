
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Heart, Book, HandHeart } from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: typeof Brain;
  color: string;
  textColor: string;
  ariaLabel: string;
  action: () => void;
}

interface QuickActionsProps {
  onNavigate?: (screen: string) => void;
}

const QuickActions = ({ onNavigate }: QuickActionsProps) => {
  const quickActions: QuickAction[] = [
    {
      title: "Pré-Diagnóstico IA",
      description: "Orientação inteligente",
      icon: Brain,
      color: "bg-cv-green-mint",
      textColor: "text-white",
      ariaLabel: "Iniciar pré-diagnóstico com inteligência artificial",
      action: () => onNavigate?.('ia')
    },
    {
      title: "Nossos Serviços",
      description: "Conheça nossa missão",
      icon: Heart,
      color: "bg-cv-blue-heart",
      textColor: "text-white",
      ariaLabel: "Conhecer serviços do Instituto Coração Valente",
      action: () => onNavigate?.('services')
    },
    {
      title: "Biblioteca",
      description: "Artigos e guias",
      icon: Book,
      color: "bg-cv-yellow-soft",
      textColor: "text-cv-purple-dark",
      ariaLabel: "Acessar biblioteca de artigos e guias",
      action: () => onNavigate?.('biblioteca')
    },
    {
      title: "Quero Ajudar",
      description: "Seja um mantenedor",
      icon: HandHeart,
      color: "bg-cv-coral",
      textColor: "text-white",
      ariaLabel: "Descobrir como ajudar o Instituto",
      action: () => onNavigate?.('ajudar')
    }
  ];

  const handleCardClick = (action: () => void) => {
    action();
  };

  return (
    <section className="px-4 py-6" aria-labelledby="quick-actions-title">
      <h3 id="quick-actions-title" className="text-xl font-heading font-bold text-cv-purple-dark mb-4">
        Acesso Rápido
      </h3>
      <div className="grid grid-cols-2 gap-3" role="grid">
        {quickActions.map((action, index) => (
          <Card 
            key={action.title}
            className={`${action.color} border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-slide-up touch-target`}
            style={{ animationDelay: `${index * 100}ms` }}
            role="gridcell"
            tabIndex={0}
            aria-label={action.ariaLabel}
            onClick={() => handleCardClick(action.action)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(action.action);
              }
            }}
          >
            <CardContent className="p-3 text-center space-y-2">
              <action.icon className={`w-6 h-6 mx-auto ${action.textColor}`} aria-hidden="true" />
              <h4 className={`font-semibold text-sm ${action.textColor}`}>
                {action.title}
              </h4>
              <p className={`text-xs opacity-90 ${action.textColor} leading-tight`}>
                {action.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
