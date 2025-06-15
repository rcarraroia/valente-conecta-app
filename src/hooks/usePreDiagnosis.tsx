
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Question {
  id: string;
  text: string;
  type: 'text_input' | 'single_choice' | 'multi_choice' | 'yes_no';
  options?: string[];
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
      console.log('Iniciando sessão de pré-diagnóstico...');
      
      const { data, error } = await supabase.functions.invoke('diagnostico-iniciar');
      
      if (error) {
        console.error('Erro da edge function:', error);
        throw new Error(error.message || 'Erro ao comunicar com o servidor');
      }

      if (data?.error) {
        console.error('Erro retornado pela função:', data);
        throw new Error(data.error);
      }

      console.log('Sessão iniciada com sucesso:', data);
      setSession(data);
      return data;
    } catch (error: any) {
      console.error('Erro ao iniciar pré-diagnóstico:', error);
      
      // Mostrar toast de erro mais específico
      const errorMessage = error.message || 'Erro desconhecido';
      toast({
        title: 'Erro ao iniciar diagnóstico',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw error; // Re-throw para que o AIAgentScreen possa capturar
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionId: string, answer: any, answerText?: string) => {
    if (!session?.session_id) {
      const error = new Error('Sessão não encontrada');
      toast({
        title: 'Erro',
        description: 'Sessão não encontrada.',
        variant: 'destructive',
      });
      throw error;
    }

    setLoading(true);
    try {
      console.log('Enviando resposta:', { questionId, answer, answerText });
      
      const { data, error } = await supabase.functions.invoke('diagnostico-resposta', {
        body: {
          session_id: session.session_id,
          question_id: questionId,
          answer,
          answer_text: answerText
        }
      });
      
      if (error) {
        console.error('Erro da edge function:', error);
        throw new Error(error.message || 'Erro ao comunicar com o servidor');
      }

      if (data?.error) {
        console.error('Erro retornado pela função:', data);
        throw new Error(data.error);
      }

      console.log('Resposta enviada com sucesso:', data);
      setSession(data);
      return data;
    } catch (error: any) {
      console.error('Erro ao enviar resposta:', error);
      
      toast({
        title: 'Erro ao enviar resposta',
        description: error.message || 'Não foi possível enviar a resposta. Tente novamente.',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    console.log('Resetando sessão');
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
