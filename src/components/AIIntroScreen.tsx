
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Heart, ArrowLeft, Loader2 } from 'lucide-react';

interface AIIntroScreenProps {
  onStart: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const AIIntroScreen = ({ onStart, onCancel, loading = false }: AIIntroScreenProps) => {
  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="text-cv-gray-light hover:text-cv-gray-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Intro Card */}
        <Card className="border-cv-blue-light bg-white">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-cv-blue-heart rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-h1 font-heading font-bold text-cv-gray-dark">
              Pré-Diagnóstico Inteligente
            </CardTitle>
            <CardDescription className="text-body text-cv-gray-light">
              Nossa ferramenta de orientação inicial para identificar possíveis sinais relacionados ao neurodesenvolvimento
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Como funciona */}
            <div className="space-y-4">
              <h3 className="text-h3 font-heading font-semibold text-cv-gray-dark">
                Como funciona:
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-cv-green-mint rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-white">1</span>
                  </div>
                  <p className="text-body text-cv-gray-dark">
                    Você responderá algumas perguntas sobre desenvolvimento e comportamento
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-cv-green-mint rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-white">2</span>
                  </div>
                  <p className="text-body text-cv-gray-dark">
                    Nossa IA analisa suas respostas baseada em critérios estabelecidos por especialistas
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-cv-green-mint rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-white">3</span>
                  </div>
                  <p className="text-body text-cv-gray-dark">
                    Você recebe orientações personalizadas e próximos passos recomendados
                  </p>
                </div>
              </div>
            </div>

            {/* Importante */}
            <div className="bg-cv-coral/10 border border-cv-coral/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-cv-coral mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-cv-coral mb-1">Importante lembrar:</h4>
                  <p className="text-sm text-cv-gray-dark">
                    Este pré-diagnóstico é uma ferramenta de orientação inicial e não substitui 
                    uma avaliação profissional. Os resultados devem sempre ser discutidos com 
                    um profissional de saúde qualificado.
                  </p>
                </div>
              </div>
            </div>

            {/* Tempo estimado */}
            <div className="text-center py-4">
              <p className="text-body text-cv-gray-light">
                ⏱️ Tempo estimado: 5-10 minutos
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={onStart}
                disabled={loading}
                className="bg-cv-blue-heart hover:bg-cv-blue-heart/90 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  'Iniciar Triagem Comportamental'
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={onCancel}
                className="border-cv-gray-light text-cv-gray-dark hover:bg-gray-50"
              >
                Voltar ao Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIIntroScreen;
