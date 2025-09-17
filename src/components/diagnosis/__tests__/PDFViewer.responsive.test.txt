// Tests for PDFViewer responsive behavior

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PDFViewer } from '../PDFViewer';

// Mock hooks
vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: vi.fn(),
  useTouchGestures: vi.fn(),
}));

const mockUseResponsive = vi.mocked(
  await import('@/hooks/useResponsive')
).useResponsive;

const mockUseTouchGestures = vi.mocked(
  await import('@/hooks/useResponsive')
).useTouchGestures;

describe('PDFViewer Responsive', () => {
  const mockProps = {
    pdfUrl: 'https://example.com/test.pdf',
    title: 'Test Report',
    onClose: vi.fn(),
    onDownload: vi.fn(),
  };

  beforeEach(() => {
    // Default desktop setup
    mockUseResponsive.mockReturnValue({
      width: 1024,
      height: 768,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
      breakpoint: 'lg',
      isLandscape: true,
      isPortrait: false,
    });

    mockUseTouchGestures.mockReturnValue({
      touchState: {
        isSwipeLeft: false,
        isSwipeRight: false,
        isSwipeUp: false,
        isSwipeDown: false,
        isPinching: false,
        scale: 1,
      },
      handleTouchGestures: vi.fn(() => vi.fn()),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Layout', () => {
    it('should render desktop layout correctly', () => {
      render(<PDFViewer {...mockProps} />);

      // Check for desktop-specific elements
      expect(screen.getByText('Test Report')).toBeInTheDocument();
      expect(screen.getByLabelText('Rotacionar PDF')).toBeInTheDocument();
      expect(screen.getByLabelText('Abrir em nova aba')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should show all control buttons on desktop', () => {
      render(<PDFViewer {...mockProps} />);

      expect(screen.getByLabelText('Diminuir zoom')).toBeInTheDocument();
      expect(screen.getByLabelText('Aumentar zoom')).toBeInTheDocument();
      expect(screen.getByLabelText('Rotacionar PDF')).toBeInTheDocument();
      expect(screen.getByLabelText('Tela cheia')).toBeInTheDocument();
      expect(screen.getByLabelText('Baixar PDF')).toBeInTheDocument();
      expect(screen.getByLabelText('Abrir em nova aba')).toBeInTheDocument();
      expect(screen.getByLabelText('Fechar visualizador')).toBeInTheDocument();
    });
  });

  describe('Mobile Layout', () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
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
    });

    it('should render mobile layout correctly', () => {
      render(<PDFViewer {...mockProps} />);

      // Check for mobile-specific elements
      expect(screen.getByText('Test Report'.substring(0, 20))).toBeInTheDocument();
      expect(screen.queryByLabelText('Rotacionar PDF')).not.toBeInTheDocument(); // Hidden on mobile
      expect(screen.queryByLabelText('Abrir em nova aba')).not.toBeInTheDocument(); // Hidden on mobile
    });

    it('should show mobile device indicator', () => {
      render(<PDFViewer {...mockProps} />);

      // Should show smartphone icon
      const smartphoneIcon = screen.getByTestId('smartphone-icon') || 
                           document.querySelector('[data-lucide="smartphone"]');
      expect(smartphoneIcon).toBeInTheDocument();
    });

    it('should show touch gesture hints', () => {
      render(<PDFViewer {...mockProps} />);

      expect(screen.getByText(/Deslize ← para fechar/)).toBeInTheDocument();
      expect(screen.getByText(/↑↓ para zoom/)).toBeInTheDocument();
      expect(screen.getByText(/Pinça para ajustar/)).toBeInTheDocument();
    });

    it('should have smaller buttons on mobile', () => {
      render(<PDFViewer {...mockProps} />);

      const zoomInButton = screen.getByLabelText('Aumentar zoom');
      expect(zoomInButton).toHaveClass('h-8', 'w-8', 'p-0');
    });

    it('should use mobile-optimized zoom minimum', () => {
      render(<PDFViewer {...mockProps} />);

      // Mobile should have minimum 75% zoom
      const zoomOutButton = screen.getByLabelText('Diminuir zoom');
      
      // Click zoom out multiple times to test minimum
      fireEvent.click(zoomOutButton);
      fireEvent.click(zoomOutButton);
      fireEvent.click(zoomOutButton);

      // Should not go below 75% on mobile (vs 50% on desktop)
      const zoomDisplay = screen.getByText(/\d+%/);
      const zoomValue = parseInt(zoomDisplay.textContent?.replace('%', '') || '100');
      expect(zoomValue).toBeGreaterThanOrEqual(75);
    });
  });

  describe('Tablet Layout', () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        width: 768,
        height: 1024,
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isTouchDevice: true,
        breakpoint: 'md',
        isLandscape: false,
        isPortrait: true,
      });
    });

    it('should render tablet layout correctly', () => {
      render(<PDFViewer {...mockProps} />);

      // Tablet should show full title but with touch optimizations
      expect(screen.getByText('Test Report')).toBeInTheDocument();
      
      // Should show tablet icon instead of smartphone
      const tabletIcon = screen.getByTestId('tablet-icon') || 
                        document.querySelector('[data-lucide="tablet"]');
      expect(tabletIcon).toBeInTheDocument();
    });
  });

  describe('Touch Gestures', () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
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
    });

    it('should setup touch gesture handlers', () => {
      const mockHandleTouchGestures = vi.fn(() => vi.fn());
      mockUseTouchGestures.mockReturnValue({
        touchState: {
          isSwipeLeft: false,
          isSwipeRight: false,
          isSwipeUp: false,
          isSwipeDown: false,
          isPinching: false,
          scale: 1,
        },
        handleTouchGestures: mockHandleTouchGestures,
      });

      render(<PDFViewer {...mockProps} />);

      expect(mockHandleTouchGestures).toHaveBeenCalled();
    });

    it('should handle swipe left to close', () => {
      const mockOnClose = vi.fn();
      mockUseTouchGestures.mockReturnValue({
        touchState: {
          isSwipeLeft: true,
          isSwipeRight: false,
          isSwipeUp: false,
          isSwipeDown: false,
          isPinching: false,
          scale: 1,
        },
        handleTouchGestures: vi.fn(() => vi.fn()),
      });

      render(<PDFViewer {...mockProps} onClose={mockOnClose} />);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should handle swipe up to zoom in', () => {
      mockUseTouchGestures.mockReturnValue({
        touchState: {
          isSwipeLeft: false,
          isSwipeRight: false,
          isSwipeUp: true,
          isSwipeDown: false,
          isPinching: false,
          scale: 1,
        },
        handleTouchGestures: vi.fn(() => vi.fn()),
      });

      render(<PDFViewer {...mockProps} />);

      // Should increase zoom
      const zoomDisplay = screen.getByText(/\d+%/);
      const zoomValue = parseInt(zoomDisplay.textContent?.replace('%', '') || '100');
      expect(zoomValue).toBeGreaterThan(100);
    });

    it('should handle pinch to scale', () => {
      mockUseTouchGestures.mockReturnValue({
        touchState: {
          isSwipeLeft: false,
          isSwipeRight: false,
          isSwipeUp: false,
          isSwipeDown: false,
          isPinching: true,
          scale: 1.5,
        },
        handleTouchGestures: vi.fn(() => vi.fn()),
      });

      render(<PDFViewer {...mockProps} />);

      // Should adjust zoom based on scale
      const zoomDisplay = screen.getByText(/\d+%/);
      const zoomValue = parseInt(zoomDisplay.textContent?.replace('%', '') || '100');
      expect(zoomValue).toBe(150); // 100 * 1.5
    });
  });

  describe('Responsive Footer', () => {
    const mockReportData = {
      createdAt: '2024-01-15T10:30:00Z',
      severityLevel: 3,
    };

    it('should show full footer info on desktop', () => {
      render(<PDFViewer {...mockProps} reportData={mockReportData} />);

      expect(screen.getByText(/Criado em:/)).toBeInTheDocument();
      expect(screen.getByText(/Severidade:/)).toBeInTheDocument();
      expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
    });

    it('should show condensed footer info on mobile', () => {
      mockUseResponsive.mockReturnValue({
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

      render(<PDFViewer {...mockProps} reportData={mockReportData} />);

      expect(screen.getByText(/Criado:/)).toBeInTheDocument(); // Shorter label
      expect(screen.queryByText(/Severidade:/)).not.toBeInTheDocument(); // Hidden on mobile
      expect(screen.getByText(/15\/01\/24/)).toBeInTheDocument(); // Shorter date format
    });
  });

  describe('Error States', () => {
    it('should show responsive error message', () => {
      mockUseResponsive.mockReturnValue({
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

      render(<PDFViewer pdfUrl="" />);

      expect(screen.getByText('URL do PDF não fornecida')).toBeInTheDocument();
      
      // Error icon should be smaller on mobile
      const errorIcon = screen.getByTestId('alert-circle') || 
                       document.querySelector('[data-lucide="alert-circle"]');
      expect(errorIcon).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show responsive loading indicator', () => {
      mockUseResponsive.mockReturnValue({
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

      render(<PDFViewer {...mockProps} />);

      // Should show loading state initially
      expect(screen.getByText('Carregando PDF...')).toBeInTheDocument();
      
      // Loading spinner should be smaller on mobile
      const loadingSpinner = screen.getByTestId('loading-spinner') || 
                            document.querySelector('[data-lucide="refresh-cw"]');
      expect(loadingSpinner).toBeInTheDocument();
    });
  });
});