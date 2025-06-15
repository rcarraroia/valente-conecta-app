
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight } from 'lucide-react';

const LandingImpact = () => {
  const scrollToTestimonials = () => {
    const testimonialsSection = document.getElementById('testimonials-section');
    if (testimonialsSection) {
      testimonialsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-cv-off-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-cv-gray-dark mb-6">
            Nosso Compromisso com o Desenvolvimento
          </h2>
          <p className="text-xl text-cv-gray-light max-w-3xl mx-auto leading-relaxed">
            Cada família que atendemos recebe cuidado personalizado e suporte contínuo em sua jornada de desenvolvimento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-cv-coral/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">🧠</span>
            </div>
            <h3 className="text-xl font-semibold text-cv-gray-dark mb-4">Neuropsicologia</h3>
            <p className="text-cv-gray-light mb-4">
              Avaliações especializadas e intervenções baseadas em evidências científicas para promover o desenvolvimento cognitivo.
            </p>
            <ul className="text-sm text-cv-gray-light space-y-1">
              <li>• Avaliação neuropsicológica completa</li>
              <li>• Planos de intervenção personalizados</li>
              <li>• Acompanhamento do progresso</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-cv-coral/20">
            <div className="w-16 h-16 bg-cv-coral/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold text-cv-gray-dark mb-4">Fonoaudiologia</h3>
            <p className="text-cv-gray-light mb-4">
              Desenvolvimento da comunicação e linguagem através de técnicas especializadas e abordagens inovadoras.
            </p>
            <ul className="text-sm text-cv-gray-light space-y-1">
              <li>• Terapia de fala e linguagem</li>
              <li>• Comunicação alternativa</li>
              <li>• Orientação familiar</li>
            </ul>
            <div className="mt-4 px-3 py-1 bg-cv-coral/10 text-cv-coral text-xs font-semibold rounded-full inline-block">
              Especialidade Principal
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-cv-coral/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-cv-gray-dark mb-4">Terapia Ocupacional</h3>
            <p className="text-cv-gray-light mb-4">
              Promoção da autonomia e independência nas atividades do dia a dia, respeitando o ritmo de cada criança.
            </p>
            <ul className="text-sm text-cv-gray-light space-y-1">
              <li>• Desenvolvimento motor</li>
              <li>• Integração sensorial</li>
              <li>• Habilidades da vida diária</li>
            </ul>
          </div>
        </div>

        {/* Seção de números de impacto */}
        <div className="bg-gradient-to-r from-cv-coral to-cv-green p-8 rounded-2xl text-white text-center">
          <h3 className="text-2xl font-bold mb-8">Nosso Impacto em Números</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold mb-2">2.500+</div>
              <div className="text-sm opacity-90">Sessões realizadas este ano</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">150+</div>
              <div className="text-sm opacity-90">Famílias beneficiadas</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-sm opacity-90">Melhora significativa relatada</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-sm opacity-90">Dedicação e cuidado</div>
            </div>
          </div>
        </div>

        {/* CTA para conhecer mais */}
        <div className="text-center mt-12">
          <Button
            onClick={scrollToTestimonials}
            size="lg"
            className="bg-cv-coral hover:bg-cv-coral/90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Heart className="w-5 h-5 mr-2" />
            Ajude Nossa Causa
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LandingImpact;
