
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DonorData {
  name: string;
  email: string;
  phone: string;
  document: string;
}

interface DonorInformationFormProps {
  donorData: DonorData;
  onDonorDataChange: (data: DonorData) => void;
}

const DonorInformationForm = ({ donorData, onDonorDataChange }: DonorInformationFormProps) => {
  const updateField = (field: keyof DonorData, value: string) => {
    onDonorDataChange({
      ...donorData,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Seus Dados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            type="text"
            required
            value={donorData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Seu nome completo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            required
            value={donorData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="seu@email.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              value={donorData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">CPF</Label>
            <Input
              id="document"
              type="text"
              value={donorData.document}
              onChange={(e) => updateField('document', e.target.value)}
              placeholder="000.000.000-00"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonorInformationForm;
