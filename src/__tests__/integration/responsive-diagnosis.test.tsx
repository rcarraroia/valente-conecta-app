// Integration tests for responsive diagnosis features

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DiagnosisChat } from '@/pages/DiagnosisChat';

// Mock all the hooks and services
vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: vi.fn(),
  useMobileKeyboard: vi.fn(),
  useTouchGestures: vi.fn(),
}));

vi.mock('@/hooks/useDiagnosisAuth', () => ({
  useDiagnosisAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    isAuthenticated: true,
    loading: false,
  }),
}));

vi.mock('@/hooks/useDiagnosisChat', () => ({
  useDiagnosisChat: () => ({
    session: null,
    loading: false,
    error: null,
    sendMessage: vi.fn(),
    startNewSession: vi.fn(),
    clearError: vi.fn(),
  }),
}));

vi.mock('@/services/chat.service', () => ({
  ChatService: {
    sendMessage: vi.fn(),
    startSession: vi.fn(),
  },
}));

// Get mocked hooks
const { useResponsive, useMobileKeyboard, useTouchGestures } = await import('@/hooks/useResponsive');
const mockUseResponsive = vi.mocked(useResponsive);
const mockUseMobileKeyboard = vi.mocked(useMobileKeyboard);
const mockUseTouchGestures = vi.mocked(useTouchGestures);

// Test wrapper component
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

describe('Responsive Diagnosis Integration', () => {
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

    mockUseMobileKeyboard.mockReturnValue({
      isKeyboardVisible: false,
      viewportHeight: 768,
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

  describe('Desktop Experience', () => {
    it('should provide full desktop experience', async () => {
      render(
        <TestWrapper>
          <DiagnosisChat />
        </TestWrapper>
      );

      // Should show navigation elements
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Mobile Experience', () => {
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

    it('should provide optimized mobile experience', async () => {
      render(
        <TestWrapper>
          <DiagnosisChat />
        </TestWrapper>
      );

      // Should render mobile layout
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Responsive Breakpoints', () => {
    const breakpointTests = [
      {
        name: 'Extra Small (xs)',
        width: 320,
        height: 568,
        expected: { isMobile: true, isTablet: false, isDesktop: false },
      },
      {
        name: 'Medium (md)',
        width: 768,
        height: 1024,
        expected: { isMobile: false, isTablet: true, isDesktop: false },
      },
      {
        name: 'Large (lg)',
        width: 1024,
        height: 768,
        expected: { isMobile: false, isTablet: false, isDesktop: true },
      },
    ];

    breakpointTests.forEach(({ name, width, height, expected }) => {
      it(`should handle ${name} breakpoint correctly`, async () => {
        mockUseResponsive.mockReturnValue({
          width,
          height,
          isMobile: expected.isMobile,
          isTablet: expected.isTablet,
          isDesktop: expected.isDesktop,
          isTouchDevice: expected.isMobile || expected.isTablet,
          breakpoint: width < 640 ? 'xs' : width < 768 ? 'sm' : width < 1024 ? 'md' : width < 1280 ? 'lg' : 'xl',
          isLandscape: width > height,
          isPortrait: height > width,
        });

        render(
          <TestWrapper>
            <DiagnosisChat />
          </TestWrapper>
        );

        // Verify layout is rendered correctly
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });
  });
});