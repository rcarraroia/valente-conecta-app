
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface SaveButtonProps {
  onSave: () => void;
  saving: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onSave, saving }) => {
  return (
    <Button
      onClick={onSave}
      disabled={saving}
      className="w-full bg-cv-coral hover:bg-cv-coral/90"
    >
      {saving ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          Salvando...
        </>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          Salvar Perfil
        </>
      )}
    </Button>
  );
};

export default SaveButton;
