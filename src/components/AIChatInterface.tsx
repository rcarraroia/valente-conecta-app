
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'text_input' | 'single_choice' | 'multi_choice' | 'yes_no';
  options?: any;
  position: number;
}

interface Session {
  session_id: string;
  question?: Question;
  progress?: {
    current: number;
    total: number;
  };
}

interface AIChatInterfaceProps {
  session: Session | null;
  loading: boolean;
  onAnswer: (answer: any, answerText?: string) => Promise<void>;
  onCancel: () => void;
}

const AIChatInterface = ({ session, loading, onAnswer, onCancel }: AIChatInterfaceProps) => {
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);

  if (!session?.question) {
    return (
      <div className="min-h-screen bg-cv-off-white flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cv-blue-heart" />
          <p className="text-cv-gray-light">Carregando pergunta...</p>
        </div>
      </div>
    );
  }

  const { question, progress } = session;
  const progressPercentage = progress ? (progress.current / progress.total) * 100 : 0;

  const handleSubmit = async () => {
    let answer = selectedAnswer;
    let answerText = textAnswer;

    // Validar resposta baseada no tipo de pergunta
    if (question.type === 'text_input' && !textAnswer.trim()) {
      return;
    }
    
    if (question.type !== 'text_input' && selectedAnswer === null) {
      return;
    }

    if (question.type === 'text_input') {
      answer = textAnswer;
      answerText = textAnswer;
    }

    await onAnswer(answer, answerText);
    
    // Limpar campos para próxima pergunta
    setTextAnswer('');
    setSelectedAnswer(null);
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'yes_no':
        return (
          <div className="space-y-3">
            <Button
              variant={selectedAnswer === true ? "default" : "outline"}
              className={`w-full justify-start ${
                selectedAnswer === true 
                  ? 'bg-cv-green-mint hover:bg-cv-green-mint/90' 
                  : 'border-cv-gray-light'
              }`}
              onClick={() => setSelectedAnswer(true)}
            >
              Sim
            </Button>
            <Button
              variant={selectedAnswer === false ? "default" : "outline"}
              className={`w-full justify-start ${
                selectedAnswer === false 
                  ? 'bg-cv-coral hover:bg-cv-coral/90' 
                  : 'border-cv-gray-light'
              }`}
              onClick={() => setSelectedAnswer(false)}
            >
              Não
            </Button>
          </div>
        );

      case 'single_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option: any, index: number) => (
              <Button
                key={index}
                variant={selectedAnswer === option.value ? "default" : "outline"}
                className={`w-full justify-start text-left ${
                  selectedAnswer === option.value 
                    ? 'bg-cv-blue-heart hover:bg-cv-blue-heart/90' 
                    : 'border-cv-gray-light'
                }`}
                onClick={() => setSelectedAnswer(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        );

      case 'text_input':
        return (
          <div className="space-y-4">
            <Input
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Digite sua resposta..."
              className="w-full"
            />
          </div>
        );

      default:
        return <div>Tipo de pergunta não suportado</div>;
    }
  };

  const canSubmit = () => {
    if (question.type === 'text_input') {
      return textAnswer.trim().length > 0;
    }
    return selectedAnswer !== null;
  };

  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header com progresso */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel}
              className="text-cv-gray-light hover:text-cv-gray-dark"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <div className="flex-1">
              <p className="text-sm text-cv-gray-light">
                Pergunta {progress?.current || 1} de {progress?.total || 1}
              </p>
              <Progress 
                value={progressPercentage} 
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Pergunta */}
        <Card className="border-cv-blue-light bg-white">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-h2 font-heading font-semibold text-cv-gray-dark mb-4">
                  {question.text}
                </h2>
              </div>

              {/* Input da resposta */}
              <div>
                {renderQuestionInput()}
              </div>

              {/* Botão de enviar */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit() || loading}
                  className="bg-cv-blue-heart hover:bg-cv-blue-heart/90 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {progress?.current === progress?.total ? 'Finalizar' : 'Próxima'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIChatInterface;
