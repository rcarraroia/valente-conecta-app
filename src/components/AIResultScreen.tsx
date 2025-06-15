
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Info, ArrowLeft, RotateCcw } from 'lucide-react';

interface AIResultScreenProps {
  result: {
    analysis: string;
    severity_level: number;
    recommendations: string;
    next_steps: string;
  };
  onRestart: () => void;
  onBack: () => void;
}

const AIResultScreen = ({ result, onRestart, onBack }: AIResultScreenProps) => {
  const getSeverityInfo = (level: number) => {
    switch (level) {
      case 5:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
          color: 'border-red-200 bg-red-50',
          title: 'Atenção Necessária',
          titleColor: 'text-red-700'
        };
      case 4:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
          color: 'border-orange-200 bg-orange-50',
          title: 'Acompanhamento Recomendado',
          titleColor: 'text-orange-700'
        };
      case 3:
        return {
          icon: <Info className="w-6 h-6 text-yellow-500" />,
          color: 'border-yellow-200 bg-yellow-50',
          title: 'Observação Contínua',
          titleColor: 'text-yellow-700'
        };
      case 2:
        return {
          icon: <Info className="w-6 h-6 text-blue-500" />,
          color: 'border-blue-200 bg-blue-50',
          title: 'Desenvolvimento Adequado',
          titleColor: 'text-blue-700'
        };
      default:
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          color: 'border-green-200 bg-green-50',
          title: 'Desenvolvimento Normal',
          titleColor: 'text-green-700'
        };
    }
  };

  const severityInfo = getSeverityInfo(result.severity_level);

  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
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
          <h1 className="text-h1 font-heading font-bold text-cv-gray-dark">
            Resultado do Pré-Diagnóstico
          </h1>
        </div>

        {/* Resultado Principal */}
        <Card className={`${severityInfo.color} border-2`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-3 ${severityInfo.titleColor}`}>
              {severityInfo.icon}
              {severityInfo.title}
            </CardTitle>
            <CardDescription className="text-gray-600">
              Com base nas suas respostas, aqui está nossa análise:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body text-cv-gray-dark leading-relaxed">
              {result.analysis}
            </p>
          </CardContent>
        </Card>

        {/* Recomendações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-cv-blue-heart">Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body text-cv-gray-dark leading-relaxed mb-4">
              {result.recommendations}
            </p>
            
            <div className="bg-cv-blue-light/20 p-4 rounded-lg">
              <h4 className="font-semibold text-cv-blue-heart mb-2">Próximos Passos:</h4>
              <p className="text-body text-cv-gray-dark">
                {result.next_steps}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Aviso Importante */}
        <Card className="border-cv-coral/30 bg-cv-coral/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-cv-coral mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-cv-gray-dark">
                  <strong>Importante:</strong> Este pré-diagnóstico é apenas uma ferramenta de orientação inicial. 
                  Os resultados não substituem uma avaliação profissional completa. Sempre consulte um 
                  profissional de saúde qualificado para diagnósticos precisos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={onRestart}
            className="bg-cv-blue-heart hover:bg-cv-blue-heart/90 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Fazer Novo Pré-Diagnóstico
          </Button>
          
          <Button 
            variant="outline"
            onClick={onBack}
            className="border-cv-gray-light text-cv-gray-dark hover:bg-gray-50"
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIResultScreen;
