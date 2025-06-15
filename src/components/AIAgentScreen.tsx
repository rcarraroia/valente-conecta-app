
import React, { useState } from 'react';
import AIIntroScreen from './AIIntroScreen';
import AIChatInterface from './AIChatInterface';
import AIResultScreen from './AIResultScreen';
import SystemErrorScreen from './SystemErrorScreen';
import { usePreDiagnosis } from '@/hooks/usePreDiagnosis';

interface AIAgentScreenProps {
  onBack: () => void;
}

const AIAgentScreen = ({ onBack }: AIAgentScreenProps) => {
  const [currentStep, setCurrentStep] = useState('intro'); // intro, chat, results, error
  const [systemError, setSystemError] = useState<any>(null);
  const { session, loading, startSession, submitAnswer, resetSession } = usePreDiagnosis();

  const handleStart = async () => {
    try {
      const newSession = await startSession();
      if (newSession) {
        setCurrentStep('chat');
        setSystemError(null);
      }
    } catch (error: any) {
      console.error('Erro ao iniciar sessão:', error);
      setSystemError({
        message: 'Não foi possível iniciar o pré-diagnóstico',
        details: error.message || 'Erro desconhecido',
        hint: 'O sistema ainda está sendo configurado. Tente novamente mais tarde.'
      });
      setCurrentStep('error');
    }
  };

  const handleCancel = () => {
    resetSession();
    setSystemError(null);
    onBack();
  };

  const handleAnswer = async (answer: any, answerText?: string) => {
    if (!session?.question) return;

    const result = await submitAnswer(session.question.id, answer, answerText);
    
    if (result?.completed) {
      setCurrentStep('results');
    }
  };

  const handleRestart = () => {
    resetSession();
    setSystemError(null);
    setCurrentStep('intro');
  };

  const handleRetryFromError = () => {
    setSystemError(null);
    setCurrentStep('intro');
  };

  if (currentStep === 'error' && systemError) {
    return (
      <SystemErrorScreen
        error={systemError}
        onBack={handleCancel}
        onRetry={handleRetryFromError}
      />
    );
  }

  if (currentStep === 'intro') {
    return (
      <AIIntroScreen
        onStart={handleStart}
        onCancel={handleCancel}
        loading={loading}
      />
    );
  }

  if (currentStep === 'chat') {
    return (
      <AIChatInterface
        session={session}
        loading={loading}
        onAnswer={handleAnswer}
        onCancel={handleCancel}
      />
    );
  }

  if (currentStep === 'results' && session?.result) {
    return (
      <AIResultScreen
        result={session.result}
        onRestart={handleRestart}
        onBack={onBack}
      />
    );
  }

  return null;
};

export default AIAgentScreen;
