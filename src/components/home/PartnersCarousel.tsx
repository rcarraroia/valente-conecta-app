
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight } from 'lucide-react';

interface Partner {
  id: string;
  full_name: string;
  specialty: string;
  professional_photo_url: string | null;
  bio: string | null;
}

interface PartnersCarouselProps {
  onNavigate?: (screen: string, partnerId?: string) => void;
}

const PartnersCarousel = ({ onNavigate }: PartnersCarouselProps) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedPartners();
  }, []);

  const loadFeaturedPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('id, full_name, specialty, professional_photo_url, bio')
        .eq('is_active', true)
        .limit(6);

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handlePartnerClick = (partnerId: string) => {
    if (onNavigate) {
      onNavigate('partner-profile', partnerId);
    }
  };

  const handleViewAll = () => {
    if (onNavigate) {
      onNavigate('partners');
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="flex space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-64 h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (partners.length === 0) {
    return null;
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading font-bold text-cv-gray-dark">
          Nossos Profissionais Parceiros
        </h2>
        <button
          onClick={handleViewAll}
          className="flex items-center text-cv-coral font-medium text-sm hover:text-cv-coral/80 transition-colors"
        >
          Ver todos
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {partners.map((partner) => (
            <CarouselItem key={partner.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm"
                onClick={() => handlePartnerClick(partner.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={partner.professional_photo_url || ''} />
                      <AvatarFallback className="bg-cv-blue-heart text-white font-bold">
                        {getInitials(partner.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-cv-gray-dark truncate">
                        {partner.full_name}
                      </h3>
                      <p className="text-sm text-cv-coral font-medium">
                        {partner.specialty}
                      </p>
                      {partner.bio && (
                        <p className="text-xs text-cv-gray-light mt-1 line-clamp-2">
                          {partner.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
};

export default PartnersCarousel;
