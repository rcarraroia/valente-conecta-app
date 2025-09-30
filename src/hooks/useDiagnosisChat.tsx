// Hook for managing Sistema de Triagem Comportamental (STC) chat state and communication

import { useState, useCallback, useRef, useEffect } from 'react';
import { chatService } from '@/services/chat.service';
import { diagnosisReportService } from '@/services/diagnosis-report.service';
import { screeningPersistence, extractSubAgentData, extractRiskIndicators } from '@/services/screening.persistence.service';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDiagnosisErrorHandler } from '@/hooks/useDiagnosisErrorHandler';
import { analyticsService, AnalyticsEvent } from '@/services/analytics.service';
import { loggingService, LogCategory } from '@/services/logging.service';
import type { 
  ChatMessage, 
  DiagnosisChatSession, 
  N8nWebhookRequest,
  N8nWebhookResponse,
  DiagnosisData 
} from '@/types/diagnosis';
import type { ReportGenerationResult } from '@/types/diagnosis-services';
import { 
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
  generatedReport: ReportGenerationResult | null;
  isGeneratingReport: boolean;
}

export interface ChatActions {
  startSession: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  endSession: () => void;
  clearError: () => void;
  retryLastMessage: () => Promise<void>;
  regenerateReport: () => Promise<void>;
  resetChat: () => void;
}

// Legacy interface for backward compatibility
export interface UseDiagnosisChatReturn {
  // Direct properties for backward compatibility
  session: DiagnosisChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  isConnected: boolean;
  diagnosisResult: DiagnosisData | null;
  generatedReport: ReportGenerationResult | null;
  isGeneratingReport: boolean;
  sessionId: string | null;
  
  // Actions
  startSession: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  endSession: () => void;
  clearError: () => void;
  retryLastMessage: () => Promise<void>;
  regenerateReport: () => Promise<void>;
  resetChat: () => void;
  
  // New structured interface
  state: ChatState;
  actions: ChatActions;
}

/**
 * Hook for managing Sistema de Triagem Comportamental (STC) chat functionality
 * Mantém nomenclatura "diagnosis" no código por compatibilidade
 */
export const useDiagnosisChat = (): UseDiagnosisChatReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { actions: errorActions } = useDiagnosisErrorHandler();
  
  // Chat state
  const [session, setSession] = useState<DiagnosisChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisData | null>(null);
  const [generatedReport, setGeneratedReport] = useState<ReportGenerationResult | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Refs for managing state
  const lastMessageRef = useRef<string>('');
  const sessionIdRef = useRef<string>('');
  const retryCountRef = useRef<number>(0);
  
  /**
   * Starts a new diagnosis chat session
   */
  const startSession = useCallback(async () => {
    // Wait for auth to be ready if still loading
    if (!user?.id) {
      const errorMsg = 'Usuário não autenticado. Verifique se você está logado.';
      setError(errorMsg);
      toast({
        title: 'Erro de Autenticação',
        description: errorMsg,
        variant: 'destructive',
      });
      console.error('startSession called without authenticated user:', { user });
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
      
      // Check if chat service is available
      if (!chatService) {
        throw new Error('O sistema de pré-diagnóstico não está configurado. Entre em contato com o suporte técnico.');
      }
      
      // Create initial request
      const initialRequest = chatService.createInitialRequest(user.id, sessionId);
      
      // Send initial request to start conversation
      const response = await chatService.sendMessage(initialRequest);
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Falha ao iniciar sessão');
      }
      
      // Add initial AI message if provided
      if (response.data.message) {
        const aiMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          type: 'ai',
          content: response.data.message,
          timestamp: new Date(),
          status: 'sent',
        };
        
        setMessages([aiMessage]);
      }
      
      setIsConnected(true);
      retryCountRef.current = 0;
      
      // Track session start
      if (analyticsService) {
        await analyticsService.trackChatInteraction(user.id, sessionId, 'session_started', {
          initial_message_received: !!response.data.message,
        });
      }
      
      loggingService.logChatInteraction('session_started', user.id, sessionId, {
        response_time: response.metadata?.response_time,
        initial_message: response.data.message?.substring(0, 100),
      });
      
      toast({
        title: 'Sessão Iniciada',
        description: 'Sua sessão de triagem comportamental foi iniciada com sucesso.',
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
      
      console.error('Erro ao iniciar sessão de triagem comportamental:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  /**
   * Sends a message in the current chat session
   */
  const sendMessage = useCallback(async (content: string) => {
    console.log('🎯 useDiagnosisChat: sendMessage called with content:', content);
    console.log('🎯 useDiagnosisChat: Current state:', { 
      hasSession: !!session, 
      hasUser: !!user?.id, 
      userId: user?.id,
      sessionId: session?.id 
    });

    if (!session || !user?.id) {
      const errorMsg = 'Sessão não encontrada ou usuário não autenticado. Tente reiniciar a sessão.';
      setError(errorMsg);
      console.error('🎯 useDiagnosisChat: sendMessage called without session or user:', { session: !!session, user: !!user });
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
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        type: 'user',
        content: content.trim(),
        timestamp: new Date(),
        status: 'sending',
      };

      // Add user message to state immediately
      setMessages(prev => [...prev, userMessage]);

      // 🔒 STC: Registrar consentimento (apenas primeira mensagem)
      if (messages.length === 0) {
        try {
          console.log('🔒 STC: Registrando consentimento para primeira mensagem');
          await screeningPersistence.recordConsent(user.id);
          await screeningPersistence.markConsentRecorded(session.id);
          console.log('✅ STC: Consentimento registrado com sucesso');
        } catch (error) {
          console.error('❌ STC: Erro ao registrar consentimento (não bloqueia chat):', error);
          // Não bloquear o chat por falha de persistência
        }
      }

      // Prepare request for N8n (exact format as shown in webhook config)
      const request = {
        chatInput: content.trim(),
        user_id: user.id,
        session_id: session.id,
        timestamp: new Date().toISOString(),
      };
      
      const hookRequestId = `hook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`🚀 [${hookRequestId}] useDiagnosisChat: Sending to n8n:`, request);
      console.log(`📝 [${hookRequestId}] Message details:`, {
        originalContent: content,
        trimmedContent: content.trim(),
        messageLength: content.trim().length,
        userId: user.id,
        sessionId: session.id,
        timestamp: request.timestamp
      });

      // Check if chat service is available
      if (!chatService) {
        console.error('🎯 useDiagnosisChat: chatService is null/undefined');
        throw new Error('O sistema de pré-diagnóstico não está configurado. Entre em contato com o suporte técnico.');
      }

      console.log(`🎯 [${hookRequestId}] useDiagnosisChat: chatService available, calling sendMessage`);
      
      // Send message to chat service
      const response = await chatService.sendMessage(request);
      
      console.log(`🎯 [${hookRequestId}] useDiagnosisChat: chatService.sendMessage response:`, response);
      console.log(`📊 [${hookRequestId}] Response analysis:`, {
        success: response.success,
        hasData: !!response.data,
        hasError: !!response.error,
        errorType: response.error?.type,
        errorMessage: response.error?.message,
        responseMessage: response.data?.message?.substring(0, 100) + '...'
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Falha ao enviar mensagem');
      }

      const responseData = response.data;

      // Create AI response message
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        type: 'ai',
        content: responseData.message,
        timestamp: new Date(),
        status: 'sent',
      };

      // Add AI message to state
      setMessages(prev => [...prev, aiMessage]);

      // 💾 STC: Persistir mensagens no banco (não bloqueia em caso de erro)
      try {
        console.log('💾 STC: Persistindo sessão no banco');
        await screeningPersistence.upsertChatSession({
          session_id: session.id,
          user_id: user.id,
          status: session.status,
          messages: [...messages, userMessage, aiMessage]
        });
        console.log('✅ STC: Sessão persistida com sucesso');
      } catch (error) {
        console.error('❌ STC: Erro ao persistir sessão (não bloqueia chat):', error);
        // Não bloquear o chat por falha de persistência
      }

      // Track message exchange with improved error handling
      try {
        if (analyticsService) {
          await analyticsService.trackChatInteraction(user.id, session.id, 'message_sent', {
            message_length: content.length,
            response_time: response.metadata?.duration || 0,
          });
          
          await analyticsService.trackChatInteraction(user.id, session.id, 'message_received', {
            response_length: responseData.message.length,
            diagnosis_complete: responseData.diagnosis_complete || false,
          });
        }
      } catch (analyticsError) {
        // Silently fail analytics to not affect user experience
        console.warn('Analytics tracking failed (non-critical):', analyticsError);
      }
      
      loggingService.logChatInteraction('message_sent', user.id, session.id, {
        message_preview: content.substring(0, 50),
        message_length: content.length,
      });
      
      loggingService.logChatInteraction('message_received', user.id, session.id, {
        response_preview: responseData.message.substring(0, 50),
        response_length: responseData.message.length,
        diagnosis_complete: responseData.diagnosis_complete,
        response_time: response.metadata?.response_time,
      });

      // Check if diagnosis is complete
      if (responseData.diagnosis_complete && responseData.diagnosis_data) {
        setDiagnosisResult(responseData.diagnosis_data);
        
        // Update session status
        setSession(prev => prev ? {
          ...prev,
          status: 'completed',
          completed_at: new Date().toISOString(),
        } : null);

        // Add completion message to chat
        const completionMessage = createChatMessage({
          id: `msg_${Date.now()}_completion`,
          session_id: session.id,
          sender: 'system',
          content: '🎯 Diagnóstico concluído! Gerando seu relatório PDF...',
          timestamp: new Date().toISOString(),
        });

        setMessages(prev => [...prev, completionMessage]);

        // 🧠 STC: Salvar resultado final da triagem
        try {
          console.log('🧠 STC: Salvando resultado final da triagem');
          const subAgentData = extractSubAgentData(responseData.diagnosis_data);
          const riskIndicators = extractRiskIndicators(responseData.diagnosis_data);
          
          await screeningPersistence.saveDiagnosticResult({
            user_id: user.id,
            session_id: session.id,
            behavioral_score: screeningPersistence.calculateBehavioralScore(responseData.diagnosis_data),
            severity_level: responseData.diagnosis_data.nivel_urgencia === 'Alta' ? 3 :
                           responseData.diagnosis_data.nivel_urgencia === 'Moderada' ? 2 : 1,
            recommendations: responseData.diagnosis_data.orientacoes_personalizadas?.join('\n') || 
                           responseData.diagnosis_data.recomendacoes || '',
            sub_agent_tea: subAgentData.tea_analysis,
            sub_agent_tdah: subAgentData.tdah_analysis,
            sub_agent_linguagem: subAgentData.linguagem_analysis,
            sub_agent_sindromes: subAgentData.sindromes_analysis,
            interview_duration_minutes: Math.floor((Date.now() - new Date(session.started_at).getTime()) / 60000),
            completed_steps: responseData.diagnosis_data.completed_steps || 
                           responseData.diagnosis_data.etapas_concluidas || [],
            risk_indicators: riskIndicators
          });
          console.log('✅ STC: Resultado da triagem salvo com sucesso');
        } catch (error) {
          console.error('❌ STC: Erro ao salvar resultado final (não bloqueia geração de PDF):', error);
          // Não bloquear a geração do PDF por falha de persistência
        }

        // Generate PDF report automatically
        await generatePDFReport(responseData.diagnosis_data);

        toast({
          title: 'Triagem Comportamental Concluída',
          description: 'Sua triagem foi finalizada. O relatório está sendo gerado.',
        });
      }

      setIsConnected(true);
      retryCountRef.current = 0;

    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao enviar mensagem';
      setError(errorMsg);
      setIsConnected(false);

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        type: 'system',
        content: `Erro: ${errorMsg}. Clique em "Tentar Novamente" para reenviar.`,
        timestamp: new Date(),
        status: 'error',
      };

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
   * Generates PDF report when diagnosis is completed
   */
  const generatePDFReport = useCallback(async (diagnosisData: DiagnosisData, retryCount = 0) => {
    if (!session || !user?.id) {
      console.error('Cannot generate PDF: missing session or user');
      return;
    }

    setIsGeneratingReport(true);
    setError(null);

    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    try {
      // Track PDF generation start
      await analyticsService.trackPDFOperation(user.id, session.id, 'generation_started', {
        retry_count: retryCount,
        diagnosis_severity: diagnosisData.severity_level,
      });
      
      loggingService.logPDFOperation('generation_started', user.id, session.id, {
        retry_count: retryCount,
        diagnosis_data_size: JSON.stringify(diagnosisData).length,
      });

      // Add progress message
      const progressMessage = createChatMessage({
        id: `msg_${Date.now()}_progress`,
        session_id: session.id,
        sender: 'system',
        content: `📄 Gerando relatório PDF... ${retryCount > 0 ? `(Tentativa ${retryCount + 1}/${maxRetries + 1})` : ''}`,
        timestamp: new Date().toISOString(),
      });

      setMessages(prev => [...prev, progressMessage]);

      // Check if diagnosis report service is available
      if (!diagnosisReportService) {
        throw new Error('Serviço de relatórios não está disponível no momento');
      }

      const result = await diagnosisReportService.generateAndSaveReport(
        user.id,
        session.id,
        diagnosisData,
        {
          title: `Pré-Diagnóstico - ${new Date().toLocaleDateString('pt-BR')}`,
          includePatientInfo: true,
          includeRecommendations: true,
          notifyUser: false, // We'll handle notification manually
          autoSave: true,
        }
      );

      if (result.success && result.data) {
        setGeneratedReport(result.data);
        
        // Track PDF generation success
        await analyticsService.trackPDFOperation(user.id, session.id, 'generation_completed', {
          file_size: result.data.metadata.fileSize,
          generation_time: result.data.metadata.totalTime,
          retry_count: retryCount,
        });
        
        loggingService.logPDFOperation('generation_completed', user.id, session.id, {
          file_size: result.data.metadata.fileSize,
          generation_time: result.data.metadata.totalTime,
          report_id: result.data.reportId,
          retry_count: retryCount,
        });
        
        // Success notification
        toast({
          title: 'Relatório Gerado com Sucesso',
          description: `Relatório PDF gerado em ${result.data.metadata.totalTime}ms. Disponível para download.`,
        });

        // Add success message with download info
        const successMessage = createChatMessage({
          id: `msg_${Date.now()}_report_success`,
          session_id: session.id,
          sender: 'system',
          content: `✅ Relatório PDF gerado com sucesso!\n\n📊 **Detalhes:**\n• Tamanho: ${(result.data.metadata.fileSize / 1024).toFixed(1)} KB\n• Tempo de geração: ${result.data.metadata.totalTime}ms\n• ID do relatório: ${result.data.reportId}\n\n🔗 Você pode visualizar e baixar seu relatório na seção "Meus Relatórios" ou no dashboard.`,
          timestamp: new Date().toISOString(),
        });

        setMessages(prev => [...prev, successMessage]);

        // Emit custom event for other components
        window.dispatchEvent(new CustomEvent('diagnosis-pdf-generated', {
          detail: {
            reportId: result.data.reportId,
            signedUrl: result.data.signedUrl,
            metadata: result.data.metadata,
          }
        }));

      } else {
        const errorMsg = result.error?.message || 'Erro desconhecido ao gerar relatório';
        
        // Check if error is retryable and we haven't exceeded max retries
        if (result.error?.retryable && retryCount < maxRetries) {
          toast({
            title: 'Tentando Novamente',
            description: `Erro temporário: ${errorMsg}. Tentando novamente em ${retryDelay/1000}s...`,
            variant: 'default',
          });

          // Add retry message
          const retryMessage = createChatMessage({
            id: `msg_${Date.now()}_retry`,
            session_id: session.id,
            sender: 'system',
            content: `⚠️ Erro temporário na geração do relatório: ${errorMsg}\n\n🔄 Tentando novamente em ${retryDelay/1000} segundos...`,
            timestamp: new Date().toISOString(),
          });

          setMessages(prev => [...prev, retryMessage]);

          // Wait and retry
          setTimeout(() => {
            generatePDFReport(diagnosisData, retryCount + 1);
          }, retryDelay);

          return;
        }

        // Final error - no more retries
        toast({
          title: 'Erro na Geração do Relatório',
          description: errorMsg,
          variant: 'destructive',
        });

        // Add final error message with manual retry option
        const errorMessage = createChatMessage({
          id: `msg_${Date.now()}_report_error`,
          session_id: session.id,
          sender: 'system',
          content: `❌ **Erro ao gerar relatório PDF**\n\n**Erro:** ${errorMsg}\n**Tentativas:** ${retryCount + 1}/${maxRetries + 1}\n\n💡 **O que fazer:**\n• Verifique sua conexão com a internet\n• Tente gerar o relatório novamente na seção "Meus Relatórios"\n• Entre em contato com o suporte se o problema persistir`,
          timestamp: new Date().toISOString(),
        });

        setMessages(prev => [...prev, errorMessage]);
      }

    } catch (error: any) {
      const errorMsg = error.message || 'Erro inesperado ao gerar relatório';
      
      // Track PDF generation failure
      await analyticsService.trackPDFOperation(user.id, session.id, 'generation_failed', {
        error_message: errorMsg,
        retry_count: retryCount,
        will_retry: retryCount < maxRetries,
      });
      
      loggingService.logPDFOperation('generation_failed', user.id, session.id, {
        error_message: errorMsg,
        error_stack: error.stack,
        retry_count: retryCount,
        will_retry: retryCount < maxRetries,
      });
      
      // Check if we should retry
      if (retryCount < maxRetries) {
        toast({
          title: 'Erro Inesperado - Tentando Novamente',
          description: `${errorMsg}. Tentativa ${retryCount + 1}/${maxRetries + 1}`,
          variant: 'default',
        });

        setTimeout(() => {
          generatePDFReport(diagnosisData, retryCount + 1);
        }, retryDelay);

        return;
      }

      // Final error
      toast({
        title: 'Erro Crítico na Geração do Relatório',
        description: errorMsg,
        variant: 'destructive',
      });

      const criticalErrorMessage = createChatMessage({
        id: `msg_${Date.now()}_critical_error`,
        session_id: session.id,
        sender: 'system',
        content: `🚨 **Erro crítico ao gerar relatório**\n\n**Erro:** ${errorMsg}\n\n⚠️ Por favor, entre em contato com o suporte técnico informando o ID da sessão: ${session.id}`,
        timestamp: new Date().toISOString(),
      });

      setMessages(prev => [...prev, criticalErrorMessage]);

      console.error('Erro crítico ao gerar relatório PDF:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [session, user?.id, toast]);

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
        description: 'Sua sessão de triagem comportamental foi finalizada.',
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
   * Regenerates PDF report for completed diagnosis
   */
  const regenerateReport = useCallback(async () => {
    if (!diagnosisResult) {
      toast({
        title: 'Diagnóstico Não Encontrado',
        description: 'Não há dados de diagnóstico para gerar o relatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!session || session.status !== 'completed') {
      toast({
        title: 'Sessão Inválida',
        description: 'A sessão deve estar completa para regenerar o relatório.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Regenerando Relatório',
      description: 'Iniciando nova geração do relatório PDF...',
    });

    await generatePDFReport(diagnosisResult);
  }, [diagnosisResult, session, generatePDFReport, toast]);

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
    setGeneratedReport(null);
    setIsGeneratingReport(false);
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

  // Listen for diagnosis report ready events
  useEffect(() => {
    const handleReportReady = (event: CustomEvent) => {
      const { title, description, reportTitle } = event.detail;
      
      toast({
        title,
        description,
      });

      // Add system message about report being ready
      if (session) {
        const reportReadyMessage = createChatMessage({
          id: `msg_${Date.now()}_report_ready`,
          session_id: session.id,
          sender: 'system',
          content: `📄 Seu relatório "${reportTitle}" está pronto para visualização!`,
          timestamp: new Date().toISOString(),
        });

        setMessages(prev => [...prev, reportReadyMessage]);
      }
    };

    window.addEventListener('diagnosis-report-ready', handleReportReady as EventListener);

    return () => {
      window.removeEventListener('diagnosis-report-ready', handleReportReady as EventListener);
    };
  }, [session, toast]);

  const state: ChatState = {
    session,
    messages,
    isLoading,
    isTyping,
    error,
    isConnected,
    diagnosisResult,
    generatedReport,
    isGeneratingReport,
  };

  const actions: ChatActions = {
    startSession,
    sendMessage,
    endSession,
    clearError,
    retryLastMessage,
    regenerateReport,
    resetChat,
  };

  // Return both legacy flat interface and new structured interface
  return {
    // Legacy flat properties for backward compatibility
    session,
    messages,
    isLoading,
    isTyping,
    error,
    isConnected,
    diagnosisResult,
    generatedReport,
    isGeneratingReport,
    sessionId: session?.id || null,
    
    // Legacy actions for backward compatibility
    startSession,
    sendMessage,
    endSession,
    clearError,
    retryLastMessage,
    regenerateReport,
    resetChat,
    
    // New structured interface
    state,
    actions,
  };
};

// Export types for external use
export type { ChatState, ChatActions };