
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Profile {
  full_name: string | null;
  user_type: string | null;
}

interface Partner {
  id: string;
  full_name: string;
  specialty: string;
}

interface User {
  id: string;
  email?: string;
}

interface ProfessionalDebugCardProps {
  profile: Profile | null;
  partner: Partner | null;
  user: User | null;
}

const ProfessionalDebugCard = ({ profile, partner, user }: ProfessionalDebugCardProps) => {
  if (profile?.user_type !== 'parceiro' || partner) {
    return null;
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-4">
        <div className="text-center">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            Perfil Profissional Não Encontrado
          </h3>
          <p className="text-xs text-red-600 mb-3">
            Seu perfil indica que você é um profissional, mas não encontramos seus dados na tabela de parceiros.
          </p>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => console.log('Profile:', profile, 'Partner:', partner, 'User:', user)}
            className="text-xs"
          >
            Debug Info (Console)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalDebugCard;
