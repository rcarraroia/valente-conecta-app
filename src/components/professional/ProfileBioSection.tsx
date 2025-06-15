
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProfileBioSectionProps {
  bio: string;
  onBioChange: (value: string) => void;
}

const ProfileBioSection = ({ bio, onBioChange }: ProfileBioSectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="bio">Apresentação Profissional</Label>
      <Textarea
        id="bio"
        value={bio}
        onChange={(e) => onBioChange(e.target.value)}
        placeholder="Conte um pouco sobre sua experiência e abordagem..."
        rows={4}
      />
    </div>
  );
};

export default ProfileBioSection;
