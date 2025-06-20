
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface MyDataHeaderProps {
  onBack: () => void;
}

const MyDataHeader: React.FC<MyDataHeaderProps> = ({ onBack }) => {
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
      <h1 className="text-2xl font-heading font-bold text-cv-gray-dark">
        Meus Dados
      </h1>
    </div>
  );
};

export default MyDataHeader;
