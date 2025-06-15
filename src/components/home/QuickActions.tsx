
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, BookOpen, Heart, Users, HeadphonesIcon } from 'lucide-react';

interface QuickActionsProps {
  onNavigate?: (screen: string) => void;
}

const QuickActions = ({ onNavigate }: QuickActionsProps) => {
  const actions = [
    {
      id: 'ia',
      title: 'Pré-Diagnóstico',
      description: 'Avaliação inicial com IA',
      icon: Brain,
      bgColor: 'bg-cv-blue-heart',
      textColor: 'text-white'
    },
    {
      id: 'biblioteca',
      title: 'Biblioteca',
      description: 'Recursos educacionais',
      icon: BookOpen,
      bgColor: 'bg-cv-green-mint',
      textColor: 'text-white'
    },
    {
      id: 'partners',
      title: 'Profissionais',
      description: 'Nossos parceiros',
      icon: Users,
      bgColor: 'bg-cv-purple-soft',
      textColor: 'text-white'
    },
    {
      id: 'ajudar',
      title: 'Ajudar',
      description: 'Faça sua doação',
      icon: Heart,
      bgColor: 'bg-cv-coral',
      textColor: 'text-white'
    },
    {
      id: 'services',
      title: 'Serviços',
      description: 'Nossos serviços',
      icon: HeadphonesIcon,
      bgColor: 'bg-cv-yellow-warm',
      textColor: 'text-cv-gray-dark'
    }
  ];

  const handleActionClick = (actionId: string) => {
    if (onNavigate) {
      onNavigate(actionId);
    }
  };

  return (
    <div className="px-6 py-8">
      <h2 className="text-xl font-heading font-bold text-cv-gray-dark mb-6 text-center">
        Acesso Rápido
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Card 
              key={action.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm"
              onClick={() => handleActionClick(action.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${action.bgColor} flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${action.textColor}`} />
                </div>
                <h3 className="font-semibold text-sm text-cv-gray-dark mb-1">
                  {action.title}
                </h3>
                <p className="text-xs text-cv-gray-light">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
