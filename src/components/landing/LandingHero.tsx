
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AmbassadorData {
  id: string;
  full_name: string;
  professional_photo_url?: string;
}

interface LandingHeroProps {
  ambassadorData: AmbassadorData | null;
}

const LandingHero = ({ ambassadorData }: LandingHeroProps) => {
  const navigate = useNavigate();

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAjudeNossaCausa = () => {
    // Preservar código do embaixador se existir
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    
    // Definir para redirecionar para a tela de ajudar
    localStorage.setItem('redirect_to', 'ajudar');
    
    if (ref) {
      navigate(`/?ref=${ref}`);
    } else {
      navigate('/');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background com gradiente usando tons de azul */}
      <div className="absolute inset-0 bg-gradient-to-br from-cv-blue-heart/20 via-cv-off-white to-cv-purple-soft/20"></div>
      
      {/* Elementos decorativos com tons de azul */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-cv-blue-heart/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-cv-purple-soft/10 rounded-full blur-xl"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Personalização do Embaixador */}
        {ambassadorData && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-lg mx-auto max-w-2xl border border-cv-blue-heart/20">
            <div className="flex items-center justify-center gap-4 mb-4">
              {ambassadorData.professional_photo_url ? (
                <img
                  src={ambassadorData.professional_photo_url}
                  alt={ambassadorData.full_name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-cv-blue-heart/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-cv-blue-heart/20 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-cv-blue-heart" />
                </div>
              )}
              <div>
                <p className="text-cv-gray-dark font-medium">
                  Olá! Meu nome é <span className="text-cv-blue-heart font-bold">{ambassadorData.full_name}</span>
                </p>
                <p className="text-cv-gray-light text-sm">Embaixador(a) da ONG Coração Valente</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Logomarca circular do Instituto */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8">
          <img
            src="/lovable-uploads/9343bd02-f7b0-4bb6-81a4-b8e8ee1af9e9.png"
            alt="ONG Coração Valente"
            className="mx-auto h-40 md:h-48 w-auto"
          />
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl text-cv-gray-light mb-8 max-w-3xl mx-auto leading-relaxed">
          Promovendo o desenvolvimento integral de crianças com TEA, TDAH, Dislexia e outras condições do neurodesenvolvimento
        </motion.h2>

        {/* CTA Principal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button
            onClick={handleAjudeNossaCausa}
            size="lg"
            className="bg-cv-blue-heart hover:bg-cv-blue-heart/90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Heart className="w-5 h-5 mr-2" />
            Ajude Nossa Causa
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => document.getElementById('triagem-comportamental-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="border-cv-purple-soft text-cv-purple-soft hover:bg-cv-purple-soft hover:text-white px-8 py-4 text-lg rounded-full transition-all duration-300"
          >
            Conheça Nossa Triagem Comportamental
          </Button>
        </motion.div>

        {/* Indicadores de Impacto */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-cv-blue-heart/10">
            <div className="text-3xl font-bold text-cv-blue-heart mb-2">500+</div>
            <div className="text-cv-gray-dark">Crianças Atendidas</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-cv-purple-soft/10">
            <div className="text-3xl font-bold text-cv-purple-soft mb-2">50+</div>
            <div className="text-cv-gray-dark">Profissionais Especializados</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-cv-blue-heart/10">
            <div className="text-3xl font-bold text-cv-blue-heart mb-2">10</div>
            <div className="text-cv-gray-dark">Anos de Experiência</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingHero;
