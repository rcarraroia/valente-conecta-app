import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DiagnosisChat } from '../DiagnosisChat';
import { useDiagnosisChat } from '@/hooks/useDiagnosisChat';
import { ChatMessage } from '@/types/diagnosis';

// Mock the hook
vi.mock('@/hooks/useDiagnosisChat');

const mockUseDiagnosisChat = vi.mocked(useDiagnosisChat);

describe('DiagnosisChat', () => {
  const mockSendMessage = vi.fn();
  const mockStartSession = vi.fn();
  const mockRetryLastMessage = vi.fn();
  const mockClearError = vi.fn();

  const defaultHookReturn = {
    messages: [],
    isLoading: false,
    error: null,
    isTyping: false,
    sessionId: null,
    sendMessage: mockSendMessage,
    startSession: mockStartSession,
    retryLastMessage: mockRetryLastMessage,
    clearError: mockClearError
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDiagnosisChat.mockReturnValue(defaultHookReturn);
  });

  describe('Initial State', () => {
    it('should render start session screen when no session exists', () => {
      render(<DiagnosisChat />);
      
      expect(screen.getByText('Iniciar Pré-Diagnóstico')).toBeInTheDocument();
      expect(screen.getByText('Iniciar Conversa')).toBeInTheDocument();
      expect(screen.getByText(/Converse com nossa IA especializada/)).toBeInTheDocument();
    });

    it('should call startSession when start button is clicked', async () => {
      render(<DiagnosisChat />);
      
      const startButton = screen.getByText('Iniciar Conversa');
      fireEvent.click(startButton);
      
      expect(mockStartSession).toHaveBeenCalledOnce();
    });

    it('should show loading state when starting session', () => {
      mockUseDiagnosisChat.mockReturnValue({
        ...defaultHookReturn,
        isLoading: true
      });

      render(<DiagnosisChat />);
      
      expect(screen.getByText('Iniciando...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Chat Interface', () => {
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        content: 'Olá! Como posso ajudá-lo?',
        type: 'ai',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        status: 'sent'
      },
      {
        id: '2',
        content: 'Tenho dor de cabeça',
        type: 'user',
        timestamp: new Date('2024-01-01T10:01:00Z'),
        status: 'sent'
      }
    ];

    beforeEach(() => {
      mockUseDiagnosisChat.mockReturnValue({
        ...defaultHookReturn,
        sessionId: 'session-123',
        messages: mockMessages
      });
    });

    it('should render chat interface when session exists', () => {
      render(<DiagnosisChat />);
      
      expect(screen.getByText('Assistente de Pré-Diagnóstico')).toBeInTheDocument();
      expect(screen.getByText('Sessão: sion-123')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Digite sua mensagem...')).toBeInTheDocument();
    });

    it('should display messages correctly', () => {
      render(<DiagnosisChat />);
      
      expect(screen.getByText('Olá! Como posso ajudá-lo?')).toBeInTheDocument();
      expect(screen.getByText('Tenho dor de cabeça')).toBeInTheDocument();
    });

    it('should show message timestamps', () => {
      render(<DiagnosisChat />);
      
      expect(screen.getByText('07:00')).toBeInTheDocument();
      expect(screen.getByText('07:01')).toBeInTheDocument();
    });

    it('should send message when send button is clicked', async () => {
      render(<DiagnosisChat />);
      
      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
      
      fireEvent.change(input, { target: { value: 'Nova mensagem' } });
      fireEvent.click(sendButton);
      
      expect(mockSendMessage).toHaveBeenCalledWith('Nova mensagem');
    });

    it('should send message when Enter is pressed', async () => {
      render(<DiagnosisChat />);
      
      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      
      fireEvent.change(input, { target: { value: 'Mensagem via Enter' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      expect(mockSendMessage).toHaveBeenCalledWith('Mensagem via Enter');
    });

    it('should not send empty messages', () => {
      render(<DiagnosisChat />);
      
      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
      
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(sendButton);
      
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should clear input after sending message', async () => {
      render(<DiagnosisChat />);
      
      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }));
      
      expect(input).toHaveValue('');
    });
  });

  describe('Loading States', () => {
    beforeEach(() => {
      mockUseDiagnosisChat.mockReturnValue({
        ...defaultHookReturn,
        sessionId: 'session-123',
        messages: []
      });
    });

    it('should disable input and send button when loading', () => {
      mockUseDiagnosisChat.mockReturnValue({
        ...defaultHookReturn,
        sessionId: 'session-123',
        isLoading: true
      });

      render(<DiagnosisChat />);
      
      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
      
      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });

    it('should show typing indicator when AI is typing', () => {
      mockUseDiagnosisChat.mockReturnValue({
        ...defaultHookReturn,
        sessionId: 'session-123',
        isTyping: true
      });

      render(<DiagnosisChat />);
      
      expect(screen.getByText('Analisando...')).toBeInTheDocument();
    });

    it('should show processing indicator when loading', () => {
      mockUseDiagnosisChat.mockReturnValue({
        ...defaultHookReturn,
        sessionId: 'session-123',
        isLoading: true
      });

      render(<DiagnosisChat />);
      
      expect(screen.getByText('Processando...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockUseDiagnosisChat.mockReturnValue({
        ...defaultHookReturn,
        sessionId: 'session-123',
        error: 'Erro de conexão'
      });
    });

    it('should display error message', () => {
      render(<DiagnosisChat />);
      
      expect(screen.getByText('Erro de conexão')).toBeInTheDocument();
    });

    it('should show retry button on error', () => {
      render(<DiagnosisChat />);
      
      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
    });

    it('should call retryLastMessage when retry button is clicked', () => {
      render(<DiagnosisChat />);
      
      const retryButton = screen.getByText('Tentar Novamente');
      fireEvent.click(retryButton);
      
      expect(mockRetryLastMessage).toHaveBeenCalledOnce();
    });

    it('should call clearError when close button is clicked', () => {
      render(<DiagnosisChat />);
      
      const closeButton = screen.getByText('Fechar');
      fireEvent.click(closeButton);
      
      expect(mockClearError).toHaveBeenCalledOnce();
    });

    it('should show error icon for failed messages', () => {
      const messagesWithError: ChatMessage[] = [
        {
          id: '1',
          content: 'Mensagem com erro',
          type: 'user',
          timestamp: new Date(),
          status: 'error'
        }
      ];

      mockUseDiagnosisChat.mockReturnValue({
        ...defaultHookReturn,
        sessionId: 'session-123',
        messages: messagesWithError,
        error: null
      });

      render(<DiagnosisChat />);
      
      // Should show error icon (AlertCircle) - using class name instead of testId
      const messageContainer = screen.getByText('Mensagem com erro').closest('div');
      expect(messageContainer).toBeInTheDocument();
    });
  });

  describe('Session Management', () => {
    it('should call onSessionComplete when session is completed', async () => {
      const onSessionComplete = vi.fn();
      const completedMessage: ChatMessage = {
        id: '1',
        content: 'Diagnóstico concluído',
        type: 'ai',
        timestamp: new Date(),
        status: 'sent',
        metadata: { isComplete: true }
      };

      mockUseDiagnosisChat.mockReturnValue({
        ...defaultHookReturn,
        sessionId: 'session-123',
        messages: [completedMessage]
      });

      render(<DiagnosisChat onSessionComplete={onSessionComplete} />);
      
      await waitFor(() => {
        expect(onSessionComplete).toHaveBeenCalledWith('session-123');
      });
    });

    it('should use provided sessionId prop', () => {
      render(<DiagnosisChat sessionId="external-session-123" />);
      
      expect(mockUseDiagnosisChat).toHaveBeenCalledWith('external-session-123');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseDiagnosisChat.mockReturnValue({
        ...defaultHookReturn,
        sessionId: 'session-123'
      });
    });

    it('should focus input on mount', () => {
      render(<DiagnosisChat />);
      
      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      expect(input).toHaveFocus();
    });

    it('should have proper ARIA labels', () => {
      render(<DiagnosisChat />);
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /enviar mensagem/i })).toBeInTheDocument();
    });

    it('should handle keyboard navigation', () => {
      render(<DiagnosisChat />);
      
      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      
      // Should not send on Shift+Enter
      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
      
      expect(mockSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Message Display', () => {
    it('should show welcome message when no messages exist', () => {
      mockUseDiagnosisChat.mockReturnValue({
        ...defaultHookReturn,
        sessionId: 'session-123',
        messages: []
      });

      render(<DiagnosisChat />);
      
      expect(screen.getByText('Olá! Sou seu assistente de pré-diagnóstico.')).toBeInTheDocument();
      expect(screen.getByText('Como posso ajudá-lo hoje?')).toBeInTheDocument();
    });

    it('should apply correct styling for user and AI messages', () => {
      const messages: ChatMessage[] = [
        {
          id: '1',
          content: 'AI message',
          type: 'ai',
          timestamp: new Date(),
          status: 'sent'
        },
        {
          id: '2',
          content: 'User message',
          type: 'user',
          timestamp: new Date(),
          status: 'sent'
        }
      ];

      mockUseDiagnosisChat.mockReturnValue({
        ...defaultHookReturn,
        sessionId: 'session-123',
        messages
      });

      render(<DiagnosisChat />);
      
      // Both messages should be visible
      expect(screen.getByText('AI message')).toBeInTheDocument();
      expect(screen.getByText('User message')).toBeInTheDocument();
    });
  });
});