
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Question {
  id: string;
  text: string;
  type: 'text_input' | 'single_choice' | 'multi_choice' | 'yes_no';
  options?: any;
  position: number;
}

interface PreDiagnosisSession {
  session_id: string;
  question?: Question;
  progress?: {
    current: number;
    total: number;
  };
  completed?: boolean;
  result?: {
    analysis: string;
    severity_level: number;
    recommendations: string;
    next_steps: string;
  };
}

export const usePreDiagnosis = () => {
  const [session, setSession] = useState<PreDiagnosisSession | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const startSession = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('diagnostico-iniciar');
      
      if (error) {
        throw error;
      }

      setSession(data);
      return data;
    } catch (error) {
      console.error('Erro ao iniciar pré-diagnóstico:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar o pré-diagnóstico. Tente novamente.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionId: string, answer: any, answerText?: string) => {
    if (!session?.session_id) {
      toast({
        title: 'Erro',
        description: 'Sessão não encontrada.',
        variant: 'destructive',
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('diagnostico-resposta', {
        body: {
          session_id: session.session_id,
          question_id: questionId,
          answer,
          answer_text: answerText
        }
      });
      
      if (error) {
        throw error;
      }

      setSession(data);
      return data;
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a resposta. Tente novamente.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setSession(null);
  };

  return {
    session,
    loading,
    startSession,
    submitAnswer,
    resetSession
  };
};
