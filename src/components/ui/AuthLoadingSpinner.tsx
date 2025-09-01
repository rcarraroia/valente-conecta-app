// Authentication loading spinner component
import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthLoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const AuthLoadingSpinner: React.FC<AuthLoadingSpinnerProps> = ({
  message = 'Verificando autenticação...',
  className = '',
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-cv-off-white ${className}`}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cv-blue" />
        <p className="text-gray-600">{message}</p>
        <p className="text-sm text-gray-500 mt-2">Aguarde um momento...</p>
      </div>
    </div>
  );
};