
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Users, 
  Building, 
  ArrowRight, 
  DollarSign,
  HandHeart,
  Star,
  Quote,
  TrendingUp,
  Calendar,
  Gift
} from 'lucide-react';

const HelpScreen = () => {
  const helpOptions = [
    {
      title: "Faça uma Doação",
      description: "Contribua financeiramente para nossos projetos de acolhimento e inclusão",
      icon: Heart,
      color: "bg-cv-coral",
      textColor: "text-white",
      cta: "Doar Agora",
      details: "A partir de R$ 10/mês"
    },
    {
      title: "Seja Voluntário",
      description: "Oferece seu tempo e habilidades para apoiar famílias e projetos",
      icon: Users,
      color: "bg-cv-green-mint",
      textColor: "text-white",
      cta: "Quero Voluntariar",
      details: "2h por semana"
    },
    {
      title: "Parceria Corporativa",
      description: "Sua empresa pode se tornar parceira e apoiar nossa missão",
      icon: Building,
      color: "bg-cv-blue-soft",
      textColor: "text-white",
      cta: "Fazer Parceria",
      details: "Benefícios fiscais"
    }
  ];

  const impactData = [
    {
      value: "R$ 50",
      description: "1 sessão de terapia especializada",
      icon: Heart
    },
    {
      value: "R$ 150",
      description: "Kit de materiais pedagógicos",
      icon: Gift
    },
    {
      value: "R$ 300",
      description: "Avaliação completa de criança",
      icon: Star
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Mantenedora há 2 anos",
      quote: "Contribuir com o Coração Valente mudou minha perspectiva sobre inclusão. Ver o impacto direto na vida das famílias é transformador.",
      avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "João Santos",
      role: "Voluntário e Pai",
      quote: "Como pai de uma criança atípica, entendo a importância do acolhimento. Voluntariar aqui é retribuir todo o apoio que recebemos.",
      avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-cv-off-white pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-cv-coral to-cv-coral/80 text-white p-6">
        <div className="space-y-2">
          <h1 className="text-h1 font-heading font-bold">Apoie o Coração Valente</h1>
          <p className="text-body opacity-95">
            Juntos, podemos transformar vidas e construir um futuro mais inclusivo
          </p>
        </div>
      </header>

      {/* Hero Image/Video Section */}
      <section className="relative h-48 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=800&h=400&fit=crop"
          alt="Crianças brincando em um ambiente inclusivo e acolhedor"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-cv-blue-soft/60 flex items-center justify-center">
          <div className="text-center text-white space-y-2">
            <h2 className="text-h2 font-heading font-bold">Cada Gesto Importa</h2>
            <p className="text-body">Sua contribuição transforma realidades</p>
          </div>
        </div>
      </section>

      {/* Help Options */}
      <section className="p-6" aria-labelledby="help-options-title">
        <h3 id="help-options-title" className="text-h2 font-heading font-bold text-cv-gray-dark mb-6 text-center">
          Como Você Pode Ajudar
        </h3>
        <div className="space-y-4">
          {helpOptions.map((option, index) => (
            <Card 
              key={option.title}
              className="bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`${option.color} p-3 rounded-xl`}>
                    <option.icon className={`w-8 h-8 ${option.textColor}`} />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="text-h3 font-heading font-bold text-cv-gray-dark">
                        {option.title}
                      </h4>
                      <p className="text-body text-cv-gray-light mt-1">
                        {option.description}
                      </p>
                      <Badge variant="secondary" className="mt-2 bg-cv-yellow-soft text-cv-gray-dark">
                        {option.details}
                      </Badge>
                    </div>
                    <Button 
                      className={`${option.color} ${option.textColor} hover:opacity-90 font-semibold transition-all duration-300 hover:scale-105 shadow-lg`}
                      size="lg"
                    >
                      {option.cta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Impact Section */}
      <section className="p-6 bg-white mx-4 rounded-2xl shadow-lg mb-6" aria-labelledby="impact-title">
        <h3 id="impact-title" className="text-h2 font-heading font-bold text-cv-gray-dark mb-6 text-center">
          Veja o Impacto da Sua Doação
        </h3>
        <div className="space-y-4">
          {impactData.map((impact, index) => (
            <div 
              key={impact.value}
              className="flex items-center space-x-4 p-4 bg-cv-off-white rounded-xl animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-cv-green-mint p-3 rounded-lg">
                <impact.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-h3 font-bold text-cv-coral">{impact.value}</div>
                <p className="text-body text-cv-gray-dark">{impact.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-cv-blue-soft to-cv-green-mint rounded-xl text-white text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2" />
          <h4 className="font-bold text-h3 mb-1">100% dos recursos</h4>
          <p className="text-body opacity-95">são direcionados para nossos projetos sociais</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="p-6" aria-labelledby="testimonials-title">
        <h3 id="testimonials-title" className="text-h2 font-heading font-bold text-cv-gray-dark mb-6 text-center">
          Depoimentos de Mantenedores
        </h3>
        <div className="space-y-4">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name}
              className="bg-white border-none shadow-lg animate-slide-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <img 
                    src={testimonial.avatar}
                    alt={`Foto de ${testimonial.name}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-cv-green-mint"
                  />
                  <div className="flex-1 space-y-2">
                    <Quote className="w-6 h-6 text-cv-blue-soft opacity-50" />
                    <p className="text-body text-cv-gray-dark italic">
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <h4 className="font-semibold text-cv-gray-dark">{testimonial.name}</h4>
                      <p className="text-caption text-cv-gray-light">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="p-6">
        <Card className="bg-gradient-to-br from-cv-coral via-cv-coral/90 to-cv-coral/80 border-none shadow-xl text-white">
          <CardContent className="p-6 text-center space-y-4">
            <Heart className="w-12 h-12 mx-auto text-white/90" />
            <h3 className="text-h2 font-heading font-bold">
              Pronto para Fazer a Diferença?
            </h3>
            <p className="text-body opacity-95">
              Escolha como quer contribuir e seja parte desta transformação
            </p>
            <div className="flex flex-col space-y-3 pt-4">
              <Button 
                size="lg"
                className="bg-white text-cv-coral hover:bg-cv-off-white font-bold shadow-lg transition-all duration-300 hover:scale-105"
              >
                <DollarSign className="mr-2 h-5 w-5" />
                Começar Doação Mensal
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-cv-coral font-semibold"
              >
                <HandHeart className="mr-2 h-5 w-5" />
                Quero ser Voluntário
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default HelpScreen;
