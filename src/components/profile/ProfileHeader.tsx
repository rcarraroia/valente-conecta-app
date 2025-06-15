
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Stethoscope } from 'lucide-react';

interface Profile {
  full_name: string | null;
  user_type: string | null;
}

interface Partner {
  id: string;
  full_name: string;
  specialty: string;
}

interface ProfileHeaderProps {
  profile: Profile | null;
  partner: Partner | null;
  userEmail: string | undefined;
}

const ProfileHeader = ({ profile, partner, userEmail }: ProfileHeaderProps) => {
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-center">
          <Avatar className="w-16 h-16 mx-auto mb-3">
            <AvatarImage src="" />
            <AvatarFallback className="bg-cv-coral text-white text-lg font-bold">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-lg font-heading font-bold text-cv-gray-dark mb-1">
            {profile?.full_name || 'Usuário'}
          </h1>
          
          <p className="text-cv-gray-light text-sm">
            {userEmail}
          </p>

          {profile?.user_type === 'parceiro' && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cv-blue-heart text-white">
                <Stethoscope className="w-3 h-3 mr-1" />
                Profissional Parceiro
                {partner && ` - ${partner.specialty}`}
              </span>
              {!partner && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Perfil profissional incompleto
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
