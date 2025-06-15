
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface AmbassadorPerformanceProps {
  performance: any;
}

const AmbassadorPerformance = ({ performance }: AmbassadorPerformanceProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-cv-gray-dark flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance de Embaixador
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-cv-blue-heart">
              {performance?.total_clicks || 0}
            </p>
            <p className="text-sm text-cv-gray-light">Cliques</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-cv-green-mint">
              {performance?.total_donations_count || 0}
            </p>
            <p className="text-sm text-cv-gray-light">Doações</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-cv-coral">
              {performance?.points || 0}
            </p>
            <p className="text-sm text-cv-gray-light">Pontos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AmbassadorPerformance;
