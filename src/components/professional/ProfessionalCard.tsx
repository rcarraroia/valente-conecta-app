
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Partner {
  id: string;
  full_name: string;
  specialty: string;
  specialties: string[];
  professional_photo_url: string | null;
  crm_crp_register: string | null;
}

interface ProfessionalCardProps {
  partner: Partner;
}

const ProfessionalCard = ({ partner }: ProfessionalCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
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
  );
};

export default ProfessionalCard;
