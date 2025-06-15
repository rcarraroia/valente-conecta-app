
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase } from 'lucide-react';

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
    </>
  );
};

export default ProfessionalFields;
