// End-to-end tests for complete user journey

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';

// Import main App component
import App from '@/App';

// Mock all external dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  },
}));

vi.mock('@/services/chat.service', () => ({
  chatService: {
    sendMessage: vi.fn(),
    startSession: vi.fn(),
  },
}));

vi.mock('@/services/diagnosis-report.service', () => ({
  diagnosisReportService: {
    listReports: vi.fn(),
    generateAndSaveReport: vi.fn(),
    downloadReport: vi.fn(),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock responsive hooks
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

// Test wrapper for full app
const AppTestWrapper: React.FC<{ 
  initialEntries?: string[];
}> = ({ initialEntries = ['/'] }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Complete User Journey E2E Tests', () => {
  let mockChatService: any;
  let mockDiagnosisReportService: any;
  let mockSupabase: any;

  beforeEach(async () => {
    // Setup service mocks
    mockChatService = vi.mocked(
      await import('@/services/chat.service')
    ).chatService;

    mockDiagnosisReportService = vi.mocked(
      await import('@/services/diagnosis-report.service')
    ).diagnosisReportService;

    mockSupabase = vi.mocked(
      await import('@/integrations/supabase/client')
    ).supabase;

    // Default authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-123',
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' },
        },
      },
      error: null,
    });

    // Default empty reports
    mockDiagnosisReportService.listReports.mockResolvedValue([]);

    // Default chat responses
    mockChatService.startSession.mockResolvedValue({
      sessionId: 'session-123',
      message: 'Olá! Como posso ajudá-lo hoje?',
    });

    mockChatService.sendMessage.mockResolvedValue({
      message: 'Obrigado pela informação. Pode me contar mais?',
      diagnosis_complete: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Happy Path: Complete Diagnosis Journey', () => {
    it('should complete full user journey from home to report generation', async () => {
      const user = userEvent.setup();

      // Step 1: Start at home page
      render(<AppTestWrapper initialEntries={['/']} />);

      await waitFor(() => {
        expect(screen.getByText('Instituto Coração Valente')).toBeInTheDocument();
      });

      // Step 2: Navigate to diagnosis from quick actions
      const diagnosisButton = screen.getByText('Pré-Diagnóstico');
      await user.click(diagnosisButton);

      // Should navigate to diagnosis dashboard
      await waitFor(() => {
        expect(screen.getByText('Dashboard de Pré-Diagnóstico')).toBeInTheDocument();
      });

      // Step 3: Start new diagnosis
      const startButton = screen.getByText('Iniciar Novo Diagnóstico');
      await user.click(startButton);

      // Should navigate to chat
      await waitFor(() => {
        expect(screen.getByText('Assistente de Pré-Diagnóstico')).toBeInTheDocument();
      });

      // Step 4: Start chat session
      const initiateChatButton = screen.getByText('Iniciar Conversa');
      await user.click(initiateChatButton);

      await waitFor(() => {
        expect(mockChatService.startSession).toHaveBeenCalled();
      });

      // Step 5: Send messages in chat
      const messageInput = screen.getByPlaceholderText('Digite sua mensagem...');
      const sendButton = screen.getByLabelText('Enviar mensagem');

      await user.type(messageInput, 'Tenho dores de cabeça frequentes');
      await user.click(sendButton);

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        'session-123',
        'Tenho dores de cabeça frequentes'
      );

      // Step 6: Continue conversation
      await user.clear(messageInput);
      await user.type(messageInput, 'As dores começaram há uma semana');
      await user.click(sendButton);

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        'session-123',
        'As dores começaram há uma semana'
      );

      // Step 7: Complete diagnosis (mock final response)
      mockChatService.sendMessage.mockResolvedValueOnce({
        message: 'Baseado nos sintomas, aqui está sua análise completa...',
        diagnosis_complete: true,
        diagnosis_data: {
          symptoms: ['dor de cabeça', 'fadiga'],
          analysis: 'Possível enxaqueca',
          recommendations: ['Consultar neurologista', 'Manter diário de dores'],
          severity_level: 3,
        },
      });

      await user.clear(messageInput);
      await user.type(messageInput, 'Mais alguma informação relevante?');
      await user.click(sendButton);

      // Should trigger PDF generation
      await waitFor(() => {
        expect(mockDiagnosisReportService.generateAndSaveReport).toHaveBeenCalled();
      });

      // Step 8: Navigate to reports
      const reportsButton = screen.getByText('Ver Relatórios');
      await user.click(reportsButton);

      // Should show generated report
      await waitFor(() => {
        expect(screen.getByText('Meus Relatórios')).toBeInTheDocument();
      });
    }, 30000); // Increased timeout for complex E2E test

    it('should handle mobile user journey', async () => {
      // Mock mobile environment
      vi.mocked(await import('@/hooks/useResponsive')).useResponsive.mockReturnValue({
        width: 375,
        height: 667,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isTouchDevice: true,
        breakpoint: 'sm',
        isLandscape: false,
        isPortrait: true,
      });

      const user = userEvent.setup();

      render(<AppTestWrapper initialEntries={['/']} />);

      await waitFor(() => {
        expect(screen.getByText('Instituto Coração Valente')).toBeInTheDocument();
      });

      // Mobile navigation should be different
      const diagnosisButton = screen.getByText('Pré-Diagnóstico');
      await user.click(diagnosisButton);

      await waitFor(() => {
        expect(screen.getByText('Dashboard de Pré-Diagnóstico')).toBeInTheDocument();
      });

      // Mobile-specific elements should be present
      const startButton = screen.getByText('Iniciar Novo Diagnóstico');
      await user.click(startButton);

      await waitFor(() => {
        // Mobile chat should show condensed title
        expect(screen.getByText('Assistente IA')).toBeInTheDocument();
      });
    });
  });

  describe('Error Scenarios and Recovery', () => {
    it('should handle authentication failures gracefully', async () => {
      // Mock authentication failure
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      render(<AppTestWrapper initialEntries={['/diagnosis']} />);

      // Should redirect to auth or show error
      await waitFor(() => {
        expect(
          screen.getByText('Erro ao verificar autenticação') ||
          screen.getByText('Faça login para continuar')
        ).toBeInTheDocument();
      });
    });

    it('should handle network failures during chat', async () => {
      const user = userEvent.setup();

      // Mock network failure
      mockChatService.sendMessage.mockRejectedValue(new Error('Network error'));

      render(<AppTestWrapper initialEntries={['/diagnosis/chat']} />);

      await waitFor(() => {
        expect(screen.getByText('Assistente de Pré-Diagnóstico')).toBeInTheDocument();
      });

      // Try to send message
      const messageInput = screen.getByPlaceholderText('Digite sua mensagem...');
      const sendButton = screen.getByLabelText('Enviar mensagem');

      await user.type(messageInput, 'Test message');
      await user.click(sendButton);

      // Should show error and retry option
      await waitFor(() => {
        expect(screen.getByText(/Falha na conexão/)).toBeInTheDocument();
        expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
      });
    });

    it('should handle PDF generation failures', async () => {
      const user = userEvent.setup();

      // Mock PDF generation failure
      mockDiagnosisReportService.generateAndSaveReport.mockRejectedValue(
        new Error('PDF generation failed')
      );

      // Mock diagnosis completion
      mockChatService.sendMessage.mockResolvedValue({
        message: 'Diagnóstico concluído!',
        diagnosis_complete: true,
        diagnosis_data: {
          symptoms: ['test'],
          analysis: 'test',
          recommendations: ['test'],
          severity_level: 2,
        },
      });

      render(<AppTestWrapper initialEntries={['/diagnosis/chat']} />);

      await waitFor(() => {
        expect(screen.getByText('Assistente de Pré-Diagnóstico')).toBeInTheDocument();
      });

      // Complete diagnosis
      const messageInput = screen.getByPlaceholderText('Digite sua mensagem...');
      const sendButton = screen.getByLabelText('Enviar mensagem');

      await user.type(messageInput, 'Finalizar diagnóstico');
      await user.click(sendButton);

      // Should show PDF generation error
      await waitFor(() => {
        expect(screen.getByText(/Erro ao gerar relatório PDF/)).toBeInTheDocument();
      });
    });

    it('should handle session timeouts', async () => {
      const user = userEvent.setup();

      // Mock session timeout
      mockChatService.sendMessage.mockRejectedValue({
        message: 'Session expired',
        code: 'SESSION_EXPIRED',
      });

      render(<AppTestWrapper initialEntries={['/diagnosis/chat']} />);

      await waitFor(() => {
        expect(screen.getByText('Assistente de Pré-Diagnóstico')).toBeInTheDocument();
      });

      // Try to send message
      const messageInput = screen.getByPlaceholderText('Digite sua mensagem...');
      const sendButton = screen.getByLabelText('Enviar mensagem');

      await user.type(messageInput, 'Test message');
      await user.click(sendButton);

      // Should show session expired message
      await waitFor(() => {
        expect(screen.getByText(/Sessão expirada/)).toBeInTheDocument();
        expect(screen.getByText('Iniciar Conversa')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and User Experience', () => {
    it('should load pages within acceptable time limits', async () => {
      const startTime = performance.now();

      render(<AppTestWrapper initialEntries={['/diagnosis']} />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard de Pré-Diagnóstico')).toBeInTheDocument();
      });

      const loadTime = performance.now() - startTime;
      
      // Should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });

    it('should handle rapid user interactions', async () => {
      const user = userEvent.setup();

      render(<AppTestWrapper initialEntries={['/diagnosis/chat']} />);

      await waitFor(() => {
        expect(screen.getByText('Assistente de Pré-Diagnóstico')).toBeInTheDocument();
      });

      const messageInput = screen.getByPlaceholderText('Digite sua mensagem...');
      const sendButton = screen.getByLabelText('Enviar mensagem');

      // Rapid fire messages
      for (let i = 0; i < 5; i++) {
        await user.type(messageInput, `Mensagem rápida ${i + 1}`);
        await user.click(sendButton);
        await user.clear(messageInput);
      }

      // Should handle all messages without breaking
      expect(mockChatService.sendMessage).toHaveBeenCalledTimes(5);
    });

    it('should maintain state during navigation', async () => {
      const user = userEvent.setup();

      render(<AppTestWrapper initialEntries={['/diagnosis']} />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard de Pré-Diagnóstico')).toBeInTheDocument();
      });

      // Navigate to chat
      const startButton = screen.getByText('Iniciar Novo Diagnóstico');
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Assistente de Pré-Diagnóstico')).toBeInTheDocument();
      });

      // Navigate back to dashboard
      const backButton = screen.getByText('Dashboard');
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Dashboard de Pré-Diagnóstico')).toBeInTheDocument();
      });

      // State should be preserved
      expect(screen.getByText('Bem-vindo')).toBeInTheDocument();
    });
  });

  describe('Accessibility and Usability', () => {
    it('should be navigable with keyboard only', async () => {
      render(<AppTestWrapper initialEntries={['/diagnosis']} />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard de Pré-Diagnóstico')).toBeInTheDocument();
      });

      // Should be able to tab through interactive elements
      const startButton = screen.getByText('Iniciar Novo Diagnóstico');
      startButton.focus();
      expect(document.activeElement).toBe(startButton);

      // Should be able to activate with Enter
      fireEvent.keyDown(startButton, { key: 'Enter' });
      
      // Navigation should work
      await waitFor(() => {
        expect(screen.getByText('Assistente de Pré-Diagnóstico')).toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels and roles', async () => {
      render(<AppTestWrapper initialEntries={['/diagnosis/chat']} />);

      await waitFor(() => {
        expect(screen.getByText('Assistente de Pré-Diagnóstico')).toBeInTheDocument();
      });

      // Check for proper ARIA labels
      expect(screen.getByLabelText('Enviar mensagem')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
    });

    it('should provide appropriate feedback for screen readers', async () => {
      const user = userEvent.setup();

      render(<AppTestWrapper initialEntries={['/diagnosis/chat']} />);

      await waitFor(() => {
        expect(screen.getByText('Assistente de Pré-Diagnóstico')).toBeInTheDocument();
      });

      // Should announce loading states
      const messageInput = screen.getByPlaceholderText('Digite sua mensagem...');
      const sendButton = screen.getByLabelText('Enviar mensagem');

      await user.type(messageInput, 'Test message');
      await user.click(sendButton);

      // Should show loading state with appropriate ARIA
      await waitFor(() => {
        const loadingElement = screen.queryByText('Processando...');
        if (loadingElement) {
          expect(loadingElement).toHaveAttribute('aria-live', 'polite');
        }
      });
    });
  });

  describe('Data Persistence and Offline Behavior', () => {
    it('should persist user data across browser sessions', async () => {
      // First session
      render(<AppTestWrapper initialEntries={['/diagnosis']} />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard de Pré-Diagnóstico')).toBeInTheDocument();
      });

      // Simulate browser refresh
      const { unmount } = render(<AppTestWrapper initialEntries={['/diagnosis']} />);
      unmount();

      // Second session
      render(<AppTestWrapper initialEntries={['/diagnosis']} />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard de Pré-Diagnóstico')).toBeInTheDocument();
      });

      // User data should be restored
      expect(screen.getByText('Bem-vindo, Test User!')).toBeInTheDocument();
    });

    it('should handle offline scenarios gracefully', async () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(<AppTestWrapper initialEntries={['/diagnosis/chat']} />);

      await waitFor(() => {
        expect(screen.getByText('Assistente de Pré-Diagnóstico')).toBeInTheDocument();
      });

      // Should show offline indicator
      expect(screen.getByText(/Você está offline/)).toBeInTheDocument();

      // Should provide offline functionality
      expect(screen.getByText('Modo Offline')).toBeInTheDocument();
    });
  });
});