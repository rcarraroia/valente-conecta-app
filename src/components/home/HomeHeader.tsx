
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import OptimizedImage from '../OptimizedImage';

const HomeHeader = () => {
  return (
    <header className="bg-cv-purple-soft text-white px-4 py-3 shadow-lg" role="banner">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <OptimizedImage 
              src="/lovable-uploads/1df1dc10-fe00-4ce7-8731-1e01e428d28e.png"
              alt="Logotipo do Instituto Coração Valente"
              className="w-8 h-8 object-contain"
              width={32}
              height={32}
            />
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold">Coração Valente</h1>
            <p className="text-xs opacity-90">Conecta</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/20 w-10 h-10" 
          aria-label="Abrir busca"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
};

export default HomeHeader;
