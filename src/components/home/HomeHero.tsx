
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HomeHeroProps {
  onNavigate?: (screen: string, articleId?: string) => void;
}

const HomeHero = ({ onNavigate }: HomeHeroProps) => {
  const handleJourneyStart = () => {
    // Redirecionar para a nova interface de diagnóstico
    window.location.href = '/diagnosis';
  };

  return (
    <section 
      className="relative bg-gradient-to-br from-cv-purple-soft via-cv-blue-heart to-cv-purple-dark px-4 py-6 text-white"
      role="banner"
      aria-labelledby="hero-title"
    >
      <div className="relative z-10 space-y-4 animate-fade-in">
        <h2 id="hero-title" className="text-xl sm:text-2xl font-heading font-bold leading-tight">
          Descubra o Poder do Acolhimento
        </h2>
        <p className="text-sm sm:text-base opacity-95 leading-relaxed">
          Oferecemos orientação especializada e apoio integral para famílias no processo de diagnóstico e desenvolvimento.
        </p>
        <Button 
          onClick={handleJourneyStart}
          className="bg-white text-cv-purple-dark hover:bg-cv-off-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 w-full touch-target"
          size="lg"
          aria-label="Iniciar jornada de orientação no Instituto Coração Valente"
        >
          <span>Inicie Sua Jornada</span>
          <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0" aria-hidden="true" />
        </Button>
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl" aria-hidden="true"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full blur-lg" aria-hidden="true"></div>
    </section>
  );
};

export default HomeHero;
