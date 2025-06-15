
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Mail, Phone, FileText } from 'lucide-react';

interface ProfessionalData {
  specialty: string;
  bio: string;
  contactEmail: string;
  contactPhone: string;
  crmCrpRegister: string;
  specialties: string;
}

interface ProfessionalFieldsProps {
  data: ProfessionalData;
  onChange: (data: ProfessionalData) => void;
}

const ProfessionalFields = ({ data, onChange }: ProfessionalFieldsProps) => {
  const updateField = (field: keyof ProfessionalData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="specialty">Especialidade Principal</Label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Input
            id="specialty"
            type="text"
            placeholder="Ex: Cardiologista, Psicólogo"
            className="pl-10"
            value={data.specialty}
            onChange={(e) => updateField('specialty', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialties">Outras Especialidades</Label>
        <Input
          id="specialties"
          type="text"
          placeholder="Separe por vírgulas: Ex: Hipertensão, Diabetes"
          value={data.specialties}
          onChange={(e) => updateField('specialties', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="crm-crp">CRM/CRP/Registro Profissional</Label>
        <Input
          id="crm-crp"
          type="text"
          placeholder="Ex: CRM-SP 123456"
          value={data.crmCrpRegister}
          onChange={(e) => updateField('crmCrpRegister', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">Email de Contato Profissional</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Input
            id="contact-email"
            type="email"
            placeholder="contato@profissional.com (opcional)"
            className="pl-10"
            value={data.contactEmail}
            onChange={(e) => updateField('contactEmail', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-phone">Telefone de Contato Profissional</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Input
            id="contact-phone"
            type="tel"
            placeholder="(11) 99999-9999 (opcional)"
            className="pl-10"
            value={data.contactPhone}
            onChange={(e) => updateField('contactPhone', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Apresentação Profissional</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-cv-gray-light" />
          <Textarea
            id="bio"
            placeholder="Conte um pouco sobre sua experiência e abordagem..."
            className="pl-10 min-h-[80px]"
            value={data.bio}
            onChange={(e) => updateField('bio', e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default ProfessionalFields;
