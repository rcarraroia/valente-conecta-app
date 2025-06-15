
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface AmbassadorData {
  id: string;
  full_name: string;
  professional_photo_url?: string;
}

interface LandingHeroProps {
  ambassadorData: AmbassadorData | null;
}

const LandingHero = ({ ambassadorData }: LandingHeroProps) => {
  const scrollToDonation = () => {
    const donationSection = document.getElementById('donation-section');
    if (donationSection) {
      donationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-cv-coral/20 via-cv-off-white to-cv-green/20"></div>
      
      {/* Elementos decorativos */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-cv-coral/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-cv-green/10 rounded-full blur-xl"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Personalização do Embaixador */}
        {ambassadorData && (
          <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mx-auto max-w-2xl">
            <div className="flex items-center justify-center gap-4 mb-4">
              {ambassadorData.professional_photo_url ? (
                <img
                  src={ambassadorData.professional_photo_url}
                  alt={ambassadorData.full_name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-cv-coral/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-cv-coral/20 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-cv-coral" />
                </div>
              )}
              <div>
                <p className="text-cv-gray-dark font-medium">
                  Olá! Meu nome é <span className="text-cv-coral font-bold">{ambassadorData.full_name}</span>
                </p>
                <p className="text-cv-gray-light text-sm">Embaixador(a) do Instituto Coração Valente</p>
              </div>
            </div>
            <p className="text-cv-gray-dark">
              Estou aqui para te convidar a fazer a diferença! Junte-se a mim nessa missão de transformar vidas.
            </p>
          </div>
        )}

        {/* Headline Principal */}
        <h1 className="text-4xl md:text-6xl font-heading font-bold text-cv-gray-dark mb-6 leading-tight">
          Um Abraço que{' '}
          <span className="text-cv-coral">Transforma Vidas</span>
        </h1>
        
        <h2 className="text-xl md:text-2xl text-cv-gray-light mb-8 max-w-3xl mx-auto leading-relaxed">
          Apoie o Neurodesenvolvimento Infantil e ajude crianças com TEA, TDAH e outras condições a alcançarem seu potencial máximo
        </h2>

        {/* CTA Principal */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={scrollToDonation}
            size="lg"
            className="bg-cv-coral hover:bg-cv-coral/90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Heart className="w-5 h-5 mr-2" />
            Quero Doar Agora!
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="border-cv-coral text-cv-coral hover:bg-cv-coral hover:text-white px-8 py-4 text-lg rounded-full transition-all duration-300"
          >
            Saiba Mais Sobre Nossa Causa
          </Button>
        </div>

        {/* Indicadores de Impacto */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-cv-coral mb-2">500+</div>
            <div className="text-cv-gray-dark">Crianças Atendidas</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-cv-coral mb-2">50+</div>
            <div className="text-cv-gray-dark">Profissionais Especializados</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-cv-coral mb-2">10</div>
            <div className="text-cv-gray-dark">Anos de Experiência</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
