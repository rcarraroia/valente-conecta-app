
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfessionalBioProps {
  bio: string;
}

const ProfessionalBio = ({ bio }: ProfessionalBioProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sobre</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-cv-gray-dark leading-relaxed">
          {bio}
        </p>
      </CardContent>
    </Card>
  );
};

export default ProfessionalBio;
