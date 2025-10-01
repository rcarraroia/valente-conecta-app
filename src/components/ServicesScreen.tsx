
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, Users, Brain, BookOpen } from 'lucide-react';

interface ServicesScreenProps {
  onBack: () => void;
}

const ServicesScreen = ({ onBack }: ServicesScreenProps) => {
  const services = [
    {
      title: "Acolhimento Familiar",
      description: "Suporte integral para famílias no processo de triagem comportamental e desenvolvimento",
      icon: Heart,
      color: "bg-cv-green-mint"
    },
    {
      title: "Orientação Especializada", 
      description: "Equipe multidisciplinar para orientação e acompanhamento",
      icon: Users,
      color: "bg-cv-blue-heart"
    },
    {
      title: "Triagem Comportamental Inteligente",
      description: "Ferramenta de IA para identificação precoce de sinais de desenvolvimento",
      icon: Brain,
      color: "bg-cv-coral"
    },
    {
      title: "Biblioteca de Recursos",
      description: "Artigos, guias e materiais educativos para famílias e cuidadores",
      icon: BookOpen,
      color: "bg-cv-yellow-soft"
    }
  ];

  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-cv-gray-light hover:text-cv-gray-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-heading font-bold text-cv-gray-dark">
            Nossos Serviços
          </h1>
        </div>

        {/* Hero */}
        <Card className="bg-gradient-to-br from-cv-purple-soft to-cv-blue-heart text-white border-none">
          <CardContent className="p-6 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-white" />
            <h2 className="text-xl font-bold mb-2">Instituto Coração Valente</h2>
            <p className="opacity-90">
              Oferecemos apoio integral para famílias no processo de triagem comportamental e desenvolvimento, 
              com foco em acolhimento humanizado e orientação especializada.
            </p>
          </CardContent>
        </Card>

        {/* Services */}
        <div className="space-y-4">
          {services.map((service, index) => (
            <Card 
              key={service.title}
              className="border-none shadow-md hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`${service.color} p-3 rounded-full flex-shrink-0`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-cv-gray-dark mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm text-cv-gray-light leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission */}
        <Card className="border-cv-yellow-soft bg-cv-yellow-soft/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-cv-gray-dark mb-2">Nossa Missão</h3>
            <p className="text-sm text-cv-gray-dark leading-relaxed">
              Proporcionar acolhimento humanizado e orientação especializada para famílias 
              que buscam compreender e apoiar o desenvolvimento de seus filhos, criando 
              uma rede de suporte baseada em conhecimento científico e empatia.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServicesScreen;
