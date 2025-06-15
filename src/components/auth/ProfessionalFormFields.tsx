
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import ProfessionalFields from './ProfessionalFields';

interface ProfessionalData {
  specialty: string;
  bio: string;
  contactEmail: string;
  contactPhone: string;
  crmCrpRegister: string;
  specialties: string;
}

interface ProfessionalFormFieldsProps {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  professionalData: ProfessionalData;
  setProfessionalData: (data: ProfessionalData) => void;
  password: string;
  setPassword: (value: string) => void;
}

const ProfessionalFormFields = ({
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  city,
  setCity,
  professionalData,
  setProfessionalData,
  password,
  setPassword
}: ProfessionalFormFieldsProps) => {
  return (
    <>
      {/* Campos comuns para profissionais */}
      <div className="space-y-2">
        <Label htmlFor="full-name">Nome Completo</Label>
        <div className="relative">
          <Input
            id="full-name"
            type="text"
            placeholder="Seu nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <div className="relative">
          <Input
            id="signup-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <div className="relative">
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Cidade</Label>
        <div className="relative">
          <Input
            id="city"
            type="text"
            placeholder="Sua cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </div>

      <ProfessionalFields
        data={professionalData}
        onChange={setProfessionalData}
      />

      {/* Campo de senha para profissionais no final */}
      <div className="space-y-2">
        <Label htmlFor="signup-password">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Input
            id="signup-password"
            type="password"
            placeholder="Crie uma senha segura"
            className="pl-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
      </div>
    </>
  );
};

export default ProfessionalFormFields;
