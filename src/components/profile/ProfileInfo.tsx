
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileInfoProps {
  userEmail?: string;
}

const ProfileInfo = ({ userEmail }: ProfileInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-cv-gray-dark">Informações Pessoais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={userEmail || ''}
            disabled
            className="bg-gray-50"
          />
        </div>
        <p className="text-sm text-cv-gray-light">
          Para alterar informações pessoais, entre em contato conosco.
        </p>
      </CardContent>
    </Card>
  );
};

export default ProfileInfo;
