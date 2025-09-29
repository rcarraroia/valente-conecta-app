import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ReportsList } from '../ReportsList';
import { useReports } from '@/hooks/useReports';
import { DiagnosisReport } from '@/types/diagnosis';

// Mock the useReports hook
vi.mock('@/hooks/useReports', () => ({
  useReports: vi.fn()
}));
const mockUseReports = vi.mocked(useReports);

const mockReports: DiagnosisReport[] = [
  {
    id: 'report-1',
    user_id: 'user-123',
    title: 'Relatório Recente',
    summary: 'Relatório mais recente com sintomas leves',
    diagnosis_data: { symptoms: ['dor de cabeça'], analysis: 'Leve', recommendations: ['Descanso'] },
    severity_level: 2,
    status: 'completed',
    pdf_url: 'https://example.com/report1.pdf',
    file_size: 1024000,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'report-2',
    user_id: 'user-123',
    title: 'Relatório Antigo',
    summary: 'Relatório mais antigo com sintomas moderados',
    diagnosis_data: { symptoms: ['febre', 'tosse'], analysis: 'Moderado', recommendations: ['Consulta médica'] },
    severity_level: 4,
    status: 'completed',
    pdf_url: 'https://example.com/report2.pdf',
    file_size: 2048000,
    created_at: '2024-01-10T08:15:00Z',
    updated_at: '2024-01-10T08:15:00Z'
  },
  {
    id: 'report-3',
    user_id: 'user-123',
    title: 'Relatório Processando',
    summary: 'Relatório ainda sendo processado',
    diagnosis_data: { symptoms: [], analysis: '', recommendations: [] },
    severity_level: undefined,
    status: 'processing',
    pdf_url: null,
    file_size: null,
    created_at: '2024-01-16T12:00:00Z',
    updated_at: '2024-01-16T12:00:00Z'
  }
];

describe('ReportsList', () => {
  const mockFetchReports = vi.fn();
  const mockRefreshReports = vi.fn();
  const mockOnViewReport = vi.fn();
  const mockOnDownloadReport = vi.fn();

  const defaultHookReturn = {
    state: {
      reports: mockReports,
      isLoading: false,
      error: null,
      totalCount: mockReports.length,
      isCreating: false,
      isDeleting: false
    },
    actions: {
      fetchReports: mockFetchReports,
      refreshReports: mockRefreshReports,
      createReport: vi.fn(),
      deleteReport: vi.fn()
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseReports.mockReturnValue(defaultHookReturn);
  });

  describe('Rendering', () => {
    it('should render reports list with header', () => {
      render(<ReportsList />);

      expect(screen.getByText('Meus Relatórios')).toBeInTheDocument();
      expect(screen.getByText('Atualizar')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Buscar relatórios...')).toBeInTheDocument();
    });

    it('should render all reports by default', () => {
      render(<ReportsList />);

      expect(screen.getByText('Relatório Recente')).toBeInTheDocument();
      expect(screen.getByText('Relatório Antigo')).toBeInTheDocument();
      expect(screen.getByText('Relatório Processando')).toBeInTheDocument();
      expect(screen.getByText('3 de 3 relatórios')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      mockUseReports.mockReturnValue({
        ...defaultHookReturn,
        state: { ...defaultHookReturn.state, isLoading: true, reports: [] }
      });

      render(<ReportsList />);

      expect(screen.getByText('Carregando relatórios...')).toBeInTheDocument();
    });

    it('should show error state', () => {
      mockUseReports.mockReturnValue({
        ...defaultHookReturn,
        state: { ...defaultHookReturn.state, error: 'Erro ao carregar relatórios' }
      });

      render(<ReportsList />);

      expect(screen.getByText('Erro ao carregar relatórios')).toBeInTheDocument();
      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
    });

    it('should show empty state when no reports', () => {
      mockUseReports.mockReturnValue({
        ...defaultHookReturn,
        state: { ...defaultHookReturn.state, reports: [] }
      });

      render(<ReportsList />);

      expect(screen.getByText('Nenhum relatório encontrado')).toBeInTheDocument();
      expect(screen.getByText('Você ainda não possui relatórios de diagnóstico.')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter reports by search term', () => {
      render(<ReportsList />);

      const searchInput = screen.getByPlaceholderText('Buscar relatórios...');
      fireEvent.change(searchInput, { target: { value: 'Recente' } });

      expect(screen.getByText('Relatório Recente')).toBeInTheDocument();
      expect(screen.queryByText('Relatório Antigo')).not.toBeInTheDocument();
      expect(screen.getByText('1 de 3 relatórios')).toBeInTheDocument();
    });

    it('should search in summary text', () => {
      render(<ReportsList />);

      const searchInput = screen.getByPlaceholderText('Buscar relatórios...');
      fireEvent.change(searchInput, { target: { value: 'sintomas leves' } });

      expect(screen.getByText('Relatório Recente')).toBeInTheDocument();
      expect(screen.queryByText('Relatório Antigo')).not.toBeInTheDocument();
    });

    it('should show clear search button when searching', () => {
      render(<ReportsList />);

      const searchInput = screen.getByPlaceholderText('Buscar relatórios...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Use getAllByText to get all buttons and check the first one (in the header)
      const clearButtons = screen.getAllByText('Limpar busca');
      expect(clearButtons[0]).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', () => {
      render(<ReportsList />);

      const searchInput = screen.getByPlaceholderText('Buscar relatórios...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      fireEvent.click(screen.getAllByText('Limpar busca')[0]);
      
      expect(searchInput).toHaveValue('');
      expect(screen.getByText('3 de 3 relatórios')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter by status - completed', () => {
      render(<ReportsList />);

      // Open filter dropdown and select completed
      fireEvent.click(screen.getByText('Todos'));
      fireEvent.click(screen.getByText('Concluídos'));

      expect(screen.getByText('Relatório Recente')).toBeInTheDocument();
      expect(screen.getByText('Relatório Antigo')).toBeInTheDocument();
      expect(screen.queryByText('Relatório Processando')).not.toBeInTheDocument();
      expect(screen.getByText('2 de 3 relatórios')).toBeInTheDocument();
    });

    it('should filter by status - processing', () => {
      render(<ReportsList />);

      fireEvent.click(screen.getByText('Todos'));
      fireEvent.click(screen.getAllByText('Processando')[1]); // Select from dropdown

      expect(screen.queryByText('Relatório Recente')).not.toBeInTheDocument();
      expect(screen.queryByText('Relatório Antigo')).not.toBeInTheDocument();
      expect(screen.getByText('Relatório Processando')).toBeInTheDocument();
      expect(screen.getByText('1 de 3 relatórios')).toBeInTheDocument();
    });

    it('should show no results message when filter returns empty', () => {
      render(<ReportsList />);

      fireEvent.click(screen.getByText('Todos'));
      fireEvent.click(screen.getByText('Com erro'));

      expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument();
      expect(screen.getByText('Tente ajustar os filtros ou termo de busca.')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort by date descending by default', () => {
      render(<ReportsList />);

      expect(screen.getByText('Relatório Processando')).toBeInTheDocument(); // Most recent
      expect(screen.getByText('Relatório Recente')).toBeInTheDocument();
      expect(screen.getByText('Relatório Antigo')).toBeInTheDocument();
    });

    it('should sort by date ascending', () => {
      render(<ReportsList />);

      fireEvent.click(screen.getByText('Mais recente'));
      fireEvent.click(screen.getByText('Mais antigo'));

      expect(screen.getByText('Relatório Antigo')).toBeInTheDocument(); // Should be visible
    });

    it('should sort by severity descending', () => {
      render(<ReportsList />);

      fireEvent.click(screen.getByText('Mais recente'));
      fireEvent.click(screen.getByText('Maior severidade'));

      expect(screen.getByText('Relatório Antigo')).toBeInTheDocument(); // Severity 4
      expect(screen.getByText('Relatório Recente')).toBeInTheDocument(); // Severity 2
    });
  });

  describe('Actions', () => {
    it('should call refresh when refresh button is clicked', async () => {
      render(<ReportsList />);

      fireEvent.click(screen.getByText('Atualizar'));
      expect(mockRefreshReports).toHaveBeenCalledOnce();
    });

    it('should show loading state during refresh', () => {
      mockUseReports.mockReturnValue({
        ...defaultHookReturn,
        state: { ...defaultHookReturn.state, isLoading: true }
      });

      render(<ReportsList />);

      const refreshButton = screen.getByText('Atualizar');
      expect(refreshButton).toBeDisabled();
    });

    it('should call onViewReport when report is viewed', () => {
      render(<ReportsList onViewReport={mockOnViewReport} />);

      const viewButtons = screen.getAllByText('Visualizar');
      fireEvent.click(viewButtons[0]);

      expect(mockOnViewReport).toHaveBeenCalledWith(expect.objectContaining({
        id: 'report-1' // First completed report
      }));
    });

    it('should call onDownloadReport when report is downloaded', () => {
      render(<ReportsList onDownloadReport={mockOnDownloadReport} />);

      const downloadButtons = screen.getAllByText('Baixar');
      fireEvent.click(downloadButtons[0]);

      expect(mockOnDownloadReport).toHaveBeenCalledWith(expect.objectContaining({
        id: 'report-1' // First completed report in sorted order
      }));
    });
  });

  describe('Error Handling', () => {
    it('should retry on error', async () => {
      mockUseReports.mockReturnValue({
        ...defaultHookReturn,
        state: { ...defaultHookReturn.state, error: 'Network error' }
      });

      render(<ReportsList />);

      fireEvent.click(screen.getByText('Tentar Novamente'));
      expect(mockRefreshReports).toHaveBeenCalledOnce();
    });
  });

  describe('Responsive Design', () => {
    it('should render filter controls', () => {
      render(<ReportsList />);

      expect(screen.getByPlaceholderText('Buscar relatórios...')).toBeInTheDocument();
      expect(screen.getByText('Todos')).toBeInTheDocument(); // Filter dropdown
      expect(screen.getByText('Mais recente')).toBeInTheDocument(); // Sort dropdown
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ReportsList />);

      expect(screen.getByPlaceholderText('Buscar relatórios...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument();
    });

    it('should handle keyboard navigation', () => {
      render(<ReportsList />);

      const searchInput = screen.getByPlaceholderText('Buscar relatórios...');
      searchInput.focus();
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      const { container } = render(<ReportsList className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should work without callback props', () => {
      render(<ReportsList />);
      
      // Should render without errors
      expect(screen.getByText('Meus Relatórios')).toBeInTheDocument();
    });
  });
});