import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, CreditCard } from 'lucide-react';
import ProfessionalFields from './ProfessionalFields';
import { ConsentCheckbox } from '@/components/consent/ConsentCheckbox';

interface ProfessionalData {
  specialty: string;
  bio: string;
  contactEmail: string;
  contactPhone: string;
  crmCrpRegister: string;
  specialties: string;
}

interface EnhancedProfessionalFormFieldsProps {
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
  cpf: string;
  setCpf: (value: string) => void;
  consentDataSharing: boolean;
  setConsentDataSharing: (value: boolean) => void;
  cpfError?: string;
  consentError?: string;
}

const EnhancedProfessionalFormFields = ({
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
  setPassword,
  cpf,
  setCpf,
  consentDataSharing,
  setConsentDataSharing,
  cpfError,
  consentError
}: EnhancedProfessionalFormFieldsProps) => {
  const formatCPF = (value: string) => {
    // Remove tudo que não é dígito
    const cleanValue = value.replace(/\D/g, '');
    
    // Aplica a máscara XXX.XXX.XXX-XX
    if (cleanValue.length <= 11) {
      return cleanValue
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    return value;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCPF(e.target.value);
    setCpf(formattedValue);
  };

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
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf">CPF</Label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Input
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            className="pl-10"
            value={cpf}
            onChange={handleCpfChange}
            maxLength={14}
            required
          />
        </div>
        {cpfError && (
          <p className="text-sm text-red-500">{cpfError}</p>
        )}
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

      {/* Campo de senha para profissionais */}
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

      {/* Consentimento para compartilhamento de dados */}
      <div className="pt-4">
        <ConsentCheckbox
          checked={consentDataSharing}
          onCheckedChange={setConsentDataSharing}
          required={false}
          error={consentError}
          showDetails={true}
        />
      </div>
    </>
  );
};

export default EnhancedProfessionalFormFields;