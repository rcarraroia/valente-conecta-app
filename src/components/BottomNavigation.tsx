
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
      id: 'diagnosis',
      label: 'Triagem Comportamental',
      icon: Brain,
      ariaLabel: 'Acessar ferramenta de triagem comportamental'
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

  const handleNavigation = (itemId: string) => {
    if (itemId === 'diagnosis') {
      // Redirecionar para a nova interface de diagnóstico
      window.location.href = '/diagnosis';
    } else {
      onTabChange(itemId);
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-cv-gray-light shadow-lg z-50 safe-area-bottom"
      role="navigation"
      aria-label="Navegação principal"
    >
      <div className="flex items-center justify-around py-2 px-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`flex flex-col items-center justify-center min-h-[56px] px-2 py-1 rounded-lg transition-all duration-200 relative flex-1 max-w-[20%] touch-target ${
                isActive 
                  ? 'bg-cv-green-mint text-white shadow-md scale-105' 
                  : 'text-cv-purple-dark hover:text-cv-blue-heart hover:bg-cv-off-white active:scale-95'
              }`}
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                className={`w-5 h-5 mb-1 transition-transform duration-200 ${
                  isActive ? 'scale-110' : ''
                }`} 
              />
              <span className={`text-xs font-medium leading-tight text-center ${
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
