
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HandHeart } from 'lucide-react';

const BecomeAmbassador = () => {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <HandHeart className="w-12 h-12 mx-auto mb-4 text-cv-coral" />
        <h3 className="text-lg font-semibold text-cv-gray-dark mb-2">
          Torne-se um Embaixador
        </h3>
        <p className="text-cv-gray-light mb-4">
          Ajude a divulgar nossa causa e ganhe reconhecimento pelos seus esforços.
        </p>
        <Button className="bg-cv-coral hover:bg-cv-coral/90">
          Saiba Mais
        </Button>
      </CardContent>
    </Card>
  );
};

export default BecomeAmbassador;
