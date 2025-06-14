
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
      case 'library':
        return <LibraryScreen onBack={() => setCurrentScreen('home')} />;
      case 'diagnosis':
        return <AIAgentScreen onBack={() => setCurrentScreen('home')} />;
      case 'help':
        return <HelpScreen onBack={() => setCurrentScreen('home')} />;
      case 'profile':
        return <ProfileScreen onBack={() => setCurrentScreen('home')} />;
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
    <div className="min-h-screen bg-cv-off-white relative">
      {renderScreen()}
      
      {/* Show bottom navigation only on main screens */}
      {['home', 'library', 'diagnosis', 'help', 'profile'].includes(currentScreen) && (
        <BottomNavigation 
          currentScreen={currentScreen} 
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};

export default Index;
