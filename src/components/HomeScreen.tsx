
import React from 'react';
import HomeHeader from '@/components/home/HomeHeader';
import HomeHero from '@/components/home/HomeHero';
import QuickActions from '@/components/home/QuickActions';
import QuickAppointment from '@/components/home/QuickAppointment';
import PartnersCarousel from '@/components/home/PartnersCarousel';
import NewsCarousel from '@/components/home/NewsCarousel';
import ImpactSection from '@/components/home/ImpactSection';

interface HomeScreenProps {
  onNavigate?: (screen: string, articleId?: string) => void;
}

const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  return (
    <div className="min-h-screen bg-cv-off-white">
      <HomeHeader onNavigate={onNavigate} />
      <HomeHero onNavigate={onNavigate} />
      <QuickActions onNavigate={onNavigate} />
      <QuickAppointment onNavigate={onNavigate} />
      <PartnersCarousel onNavigate={onNavigate} />
      <NewsCarousel onNavigate={onNavigate} />
      <ImpactSection />
    </div>
  );
};

export default HomeScreen;
