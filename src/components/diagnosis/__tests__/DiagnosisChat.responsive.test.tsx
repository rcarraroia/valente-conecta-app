// Tests for DiagnosisChat responsive behavior

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DiagnosisChat } from '../DiagnosisChat';

// Mock hooks
vi.mock('@/hooks/useDiagnosisChat', () => ({
  useDiagnosisChat: () => ({
    messages: [],
    isLoading: false,
    error: null,
    isTyping: false,
    sessionId: 'test-session-123',
    sendMessage: vi.fn(),
    startSession: vi.fn(),
    retryLastMessage: vi.fn(),
    clearError: vi.fn(),
  }),
}));

vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: vi.fn(),
  useMobileKeyboard: vi.fn(),
  useTouchGestures: vi.fn(),
}));

const mockUseResponsive = vi.mocked(
  await import('@/hooks/useResponsive')
).useResponsive;

const mockUseMobileKeyboard = vi.mocked(
  await import('@/hooks/useResponsive')
).useMobileKeyboard;

const mockUseTouchGestures = vi.mocked(
  await import('@/hooks/useResponsive')
).useTouchGestures;

describe('DiagnosisChat Responsive', () => {
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

  describe('Desktop Layout', () => {
    it('should render desktop layout correctly', () => {
      render(<DiagnosisChat sessionId="test-session" />);

      // Check for desktop-specific elements
      expect(screen.getByText('Assistente de Pré-Diagnóstico')).toBeInTheDocument();
      expect(screen.getByText('Sessão: on-123')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Digite sua mensagem...')).toBeInTheDocument();
      expect(screen.getByText('Pressione Enter para enviar')).toBeInTheDocument();
    });

    it('should have proper desktop styling', () => {
      render(<DiagnosisChat sessionId="test-session" />);

      const card = screen.getByRole('region', { name: /chat/i }) || screen.getByTestId('chat-container');
      expect(card).toHaveStyle({ height: '600px' });
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
      render(<DiagnosisChat sessionId="test-session" isMobile={true} />);

      // Check for mobile-specific elements
      expect(screen.getByText('Assistente IA')).toBeInTheDocument();
      expect(screen.getByText('on-123')).toBeInTheDocument(); // Shorter session ID
      expect(screen.getByPlaceholderText('Sua mensagem...')).toBeInTheDocument();
      expect(screen.getByText('Enter para enviar')).toBeInTheDocument();
    });

    it('should show mobile optimizations', () => {
      render(<DiagnosisChat sessionId="test-session" isMobile={true} />);

      // Check for mobile-specific button text
      const sendButton = screen.getByRole('button', { name: /enviar/i });
      expect(sendButton).toHaveTextContent('Enviar');
    });

    it('should handle keyboard visibility', () => {
      mockUseMobileKeyboard.mockReturnValue({
        isKeyboardVisible: true,
        viewportHeight: 400,
      });

      render(<DiagnosisChat sessionId="test-session" isMobile={true} isKeyboardVisible={true} />);

      // Should hide helper text when keyboard is visible
      expect(screen.queryByText('Enter para enviar')).not.toBeInTheDocument();
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

      render(<DiagnosisChat sessionId="test-session" isTouchDevice={true} />);

      expect(mockHandleTouchGestures).toHaveBeenCalled();
    });
  });

  describe('Responsive Messages', () => {
    const mockMessages = [
      {
        id: '1',
        type: 'user' as const,
        content: 'Hello',
        timestamp: new Date(),
        status: 'sent' as const,
      },
      {
        id: '2',
        type: 'ai' as const,
        content: 'Hi there! How can I help you?',
        timestamp: new Date(),
        status: 'received' as const,
      },
    ];

    beforeEach(() => {
      vi.mocked(await import('@/hooks/useDiagnosisChat')).useDiagnosisChat.mockReturnValue({
        messages: mockMessages,
        isLoading: false,
        error: null,
        isTyping: false,
        sessionId: 'test-session-123',
        sendMessage: vi.fn(),
        startSession: vi.fn(),
        retryLastMessage: vi.fn(),
        clearError: vi.fn(),
      });
    });

    it('should render messages with mobile styling', () => {
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

      render(<DiagnosisChat sessionId="test-session" isMobile={true} />);

      // Messages should be rendered
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there! How can I help you?')).toBeInTheDocument();
    });

    it('should render messages with desktop styling', () => {
      render(<DiagnosisChat sessionId="test-session" />);

      // Messages should be rendered
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there! How can I help you?')).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('should handle input on mobile with proper font size', () => {
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

      render(<DiagnosisChat sessionId="test-session" isMobile={true} />);

      const input = screen.getByPlaceholderText('Sua mensagem...');
      expect(input).toHaveStyle({ fontSize: '16px' }); // Prevents zoom on iOS
    });

    it('should handle Enter key on desktop', () => {
      const mockSendMessage = vi.fn();
      vi.mocked(await import('@/hooks/useDiagnosisChat')).useDiagnosisChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        isTyping: false,
        sessionId: 'test-session-123',
        sendMessage: mockSendMessage,
        startSession: vi.fn(),
        retryLastMessage: vi.fn(),
        clearError: vi.fn(),
      });

      render(<DiagnosisChat sessionId="test-session" />);

      const input = screen.getByPlaceholderText('Digite sua mensagem...');
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(await import('@/hooks/useDiagnosisChat')).useDiagnosisChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: 'Connection failed',
        isTyping: false,
        sessionId: 'test-session-123',
        sendMessage: vi.fn(),
        startSession: vi.fn(),
        retryLastMessage: vi.fn(),
        clearError: vi.fn(),
      });
    });

    it('should display error with mobile layout', () => {
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

      render(<DiagnosisChat sessionId="test-session" isMobile={true} />);

      expect(screen.getByText('Connection failed')).toBeInTheDocument();
      expect(screen.getByText('Tentar')).toBeInTheDocument(); // Mobile text
    });

    it('should display error with desktop layout', () => {
      render(<DiagnosisChat sessionId="test-session" />);

      expect(screen.getByText('Connection failed')).toBeInTheDocument();
      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument(); // Desktop text
    });
  });
});