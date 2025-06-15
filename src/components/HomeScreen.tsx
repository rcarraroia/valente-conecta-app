
import React from 'react';
import HomeHeader from './home/HomeHeader';
import HomeHero from './home/HomeHero';
import QuickActions from './home/QuickActions';
import NewsCarousel from './home/NewsCarousel';
import PartnersCarousel from './home/PartnersCarousel';
import QuickAppointment from './home/QuickAppointment';
import ImpactSection from './home/ImpactSection';

interface HomeScreenProps {
  onNavigate?: (screen: string, articleId?: string) => void;
}

const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  return (
    <div className="min-h-screen bg-cv-off-white">
      <HomeHeader />
      <main className="pb-4" role="main">
        <HomeHero onNavigate={onNavigate} />
        <QuickActions onNavigate={onNavigate} />
        <QuickAppointment onNavigate={onNavigate} />
        <NewsCarousel onNavigate={onNavigate} />
        <PartnersCarousel onNavigate={onNavigate} />
        <ImpactSection />
      </main>
    </div>
  );
};

export default HomeScreen;
