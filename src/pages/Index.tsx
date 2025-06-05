
import React, { useState } from 'react';
import { Book, User } from 'lucide-react';
import HomeScreen from '@/components/HomeScreen';
import AIAgentScreen from '@/components/AIAgentScreen';
import HelpScreen from '@/components/HelpScreen';
import BottomNavigation from '@/components/BottomNavigation';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'ia':
        return <AIAgentScreen />;
      case 'ajudar':
        return <HelpScreen />;
      case 'biblioteca':
        return (
          <div className="min-h-screen bg-cv-off-white flex items-center justify-center p-6 pb-20">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-cv-blue-soft rounded-full flex items-center justify-center mx-auto">
                <Book className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-h2 font-heading font-bold text-cv-gray-dark">Biblioteca</h2>
              <p className="text-body text-cv-gray-light">
                Em breve: artigos, guias e materiais especializados
              </p>
            </div>
          </div>
        );
      case 'perfil':
        return (
          <div className="min-h-screen bg-cv-off-white flex items-center justify-center p-6 pb-20">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-cv-green-mint rounded-full flex items-center justify-center mx-auto">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-h2 font-heading font-bold text-cv-gray-dark">Perfil</h2>
              <p className="text-body text-cv-gray-light">
                Em breve: configurações e personalização
              </p>
            </div>
          </div>
        );
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {renderScreen()}
      <BottomNavigation currentTab={currentScreen} onTabChange={setCurrentScreen} />
    </div>
  );
};

export default Index;
