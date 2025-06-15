
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

const SupporterBenefits = () => {
  return (
    <Card className="border-cv-blue-heart/20 bg-cv-blue-heart/5">
      <CardHeader>
        <CardTitle className="text-lg text-cv-blue-heart">Benefícios do Mantenedor</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-cv-coral" />
            Relatórios mensais sobre o impacto das doações
          </li>
          <li className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-cv-coral" />
            Acesso prioritário a eventos do instituto
          </li>
          <li className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-cv-coral" />
            Certificado de apoiador para dedução fiscal
          </li>
          <li className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-cv-coral" />
            Cancelamento a qualquer momento
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default SupporterBenefits;
