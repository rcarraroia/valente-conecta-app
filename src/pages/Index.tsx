
import React, { useState, useEffect } from 'react';
import HomeScreen from '@/components/HomeScreen';
import LibraryScreen from '@/components/LibraryScreen';
import ArticleDetailScreen from '@/components/ArticleDetailScreen';
import AIAgentScreen from '@/components/AIAgentScreen';
import HelpScreen from '@/components/HelpScreen';
import ProfileScreen from '@/components/ProfileScreen';
import ServicesScreen from '@/components/ServicesScreen';
import PartnersScreen from '@/components/PartnersScreen';
import ProfessionalProfileScreen from '@/components/ProfessionalProfileScreen';
import ProfessionalDashboard from '@/components/professional/ProfessionalDashboard';
import BottomNavigation from '@/components/BottomNavigation';
import DonationScreen from '@/components/DonationScreen';
import AmbassadorDashboard from '@/components/ambassador/AmbassadorDashboard';
import MyDataScreen from '@/components/profile/MyDataScreen';
import MyDonationsScreen from '@/components/profile/MyDonationsScreen';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [selectedArticleId, setSelectedArticleId] = useState<string | undefined>();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | undefined>();

  useEffect(() => {
    const redirectTo = localStorage.getItem('redirect_to');
    if (redirectTo) {
      // A simple validation to ensure we only redirect to valid screens
      const validScreens = [
        'home', 'biblioteca', 'article-detail', 'partners', 
        'partner-profile', 'professional-dashboard', 'ia', 'ajudar', 
        'donation', 'perfil', 'ambassador', 'my-data', 
        'my-donations', 'services'
      ];
      if (validScreens.includes(redirectTo)) {
        setCurrentScreen(redirectTo);
      }
      localStorage.removeItem('redirect_to');
    }
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'biblioteca':
        return <LibraryScreen onNavigate={handleNavigate} />;
      case 'article-detail':
        return <ArticleDetailScreen onBack={() => setCurrentScreen('biblioteca')} articleId={selectedArticleId} />;
      case 'partners':
        return <PartnersScreen onNavigate={handleNavigate} />;
      case 'partner-profile':
        return <ProfessionalProfileScreen onBack={() => setCurrentScreen('partners')} partnerId={selectedPartnerId} />;
      case 'professional-dashboard':
        return <ProfessionalDashboard onBack={() => setCurrentScreen('perfil')} />;
      case 'ia':
        return <AIAgentScreen onBack={() => setCurrentScreen('home')} />;
      case 'ajudar':
        return <HelpScreen onBack={() => setCurrentScreen('home')} onNavigate={handleNavigate} />;
      case 'donation':
        return <DonationScreen onBack={() => setCurrentScreen('ajudar')} />;
      case 'perfil':
        return <ProfileScreen onNavigate={handleNavigate} />;
      case 'ambassador':
        return <AmbassadorDashboard onBack={() => setCurrentScreen('perfil')} />;
      case 'my-data':
        return <MyDataScreen onBack={() => setCurrentScreen('perfil')} />;
      case 'my-donations':
        return <MyDonationsScreen onBack={() => setCurrentScreen('perfil')} onNavigate={handleNavigate} />;
      case 'services':
        return <ServicesScreen onBack={() => setCurrentScreen('home')} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  const handleNavigate = (screen: string, articleId?: string) => {
    if (articleId) {
      setSelectedArticleId(articleId);
      setSelectedPartnerId(articleId); // Para compatibilidade com parceiros
    }
    setCurrentScreen(screen);
  };

  // Define which screens should show the bottom navigation
  const screensWithNavigation = [
    'home', 'biblioteca', 'ia', 'ajudar', 'perfil', 'services', 'partners', 
    'donation', 'my-data', 'my-donations', 'ambassador'
  ];

  // Determine the active tab for the navigation
  const getActiveTab = () => {
    if (currentScreen === 'services' || currentScreen === 'partners') return 'home';
    if (currentScreen === 'donation') return 'ajudar';
    if (currentScreen === 'my-data' || currentScreen === 'my-donations' || currentScreen === 'ambassador') return 'perfil';
    return currentScreen;
  };

  return (
    <div className="min-h-screen bg-cv-off-white relative w-full">
      <div className="pb-16">
        {renderScreen()}
      </div>
      
      {/* Show bottom navigation on main screens and related sub-screens */}
      {screensWithNavigation.includes(currentScreen) && (
        <BottomNavigation 
          currentTab={getActiveTab()} 
          onTabChange={handleNavigate}
        />
      )}
    </div>
  );
};

export default Index;
