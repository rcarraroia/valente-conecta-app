
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MedicalInformationFormProps {
  formData: {
    medical_conditions: string;
    medications: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const MedicalInformationForm: React.FC<MedicalInformationFormProps> = ({ formData, onInputChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Médicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="medical_conditions">Condições Médicas</Label>
          <Textarea
            id="medical_conditions"
            value={formData.medical_conditions}
            onChange={(e) => onInputChange('medical_conditions', e.target.value)}
            placeholder="Descreva suas condições médicas (opcional)"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="medications">Medicamentos</Label>
          <Textarea
            id="medications"
            value={formData.medications}
            onChange={(e) => onInputChange('medications', e.target.value)}
            placeholder="Liste seus medicamentos atuais (opcional)"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalInformationForm;
