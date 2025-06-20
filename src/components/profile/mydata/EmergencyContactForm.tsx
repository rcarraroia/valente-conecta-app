
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmergencyContactFormProps {
  formData: {
    emergency_contact_name: string;
    emergency_contact_phone: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({ formData, onInputChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contato de Emergência</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergency_contact_name">Nome do Contato</Label>
            <Input
              id="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={(e) => onInputChange('emergency_contact_name', e.target.value)}
              placeholder="Nome completo"
            />
          </div>
          <div>
            <Label htmlFor="emergency_contact_phone">Telefone do Contato</Label>
            <Input
              id="emergency_contact_phone"
              value={formData.emergency_contact_phone}
              onChange={(e) => onInputChange('emergency_contact_phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyContactForm;
