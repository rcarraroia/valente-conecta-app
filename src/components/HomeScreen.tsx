
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

const HomeScreen = () => {
  const quickActions = [
    {
      title: "Pré-Diagnóstico IA",
      description: "Orientação inteligente",
      icon: Brain,
      color: "bg-cv-green-mint",
      textColor: "text-white"
    },
    {
      title: "Nossos Serviços",
      description: "Conheça nossa missão",
      icon: Heart,
      color: "bg-cv-blue-heart",
      textColor: "text-white"
    },
    {
      title: "Biblioteca",
      description: "Artigos e guias",
      icon: Book,
      color: "bg-cv-yellow-soft",
      textColor: "text-cv-purple-dark"
    },
    {
      title: "Quero Ajudar",
      description: "Seja um mantenedor",
      icon: HandHeart,
      color: "bg-cv-coral",
      textColor: "text-white"
    }
  ];

  const recentNews = [
    {
      id: 1,
      title: "Nova Metodologia de Acolhimento Familiar",
      description: "Desenvolvemos uma abordagem inovadora para apoiar famílias no processo de diagnóstico.",
      date: "05 Jun 2025",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=200&fit=crop",
      category: "Metodologia"
    },
    {
      id: 2,
      title: "Workshop: Sinais Precoces do TEA",
      description: "Evento gratuito para pais e cuidadores sobre identificação precoce do Transtorno do Espectro Autista.",
      date: "10 Jun 2025",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop",
      category: "Evento"
    },
    {
      id: 3,
      title: "Parceria com Universidade Federal",
      description: "Nova colaboração para pesquisas em neurodesenvolvimento e inclusão educacional.",
      date: "01 Jun 2025",
      image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=200&fit=crop",
      category: "Parceria"
    }
  ];

  return (
    <div className="min-h-screen bg-cv-off-white">
      {/* Header */}
      <header className="bg-cv-purple-soft text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <img 
                src="/lovable-uploads/1df1dc10-fe00-4ce7-8731-1e01e428d28e.png" 
                alt="Instituto Coração Valente" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-h3 font-heading font-bold">Coração Valente</h1>
              <p className="text-sm opacity-90">Conecta</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" aria-label="Pesquisar">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cv-purple-soft via-cv-blue-heart to-cv-purple-dark p-6 text-white">
        <div className="relative z-10 space-y-4 animate-fade-in">
          <h2 className="text-h1 font-heading font-bold leading-tight">
            Descubra o Poder do Acolhimento
          </h2>
          <p className="text-body opacity-95 max-w-md">
            Oferecemos orientação especializada e apoio integral para famílias no processo de diagnóstico e desenvolvimento.
          </p>
          <Button 
            className="bg-white text-cv-purple-dark hover:bg-cv-off-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
            size="lg"
            aria-label="Iniciar jornada de orientação"
          >
            Inicie Sua Jornada
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
      </section>

      {/* Quick Actions */}
      <section className="p-6" aria-labelledby="quick-actions-title">
        <h3 id="quick-actions-title" className="text-h2 font-heading font-bold text-cv-purple-dark mb-4">
          Acesso Rápido
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Card 
              key={action.title}
              className={`${action.color} border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-slide-up`}
              style={{ animationDelay: `${index * 100}ms` }}
              role="button"
              tabIndex={0}
              aria-label={`${action.title}: ${action.description}`}
            >
              <CardContent className="p-4 text-center space-y-2">
                <action.icon className={`w-8 h-8 mx-auto ${action.textColor}`} />
                <h4 className={`font-semibold text-sm ${action.textColor}`}>
                  {action.title}
                </h4>
                <p className={`text-xs opacity-90 ${action.textColor}`}>
                  {action.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Impact Section */}
      <section className="p-6 bg-white mx-4 rounded-2xl shadow-lg mb-6" aria-labelledby="impact-title">
        <h3 id="impact-title" className="text-h2 font-heading font-bold text-cv-purple-dark mb-4 text-center">
          Nosso Impacto
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-h1 font-bold text-cv-green-mint">2.5K+</div>
            <p className="text-caption text-cv-purple-dark">Famílias Atendidas</p>
          </div>
          <div className="space-y-2">
            <div className="text-h1 font-bold text-cv-coral">98%</div>
            <p className="text-caption text-cv-purple-dark">Satisfação</p>
          </div>
          <div className="space-y-2">
            <div className="text-h1 font-bold text-cv-blue-heart">15</div>
            <p className="text-caption text-cv-purple-dark">Especialistas</p>
          </div>
        </div>
      </section>

      {/* Recent News */}
      <section className="p-6" aria-labelledby="news-title">
        <div className="flex items-center justify-between mb-4">
          <h3 id="news-title" className="text-h2 font-heading font-bold text-cv-purple-dark">
            Últimas Notícias
          </h3>
          <Button variant="ghost" size="sm" className="text-cv-blue-heart hover:text-cv-green-mint">
            Ver todas
          </Button>
        </div>
        <div className="space-y-4">
          {recentNews.map((news, index) => (
            <Card 
              key={news.id}
              className="bg-white border-none shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
              role="article"
              aria-labelledby={`news-title-${news.id}`}
            >
              <CardContent className="p-0">
                <div className="flex space-x-4">
                  <img 
                    src={news.image} 
                    alt={`Imagem relacionada a ${news.title}`}
                    className="w-20 h-20 object-cover rounded-l-lg flex-shrink-0"
                  />
                  <div className="flex-1 p-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className="bg-cv-yellow-soft text-cv-purple-dark text-xs"
                      >
                        {news.category}
                      </Badge>
                      <span className="text-caption text-cv-gray-light">{news.date}</span>
                    </div>
                    <h4 id={`news-title-${news.id}`} className="font-semibold text-cv-purple-dark line-clamp-2">
                      {news.title}
                    </h4>
                    <p className="text-caption text-cv-gray-light line-clamp-2">
                      {news.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Bottom spacing for navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default HomeScreen;
