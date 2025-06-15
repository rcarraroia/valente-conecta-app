
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Briefcase, Phone, MapPin, Mail, FileText } from 'lucide-react';

interface ProfileBasicFieldsProps {
  formData: {
    full_name: string;
    specialty: string;
    contact_email: string;
    contact_phone: string;
    crm_crp_register: string;
    specialties: string;
  };
  profileData: {
    phone: string;
    city: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  onProfileDataChange: (field: string, value: string) => void;
}

const ProfileBasicFields = ({ 
  formData, 
  profileData, 
  onFormDataChange, 
  onProfileDataChange 
}: ProfileBasicFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nome Completo</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => onFormDataChange('full_name', e.target.value)}
            className="pl-10"
            placeholder="Seu nome completo"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialty">Especialidade Principal</Label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Input
            id="specialty"
            value={formData.specialty}
            onChange={(e) => onFormDataChange('specialty', e.target.value)}
            className="pl-10"
            placeholder="Ex: Cardiologista, Psicólogo"
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
            value={profileData.phone}
            onChange={(e) => onProfileDataChange('phone', e.target.value)}
            className="pl-10"
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Cidade</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Input
            id="city"
            value={profileData.city}
            onChange={(e) => onProfileDataChange('city', e.target.value)}
            className="pl-10"
            placeholder="Sua cidade"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_email">Email de Contato Profissional</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Input
            id="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={(e) => onFormDataChange('contact_email', e.target.value)}
            className="pl-10"
            placeholder="contato@profissional.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_phone">Telefone de Contato Profissional</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Input
            id="contact_phone"
            type="tel"
            value={formData.contact_phone}
            onChange={(e) => onFormDataChange('contact_phone', e.target.value)}
            className="pl-10"
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="crm_crp_register">CRM/CRP</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Input
            id="crm_crp_register"
            value={formData.crm_crp_register}
            onChange={(e) => onFormDataChange('crm_crp_register', e.target.value)}
            className="pl-10"
            placeholder="Ex: CRM-SP 123456"
          />
        </div>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="specialties">Outras Especialidades</Label>
        <Input
          id="specialties"
          value={formData.specialties}
          onChange={(e) => onFormDataChange('specialties', e.target.value)}
          placeholder="Separe por vírgulas: Ex: Hipertensão, Diabetes"
        />
      </div>
    </div>
  );
};

export default ProfileBasicFields;
