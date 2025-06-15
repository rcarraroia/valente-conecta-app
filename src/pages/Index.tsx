
import React, { useState } from 'react';
import HomeScreen from '@/components/HomeScreen';
import LibraryScreen from '@/components/LibraryScreen';
import AIAgentScreen from '@/components/AIAgentScreen';
import HelpScreen from '@/components/HelpScreen';
import ProfileScreen from '@/components/ProfileScreen';
import ServicesScreen from '@/components/ServicesScreen';
import BottomNavigation from '@/components/BottomNavigation';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<string>('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'biblioteca':
        return <LibraryScreen />;
      case 'ia':
        return <AIAgentScreen onBack={() => setCurrentScreen('home')} />;
      case 'ajudar':
        return <HelpScreen onBack={() => setCurrentScreen('home')} />;
      case 'perfil':
        return <ProfileScreen />;
      case 'services':
        return <ServicesScreen onBack={() => setCurrentScreen('home')} />;
      default:
        return <HomeScreen />;
    }
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  return (
    <div className="min-h-screen bg-cv-off-white relative w-full">
      <div className="pb-16">
        {renderScreen()}
      </div>
      
      {/* Show bottom navigation only on main screens */}
      {['home', 'biblioteca', 'ia', 'ajudar', 'perfil'].includes(currentScreen) && (
        <BottomNavigation 
          currentTab={currentScreen} 
          onTabChange={handleNavigate}
        />
      )}
    </div>
  );
};

export default Index;
