
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserTypeSelectorProps {
  value: 'comum' | 'parceiro';
  onChange: (value: 'comum' | 'parceiro') => void;
}

const UserTypeSelector = ({ value, onChange }: UserTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="user-type">Tipo de Cadastro</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo de cadastro" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="comum">Usuário Comum</SelectItem>
          <SelectItem value="parceiro">Profissional de Saúde</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserTypeSelector;
