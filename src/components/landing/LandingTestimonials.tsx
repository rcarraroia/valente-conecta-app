
import React from 'react';
import { Star, Quote, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const LandingTestimonials = () => {
  const navigate = useNavigate();
  
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
  const testimonials = [
    {
      name: "Maria Santos",
      role: "Mãe do João, 8 anos",
      content: "A ONG Coração Valente transformou a vida do meu filho. Hoje ele se comunica melhor, está mais confiante e feliz. A equipe é maravilhosa e sempre nos acolhe com muito carinho.",
      rating: 5
    },
    {
      name: "Dr. Carlos Mendes",
      role: "Neurologista Parceiro",
      content: "A qualidade do atendimento e o profissionalismo da equipe são excepcionais. É uma honra fazer parte desta rede que verdadeiramente transforma vidas.",
      rating: 5
    },
    {
      name: "Ana Paula",
      role: "Mãe da Sofia, 6 anos",
      content: "Minha filha com TEA evoluiu muito desde que começou o tratamento. As terapeutas são especializadas e tratam cada criança de forma única e especial.",
      rating: 5
    }
  ];

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="testimonials-section" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-cv-gray-dark mb-6">
            Histórias que Nos Motivam
          </h2>
          <p className="text-xl text-cv-gray-light max-w-3xl mx-auto leading-relaxed">
            Cada família que passa pela ONG Coração Valente tem uma história única de superação e desenvolvimento. Conheça alguns depoimentos:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-cv-off-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
              <Quote className="w-8 h-8 text-cv-coral/30 absolute top-4 right-4" />
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-cv-gray-dark mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              <div className="border-t border-cv-gray-light/30 pt-4">
                <h4 className="font-semibold text-cv-gray-dark">{testimonial.name}</h4>
                <p className="text-sm text-cv-gray-light">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-cv-coral/5 to-cv-green/5 p-12 rounded-2xl">
          <h3 className="text-2xl font-heading font-semibold text-cv-gray-dark mb-4">
            Faça Parte Desta Transformação
          </h3>
          <p className="text-cv-gray-light mb-8 max-w-2xl mx-auto">
            Junte-se a nós nesta missão de promover o desenvolvimento pleno de crianças e adolescentes. Sua participação faz toda a diferença.
          </p>
          <Button
            onClick={handleAjudeNossaCausa}
            size="lg"
            className="bg-cv-coral hover:bg-cv-coral/90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Heart className="w-5 h-5 mr-2" />
            Ajude Nossa Causa
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Seção adicional de credibilidade */}
        <div className="mt-16 bg-gradient-to-r from-cv-green/5 to-cv-coral/5 p-8 rounded-2xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-semibold text-cv-gray-dark mb-4">
              Reconhecimento e Parcerias
            </h3>
            <p className="text-cv-gray-light">
              Nosso trabalho é reconhecido por instituições de saúde e educação
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-cv-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h4 className="font-semibold text-cv-gray-dark mb-2">Certificações</h4>
              <p className="text-sm text-cv-gray-light">Profissionais certificados e especializados</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-cv-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h4 className="font-semibold text-cv-gray-dark mb-2">Parcerias</h4>
              <p className="text-sm text-cv-gray-light">Rede de profissionais especializados</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-cv-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h4 className="font-semibold text-cv-gray-dark mb-2">Transparência</h4>
              <p className="text-sm text-cv-gray-light">Relatórios de impacto regulares</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingTestimonials;
