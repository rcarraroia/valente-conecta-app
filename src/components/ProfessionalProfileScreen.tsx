import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Phone, Mail, Calendar, MessageCircle } from 'lucide-react';
import AppointmentBooking from './partner/AppointmentBooking';

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

interface ProfessionalProfileScreenProps {
  onBack: () => void;
  partnerId?: string;
}

const ProfessionalProfileScreen = ({ onBack, partnerId }: ProfessionalProfileScreenProps) => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    if (partnerId) {
      loadPartner();
    }
  }, [partnerId]);

  const loadPartner = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', partnerId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      // Transform the data to ensure specialties is always an array of strings
      const transformedData: Partner = {
        ...data,
        specialties: Array.isArray(data.specialties) 
          ? data.specialties.filter((spec): spec is string => typeof spec === 'string')
          : []
      };
      
      setPartner(transformedData);
    } catch (error) {
      console.error('Erro ao carregar profissional:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleWhatsApp = () => {
    if (partner?.contact_phone) {
      const phone = partner.contact_phone.replace(/\D/g, '');
      const message = `Olá, ${partner.full_name}! Vi seu perfil no Coração Valente Conecta e gostaria de conversar.`;
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (partner?.contact_email) {
      window.open(`mailto:${partner.contact_email}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cv-coral"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-cv-gray-light">Profissional não encontrado.</p>
          <Button onClick={onBack} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  if (showBooking) {
    return (
      <AppointmentBooking
        partnerId={partner.id}
        partnerName={partner.full_name}
        onBack={() => setShowBooking(false)}
      />
    );
  }

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
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={partner.professional_photo_url || ''} />
                <AvatarFallback className="bg-cv-blue-heart text-white font-bold text-xl">
                  {getInitials(partner.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <h1 className="text-2xl font-heading font-bold text-cv-gray-dark mb-2">
                {partner.full_name}
              </h1>
              
              <p className="text-cv-coral font-medium text-lg mb-3">
                {partner.specialty}
              </p>

              {partner.crm_crp_register && (
                <p className="text-sm text-cv-gray-light mb-4">
                  {partner.crm_crp_register}
                </p>
              )}

              {partner.specialties && partner.specialties.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {partner.specialties.map((spec, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        {partner.bio && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sobre</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-cv-gray-dark leading-relaxed">
                {partner.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            onClick={() => setShowBooking(true)}
            className="bg-cv-coral hover:bg-cv-coral/90 flex items-center justify-center"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Agendar Consulta
          </Button>

          {partner.contact_phone && (
            <Button
              onClick={handleWhatsApp}
              variant="outline"
              className="flex items-center justify-center"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          )}

          {partner.contact_email && (
            <Button
              onClick={handleEmail}
              variant="outline"
              className="flex items-center justify-center"
            >
              <Mail className="w-4 h-4 mr-2" />
              E-mail
            </Button>
          )}

          {partner.contact_phone && (
            <Button
              onClick={() => window.open(`tel:${partner.contact_phone}`, '_blank')}
              variant="outline"
              className="flex items-center justify-center"
            >
              <Phone className="w-4 h-4 mr-2" />
              Ligar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfileScreen;
