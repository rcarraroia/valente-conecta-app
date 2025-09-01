
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Users, Book, Brain, UserPlus } from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (screen: string) => void;
}

const QuickActions = ({ onNavigate }: QuickActionsProps) => {
  const actions = [
    {
      icon: Brain,
      title: 'Pré-Diagnóstico',
      description: 'Faça uma avaliação inicial da sua saúde mental',
      onClick: () => window.location.href = '/diagnosis',
      color: 'bg-cv-blue-heart hover:bg-cv-blue-heart/90'
    },
    {
      icon: Book,
      title: 'Biblioteca',
      description: 'Acesse recursos e conteúdos sobre saúde mental',
      onClick: () => onNavigate('biblioteca'),
      color: 'bg-cv-purple-soft hover:bg-cv-purple-soft/90'
    },
    {
      icon: Heart,
      title: 'Ajudar',
      description: 'Descubra como apoiar nossa causa',
      onClick: () => onNavigate('ajudar'),
      color: 'bg-cv-coral hover:bg-cv-coral/90'
    },
    {
      icon: UserPlus,
      title: 'Seja Voluntário',
      description: 'Junte-se à nossa missão como voluntário',
      onClick: () => onNavigate('volunteers'),
      color: 'bg-cv-green-mint hover:bg-cv-green-mint/90'
    }
  ];

  return (
    <Card className="bg-white border-cv-off-white">
      <CardHeader>
        <CardTitle className="text-lg text-cv-gray-dark">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className={`${action.color} text-white p-4 h-auto flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105`}
            >
              <action.icon className="w-6 h-6" />
              <div className="text-center">
                <div className="font-semibold text-sm">{action.title}</div>
                <div className="text-xs opacity-90 mt-1">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
