
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Search, MapPin, Phone, Mail } from 'lucide-react';

interface Partner {
  id: string;
  full_name: string;
  specialty: string;
  specialties: string[];
  professional_photo_url: string | null;
  bio: string | null;
  contact_email: string | null;
  contact_phone: string | null;
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

  useEffect(() => {
    loadPartners();
  }, []);

  useEffect(() => {
    filterPartners();
  }, [partners, searchTerm, selectedSpecialty]);

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure specialties is always an array
      const transformedData = (data || []).map(partner => ({
        ...partner,
        specialties: Array.isArray(partner.specialties) ? partner.specialties : []
      }));
      
      setPartners(transformedData);
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPartners = () => {
    let filtered = partners;

    if (searchTerm) {
      filtered = filtered.filter(partner =>
        partner.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialty) {
      filtered = filtered.filter(partner =>
        partner.specialty === selectedSpecialty ||
        (partner.specialties && partner.specialties.includes(selectedSpecialty))
      );
    }

    setFilteredPartners(filtered);
  };

  const getUniqueSpecialties = () => {
    const specialties = new Set<string>();
    partners.forEach(partner => {
      if (partner.specialty) specialties.add(partner.specialty);
      if (partner.specialties) {
        partner.specialties.forEach(spec => specialties.add(spec));
      }
    });
    return Array.from(specialties).sort();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handlePartnerClick = (partnerId: string) => {
    if (onNavigate) {
      onNavigate('partner-profile', partnerId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-heading font-bold text-cv-gray-dark mb-6">
          Nossos Profissionais Parceiros
        </h1>

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
              Todas
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

        {/* Grid de Parceiros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <Card
              key={partner.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm"
              onClick={() => handlePartnerClick(partner.id)}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={partner.professional_photo_url || ''} />
                    <AvatarFallback className="bg-cv-blue-heart text-white font-bold text-lg">
                      {getInitials(partner.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold text-lg text-cv-gray-dark mb-1">
                    {partner.full_name}
                  </h3>
                  
                  <p className="text-cv-coral font-medium mb-3">
                    {partner.specialty}
                  </p>
                  
                  {partner.bio && (
                    <p className="text-sm text-cv-gray-light mb-4 line-clamp-3">
                      {partner.bio}
                    </p>
                  )}

                  <div className="space-y-2 text-xs text-cv-gray-light">
                    {partner.contact_email && (
                      <div className="flex items-center justify-center">
                        <Mail className="w-3 h-3 mr-1" />
                        <span className="truncate">{partner.contact_email}</span>
                      </div>
                    )}
                    {partner.contact_phone && (
                      <div className="flex items-center justify-center">
                        <Phone className="w-3 h-3 mr-1" />
                        <span>{partner.contact_phone}</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full mt-4 bg-cv-coral hover:bg-cv-coral/90"
                    size="sm"
                  >
                    Ver Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPartners.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-cv-gray-light">
              Nenhum profissional encontrado com os filtros aplicados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnersScreen;
