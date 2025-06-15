
import React, { useState } from 'react';
import AIIntroScreen from './AIIntroScreen';
import AIChatInterface from './AIChatInterface';
import AIResultScreen from './AIResultScreen';
import { usePreDiagnosis } from '@/hooks/usePreDiagnosis';

interface AIAgentScreenProps {
  onBack: () => void;
}

const AIAgentScreen = ({ onBack }: AIAgentScreenProps) => {
  const [currentStep, setCurrentStep] = useState('intro'); // intro, chat, results
  const { session, loading, startSession, submitAnswer, resetSession } = usePreDiagnosis();

  const handleStart = async () => {
    const newSession = await startSession();
    if (newSession) {
      setCurrentStep('chat');
    }
  };

  const handleCancel = () => {
    resetSession();
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
    setCurrentStep('intro');
  };

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
