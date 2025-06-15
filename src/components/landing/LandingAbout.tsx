
import React from 'react';
import { Heart, Users, Target, Award } from 'lucide-react';

const LandingAbout = () => {
  return (
    <section id="about-section" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-cv-gray-dark mb-6">
            Quem Somos e o que Nos Move
          </h2>
          <p className="text-xl text-cv-gray-light max-w-3xl mx-auto leading-relaxed">
            O Instituto Coração Valente é uma organização dedicada ao desenvolvimento integral de crianças e adolescentes com necessidades especiais, oferecendo suporte especializado e humanizado.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl font-heading font-semibold text-cv-gray-dark mb-6">
              Nossa Missão
            </h3>
            <p className="text-cv-gray-light mb-6 leading-relaxed">
              Promover o desenvolvimento pleno de crianças e adolescentes com TEA, TDAH, Dislexia e outras condições do neurodesenvolvimento, através de atendimento multidisciplinar especializado e apoio às famílias.
            </p>
            <p className="text-cv-gray-light leading-relaxed">
              Acreditamos que cada criança tem potencial único e merece todas as oportunidades para crescer, aprender e se desenvolver em um ambiente acolhedor e especializado.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-cv-off-white p-6 rounded-xl text-center">
              <Heart className="w-12 h-12 text-cv-coral mx-auto mb-4" />
              <h4 className="font-semibold text-cv-gray-dark mb-2">Amor</h4>
              <p className="text-sm text-cv-gray-light">Base de tudo que fazemos</p>
            </div>
            <div className="bg-cv-off-white p-6 rounded-xl text-center">
              <Users className="w-12 h-12 text-cv-coral mx-auto mb-4" />
              <h4 className="font-semibold text-cv-gray-dark mb-2">Comunidade</h4>
              <p className="text-sm text-cv-gray-light">Juntos somos mais fortes</p>
            </div>
            <div className="bg-cv-off-white p-6 rounded-xl text-center">
              <Target className="w-12 h-12 text-cv-coral mx-auto mb-4" />
              <h4 className="font-semibold text-cv-gray-dark mb-2">Propósito</h4>
              <p className="text-sm text-cv-gray-light">Transformar vidas</p>
            </div>
            <div className="bg-cv-off-white p-6 rounded-xl text-center">
              <Award className="w-12 h-12 text-cv-coral mx-auto mb-4" />
              <h4 className="font-semibold text-cv-gray-dark mb-2">Excelência</h4>
              <p className="text-sm text-cv-gray-light">Qualidade em tudo</p>
            </div>
          </div>
        </div>

        {/* Serviços oferecidos */}
        <div className="bg-gradient-to-r from-cv-coral/5 to-cv-green/5 rounded-2xl p-8">
          <h3 className="text-2xl font-heading font-semibold text-cv-gray-dark mb-8 text-center">
            Como Ajudamos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-cv-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h4 className="font-semibold text-cv-gray-dark mb-2">Neuropsicologia</h4>
              <p className="text-sm text-cv-gray-light">Avaliação e intervenção especializada</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-cv-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="font-semibold text-cv-gray-dark mb-2">Fonoaudiologia</h4>
              <p className="text-sm text-cv-gray-light">Desenvolvimento da comunicação</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-cv-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-semibold text-cv-gray-dark mb-2">Terapia Ocupacional</h4>
              <p className="text-sm text-cv-gray-light">Autonomia e independência</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-cv-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h4 className="font-semibold text-cv-gray-dark mb-2">Psicologia</h4>
              <p className="text-sm text-cv-gray-light">Bem-estar emocional</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingAbout;
