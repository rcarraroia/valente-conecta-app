
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import OptimizedImage from '../OptimizedImage';

interface NewsItem {
  id: number;
  title: string;
  description: string;
  date: string;
  image: string;
  category: string;
}

interface NewsCarouselProps {
  onNavigate?: (screen: string) => void;
}

const NewsCarousel = ({ onNavigate }: NewsCarouselProps) => {
  const recentNews: NewsItem[] = [
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
          onClick={() => onNavigate?.('biblioteca')}
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
                onClick={() => onNavigate?.('biblioteca')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate?.('biblioteca');
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
  );
};

export default NewsCarousel;
