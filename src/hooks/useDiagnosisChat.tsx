// Hook for managing diagnosis chat state and communication

import { useState, useCallback, useRef, useEffect } from 'react';
import { chatService } from '@/services/chat.service';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { 
  ChatMessage, 
  DiagnosisChatSession, 
  N8nWebhookRequest,
  N8nWebhookResponse,
  DiagnosisData 
} from '@/types/diagnosis';
import { 
  createChatMessage, 
  createDiagnosisChatSession,
  isValidChatMessage 
} from '@/utils/diagnosis-utils';

export interface ChatState {
  session: DiagnosisChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  isConnected: boolean;
  diagnosisResult: DiagnosisData | null;
}

export interface ChatActions {
  startSession: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  endSession: () => void;
  clearError: () => void;
  retryLastMessage: () => Promise<void>;
  resetChat: () => void;
}

export interface UseDiagnosisChatReturn {
  state: ChatState;
  actions: ChatActions;
}

/**
 * Hook for managing diagnosis chat functionality
 */
export const useDiagnosisChat = (): UseDiagnosisChatReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Chat state
  const [session, setSession] = useState<DiagnosisChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisData | null>(null);
  
  // Refs for managing state
  const lastMessageRef = useRef<string>('');
  const sessionIdRef = useRef<string>('');
  const retryCountRef = useRef<number>(0);
  
  /**
   * Starts a new diagnosis chat session
   */
  const startSession = useCallback(async () => {
    if (!user?.id) {
      const errorMsg = 'Usuário não autenticado';
      setError(errorMsg);
      toast({
        title: 'Erro de Autenticação',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Generate session ID
      const sessionId = `session_${user.id}_${Date.now()}`;
      sessionIdRef.current = sessionId;
      
      // Create session object
      const newSession = createDiagnosisChatSession({
        id: sessionId,
        user_id: user.id,
        status: 'active',
        started_at: new Date().toISOString(),
      });
      
      setSession(newSession);
      
      // Create initial request
      const initialRequest = chatService.createInitialRequest(user.id, sessionId);
      
      // Send initial request to start conversation
      const response = await chatService.sendMessage(initialRequest);
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Falha ao iniciar sessão');
      }
      
      // Add initial AI message if provided
      if (response.data.message) {
        const aiMessage = createChatMessage({
          id: `msg_${Date.now()}`,
          session_id: sessionId,
          sender: 'ai',
          content: response.data.message,
          timestamp: new Date().toISOString(),
        });
        
        setMessages([aiMessage]);
      }
      
      setIsConnected(true);
      retryCountRef.current = 0;
      
      toast({
        title: 'Sessão Iniciada',
        description: 'Sua sessão de pré-diagnóstico foi iniciada com sucesso.',
      });
      
    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao iniciar sessão';
      setError(errorMsg);
      setIsConnected(false);
      
      toast({
        title: 'Erro ao Iniciar Sessão',
        description: errorMsg,
        variant: 'destructive',
      });
      
      console.error('Erro ao iniciar sessão de diagnóstico:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  /**
   * Sends a message in the current chat session
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!session || !user?.id) {
      const errorMsg = 'Sessão não encontrada ou usuário não autenticado';
      setError(errorMsg);
      return;
    }

    if (!content.trim()) {
      toast({
        title: 'Mensagem Vazia',
        description: 'Por favor, digite uma mensagem antes de enviar.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setIsTyping(true);
    setError(null);
    lastMessageRef.current = content;

    try {
      // Create user message
      const userMessage = createChatMessage({
        id: `msg_${Date.now()}_user`,
        session_id: session.id,
        sender: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      });

      // Add user message to state immediately
      setMessages(prev => [...prev, userMessage]);

      // Prepare request for N8n
      const request: N8nWebhookRequest = {
        user_id: user.id,
        session_id: session.id,
        message: content.trim(),
        timestamp: new Date().toISOString(),
        message_history: messages.map(msg => ({
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp,
        })),
      };

      // Send message to chat service
      const response = await chatService.sendMessage(request);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Falha ao enviar mensagem');
      }

      const responseData = response.data;

      // Create AI response message
      const aiMessage = createChatMessage({
        id: `msg_${Date.now()}_ai`,
        session_id: session.id,
        sender: 'ai',
        content: responseData.message,
        timestamp: new Date().toISOString(),
      });

      // Add AI message to state
      setMessages(prev => [...prev, aiMessage]);

      // Check if diagnosis is complete
      if (responseData.diagnosis_complete && responseData.diagnosis_data) {
        setDiagnosisResult(responseData.diagnosis_data);
        
        // Update session status
        setSession(prev => prev ? {
          ...prev,
          status: 'completed',
          completed_at: new Date().toISOString(),
        } : null);

        toast({
          title: 'Diagnóstico Concluído',
          description: 'Seu pré-diagnóstico foi finalizado. Você pode visualizar o relatório.',
        });
      }

      setIsConnected(true);
      retryCountRef.current = 0;

    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao enviar mensagem';
      setError(errorMsg);
      setIsConnected(false);

      // Add error message to chat
      const errorMessage = createChatMessage({
        id: `msg_${Date.now()}_error`,
        session_id: session.id,
        sender: 'system',
        content: `Erro: ${errorMsg}. Clique em "Tentar Novamente" para reenviar.`,
        timestamp: new Date().toISOString(),
      });

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: 'Erro ao Enviar Mensagem',
        description: errorMsg,
        variant: 'destructive',
      });

      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [session, user?.id, messages, toast]);

  /**
   * Retries the last message that failed
   */
  const retryLastMessage = useCallback(async () => {
    if (!lastMessageRef.current) {
      toast({
        title: 'Nenhuma Mensagem para Repetir',
        description: 'Não há mensagem anterior para tentar novamente.',
        variant: 'destructive',
      });
      return;
    }

    retryCountRef.current += 1;
    
    if (retryCountRef.current > 3) {
      toast({
        title: 'Muitas Tentativas',
        description: 'Muitas tentativas de reenvio. Tente reiniciar a sessão.',
        variant: 'destructive',
      });
      return;
    }

    await sendMessage(lastMessageRef.current);
  }, [sendMessage, toast]);

  /**
   * Ends the current chat session
   */
  const endSession = useCallback(() => {
    if (session) {
      setSession(prev => prev ? {
        ...prev,
        status: 'ended',
        completed_at: new Date().toISOString(),
      } : null);

      toast({
        title: 'Sessão Finalizada',
        description: 'Sua sessão de pré-diagnóstico foi finalizada.',
      });
    }
  }, [session, toast]);

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setIsConnected(true);
  }, []);

  /**
   * Resets the entire chat state
   */
  const resetChat = useCallback(() => {
    setSession(null);
    setMessages([]);
    setIsLoading(false);
    setIsTyping(false);
    setError(null);
    setIsConnected(true);
    setDiagnosisResult(null);
    lastMessageRef.current = '';
    sessionIdRef.current = '';
    retryCountRef.current = 0;
  }, []);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
      if (session && session.status === 'active') {
        // Could save session state here if needed
      }
    };
  }, [session]);

  // Validate messages when they change
  useEffect(() => {
    messages.forEach(message => {
      if (!isValidChatMessage(message)) {
        console.warn('Invalid chat message detected:', message);
      }
    });
  }, [messages]);

  const state: ChatState = {
    session,
    messages,
    isLoading,
    isTyping,
    error,
    isConnected,
    diagnosisResult,
  };

  const actions: ChatActions = {
    startSession,
    sendMessage,
    endSession,
    clearError,
    retryLastMessage,
    resetChat,
  };

  return {
    state,
    actions,
  };
};

// Export types for external use
export type { ChatState, ChatActions };