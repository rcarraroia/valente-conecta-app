
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ProfessionalHeaderProps {
  onBack: () => void;
}

const ProfessionalHeader = ({ onBack }: ProfessionalHeaderProps) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onBack}
        className="text-cv-gray-light hover:text-cv-gray-dark"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>
    </div>
  );
};

export default ProfessionalHeader;
