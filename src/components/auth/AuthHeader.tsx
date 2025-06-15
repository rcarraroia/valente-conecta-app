
import React from 'react';
import { Heart } from 'lucide-react';

const AuthHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-cv-coral rounded-full flex items-center justify-center mx-auto mb-4">
        <Heart className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-h1 font-heading font-bold text-cv-gray-dark">Valente Conecta</h1>
      <p className="text-body text-cv-gray-light">Cuidando do seu coração</p>
    </div>
  );
};

export default AuthHeader;
