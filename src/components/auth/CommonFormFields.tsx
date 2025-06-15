
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserIcon, Mail, Phone, MapPin, Lock } from 'lucide-react';

interface CommonFormFieldsProps {
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
}

const CommonFormFields = ({
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  city,
  setCity,
  password,
  setPassword
}: CommonFormFieldsProps) => {
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
          />
        </div>
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
    </>
  );
};

export default CommonFormFields;
