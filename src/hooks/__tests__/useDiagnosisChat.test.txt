// Tests for useDiagnosisChat hook

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDiagnosisChat } from '../useDiagnosisChat';
import { chatService } from '@/services/chat.service';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

// Mock dependencies
vi.mock('@/services/chat.service', () => ({
  chatService: {
    sendMessage: vi.fn(),
    createInitialRequest: vi.fn(),
  },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(),
}));

vi.mock('@/utils/diagnosis-utils', () => ({
  createChatMessage: vi.fn((data) => ({
    id: data.id,
    session_id: data.session_id,
    sender: data.sender,
    content: data.content,
    timestamp: data.timestamp,
  })),
  createDiagnosisChatSession: vi.fn((data) => ({
    id: data.id,
    user_id: data.user_id,
    status: data.status,
    started_at: data.started_at,
  })),
  isValidChatMessage: vi.fn(() => true),
}));

describe('useDiagnosisChat', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockToast = vi.fn();

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    } as any);

    vi.mocked(useToast).mockReturnValue({
      toast: mockToast,
    });

    vi.mocked(chatService.createInitialRequest).mockReturnValue({
      user_id: mockUser.id,
      session_id: 'session_123',
      message: '',
      timestamp: new Date().toISOString(),
      message_history: [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useDiagnosisChat());

      expect(result.current.state.session).toBeNull();
      expect(result.current.state.messages).toEqual([]);
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.isTyping).toBe(false);
      expect(result.current.state.error).toBeNull();
      expect(result.current.state.isConnected).toBe(true);
      expect(result.current.state.diagnosisResult).toBeNull();
    });

    it('should provide all required actions', () => {
      const { result } = renderHook(() => useDiagnosisChat());

      expect(typeof result.current.actions.startSession).toBe('function');
      expect(typeof result.current.actions.sendMessage).toBe('function');
      expect(typeof result.current.actions.endSession).toBe('function');
      expect(typeof result.current.actions.clearError).toBe('function');
      expect(typeof result.current.actions.retryLastMessage).toBe('function');
      expect(typeof result.current.actions.resetChat).toBe('function');
    });
  });

  describe('startSession', () => {
    it('should start a session successfully', async () => {
      vi.mocked(chatService.sendMessage).mockResolvedValue({
        success: true,
        data: {
          message: 'Olá! Como posso ajudá-lo hoje?',
          diagnosis_complete: false,
        },
        metadata: {
          timestamp: new Date(),
          duration: 100,
        },
      });

      const { result } = renderHook(() => useDiagnosisChat());

      await act(async () => {
        await result.current.actions.startSession();
      });

      expect(result.current.state.session).not.toBeNull();
      expect(result.current.state.session?.user_id).toBe(mockUser.id);
      expect(result.current.state.session?.status).toBe('active');
      expect(result.current.state.messages).toHaveLength(1);
      expect(result.current.state.messages[0].sender).toBe('ai');
      expect(result.current.state.isConnected).toBe(true);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Sessão Iniciada',
        description: 'Sua sessão de pré-diagnóstico foi iniciada com sucesso.',
      });
    });

    it('should handle authentication error', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        signOut: vi.fn(),
      } as any);

      const { result } = renderHook(() => useDiagnosisChat());

      await act(async () => {
        await result.current.actions.startSession();
      });

      expect(result.current.state.error).toBe('Usuário não autenticado');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro de Autenticação',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
    });

    it('should handle service error', async () => {
      vi.mocked(chatService.sendMessage).mockResolvedValue({
        success: false,
        error: {
          type: 'CHAT_SERVICE_ERROR',
          message: 'Serviço indisponível',
          timestamp: new Date(),
          retryable: true,
        },
        metadata: {
          timestamp: new Date(),
          duration: 100,
        },
      });

      const { result } = renderHook(() => useDiagnosisChat());

      await act(async () => {
        await result.current.actions.startSession();
      });

      expect(result.current.state.error).toBe('Serviço indisponível');
      expect(result.current.state.isConnected).toBe(false);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro ao Iniciar Sessão',
        description: 'Serviço indisponível',
        variant: 'destructive',
      });
    });
  });

  describe('sendMessage', () => {
    beforeEach(async () => {
      vi.mocked(chatService.sendMessage).mockResolvedValue({
        success: true,
        data: {
          message: 'Olá! Como posso ajudá-lo hoje?',
          diagnosis_complete: false,
        },
        metadata: {
          timestamp: new Date(),
          duration: 100,
        },
      });

      const { result } = renderHook(() => useDiagnosisChat());
      
      await act(async () => {
        await result.current.actions.startSession();
      });
    });

    it('should send message successfully', async () => {
      vi.mocked(chatService.sendMessage).mockResolvedValue({
        success: true,
        data: {
          message: 'Entendi. Pode me contar mais sobre seus sintomas?',
          diagnosis_complete: false,
        },
        metadata: {
          timestamp: new Date(),
          duration: 150,
        },
      });

      const { result } = renderHook(() => useDiagnosisChat());

      // Start session first
      await act(async () => {
        await result.current.actions.startSession();
      });

      const initialMessageCount = result.current.state.messages.length;

      await act(async () => {
        await result.current.actions.sendMessage('Estou sentindo dor de cabeça');
      });

      expect(result.current.state.messages).toHaveLength(initialMessageCount + 2); // user + ai message
      expect(result.current.state.messages[initialMessageCount].sender).toBe('user');
      expect(result.current.state.messages[initialMessageCount].content).toBe('Estou sentindo dor de cabeça');
      expect(result.current.state.messages[initialMessageCount + 1].sender).toBe('ai');
      expect(result.current.state.isConnected).toBe(true);
    });

    it('should handle empty message', async () => {
      const { result } = renderHook(() => useDiagnosisChat());

      await act(async () => {
        await result.current.actions.startSession();
      });

      await act(async () => {
        await result.current.actions.sendMessage('   ');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Mensagem Vazia',
        description: 'Por favor, digite uma mensagem antes de enviar.',
        variant: 'destructive',
      });
    });

    it('should handle diagnosis completion', async () => {
      const diagnosisData = {
        symptoms: [{ description: 'Dor de cabeça', severity: 7 }],
        analysis: 'Possível enxaqueca',
        recommendations: ['Consultar médico'],
        severity_level: 3,
        generated_at: new Date().toISOString(),
      };

      vi.mocked(chatService.sendMessage).mockResolvedValue({
        success: true,
        data: {
          message: 'Baseado em suas respostas, aqui está seu pré-diagnóstico...',
          diagnosis_complete: true,
          diagnosis_data: diagnosisData,
        },
        metadata: {
          timestamp: new Date(),
          duration: 200,
        },
      });

      const { result } = renderHook(() => useDiagnosisChat());

      await act(async () => {
        await result.current.actions.startSession();
      });

      await act(async () => {
        await result.current.actions.sendMessage('Sim, é isso mesmo');
      });

      expect(result.current.state.diagnosisResult).toEqual(diagnosisData);
      expect(result.current.state.session?.status).toBe('completed');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Diagnóstico Concluído',
        description: 'Seu pré-diagnóstico foi finalizado. Você pode visualizar o relatório.',
      });
    });

    it('should handle message sending error', async () => {
      vi.mocked(chatService.sendMessage).mockResolvedValue({
        success: false,
        error: {
          type: 'CHAT_SERVICE_ERROR',
          message: 'Timeout na comunicação',
          timestamp: new Date(),
          retryable: true,
        },
        metadata: {
          timestamp: new Date(),
          duration: 30000,
        },
      });

      const { result } = renderHook(() => useDiagnosisChat());

      await act(async () => {
        await result.current.actions.startSession();
      });

      const initialMessageCount = result.current.state.messages.length;

      await act(async () => {
        await result.current.actions.sendMessage('Teste de erro');
      });

      expect(result.current.state.error).toBe('Timeout na comunicação');
      expect(result.current.state.isConnected).toBe(false);
      expect(result.current.state.messages).toHaveLength(initialMessageCount + 2); // user + error message
      expect(result.current.state.messages[initialMessageCount + 1].sender).toBe('system');
    });
  });

  describe('retryLastMessage', () => {
    it('should retry the last message', async () => {
      const { result } = renderHook(() => useDiagnosisChat());

      await act(async () => {
        await result.current.actions.startSession();
      });

      // First, send a message that will be stored as last message
      vi.mocked(chatService.sendMessage).mockResolvedValue({
        success: true,
        data: {
          message: 'Resposta normal',
          diagnosis_complete: false,
        },
        metadata: {
          timestamp: new Date(),
          duration: 100,
        },
      });

      await act(async () => {
        await result.current.actions.sendMessage('Mensagem de teste');
      });

      // Now retry should work
      await act(async () => {
        await result.current.actions.retryLastMessage();
      });

      expect(chatService.sendMessage).toHaveBeenCalledTimes(3); // initial + message + retry
    });

    it('should handle no message to retry', async () => {
      const { result } = renderHook(() => useDiagnosisChat());

      await act(async () => {
        await result.current.actions.retryLastMessage();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Nenhuma Mensagem para Repetir',
        description: 'Não há mensagem anterior para tentar novamente.',
        variant: 'destructive',
      });
    });
  });

  describe('endSession', () => {
    it('should end the session', async () => {
      const { result } = renderHook(() => useDiagnosisChat());

      await act(async () => {
        await result.current.actions.startSession();
      });

      await act(async () => {
        result.current.actions.endSession();
      });

      expect(result.current.state.session?.status).toBe('ended');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Sessão Finalizada',
        description: 'Sua sessão de pré-diagnóstico foi finalizada.',
      });
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const { result } = renderHook(() => useDiagnosisChat());

      // Set an error state first
      vi.mocked(chatService.sendMessage).mockResolvedValue({
        success: false,
        error: {
          type: 'CHAT_SERVICE_ERROR',
          message: 'Test error',
          timestamp: new Date(),
          retryable: true,
        },
        metadata: {
          timestamp: new Date(),
          duration: 100,
        },
      });

      await act(async () => {
        await result.current.actions.startSession();
      });

      expect(result.current.state.error).toBe('Test error');
      expect(result.current.state.isConnected).toBe(false);

      await act(async () => {
        result.current.actions.clearError();
      });

      expect(result.current.state.error).toBeNull();
      expect(result.current.state.isConnected).toBe(true);
    });
  });

  describe('resetChat', () => {
    it('should reset all chat state', async () => {
      const { result } = renderHook(() => useDiagnosisChat());

      await act(async () => {
        await result.current.actions.startSession();
      });

      await act(async () => {
        await result.current.actions.sendMessage('Test message');
      });

      // Verify state has data
      expect(result.current.state.session).not.toBeNull();
      expect(result.current.state.messages.length).toBeGreaterThan(0);

      await act(async () => {
        result.current.actions.resetChat();
      });

      // Verify state is reset
      expect(result.current.state.session).toBeNull();
      expect(result.current.state.messages).toEqual([]);
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.isTyping).toBe(false);
      expect(result.current.state.error).toBeNull();
      expect(result.current.state.isConnected).toBe(true);
      expect(result.current.state.diagnosisResult).toBeNull();
    });
  });

  describe('loading states', () => {
    it('should manage loading state during session start', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      vi.mocked(chatService.sendMessage).mockReturnValue(promise as any);

      const { result } = renderHook(() => useDiagnosisChat());

      act(() => {
        result.current.actions.startSession();
      });

      expect(result.current.state.isLoading).toBe(true);

      await act(async () => {
        resolvePromise({
          success: true,
          data: {
            message: 'Test message',
            diagnosis_complete: false,
          },
          metadata: {
            timestamp: new Date(),
            duration: 100,
          },
        });
        await promise;
      });

      expect(result.current.state.isLoading).toBe(false);
    });

    it('should manage typing state during message send', async () => {
      const { result } = renderHook(() => useDiagnosisChat());

      await act(async () => {
        await result.current.actions.startSession();
      });

      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      vi.mocked(chatService.sendMessage).mockReturnValue(promise as any);

      act(() => {
        result.current.actions.sendMessage('Test message');
      });

      expect(result.current.state.isTyping).toBe(true);

      await act(async () => {
        resolvePromise({
          success: true,
          data: {
            message: 'Response',
            diagnosis_complete: false,
          },
          metadata: {
            timestamp: new Date(),
            duration: 100,
          },
        });
        await promise;
      });

      expect(result.current.state.isTyping).toBe(false);
    });
  });
});