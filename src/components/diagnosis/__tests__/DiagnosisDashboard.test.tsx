// Tests for DiagnosisDashboard component

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { DiagnosisDashboard } from '../DiagnosisDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useReports } from '@/hooks/useReports';

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useReports', () => ({
  useReports: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => 'há 2 dias'),
}));

vi.mock('date-fns/locale', () => ({
  ptBR: {},
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('DiagnosisDashboard', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockReportsState = {
    reports: [
      {
        id: 'report-1',
        title: 'Pré-diagnóstico - 30 anos - 01/01/2024',
        status: 'completed',
        created_at: '2024-01-01T10:00:00Z',
        user_id: 'user-123',
        pdf_url: 'https://example.com/report.pdf',
        diagnosis_data: null,
        session_id: 'session-1',
        updated_at: '2024-01-01T10:00:00Z',
      },
      {
        id: 'report-2',
        title: 'Pré-diagnóstico - Dor de cabeça - 02/01/2024',
        status: 'pending',
        created_at: '2024-01-02T10:00:00Z',
        user_id: 'user-123',
        pdf_url: 'https://example.com/report2.pdf',
        diagnosis_data: null,
        session_id: 'session-2',
        updated_at: '2024-01-02T10:00:00Z',
      },
    ],
    isLoading: false,
    isCreating: false,
    isDeleting: false,
    error: null,
    totalCount: 2,
    hasMore: false,
  };

  const mockReportsActions = {
    fetchReports: vi.fn(),
    createReport: vi.fn(),
    deleteReport: vi.fn(),
    downloadReport: vi.fn(),
    refreshReports: vi.fn(),
    loadMoreReports: vi.fn(),
    clearError: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
    } as any);

    vi.mocked(useReports).mockReturnValue({
      state: mockReportsState,
      actions: mockReportsActions,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should show login message when user is not authenticated', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        signOut: vi.fn(),
      } as any);

      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      expect(screen.getByText(/você precisa estar logado/i)).toBeInTheDocument();
    });

    it('should show dashboard when user is authenticated', () => {
      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Pré-Diagnóstico')).toBeInTheDocument();
      expect(screen.getByText(/realize um pré-diagnóstico médico/i)).toBeInTheDocument();
    });
  });

  describe('Header and Quick Actions', () => {
    it('should display header with title and description', () => {
      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Pré-Diagnóstico')).toBeInTheDocument();
      expect(screen.getByText(/realize um pré-diagnóstico médico/i)).toBeInTheDocument();
    });

    it('should display quick action cards', () => {
      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Novo Diagnóstico')).toBeInTheDocument();
      expect(screen.getByText('Meus Relatórios')).toBeInTheDocument();
      expect(screen.getByText('Atividade Recente')).toBeInTheDocument();
    });

    it('should show correct reports summary', () => {
      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('2')).toBeInTheDocument(); // Total count
      const countElements = screen.getAllByText('1');
      expect(countElements).toHaveLength(2); // Completed and pending counts
    });
  });

  describe('Reports List', () => {
    it('should display reports list with correct data', () => {
      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Histórico de Relatórios')).toBeInTheDocument();
      expect(screen.getByText('Pré-diagnóstico - 30 anos - 01/01/2024')).toBeInTheDocument();
      expect(screen.getByText('Pré-diagnóstico - Dor de cabeça - 02/01/2024')).toBeInTheDocument();
    });

    it('should show status badges correctly', () => {
      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Concluído')).toBeInTheDocument();
      expect(screen.getByText('Pendente')).toBeInTheDocument();
    });

    it('should show download button only for completed reports', () => {
      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      const downloadButtons = screen.getAllByText('Download');
      expect(downloadButtons).toHaveLength(1); // Only one completed report
    });

    it('should handle download button click', () => {
      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      const downloadButton = screen.getByText('Download');
      fireEvent.click(downloadButton);

      expect(mockReportsActions.downloadReport).toHaveBeenCalledWith('report-1');
    });
  });

  describe('Loading States', () => {
    it('should show loading skeletons when reports are loading', () => {
      vi.mocked(useReports).mockReturnValue({
        state: { ...mockReportsState, isLoading: true },
        actions: mockReportsActions,
      });

      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      // Should show skeleton loaders (they use specific CSS classes)
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no reports exist', () => {
      vi.mocked(useReports).mockReturnValue({
        state: { ...mockReportsState, reports: [], totalCount: 0 },
        actions: mockReportsActions,
      });

      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Nenhum relatório encontrado')).toBeInTheDocument();
      expect(screen.getByText('Você ainda não possui relatórios de pré-diagnóstico.')).toBeInTheDocument();
      expect(screen.getByText('Criar Primeiro Relatório')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when there is an error', () => {
      vi.mocked(useReports).mockReturnValue({
        state: { ...mockReportsState, error: 'Erro ao carregar relatórios' },
        actions: mockReportsActions,
      });

      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Erro ao carregar relatórios')).toBeInTheDocument();
      expect(screen.getByText('Dispensar')).toBeInTheDocument();
    });

    it('should clear error when dismiss button is clicked', () => {
      vi.mocked(useReports).mockReturnValue({
        state: { ...mockReportsState, error: 'Erro ao carregar relatórios' },
        actions: mockReportsActions,
      });

      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      const dismissButton = screen.getByText('Dispensar');
      fireEvent.click(dismissButton);

      expect(mockReportsActions.clearError).toHaveBeenCalled();
    });
  });

  describe('Actions', () => {
    it('should handle refresh button click', () => {
      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Atualizar');
      fireEvent.click(refreshButton);

      expect(mockReportsActions.refreshReports).toHaveBeenCalled();
    });

    it('should disable refresh button when loading', () => {
      vi.mocked(useReports).mockReturnValue({
        state: { ...mockReportsState, isLoading: true },
        actions: mockReportsActions,
      });

      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Atualizar');
      expect(refreshButton).toBeDisabled();
    });

    it('should show load more button when hasMore is true', () => {
      vi.mocked(useReports).mockReturnValue({
        state: { ...mockReportsState, hasMore: true },
        actions: mockReportsActions,
      });

      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Carregar Mais')).toBeInTheDocument();
    });

    it('should handle load more button click', () => {
      vi.mocked(useReports).mockReturnValue({
        state: { ...mockReportsState, hasMore: true },
        actions: mockReportsActions,
      });

      render(
        <TestWrapper>
          <DiagnosisDashboard />
        </TestWrapper>
      );

      const loadMoreButton = screen.getByText('Carregar Mais');
      fireEvent.click(loadMoreButton);

      expect(mockReportsActions.loadMoreReports).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <TestWrapper>
          <DiagnosisDashboard className="custom-class" />
        </TestWrapper>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});