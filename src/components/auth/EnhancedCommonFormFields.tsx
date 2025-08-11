import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserIcon, Mail, Phone, MapPin, Lock, CreditCard } from 'lucide-react';
import { ConsentCheckbox } from '@/components/consent/ConsentCheckbox';

interface EnhancedCommonFormFieldsProps {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  cpf: string;
  setCpf: (value: string) => void;
  consentDataSharing: boolean;
  setConsentDataSharing: (value: boolean) => void;
  cpfError?: string;
  consentError?: string;
}

const EnhancedCommonFormFields = ({
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  city,
  setCity,
  password,
  setPassword,
  cpf,
  setCpf,
  consentDataSharing,
  setConsentDataSharing,
  cpfError,
  consentError
}: EnhancedCommonFormFieldsProps) => {
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
      <div className="space-y-2">
        <Label htmlFor="full-name">Nome Completo</Label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Input
            id="full-name"
            type="text"
            placeholder="Seu nome completo"
            className="pl-10"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Input
            id="signup-email"
            type="email"
            placeholder="seu@email.com"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            className="pl-10"
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
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Input
            id="city"
            type="text"
            placeholder="Sua cidade"
            className="pl-10"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </div>

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

export default EnhancedCommonFormFields;