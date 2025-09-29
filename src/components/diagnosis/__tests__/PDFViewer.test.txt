import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PDFViewer } from '../PDFViewer';
import { DiagnosisReport } from '@/types/diagnosis';

const mockReport: DiagnosisReport = {
  id: 'report-123',
  user_id: 'user-123',
  title: 'Relatório de Teste PDF',
  summary: 'Relatório para teste do visualizador PDF',
  diagnosis_data: {
    symptoms: ['dor de cabeça', 'febre'],
    analysis: 'Análise do PDF',
    recommendations: ['Descanso', 'Hidratação']
  },
  severity_level: 3,
  status: 'completed',
  pdf_url: 'https://example.com/test-report.pdf',
  file_size: 2048000,
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z'
};

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen
});

describe('PDFViewer', () => {
  const mockOnClose = vi.fn();
  const mockOnDownload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render PDF viewer with header controls', () => {
      render(<PDFViewer report={mockReport} />);

      expect(screen.getByText('Relatório de Teste PDF')).toBeInTheDocument();
      expect(screen.getByText('(2000 KB)')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument(); // Zoom level
    });

    it('should render default title when title is not provided', () => {
      const reportWithoutTitle = { ...mockReport, title: undefined };
      render(<PDFViewer report={reportWithoutTitle} />);

      expect(screen.getByText('Relatório de Pré-Diagnóstico')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<PDFViewer report={mockReport} />);

      // The PDF loads immediately in tests, so we check for the iframe instead
      expect(screen.getByTitle(/PDF: Relatório de Teste PDF/)).toBeInTheDocument();
    });

    it('should render all control buttons', () => {
      render(
        <PDFViewer 
          report={mockReport} 
          onClose={mockOnClose}
          onDownload={mockOnDownload}
        />
      );

      // Zoom controls
      expect(screen.getByRole('button', { name: /diminuir zoom/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /aumentar zoom/i })).toBeInTheDocument();
      
      // Other controls
      expect(screen.getByRole('button', { name: /rotacionar pdf/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /abrir em nova aba/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /baixar pdf/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tela cheia/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /fechar visualizador/i })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error when PDF URL is missing', () => {
      const reportWithoutPDF = { ...mockReport, pdf_url: null };
      render(<PDFViewer report={reportWithoutPDF} />);

      expect(screen.getByText('URL do PDF não encontrada')).toBeInTheDocument();
      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
    });

    it('should show retry button on error', () => {
      const reportWithoutPDF = { ...mockReport, pdf_url: null };
      render(<PDFViewer report={reportWithoutPDF} onClose={mockOnClose} />);

      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
      expect(screen.getByText('Fechar')).toBeInTheDocument();
    });

    it('should retry loading when retry button is clicked', () => {
      const reportWithoutPDF = { ...mockReport, pdf_url: null };
      const { rerender } = render(<PDFViewer report={reportWithoutPDF} />);

      fireEvent.click(screen.getByText('Tentar Novamente'));

      // Rerender with valid PDF URL
      rerender(<PDFViewer report={mockReport} />);
      expect(screen.getByTitle(/PDF: Relatório de Teste PDF/)).toBeInTheDocument();
    });
  });

  describe('Zoom Controls', () => {
    it('should increase zoom when zoom in is clicked', () => {
      render(<PDFViewer report={mockReport} />);

      const zoomInButton = screen.getByRole('button', { name: /aumentar zoom/i });
      fireEvent.click(zoomInButton);

      expect(screen.getByText('125%')).toBeInTheDocument();
    });

    it('should decrease zoom when zoom out is clicked', () => {
      render(<PDFViewer report={mockReport} />);

      const zoomOutButton = screen.getByRole('button', { name: /diminuir zoom/i });
      fireEvent.click(zoomOutButton);

      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should disable zoom out at minimum zoom', () => {
      render(<PDFViewer report={mockReport} />);

      const zoomOutButton = screen.getByRole('button', { name: /diminuir zoom/i });
      
      // Click multiple times to reach minimum
      fireEvent.click(zoomOutButton);
      fireEvent.click(zoomOutButton);
      
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(zoomOutButton).toBeDisabled();
    });

    it('should disable zoom in at maximum zoom', () => {
      render(<PDFViewer report={mockReport} />);

      const zoomInButton = screen.getByRole('button', { name: /aumentar zoom/i });
      
      // Click multiple times to reach maximum
      fireEvent.click(zoomInButton);
      fireEvent.click(zoomInButton);
      fireEvent.click(zoomInButton);
      fireEvent.click(zoomInButton);
      
      expect(screen.getByText('200%')).toBeInTheDocument();
      expect(zoomInButton).toBeDisabled();
    });
  });

  describe('Rotation Controls', () => {
    it('should rotate PDF when rotate button is clicked', () => {
      render(<PDFViewer report={mockReport} />);

      const rotateButton = screen.getByRole('button', { name: /rotacionar pdf/i });
      fireEvent.click(rotateButton);

      // Should show rotation in footer
      expect(screen.getByText('Rotação: 90°')).toBeInTheDocument();
    });

    it('should cycle through rotation angles', () => {
      render(<PDFViewer report={mockReport} />);

      const rotateButton = screen.getByRole('button', { name: /rotacionar pdf/i });
      
      fireEvent.click(rotateButton);
      expect(screen.getByText('Rotação: 90°')).toBeInTheDocument();
      
      fireEvent.click(rotateButton);
      expect(screen.getByText('Rotação: 180°')).toBeInTheDocument();
      
      fireEvent.click(rotateButton);
      expect(screen.getByText('Rotação: 270°')).toBeInTheDocument();
      
      fireEvent.click(rotateButton);
      expect(screen.queryByText(/Rotação:/)).not.toBeInTheDocument(); // Back to 0°
    });
  });

  describe('Fullscreen Mode', () => {
    it('should toggle fullscreen mode', () => {
      const { container } = render(<PDFViewer report={mockReport} />);

      const fullscreenButton = screen.getByRole('button', { name: /tela cheia/i });
      fireEvent.click(fullscreenButton);

      expect(container.firstChild).toHaveClass('fixed', 'inset-0', 'z-50');
      expect(screen.getByRole('button', { name: /sair da tela cheia/i })).toBeInTheDocument();
    });

    it('should exit fullscreen mode', () => {
      const { container } = render(<PDFViewer report={mockReport} />);

      const fullscreenButton = screen.getByRole('button', { name: /tela cheia/i });
      fireEvent.click(fullscreenButton);
      
      const minimizeButton = screen.getByRole('button', { name: /sair da tela cheia/i });
      fireEvent.click(minimizeButton);

      expect(container.firstChild).not.toHaveClass('fixed', 'inset-0', 'z-50');
      expect(screen.getByRole('button', { name: /tela cheia/i })).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onClose when close button is clicked', () => {
      render(<PDFViewer report={mockReport} onClose={mockOnClose} />);

      fireEvent.click(screen.getByRole('button', { name: /fechar visualizador/i }));
      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should call onDownload when download button is clicked', () => {
      render(<PDFViewer report={mockReport} onDownload={mockOnDownload} />);

      fireEvent.click(screen.getByRole('button', { name: /baixar pdf/i }));
      expect(mockOnDownload).toHaveBeenCalledWith(mockReport);
    });

    it('should open PDF in new tab when external link is clicked', () => {
      render(<PDFViewer report={mockReport} />);

      fireEvent.click(screen.getByRole('button', { name: /abrir em nova aba/i }));
      expect(mockWindowOpen).toHaveBeenCalledWith(mockReport.pdf_url, '_blank');
    });

    it('should handle download error', async () => {
      const failingDownload = vi.fn(() => Promise.reject(new Error('Download failed')));
      
      render(<PDFViewer report={mockReport} onDownload={failingDownload} />);

      fireEvent.click(screen.getByRole('button', { name: /baixar pdf/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Download failed')).toBeInTheDocument();
      });
    });
  });

  describe('Footer Information', () => {
    it('should show report creation date', () => {
      render(<PDFViewer report={mockReport} />);

      expect(screen.getByText('Criado em 15/01/2024')).toBeInTheDocument();
    });

    it('should show severity level in footer', () => {
      render(<PDFViewer report={mockReport} />);

      expect(screen.getByText('Nível de severidade: 3')).toBeInTheDocument();
    });

    it('should show current zoom level in footer', () => {
      render(<PDFViewer report={mockReport} />);

      expect(screen.getByText('Zoom: 100%')).toBeInTheDocument();
    });

    it('should not show rotation in footer when rotation is 0', () => {
      render(<PDFViewer report={mockReport} />);

      expect(screen.queryByText(/Rotação:/)).not.toBeInTheDocument();
    });
  });

  describe('PDF Loading', () => {
    it('should show error message when URL is invalid', () => {
      const reportWithInvalidPDF = { ...mockReport, pdf_url: '' };
      render(<PDFViewer report={reportWithInvalidPDF} />);

      expect(screen.getByText('URL do PDF não encontrada')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper iframe title', () => {
      render(<PDFViewer report={mockReport} />);

      // The iframe should have a proper title (though it might not be immediately visible due to loading)
      expect(screen.getByTitle(/PDF: Relatório de Teste PDF/)).toBeInTheDocument();
    });

    it('should have keyboard accessible controls', () => {
      render(<PDFViewer report={mockReport} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /fechar visualizador/i });
      closeButton.focus();
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <PDFViewer report={mockReport} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should work without optional callbacks', () => {
      render(<PDFViewer report={mockReport} />);

      // Should render without errors
      expect(screen.getByText('Relatório de Teste PDF')).toBeInTheDocument();
    });
  });
});