
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SupporterData {
  name: string;
  email: string;
  phone: string;
  document: string;
}

interface SupporterInformationFormProps {
  supporterData: SupporterData;
  onSupporterDataChange: (data: SupporterData) => void;
}

const SupporterInformationForm = ({ supporterData, onSupporterDataChange }: SupporterInformationFormProps) => {
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
            value={supporterData.name}
            onChange={(e) => onSupporterDataChange({...supporterData, name: e.target.value})}
            placeholder="Seu nome completo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            required
            value={supporterData.email}
            onChange={(e) => onSupporterDataChange({...supporterData, email: e.target.value})}
            placeholder="seu@email.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              type="tel"
              required
              value={supporterData.phone}
              onChange={(e) => onSupporterDataChange({...supporterData, phone: e.target.value})}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">CPF *</Label>
            <Input
              id="document"
              type="text"
              required
              value={supporterData.document}
              onChange={(e) => onSupporterDataChange({...supporterData, document: e.target.value})}
              placeholder="000.000.000-00"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupporterInformationForm;
