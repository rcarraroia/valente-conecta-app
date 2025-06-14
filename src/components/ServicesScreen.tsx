
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  ExternalLink,
  Users,
  Heart,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  name: string;
  description: string;
  detailed_description: string | null;
  image_url: string | null;
  contact_info: string | null;
  is_active: boolean;
  order_position: number;
}

interface ServicesScreenProps {
  onBack: () => void;
}

const ServicesScreen = ({ onBack }: ServicesScreenProps) => {
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('order_position');
      
      if (error) throw error;
      return data as Service[];
    }
  });

  const getServiceIcon = (name: string) => {
    if (name.toLowerCase().includes('família') || name.toLowerCase().includes('orientação')) {
      return Users;
    }
    if (name.toLowerCase().includes('avaliação') || name.toLowerCase().includes('diagnóstico')) {
      return UserCheck;
    }
    if (name.toLowerCase().includes('grupo') || name.toLowerCase().includes('apoio')) {
      return Heart;
    }
    if (name.toLowerCase().includes('capacitação') || name.toLowerCase().includes('treinamento')) {
      return BookOpen;
    }
    return Users;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cv-off-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cv-purple-dark"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cv-off-white">
      {/* Header */}
      <header className="bg-cv-purple-soft text-white p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/20">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-h2 font-heading font-bold">Nossos Serviços</h1>
            <p className="text-sm opacity-90">Conheça como podemos ajudar</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Mission statement */}
        <Card className="bg-gradient-to-r from-cv-blue-heart to-cv-purple-soft text-white border-none shadow-lg">
          <CardContent className="p-6 text-center">
            <h2 className="text-h3 font-heading font-bold mb-3">Nossa Missão</h2>
            <p className="text-body opacity-95">
              Oferecemos acolhimento, apoio e orientação especializada para famílias que vivenciam 
              o neurodesenvolvimento, criando uma rede de cuidado e compreensão.
            </p>
          </CardContent>
        </Card>

        {/* Services list */}
        <div className="space-y-4">
          {services.map((service) => {
            const IconComponent = getServiceIcon(service.name);
            return (
              <Card key={service.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-cv-green-mint/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-cv-green-mint" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-cv-purple-dark">{service.name}</CardTitle>
                      <CardDescription className="text-cv-gray-light mt-1">
                        {service.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                {service.detailed_description && (
                  <CardContent className="pt-0">
                    <p className="text-body text-cv-gray-dark mb-4">
                      {service.detailed_description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        className="bg-cv-blue-heart hover:bg-cv-blue-heart/90 text-white flex-1"
                        size="sm"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Entrar em Contato
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-cv-purple-dark text-cv-purple-dark hover:bg-cv-purple-dark hover:text-white flex-1"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Saiba Mais
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Contact section */}
        <Card className="bg-cv-yellow-soft border-none shadow-md">
          <CardContent className="p-6 text-center space-y-4">
            <h3 className="text-h3 font-heading font-bold text-cv-purple-dark">
              Precisa de Mais Informações?
            </h3>
            <p className="text-body text-cv-gray-dark">
              Nossa equipe está pronta para ajudar você e sua família.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-cv-coral hover:bg-cv-coral/90 text-white">
                <Phone className="w-4 h-4 mr-2" />
                (11) 99999-9999
              </Button>
              <Button variant="outline" className="border-cv-purple-dark text-cv-purple-dark hover:bg-cv-purple-dark hover:text-white">
                <Mail className="w-4 h-4 mr-2" />
                Enviar E-mail
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom spacing */}
      <div className="h-20"></div>
    </div>
  );
};

export default ServicesScreen;
