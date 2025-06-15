
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, User } from 'lucide-react';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import ProfileBasicFields from './ProfileBasicFields';
import ProfileBioSection from './ProfileBioSection';

interface Partner {
  id: string;
  full_name: string;
  specialty: string;
  bio: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  crm_crp_register: string | null;
  specialties?: string[];
}

interface ProfessionalProfileProps {
  partner: Partner;
  onUpdate: () => void;
}

const ProfessionalProfile = ({ partner, onUpdate }: ProfessionalProfileProps) => {
  const {
    formData,
    profileData,
    saving,
    handleInputChange,
    handleProfileDataChange,
    handleSave
  } = useProfessionalProfile({ partner, onUpdate });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Editar Perfil Profissional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProfileBasicFields
          formData={formData}
          profileData={profileData}
          onFormDataChange={handleInputChange}
          onProfileDataChange={handleProfileDataChange}
        />

        <ProfileBioSection
          bio={formData.bio}
          onBioChange={(value) => handleInputChange('bio', value)}
        />

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-cv-coral hover:bg-cv-coral/90"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfessionalProfile;
