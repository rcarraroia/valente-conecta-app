
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, User, Gift, Heart, Stethoscope } from 'lucide-react';

interface MenuItem {
  id: string;
  icon: any;
  title: string;
  description: string;
}

interface ProfileMenuItemsProps {
  userType: string | null;
  onNavigate?: (screen: string) => void;
}

const ProfileMenuItems = ({ userType, onNavigate }: ProfileMenuItemsProps) => {
  const menuItems: MenuItem[] = [
    {
      id: 'my-data',
      icon: User,
      title: 'Meus Dados',
      description: 'Editar informações pessoais'
    },
    {
      id: 'my-donations',
      icon: Gift,
      title: 'Minhas Doações',
      description: 'Histórico de contribuições'
    },
    {
      id: 'ambassador',
      icon: Heart,
      title: 'Seja um Embaixador',
      description: 'Divulgue nossa causa e ganhe recompensas'
    }
  ];

  // Add professional dashboard if user is a partner
  if (userType === 'parceiro') {
    menuItems.unshift({
      id: 'professional-dashboard',
      icon: Stethoscope,
      title: 'Painel Profissional',
      description: 'Gerencie seus horários e agendamentos'
    });
  }

  return (
    <div className="space-y-3">
      {menuItems.map((item) => (
        <Card 
          key={item.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.(item.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cv-off-white rounded-lg">
                  <item.icon className="w-5 h-5 text-cv-coral" />
                </div>
                <div>
                  <h3 className="font-medium text-cv-gray-dark text-sm">{item.title}</h3>
                  <p className="text-xs text-cv-gray-light">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-cv-gray-light" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProfileMenuItems;
