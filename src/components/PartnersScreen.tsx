
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Search, MapPin, Phone, Mail, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Partner {
  id: string;
  full_name: string;
  specialty: string;
  specialties: string[];
  professional_photo_url: string | null;
  bio: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  crm_crp_register: string | null;
}

interface PartnersScreenProps {
  onNavigate?: (screen: string, partnerId?: string) => void;
}

const PartnersScreen = ({ onNavigate }: PartnersScreenProps) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPartners();
  }, []);

  useEffect(() => {
    filterPartners();
  }, [partners, searchTerm, selectedSpecialty]);

  const loadPartners = async () => {
    try {
      setError(null);
      console.log('Loading partners...');
      
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading partners:', error);
        throw error;
      }

      console.log('Raw partners data:', data);
      
      const transformedData: Partner[] = (data || []).map(partner => ({
        ...partner,
        specialties: Array.isArray(partner.specialties) 
          ? partner.specialties.filter((spec): spec is string => typeof spec === 'string')
          : [],
        specialty: partner.specialty || 'Não informado'
      }));
      
      console.log('Transformed partners data:', transformedData);
      setPartners(transformedData);

      if (transformedData.length === 0) {
        console.log('No active partners found');
        toast({
          title: "Nenhum parceiro encontrado",
          description: "Não há profissionais ativos cadastrados no momento.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar parceiros:', error);
      setError(error.message || 'Erro ao carregar profissionais');
      toast({
        title: "Erro ao carregar profissionais",
        description: "Não foi possível carregar a lista de profissionais. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPartners = () => {
    let filtered = partners;

    if (searchTerm) {
      filtered = filtered.filter(partner =>
        partner.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.specialties.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedSpecialty) {
      filtered = filtered.filter(partner =>
        partner.specialty === selectedSpecialty ||
        (partner.specialties && partner.specialties.includes(selectedSpecialty))
      );
    }

    console.log('Filtered partners:', filtered);
    setFilteredPartners(filtered);
  };

  const getUniqueSpecialties = () => {
    const specialties = new Set<string>();
    partners.forEach(partner => {
      if (partner.specialty && partner.specialty !== 'Não informado') {
        specialties.add(partner.specialty);
      }
      if (partner.specialties) {
        partner.specialties.forEach(spec => specialties.add(spec));
      }
    });
    return Array.from(specialties).sort();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleScheduleAppointment = (partnerId: string) => {
    if (onNavigate) {
      onNavigate('partner-profile', partnerId);
    }
  };

  const handlePartnerClick = (partnerId: string) => {
    if (onNavigate) {
      onNavigate('partner-profile', partnerId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-cv-gray-dark mb-2">
              Erro ao carregar profissionais
            </h3>
            <p className="text-cv-gray-light mb-4">{error}</p>
            <Button onClick={loadPartners} className="bg-cv-coral hover:bg-cv-coral/90">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-heading font-bold text-cv-gray-dark mb-6">
          Nossos Profissionais Parceiros
        </h1>

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-xs rounded">
            Debug: {partners.length} parceiros carregados, {filteredPartners.length} após filtros
          </div>
        )}

        {/* Filtros */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cv-gray-light w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por nome ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSpecialty === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSpecialty('')}
              className="text-xs"
            >
              Todas ({partners.length})
            </Button>
            {getUniqueSpecialties().map((specialty) => (
              <Button
                key={specialty}
                variant={selectedSpecialty === specialty ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSpecialty(specialty)}
                className="text-xs"
              >
                {specialty}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid de Profissionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <Card
              key={partner.id}
              className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm overflow-hidden"
            >
              <CardContent className="p-0">
                {/* Cabeçalho do Card com Foto e Info Básica */}
                <div className="bg-gradient-to-r from-cv-coral to-cv-blue-heart p-6 text-white">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16 border-2 border-white">
                      <AvatarImage src={partner.professional_photo_url || ''} />
                      <AvatarFallback className="bg-white text-cv-blue-heart font-bold text-lg">
                        {getInitials(partner.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {partner.full_name}
                      </h3>
                      <p className="text-white/90 font-medium">
                        {partner.specialty}
                      </p>
                      {partner.crm_crp_register && (
                        <p className="text-white/80 text-sm">
                          {partner.crm_crp_register}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-6">
                  {partner.bio && (
                    <p className="text-sm text-cv-gray-light mb-4 line-clamp-3">
                      {partner.bio}
                    </p>
                  )}

                  {/* Informações de Contato */}
                  <div className="space-y-2 mb-4">
                    {partner.contact_email && (
                      <div className="flex items-center text-xs text-cv-gray-light">
                        <Mail className="w-3 h-3 mr-2 text-cv-coral" />
                        <span className="truncate">{partner.contact_email}</span>
                      </div>
                    )}
                    {partner.contact_phone && (
                      <div className="flex items-center text-xs text-cv-gray-light">
                        <Phone className="w-3 h-3 mr-2 text-cv-green-mint" />
                        <span>{partner.contact_phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Especialidades Adicionais */}
                  {partner.specialties && partner.specialties.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {partner.specialties.slice(0, 3).map((spec, index) => (
                          <span
                            key={index}
                            className="bg-cv-off-white text-cv-gray-dark text-xs px-2 py-1 rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                        {partner.specialties.length > 3 && (
                          <span className="bg-cv-off-white text-cv-gray-dark text-xs px-2 py-1 rounded-full">
                            +{partner.specialties.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Botões de Ação */}
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleScheduleAppointment(partner.id)}
                      className="w-full bg-cv-coral hover:bg-cv-coral/90 text-white"
                      size="sm"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Consulta
                    </Button>
                    
                    <Button 
                      onClick={() => handlePartnerClick(partner.id)}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      Ver Perfil Completo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPartners.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Search className="w-12 h-12 mx-auto mb-4 text-cv-gray-light" />
              <h3 className="text-lg font-semibold text-cv-gray-dark mb-2">
                Nenhum profissional encontrado
              </h3>
              <p className="text-cv-gray-light">
                {partners.length === 0 
                  ? "Não há profissionais cadastrados no momento."
                  : "Tente ajustar os filtros ou buscar por termos diferentes."
                }
              </p>
              {partners.length === 0 && (
                <Button 
                  onClick={loadPartners} 
                  className="mt-4 bg-cv-coral hover:bg-cv-coral/90"
                >
                  Recarregar
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnersScreen;
