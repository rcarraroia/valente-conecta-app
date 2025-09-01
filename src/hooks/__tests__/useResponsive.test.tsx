// Tests for useResponsive hook

import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useResponsive, useMobileKeyboard, useTouchGestures } from '../useResponsive';

// Mock window properties
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  visualViewport: {
    height: 768,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
};

// Mock navigator
const mockNavigator = {
  maxTouchPoints: 0,
};

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  configurable: true,
  value: mockWindow.addEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  configurable: true,
  value: mockWindow.removeEventListener,
});

Object.defineProperty(navigator, 'maxTouchPoints', {
  writable: true,
  configurable: true,
  value: 0,
});

describe('useResponsive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.innerWidth = 1024;
    window.innerHeight = 768;
    navigator.maxTouchPoints = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with desktop state', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.breakpoint).toBe('lg');
    expect(result.current.isLandscape).toBe(true);
    expect(result.current.isPortrait).toBe(false);
  });

  it('should detect mobile breakpoint', () => {
    window.innerWidth = 640;
    window.innerHeight = 1136;

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe('sm');
    expect(result.current.isPortrait).toBe(true);
  });

  it('should detect tablet breakpoint', () => {
    window.innerWidth = 768;
    window.innerHeight = 1024;

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe('md');
  });

  it('should detect touch device', () => {
    navigator.maxTouchPoints = 1;
    
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isTouchDevice).toBe(true);
  });

  it('should handle custom breakpoints', () => {
    const customBreakpoints = {
      sm: 480,
      md: 640,
      lg: 960,
      xl: 1200,
      '2xl': 1600,
    };

    window.innerWidth = 500;

    const { result } = renderHook(() => useResponsive(customBreakpoints));

    expect(result.current.breakpoint).toBe('sm');
  });

  it('should add event listeners on mount', () => {
    renderHook(() => useResponsive());

    expect(mockWindow.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(mockWindow.addEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
  });

  it('should remove event listeners on unmount', () => {
    const { unmount } = renderHook(() => useResponsive());

    unmount();

    expect(mockWindow.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(mockWindow.removeEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
  });
});

describe('useMobileKeyboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.innerHeight = 768;
    Object.defineProperty(window, 'visualViewport', {
      writable: true,
      configurable: true,
      value: mockWindow.visualViewport,
    });
  });

  it('should initialize with keyboard not visible', () => {
    const { result } = renderHook(() => useMobileKeyboard());

    expect(result.current.isKeyboardVisible).toBe(false);
    expect(result.current.viewportHeight).toBe(768);
  });

  it('should detect keyboard visibility based on height change', () => {
    const { result } = renderHook(() => useMobileKeyboard());

    // Simulate keyboard opening (height decrease)
    act(() => {
      window.innerHeight = 400; // Decreased by more than 150px
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isKeyboardVisible).toBe(true);
    expect(result.current.viewportHeight).toBe(400);
  });

  it('should handle visual viewport changes', () => {
    const { result } = renderHook(() => useMobileKeyboard());

    // Simulate visual viewport change
    act(() => {
      if (window.visualViewport) {
        Object.defineProperty(window.visualViewport, 'height', {
          value: 400,
          writable: true,
        });
        window.visualViewport.dispatchEvent(new Event('resize'));
      }
    });

    expect(result.current.isKeyboardVisible).toBe(true);
  });
});

describe('useTouchGestures', () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
  });

  it('should initialize with default touch state', () => {
    const { result } = renderHook(() => useTouchGestures());

    expect(result.current.touchState.isSwipeLeft).toBe(false);
    expect(result.current.touchState.isSwipeRight).toBe(false);
    expect(result.current.touchState.isSwipeUp).toBe(false);
    expect(result.current.touchState.isSwipeDown).toBe(false);
    expect(result.current.touchState.isPinching).toBe(false);
    expect(result.current.touchState.scale).toBe(1);
  });

  it('should add touch event listeners to element', () => {
    const { result } = renderHook(() => useTouchGestures());

    act(() => {
      result.current.handleTouchGestures(mockElement);
    });

    expect(mockElement.addEventListener).toHaveBeenCalledWith(
      'touchstart',
      expect.any(Function),
      { passive: true }
    );
    expect(mockElement.addEventListener).toHaveBeenCalledWith(
      'touchmove',
      expect.any(Function),
      { passive: true }
    );
    expect(mockElement.addEventListener).toHaveBeenCalledWith(
      'touchend',
      expect.any(Function),
      { passive: true }
    );
  });

  it('should return cleanup function', () => {
    const { result } = renderHook(() => useTouchGestures());

    const cleanup = result.current.handleTouchGestures(mockElement);
    
    expect(typeof cleanup).toBe('function');

    // Call cleanup
    cleanup();

    expect(mockElement.removeEventListener).toHaveBeenCalledWith(
      'touchstart',
      expect.any(Function)
    );
    expect(mockElement.removeEventListener).toHaveBeenCalledWith(
      'touchmove',
      expect.any(Function)
    );
    expect(mockElement.removeEventListener).toHaveBeenCalledWith(
      'touchend',
      expect.any(Function)
    );
  });

  it('should handle null element gracefully', () => {
    const { result } = renderHook(() => useTouchGestures());

    expect(() => {
      result.current.handleTouchGestures(null);
    }).not.toThrow();
  });
});

describe('Responsive breakpoints', () => {
  const testCases = [
    { width: 320, expected: 'xs', isMobile: true, isTablet: false, isDesktop: false },
    { width: 640, expected: 'sm', isMobile: true, isTablet: false, isDesktop: false },
    { width: 768, expected: 'md', isMobile: false, isTablet: true, isDesktop: false },
    { width: 1024, expected: 'lg', isMobile: false, isTablet: false, isDesktop: true },
    { width: 1280, expected: 'xl', isMobile: false, isTablet: false, isDesktop: true },
    { width: 1536, expected: '2xl', isMobile: false, isTablet: false, isDesktop: true },
  ];

  testCases.forEach(({ width, expected, isMobile, isTablet, isDesktop }) => {
    it(`should correctly categorize ${width}px as ${expected}`, () => {
      window.innerWidth = width;
      window.innerHeight = 768;

      const { result } = renderHook(() => useResponsive());

      expect(result.current.breakpoint).toBe(expected);
      expect(result.current.isMobile).toBe(isMobile);
      expect(result.current.isTablet).toBe(isTablet);
      expect(result.current.isDesktop).toBe(isDesktop);
    });
  });
});

describe('Orientation detection', () => {
  it('should detect landscape orientation', () => {
    window.innerWidth = 1024;
    window.innerHeight = 768;

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isLandscape).toBe(true);
    expect(result.current.isPortrait).toBe(false);
  });

  it('should detect portrait orientation', () => {
    window.innerWidth = 768;
    window.innerHeight = 1024;

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isLandscape).toBe(false);
    expect(result.current.isPortrait).toBe(true);
  });
});