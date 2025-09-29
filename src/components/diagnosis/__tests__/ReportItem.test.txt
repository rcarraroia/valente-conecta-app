import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ReportItem } from '../ReportItem';
import { DiagnosisReport } from '@/types/diagnosis';

const mockReport: DiagnosisReport = {
  id: 'report-123',
  user_id: 'user-123',
  title: 'Relatório de Teste',
  summary: 'Este é um relatório de teste para verificar os sintomas.',
  diagnosis_data: {
    symptoms: ['dor de cabeça', 'febre'],
    analysis: 'Análise preliminar',
    recommendations: ['Descanso', 'Hidratação']
  },
  severity_level: 3,
  status: 'completed',
  pdf_url: 'https://example.com/report.pdf',
  file_size: 1024000,
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z'
};

describe('ReportItem', () => {
  const mockOnView = vi.fn();
  const mockOnDownload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render report information correctly', () => {
      render(<ReportItem report={mockReport} />);

      expect(screen.getByText('Relatório de Teste')).toBeInTheDocument();
      expect(screen.getByText('Este é um relatório de teste para verificar os sintomas.')).toBeInTheDocument();
      expect(screen.getByText('15 de janeiro de 2024')).toBeInTheDocument();
      expect(screen.getByText('07:30')).toBeInTheDocument();
      expect(screen.getByText('Moderado')).toBeInTheDocument();
      expect(screen.getByText('Concluído')).toBeInTheDocument();
    });

    it('should render default title when title is not provided', () => {
      const reportWithoutTitle = { ...mockReport, title: undefined };
      render(<ReportItem report={reportWithoutTitle} />);

      expect(screen.getByText('Relatório de Pré-Diagnóstico')).toBeInTheDocument();
    });

    it('should render severity level badge with correct styling', () => {
      render(<ReportItem report={mockReport} />);

      const severityBadge = screen.getByText('Moderado');
      expect(severityBadge).toBeInTheDocument();
      expect(severityBadge).toHaveClass('border-yellow-200', 'text-yellow-700', 'bg-yellow-50');
    });

    it('should render file size information', () => {
      render(<ReportItem report={mockReport} />);

      expect(screen.getByText('1000 KB')).toBeInTheDocument();
    });
  });

  describe('Status Handling', () => {
    it('should show action buttons for completed reports', () => {
      render(
        <ReportItem 
          report={mockReport} 
          onView={mockOnView}
          onDownload={mockOnDownload}
        />
      );

      expect(screen.getByText('Visualizar')).toBeInTheDocument();
      expect(screen.getByText('Baixar')).toBeInTheDocument();
    });

    it('should show processing indicator for processing reports', () => {
      const processingReport = { ...mockReport, status: 'processing' as const };
      render(<ReportItem report={processingReport} />);

      expect(screen.getByText('Processando...')).toBeInTheDocument();
      expect(screen.queryByText('Visualizar')).not.toBeInTheDocument();
      expect(screen.queryByText('Baixar')).not.toBeInTheDocument();
    });

    it('should show error indicator for error reports', () => {
      const errorReport = { ...mockReport, status: 'error' as const };
      render(<ReportItem report={errorReport} />);

      expect(screen.getAllByText('Erro')).toHaveLength(2); // Badge and icon text
      expect(screen.queryByText('Visualizar')).not.toBeInTheDocument();
      expect(screen.queryByText('Baixar')).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onView when view button is clicked', () => {
      render(
        <ReportItem 
          report={mockReport} 
          onView={mockOnView}
          onDownload={mockOnDownload}
        />
      );

      fireEvent.click(screen.getByText('Visualizar'));
      expect(mockOnView).toHaveBeenCalledWith(mockReport);
    });

    it('should call onDownload when download button is clicked', () => {
      render(
        <ReportItem 
          report={mockReport} 
          onView={mockOnView}
          onDownload={mockOnDownload}
        />
      );

      fireEvent.click(screen.getByText('Baixar'));
      expect(mockOnDownload).toHaveBeenCalledWith(mockReport);
    });

    it('should show loading state during download', async () => {
      const slowDownload = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <ReportItem 
          report={mockReport} 
          onDownload={slowDownload}
        />
      );

      fireEvent.click(screen.getByText('Baixar'));
      
      expect(screen.getByText('Baixando...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Baixar')).toBeInTheDocument();
      });
    });

    it('should show error message when download fails', async () => {
      const failingDownload = vi.fn(() => Promise.reject(new Error('Download failed')));
      
      render(
        <ReportItem 
          report={mockReport} 
          onDownload={failingDownload}
        />
      );

      fireEvent.click(screen.getByText('Baixar'));
      
      await waitFor(() => {
        expect(screen.getByText('Download failed')).toBeInTheDocument();
      });

      // Should be able to close error
      fireEvent.click(screen.getByText('Fechar'));
      expect(screen.queryByText('Download failed')).not.toBeInTheDocument();
    });
  });

  describe('Severity Levels', () => {
    it('should render correct severity for level 1', () => {
      const lowSeverityReport = { ...mockReport, severity_level: 1 };
      render(<ReportItem report={lowSeverityReport} />);

      const badge = screen.getByText('Muito Baixo');
      expect(badge).toHaveClass('border-green-200', 'text-green-700', 'bg-green-50');
    });

    it('should render correct severity for level 5', () => {
      const highSeverityReport = { ...mockReport, severity_level: 5 };
      render(<ReportItem report={highSeverityReport} />);

      const badge = screen.getByText('Muito Alto');
      expect(badge).toHaveClass('border-red-200', 'text-red-700', 'bg-red-50');
    });

    it('should handle missing severity level', () => {
      const noSeverityReport = { ...mockReport, severity_level: undefined };
      render(<ReportItem report={noSeverityReport} />);

      expect(screen.queryByText(/Nível:/)).not.toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should handle invalid dates gracefully', () => {
      const invalidDateReport = { ...mockReport, created_at: 'invalid-date' };
      render(<ReportItem report={invalidDateReport} />);

      expect(screen.getByText('Data inválida')).toBeInTheDocument();
      expect(screen.getByText('--:--')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button labels', () => {
      render(
        <ReportItem 
          report={mockReport} 
          onView={mockOnView}
          onDownload={mockOnDownload}
        />
      );

      expect(screen.getByRole('button', { name: /visualizar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /baixar/i })).toBeInTheDocument();
    });

    it('should disable download button during download', async () => {
      const slowDownload = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <ReportItem 
          report={mockReport} 
          onDownload={slowDownload}
        />
      );

      const downloadButton = screen.getByRole('button', { name: /baixar/i });
      fireEvent.click(downloadButton);
      
      expect(downloadButton).toBeDisabled();
      
      await waitFor(() => {
        expect(downloadButton).not.toBeDisabled();
      });
    });
  });

  describe('Optional Props', () => {
    it('should work without onView and onDownload callbacks', () => {
      render(<ReportItem report={mockReport} />);

      // Should still render the component
      expect(screen.getByText('Relatório de Teste')).toBeInTheDocument();
      
      // But buttons should not be functional
      const viewButton = screen.getByText('Visualizar');
      fireEvent.click(viewButton);
      // No error should occur
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ReportItem report={mockReport} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});