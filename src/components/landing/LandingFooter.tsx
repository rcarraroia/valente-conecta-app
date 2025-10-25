
import React from 'react';
import { Heart, Phone, MapPin, Instagram } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer className="bg-cv-gray-dark text-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo e descrição */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/lovable-uploads/96de9681-7a55-45c7-8b32-f405f2bc4e19.png"
                alt="Instituto Coração Valente"
                className="h-12 w-auto"
              />
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Dedicados ao desenvolvimento integral de crianças e adolescentes com necessidades especiais, 
              oferecendo suporte especializado e humanizado para toda a família.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/coracaovalente.ong/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-cv-coral/20 rounded-full flex items-center justify-center hover:bg-cv-coral/30 transition-colors"
                aria-label="Instagram do Instituto Coração Valente"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cv-coral flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-300">Ipatinga - MG</p>
                  <p className="text-gray-300">CEP: 35162-820</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-cv-coral" />
                <a href="tel:+5531988036923" className="text-gray-300 hover:text-cv-coral transition-colors">
                  +55 31 98803-6923
                </a>
              </div>
            </div>
          </div>

          {/* Links úteis */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Links Úteis</h4>
            <div className="space-y-3">
              <a 
                href="#about-section" 
                onClick={(e) => {
                  e.preventDefault();
                  const section = document.getElementById('about-section');
                  if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="block text-gray-300 hover:text-cv-coral transition-colors cursor-pointer"
              >
                Sobre Nós
              </a>
              <a 
                href="#triagem-comportamental-section"
                onClick={(e) => {
                  e.preventDefault();
                  const section = document.getElementById('triagem-comportamental-section');
                  if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="block text-gray-300 hover:text-cv-coral transition-colors cursor-pointer"
              >
                Triagem Comportamental
              </a>
              <a href="/auth" className="block text-gray-300 hover:text-cv-coral transition-colors">Como Ajudar</a>
              <a href="/auth" className="block text-gray-300 hover:text-cv-coral transition-colors">Seja um Parceiro</a>
              <a href="/diagnosis/chat" className="block text-gray-300 hover:text-cv-coral transition-colors">Fazer Triagem</a>
            </div>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-gray-600 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 Instituto Coração Valente. Todos os direitos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-cv-coral transition-colors">Política de Privacidade</a>
              <a href="#" className="text-gray-400 hover:text-cv-coral transition-colors">Termos de Uso</a>
            </div>
          </div>
        </div>

        {/* Certificações */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-4">Instituto Coração Valente - CNPJ: 00.000.000/0001-00</p>
          <div className="flex justify-center items-center space-x-6">
            <div className="bg-gray-600/50 px-4 py-2 rounded text-xs">
              🏆 Certificado de Utilidade Pública
            </div>
            <div className="bg-gray-600/50 px-4 py-2 rounded text-xs">
              🔒 Dados Protegidos - LGPD
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
