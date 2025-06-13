
import React, { useState, useEffect } from 'react';
import { Book, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import HomeScreen from '@/components/HomeScreen';
import AIAgentScreen from '@/components/AIAgentScreen';
import HelpScreen from '@/components/HelpScreen';
import LibraryScreen from '@/components/LibraryScreen';
import ProfileScreen from '@/components/ProfileScreen';
import BottomNavigation from '@/components/BottomNavigation';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const { user, loading } = useAuth();

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth';
    }
  }, [user, loading]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cv-coral border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cv-gray-light">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não autenticado, não renderizar nada (será redirecionado)
  if (!user) {
    return null;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'ia':
        return <AIAgentScreen />;
      case 'ajudar':
        return <HelpScreen />;
      case 'biblioteca':
        return <LibraryScreen />;
      case 'perfil':
        return <ProfileScreen />;
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
