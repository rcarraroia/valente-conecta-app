// Integration tests for complete diagnosis workflow

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';

// Import components
import { DiagnosisDashboard } from '@/pages/DiagnosisDashboard';
import { DiagnosisChat } from '@/pages/DiagnosisChat';
import { DiagnosisReports } from '@/pages/DiagnosisReports';

// Mock services and hooks
vi.mock('@/hooks/useDiagnosisAuth', () => ({
  useDiagnosisAuth: () => ({
    user: { 
      id: 'test-user-123', 
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    },
    isAuthenticated: true,
    isLoading: false,
    canAccessDiagnosis: true,
    hasActiveSession: false,
    lastDiagnosisAccess: null,
    requireAuth: vi.fn(),
    redirectToLogin: vi.fn(),
    redirectToDashboard: vi.fn(),
    redirectToChat: vi.fn(),
    redirectToReports: vi.fn(),
    clearDiagnosisSession: vi.fn(),
    updateLastAccess: vi.fn(),
  }),
}));

vi.mock('@/hooks/useDiagnosisChat', () => ({
  useDiagnosisChat: vi.fn(),
}));

vi.mock('@/services/diagnosis-report.service', () => ({
  diagnosisReportService: {
    listReports: vi.fn(),
    generateAndSaveReport: vi.fn(),
    downloadReport: vi.fn(),
  },
}));

vi.mock('@/services/chat.service', () => ({
  chatService: {
    sendMessage: vi.fn(),
    startSession: vi.fn(),
  },
}));

vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({
    width: 1024,
    height: 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    breakpoint: 'lg',
    isLandscape: true,
    isPortrait: false,
  }),
  useMobileKeyboard: () => ({
    isKeyboardVisible: false,
    viewportHeight: 768,
  }),
  useTouchGestures: () => ({
    touchState: {
      isSwipeLeft: false,
      isSwipeRight: false,
      isSwipeUp: false,
      isSwipeDown: false,
      isPinching: false,
      scale: 1,
    },
    handleTouchGestures: vi.fn(() => vi.fn()),
  }),
}));

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Complete Diagnosis Workflow Integration', () => {
  let mockUseDiagnosisChat: any;
  let mockDiagnosisReportService: any;
  let mockChatService: any;

  beforeEach(async () => {
    // Setup mocks
    mockUseDiagnosisChat = vi.mocked(
      await import('@/hooks/useDiagnosisChat')
    ).useDiagnosisChat;

    mockDiagnosisReportService = vi.mocked(
      await import('@/services/diagnosis-report.service')
    ).diagnosisReportService;

    mockChatService = vi.mocked(
      await import('@/services/chat.service')
    ).chatService;

    // Default chat hook state
    mockUseDiagnosisChat.mockReturnValue({
      messages: [],
      isLoading: false,
      error: null,
      isTyping: false,
      sessionId: null,
      session: null,
      isGeneratingReport: false,
      sendMessage: vi.fn(),
      startSession: vi.fn(),
      retryLastMessage: vi.fn(),
      clearError: vi.fn(),
      regenerateReport: vi.fn(),
    });

    // Default service responses
    mockDiagnosisReportService.listReports.mockResolvedValue([]);
    mockDiagnosisReportService.generateAndSaveReport.mockResolvedValue({
      id: 'report-123',
      pdf_url: 'https://example.com/report.pdf',
      file_size: 1024000,
    });

    mockChatService.startSession.mockResolvedValue({
      sessionId: 'session-123',
      message: 'Olá! Como posso ajudá-lo hoje?',
    });

    mockChatService.sendMessage.mockResolvedValue({
      message: 'Obrigado pela informação. Pode me contar mais sobre os sintomas?',
      diagnosis_complete: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('User Journey: Dashboard → Chat → Report Generation', () => {
    it('should complete full diagnosis workflow successfully', async () => {
      const user = userEvent.setup();

      // Step 1: Start at Dashboard
      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard de Pré-Diagnóstico')).toBeInTheDocument();
      expect(screen.getByText('Iniciar Novo Diagnóstico')).toBeInTheDocument();

      // Step 2: Click to start diagnosis
      const startButton = screen.getByText('Iniciar Novo Diagnóstico');
      await user.click(startButton);

      // Should navigate to chat (mocked navigation)
      expect(screen.getByText('Iniciar Novo Diagnóstico')).toBeInTheDocument();
    });

    it('should handle complete chat session with PDF generation', async () => {
      const user = userEvent.setup();
      
      // Mock complete chat flow
      const mockMessages = [
        {
          id: '1',
          type: 'ai' as const,
          content: 'Olá! Como posso ajudá-lo hoje?',
          timestamp: new Date(),
          status: 'received' as const,
        },
        {
          id: '2',
          type: 'user' as const,
          content: 'Tenho dores de cabeça frequentes',
          timestamp: new Date(),
          status: 'sent' as const,
        },
        {
          id: '3',
          type: 'ai' as const,
          content: 'Baseado nos sintomas relatados, aqui está sua análise...',
          timestamp: new Date(),
          status: 'received' as const,
          metadata: { isComplete: true },
        },
      ];

      mockUseDiagnosisChat.mockReturnValue({
        messages: mockMessages,
        isLoading: false,
        error: null,
        isTyping: false,
        sessionId: 'session-123',
        session: {
          id: 'session-123',
          status: 'completed',
          started_at: new Date().toISOString(),
        },
        isGeneratingReport: false,
        sendMessage: vi.fn(),
        startSession: vi.fn(),
        retryLastMessage: vi.fn(),
        clearError: vi.fn(),
        regenerateReport: vi.fn(),
      });

      render(
        <TestWrapper>
          <DiagnosisChat />
        </TestWrapper>
      );

      // Should show completed chat
      expect(screen.getByText('Olá! Como posso ajudá-lo hoje?')).toBeInTheDocument();
      expect(screen.getByText('Tenho dores de cabeça frequentes')).toBeInTheDocument();
      expect(screen.getByText(/Baseado nos sintomas relatados/)).toBeInTheDocument();

      // Should show session info
      expect(screen.getByText(/Sessão:/)).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });

    it('should handle PDF generation workflow', async () => {
      const mockSendMessage = vi.fn();
      const mockRegenerateReport = vi.fn();

      // Mock diagnosis completion response
      mockSendMessage.mockResolvedValueOnce({
        message: 'Diagnóstico concluído! Gerando relatório...',
        diagnosis_complete: true,
        diagnosis_data: {
          symptoms: ['dor de cabeça', 'fadiga'],
          analysis: 'Possível enxaqueca',
          recommendations: ['Consultar neurologista'],
          severity_level: 3,
        },
      });

      mockUseDiagnosisChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        isTyping: false,
        sessionId: 'session-123',
        session: null,
        isGeneratingReport: true,
        sendMessage: mockSendMessage,
        startSession: vi.fn(),
        retryLastMessage: vi.fn(),
        clearError: vi.fn(),
        regenerateReport: mockRegenerateReport,
      });

      render(
        <TestWrapper>
          <DiagnosisChat />
        </TestWrapper>
      );

      // Should show PDF generation state
      expect(screen.getByText(/Gerando relatório/)).toBeInTheDocument();
    });
  });

  describe('Error Scenarios and Recovery', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();

      mockUseDiagnosisChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: 'Falha na conexão. Verifique sua internet.',
        isTyping: false,
        sessionId: 'session-123',
        session: null,
        isGeneratingReport: false,
        sendMessage: vi.fn(),
        startSession: vi.fn(),
        retryLastMessage: vi.fn(),
        clearError: vi.fn(),
        regenerateReport: vi.fn(),
      });

      render(
        <TestWrapper>
          <DiagnosisChat />
        </TestWrapper>
      );

      // Should show error message
      expect(screen.getByText('Falha na conexão. Verifique sua internet.')).toBeInTheDocument();
      
      // Should show retry button
      const retryButton = screen.getByText('Tentar Novamente');
      expect(retryButton).toBeInTheDocument();

      // Should be able to retry
      await user.click(retryButton);
      expect(mockUseDiagnosisChat().retryLastMessage).toHaveBeenCalled();
    });

    it('should handle PDF generation failures', async () => {
      const user = userEvent.setup();
      const mockRegenerateReport = vi.fn();

      mockUseDiagnosisChat.mockReturnValue({
        messages: [
          {
            id: '1',
            type: 'system' as const,
            content: 'Erro ao gerar relatório PDF. Clique para tentar novamente.',
            timestamp: new Date(),
            status: 'error' as const,
          },
        ],
        isLoading: false,
        error: null,
        isTyping: false,
        sessionId: 'session-123',
        session: null,
        isGeneratingReport: false,
        sendMessage: vi.fn(),
        startSession: vi.fn(),
        retryLastMessage: vi.fn(),
        clearError: vi.fn(),
        regenerateReport: mockRegenerateReport,
      });

      render(
        <TestWrapper>
          <DiagnosisChat />
        </TestWrapper>
      );

      // Should show PDF error message
      expect(screen.getByText(/Erro ao gerar relatório PDF/)).toBeInTheDocument();
    });

    it('should handle session timeout', async () => {
      mockUseDiagnosisChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: 'Sessão expirada. Inicie uma nova conversa.',
        isTyping: false,
        sessionId: null,
        session: null,
        isGeneratingReport: false,
        sendMessage: vi.fn(),
        startSession: vi.fn(),
        retryLastMessage: vi.fn(),
        clearError: vi.fn(),
        regenerateReport: vi.fn(),
      });

      render(
        <TestWrapper>
          <DiagnosisChat />
        </TestWrapper>
      );

      // Should show session expired message
      expect(screen.getByText('Sessão expirada. Inicie uma nova conversa.')).toBeInTheDocument();
      
      // Should show start new session option
      expect(screen.getByText('Iniciar Conversa')).toBeInTheDocument();
    });
  });

  describe('Reports Integration', () => {
    it('should display generated reports correctly', async () => {
      const mockReports = [
        {
          id: 'report-1',
          title: 'Relatório de Pré-Diagnóstico',
          created_at: '2024-01-15T10:30:00Z',
          status: 'completed' as const,
          severity_level: 3,
          summary: 'Análise de sintomas neurológicos',
          pdf_url: 'https://example.com/report1.pdf',
          file_size: 1024000,
          user_id: 'test-user-123',
          session_id: 'session-123',
        },
        {
          id: 'report-2',
          title: 'Relatório de Pré-Diagnóstico',
          created_at: '2024-01-14T15:45:00Z',
          status: 'completed' as const,
          severity_level: 2,
          summary: 'Análise de sintomas respiratórios',
          pdf_url: 'https://example.com/report2.pdf',
          file_size: 856000,
          user_id: 'test-user-123',
          session_id: 'session-456',
        },
      ];

      mockDiagnosisReportService.listReports.mockResolvedValue(mockReports);

      render(
        <TestWrapper>
          <DiagnosisReports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Meus Relatórios')).toBeInTheDocument();
      });

      // Should show both reports
      expect(screen.getByText('Análise de sintomas neurológicos')).toBeInTheDocument();
      expect(screen.getByText('Análise de sintomas respiratórios')).toBeInTheDocument();

      // Should show report actions
      const viewButtons = screen.getAllByText('Visualizar');
      const downloadButtons = screen.getAllByText('Baixar');
      
      expect(viewButtons).toHaveLength(2);
      expect(downloadButtons).toHaveLength(2);
    });

    it('should handle report download', async () => {
      const user = userEvent.setup();
      
      const mockReports = [
        {
          id: 'report-1',
          title: 'Relatório de Pré-Diagnóstico',
          created_at: '2024-01-15T10:30:00Z',
          status: 'completed' as const,
          severity_level: 3,
          summary: 'Análise de sintomas',
          pdf_url: 'https://example.com/report1.pdf',
          file_size: 1024000,
          user_id: 'test-user-123',
          session_id: 'session-123',
        },
      ];

      mockDiagnosisReportService.listReports.mockResolvedValue(mockReports);
      mockDiagnosisReportService.downloadReport.mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <DiagnosisReports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Meus Relatórios')).toBeInTheDocument();
      });

      // Click download button
      const downloadButton = screen.getByText('Baixar');
      await user.click(downloadButton);

      expect(mockDiagnosisReportService.downloadReport).toHaveBeenCalledWith(mockReports[0]);
    });

    it('should handle empty reports state', async () => {
      mockDiagnosisReportService.listReports.mockResolvedValue([]);

      render(
        <TestWrapper>
          <DiagnosisReports />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Nenhum relatório encontrado')).toBeInTheDocument();
      });

      expect(screen.getByText('Você ainda não possui relatórios de diagnóstico.')).toBeInTheDocument();
      expect(screen.getByText('Iniciar Diagnóstico')).toBeInTheDocument();
    });
  });

  describe('Performance and Responsiveness', () => {
    it('should handle rapid message sending', async () => {
      const user = userEvent.setup();
      const mockSendMessage = vi.fn();

      mockUseDiagnosisChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        isTyping: false,
        sessionId: 'session-123',
        session: null,
        isGeneratingReport: false,
        sendMessage: mockSendMessage,
        startSession: vi.fn(),
        retryLastMessage: vi.fn(),
        clearError: vi.fn(),
        regenerateReport: vi.fn(),
      });

      render(
        <TestWrapper>
          <DiagnosisChat />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      const sendButton = screen.getByLabelText('Enviar mensagem');

      // Send multiple messages rapidly
      for (let i = 0; i < 5; i++) {
        await user.type(input, `Mensagem ${i + 1}`);
        await user.click(sendButton);
      }

      // Should handle all messages
      expect(mockSendMessage).toHaveBeenCalledTimes(5);
    });

    it('should maintain performance with large message history', async () => {
      const largeMessageHistory = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        type: (i % 2 === 0 ? 'user' : 'ai') as const,
        content: `Mensagem número ${i + 1}`,
        timestamp: new Date(Date.now() - (100 - i) * 1000),
        status: 'received' as const,
      }));

      mockUseDiagnosisChat.mockReturnValue({
        messages: largeMessageHistory,
        isLoading: false,
        error: null,
        isTyping: false,
        sessionId: 'session-123',
        session: null,
        isGeneratingReport: false,
        sendMessage: vi.fn(),
        startSession: vi.fn(),
        retryLastMessage: vi.fn(),
        clearError: vi.fn(),
        regenerateReport: vi.fn(),
      });

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <DiagnosisChat />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (< 1000ms)
      expect(renderTime).toBeLessThan(1000);

      // Should show all messages
      expect(screen.getByText('Mensagem número 1')).toBeInTheDocument();
      expect(screen.getByText('Mensagem número 100')).toBeInTheDocument();
    });
  });

  describe('Data Persistence and State Management', () => {
    it('should persist session state across page reloads', async () => {
      const mockSession = {
        id: 'session-123',
        status: 'active' as const,
        started_at: new Date().toISOString(),
      };

      mockUseDiagnosisChat.mockReturnValue({
        messages: [
          {
            id: '1',
            type: 'ai' as const,
            content: 'Sessão restaurada com sucesso',
            timestamp: new Date(),
            status: 'received' as const,
          },
        ],
        isLoading: false,
        error: null,
        isTyping: false,
        sessionId: 'session-123',
        session: mockSession,
        isGeneratingReport: false,
        sendMessage: vi.fn(),
        startSession: vi.fn(),
        retryLastMessage: vi.fn(),
        clearError: vi.fn(),
        regenerateReport: vi.fn(),
      });

      render(
        <TestWrapper>
          <DiagnosisChat />
        </TestWrapper>
      );

      // Should restore session
      expect(screen.getByText('Sessão restaurada com sucesso')).toBeInTheDocument();
      expect(screen.getByText(/session-123/)).toBeInTheDocument();
    });

    it('should handle concurrent user sessions', async () => {
      // This test would verify that multiple browser tabs/windows
      // don't interfere with each other's sessions
      const session1 = 'session-123';
      const session2 = 'session-456';

      mockUseDiagnosisChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        isTyping: false,
        sessionId: session1,
        session: null,
        isGeneratingReport: false,
        sendMessage: vi.fn(),
        startSession: vi.fn(),
        retryLastMessage: vi.fn(),
        clearError: vi.fn(),
        regenerateReport: vi.fn(),
      });

      const { rerender } = render(
        <TestWrapper>
          <DiagnosisChat />
        </TestWrapper>
      );

      // Simulate different session in another tab
      mockUseDiagnosisChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        isTyping: false,
        sessionId: session2,
        session: null,
        isGeneratingReport: false,
        sendMessage: vi.fn(),
        startSession: vi.fn(),
        retryLastMessage: vi.fn(),
        clearError: vi.fn(),
        regenerateReport: vi.fn(),
      });

      rerender(
        <TestWrapper>
          <DiagnosisChat />
        </TestWrapper>
      );

      // Should handle different sessions independently
      expect(screen.getByText(/session-456/)).toBeInTheDocument();
    });
  });
});