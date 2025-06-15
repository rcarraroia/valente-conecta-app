
import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, MessageSquare, Heart, Clock, Users, CheckCircle } from 'lucide-react';

const LandingPreDiagnosis = () => {
  const scrollToTestimonials = () => {
    const testimonialsSection = document.getElementById('testimonials-section');
    if (testimonialsSection) {
      testimonialsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pre-diagnosis-section" className="py-20 bg-gradient-to-br from-cv-coral/5 to-cv-green/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-cv-gray-dark mb-6">
            Pré-Diagnóstico Inteligente
          </h2>
          <p className="text-xl text-cv-gray-light max-w-3xl mx-auto leading-relaxed">
            Nossa ferramenta de pré-diagnóstico utiliza inteligência artificial para identificar possíveis sinais de TEA, TDAH, Dislexia e outras condições do neurodesenvolvimento.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl font-heading font-semibold text-cv-gray-dark mb-6">
              Como Funciona Nossa Avaliação
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cv-coral/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-cv-coral" />
                </div>
                <div>
                  <h4 className="font-semibold text-cv-gray-dark mb-2">Questionário Personalizado</h4>
                  <p className="text-cv-gray-light">Perguntas elaboradas por profissionais especializados, adaptadas para cada faixa etária e situação específica.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cv-coral/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-cv-coral" />
                </div>
                <div>
                  <h4 className="font-semibold text-cv-gray-dark mb-2">Análise Inteligente</h4>
                  <p className="text-cv-gray-light">Nossa IA analisa as respostas e identifica padrões comportamentais que podem indicar condições específicas.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cv-coral/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-cv-coral" />
                </div>
                <div>
                  <h4 className="font-semibold text-cv-gray-dark mb-2">Relatório Detalhado</h4>
                  <p className="text-cv-gray-light">Receba um relatório completo com orientações e recomendações de próximos passos.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-cv-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-10 h-10 text-cv-coral" />
              </div>
              <h4 className="text-xl font-semibold text-cv-gray-dark mb-2">Avaliação Gratuita</h4>
              <p className="text-cv-gray-light">Ferramenta desenvolvida para auxiliar famílias e profissionais</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-cv-green" />
                <span className="text-cv-gray-dark">10-15 minutos para completar</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-cv-green" />
                <span className="text-cv-gray-dark">Para pais, cuidadores e profissionais</span>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-cv-green" />
                <span className="text-cv-gray-dark">Baseado em evidências científicas</span>
              </div>
            </div>
            
            <Button
              onClick={scrollToTestimonials}
              className="w-full bg-cv-coral hover:bg-cv-coral/90 text-white py-3 rounded-full font-semibold"
            >
              Saiba Mais Sobre Nossos Resultados
            </Button>
          </div>
        </div>

        {/* Benefícios da ferramenta */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-heading font-semibold text-cv-gray-dark mb-8 text-center">
            Por que Nosso Pré-Diagnóstico é Diferente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-cv-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-semibold text-cv-gray-dark mb-2">Precisão Científica</h4>
              <p className="text-sm text-cv-gray-light">Baseado em protocolos internacionais e validado por nossa equipe multidisciplinar</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-cv-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="font-semibold text-cv-gray-dark mb-2">Inteligência Artificial</h4>
              <p className="text-sm text-cv-gray-light">Algoritmos avançados que aprendem com cada avaliação para maior precisão</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-cv-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h4 className="font-semibold text-cv-gray-dark mb-2">Suporte Humano</h4>
              <p className="text-sm text-cv-gray-light">Orientação de profissionais especializados após o resultado</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPreDiagnosis;
