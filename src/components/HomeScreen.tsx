
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Book, 
  User, 
  Mail,
  Search,
  Heart,
  Users,
  Brain,
  HandHeart,
  Calendar,
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import OptimizedImage from './OptimizedImage';

const HomeScreen = () => {
  const quickActions = [
    {
      title: "Pré-Diagnóstico IA",
      description: "Orientação inteligente",
      icon: Brain,
      color: "bg-cv-green-mint",
      textColor: "text-white",
      ariaLabel: "Iniciar pré-diagnóstico com inteligência artificial"
    },
    {
      title: "Nossos Serviços",
      description: "Conheça nossa missão",
      icon: Heart,
      color: "bg-cv-blue-heart",
      textColor: "text-white",
      ariaLabel: "Conhecer serviços do Instituto Coração Valente"
    },
    {
      title: "Biblioteca",
      description: "Artigos e guias",
      icon: Book,
      color: "bg-cv-yellow-soft",
      textColor: "text-cv-purple-dark",
      ariaLabel: "Acessar biblioteca de artigos e guias"
    },
    {
      title: "Quero Ajudar",
      description: "Seja um mantenedor",
      icon: HandHeart,
      color: "bg-cv-coral",
      textColor: "text-white",
      ariaLabel: "Descobrir como ajudar o Instituto"
    }
  ];

  const recentNews = [
    {
      id: 1,
      title: "Nova Metodologia de Acolhimento Familiar",
      description: "Desenvolvemos uma abordagem inovadora para apoiar famílias no processo de diagnóstico.",
      date: "05 Jun 2025",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      category: "Metodologia"
    },
    {
      id: 2,
      title: "Workshop: Sinais Precoces do TEA",
      description: "Evento gratuito para pais e cuidadores sobre identificação precoce do Transtorno do Espectro Autista.",
      date: "10 Jun 2025",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      category: "Evento"
    },
    {
      id: 3,
      title: "Parceria com Universidade Federal",
      description: "Nova colaboração para pesquisas em neurodesenvolvimento e inclusão educacional.",
      date: "01 Jun 2025",
      image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
      category: "Parceria"
    }
  ];

  return (
    <div className="min-h-screen bg-cv-off-white">
      {/* Header - Mobile Optimized */}
      <header className="bg-cv-purple-soft text-white px-4 py-3 shadow-lg" role="banner">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <OptimizedImage 
                src="/lovable-uploads/1df1dc10-fe00-4ce7-8731-1e01e428d28e.png"
                alt="Logotipo do Instituto Coração Valente"
                className="w-8 h-8 object-contain"
                width={32}
                height={32}
              />
            </div>
            <div>
              <h1 className="text-lg font-heading font-bold">Coração Valente</h1>
              <p className="text-xs opacity-90">Conecta</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20 w-10 h-10" 
            aria-label="Abrir busca"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </header>

      {/* Hero Section - Mobile Optimized */}
      <section 
        className="relative bg-gradient-to-br from-cv-purple-soft via-cv-blue-heart to-cv-purple-dark px-4 py-6 text-white"
        role="banner"
        aria-labelledby="hero-title"
      >
        <div className="relative z-10 space-y-4 animate-fade-in">
          <h2 id="hero-title" className="text-2xl font-heading font-bold leading-tight">
            Descubra o Poder do Acolhimento
          </h2>
          <p className="text-base opacity-95">
            Oferecemos orientação especializada e apoio integral para famílias no processo de diagnóstico e desenvolvimento.
          </p>
          <Button 
            className="bg-white text-cv-purple-dark hover:bg-cv-off-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            size="lg"
            aria-label="Iniciar jornada de orientação no Instituto Coração Valente"
          >
            Inicie Sua Jornada
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full blur-lg" aria-hidden="true"></div>
      </section>

      {/* Quick Actions - Mobile Grid */}
      <section className="px-4 py-6" aria-labelledby="quick-actions-title">
        <h3 id="quick-actions-title" className="text-xl font-heading font-bold text-cv-purple-dark mb-4">
          Acesso Rápido
        </h3>
        <div className="grid grid-cols-2 gap-3" role="grid">
          {quickActions.map((action, index) => (
            <Card 
              key={action.title}
              className={`${action.color} border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-slide-up touch-target`}
              style={{ animationDelay: `${index * 100}ms` }}
              role="gridcell"
              tabIndex={0}
              aria-label={action.ariaLabel}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  // Handle action click
                }
              }}
            >
              <CardContent className="p-3 text-center space-y-2">
                <action.icon className={`w-6 h-6 mx-auto ${action.textColor}`} aria-hidden="true" />
                <h4 className={`font-semibold text-sm ${action.textColor}`}>
                  {action.title}
                </h4>
                <p className={`text-xs opacity-90 ${action.textColor} leading-tight`}>
                  {action.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Impact Section - Mobile Layout */}
      <section className="px-4 pb-6" aria-labelledby="impact-title">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h3 id="impact-title" className="text-xl font-heading font-bold text-cv-purple-dark mb-4 text-center">
            Nosso Impacto
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center" role="grid">
            <div className="space-y-1" role="gridcell">
              <div className="text-2xl font-bold text-cv-green-mint" aria-label="Duas mil e quinhentas famílias atendidas">2.5K+</div>
              <p className="text-xs text-cv-purple-dark">Famílias Atendidas</p>
            </div>
            <div className="space-y-1" role="gridcell">
              <div className="text-2xl font-bold text-cv-coral" aria-label="Noventa e oito por cento de satisfação">98%</div>
              <p className="text-xs text-cv-purple-dark">Satisfação</p>
            </div>
            <div className="space-y-1" role="gridcell">
              <div className="text-2xl font-bold text-cv-blue-heart" aria-label="Quinze especialistas">15</div>
              <p className="text-xs text-cv-purple-dark">Especialistas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent News - Mobile Carousel */}
      <section className="px-4 pb-6" aria-labelledby="news-title">
        <div className="flex items-center justify-between mb-4">
          <h3 id="news-title" className="text-xl font-heading font-bold text-cv-purple-dark">
            Últimas Notícias
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-cv-blue-heart hover:text-cv-green-mint text-sm"
            aria-label="Ver todas as notícias"
          >
            Ver todas
          </Button>
        </div>
        <Carousel className="w-full" opts={{ align: "start", loop: true }}>
          <CarouselContent className="-ml-2">
            {recentNews.map((news, index) => (
              <CarouselItem key={news.id} className="pl-2 basis-[90%]">
                <Card 
                  className="bg-white border-none shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                  role="article"
                  aria-labelledby={`news-title-${news.id}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      // Handle news click
                    }
                  }}
                >
                  <CardContent className="p-0">
                    <div className="flex space-x-3">
                      <OptimizedImage 
                        src={news.image}
                        alt={`Imagem relacionada à notícia: ${news.title}`}
                        className="w-16 h-16 object-cover rounded-l-lg flex-shrink-0"
                        width={64}
                        height={64}
                      />
                      <div className="flex-1 p-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary" 
                            className="bg-cv-yellow-soft text-cv-purple-dark text-xs"
                          >
                            {news.category}
                          </Badge>
                          <time className="text-xs text-cv-gray-light" dateTime="2025-06-05">
                            {news.date}
                          </time>
                        </div>
                        <h4 id={`news-title-${news.id}`} className="font-semibold text-sm text-cv-purple-dark line-clamp-2">
                          {news.title}
                        </h4>
                        <p className="text-xs text-cv-gray-light line-clamp-2">
                          {news.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious 
            className="left-2 bg-white/80 hover:bg-white text-cv-purple-dark w-8 h-8" 
            aria-label="Notícia anterior"
          />
          <CarouselNext 
            className="right-2 bg-white/80 hover:bg-white text-cv-purple-dark w-8 h-8" 
            aria-label="Próxima notícia"
          />
        </Carousel>
      </section>

      {/* Bottom spacing for navigation */}
      <div className="h-20" aria-hidden="true"></div>
    </div>
  );
};

export default HomeScreen;
