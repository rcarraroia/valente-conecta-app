
import React from 'react';
import { Home, Book, Brain, Heart, User } from 'lucide-react';

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentTab, onTabChange }) => {
  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      ariaLabel: 'Ir para página inicial'
    },
    {
      id: 'biblioteca',
      label: 'Biblioteca',
      icon: Book,
      ariaLabel: 'Acessar biblioteca de conteúdos'
    },
    {
      id: 'ia',
      label: 'Diagnóstico',
      icon: Brain,
      ariaLabel: 'Acessar ferramenta de pré-diagnóstico'
    },
    {
      id: 'ajudar',
      label: 'Ajudar',
      icon: Heart,
      ariaLabel: 'Ver opções para ajudar o instituto'
    },
    {
      id: 'perfil',
      label: 'Perfil',
      icon: User,
      ariaLabel: 'Acessar perfil e configurações'
    }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-cv-gray-light shadow-lg z-50"
      role="navigation"
      aria-label="Navegação principal"
    >
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center min-h-[64px] px-3 py-2 rounded-lg transition-all duration-300 relative ${
                isActive 
                  ? 'bg-cv-green-mint text-white shadow-lg scale-105' 
                  : 'text-cv-purple-dark hover:text-cv-blue-heart hover:bg-cv-off-white'
              }`}
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                className={`w-6 h-6 mb-1 transition-transform duration-300 ${
                  isActive ? 'scale-110' : ''
                }`} 
              />
              <span className={`text-xs font-medium ${
                isActive ? 'font-semibold' : ''
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-1 w-2 h-2 bg-cv-coral rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
