
import React from 'react';
import HomeHeader from './home/HomeHeader';
import HomeHero from './home/HomeHero';
import QuickActions from './home/QuickActions';
import ImpactSection from './home/ImpactSection';
import NewsCarousel from './home/NewsCarousel';

interface HomeScreenProps {
  onNavigate?: (screen: string) => void;
}

const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  const handleJourneyStart = () => {
    onNavigate?.('ia');
  };

  return (
    <div className="min-h-screen bg-cv-off-white">
      <HomeHeader />
      <HomeHero onJourneyStart={handleJourneyStart} />
      <QuickActions onNavigate={onNavigate} />
      <ImpactSection />
      <NewsCarousel onNavigate={onNavigate} />
      
      {/* Bottom spacing for navigation */}
      <div className="h-20" aria-hidden="true"></div>
    </div>
  );
};

export default HomeScreen;
