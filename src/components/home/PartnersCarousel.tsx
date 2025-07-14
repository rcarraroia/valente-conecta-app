
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Partner {
  id: string;
  full_name: string;
  specialty: string;
  professional_photo_url: string | null;
  bio: string | null;
  crm_crp_register: string | null;
}

interface PartnersCarouselProps {
  onNavigate?: (screen: string, partnerId?: string) => void;
}

const PartnersCarousel = ({ onNavigate }: PartnersCarouselProps) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFeaturedPartners();
  }, []);

  const loadFeaturedPartners = async () => {
    try {
      setError(null);
      console.log('Loading featured partners...');
      
      const { data, error } = await supabase
        .from('partners')
        .select('id, full_name, specialty, professional_photo_url, bio, crm_crp_register')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) {
        console.error('Error loading featured partners:', error);
        throw error;
      }

      console.log('Featured partners data:', data);
      
      const transformedData = (data || []).map(partner => ({
        ...partner,
        specialty: partner.specialty || 'Não informado'
      }));

      setPartners(transformedData);

      if (transformedData.length === 0) {
        console.log('No featured partners found');
      }
    } catch (error: any) {
      console.error('Erro ao carregar parceiros:', error);
      setError(error.message || 'Erro ao carregar profissionais');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleScheduleAppointment = (partnerId: string) => {
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
              <div key={i} className="w-72 h-40 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-bold text-cv-gray-dark">
            Nossos Profissionais Parceiros
          </h2>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-cv-gray-light text-sm">
            Erro ao carregar profissionais. Tente novamente.
          </p>
          <Button 
            onClick={loadFeaturedPartners} 
            size="sm" 
            className="mt-2 bg-cv-coral hover:bg-cv-coral/90"
          >
            Recarregar
          </Button>
        </div>
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-bold text-cv-gray-dark">
            Nossos Profissionais Parceiros
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-cv-gray-light">
            Nenhum profissional disponível no momento.
          </p>
        </div>
      </div>
    );
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

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-2 p-1 bg-blue-100 text-blue-800 text-xs rounded">
          Debug: {partners.length} profissionais carregados
        </div>
      )}

      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {partners.map((partner) => (
            <CarouselItem key={partner.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
              <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  {/* Cabeçalho com gradiente */}
                  <div className="bg-gradient-to-r from-cv-coral to-cv-blue-heart p-4 text-white">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12 border-2 border-white">
                        <AvatarImage src={partner.professional_photo_url || ''} />
                        <AvatarFallback className="bg-white text-cv-blue-heart font-bold">
                          {getInitials(partner.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">
                          {partner.full_name}
                        </h3>
                        <p className="text-white/90 text-sm font-medium">
                          {partner.specialty}
                        </p>
                        {partner.crm_crp_register && (
                          <p className="text-white/80 text-xs">
                            {partner.crm_crp_register}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4">
                    {partner.bio && (
                      <p className="text-xs text-cv-gray-light mb-3 line-clamp-2">
                        {partner.bio}
                      </p>
                    )}
                    
                    <Button
                      onClick={() => handleScheduleAppointment(partner.id)}
                      className="w-full bg-cv-coral hover:bg-cv-coral/90 text-white"
                      size="sm"
                    >
                      <Calendar className="w-3 h-3 mr-2" />
                      Agendar
                    </Button>
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
