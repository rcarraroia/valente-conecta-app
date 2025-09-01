// Hook for responsive design utilities

import { useState, useEffect } from 'react';

export interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isTouchDevice: boolean;
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Hook for responsive design and mobile optimization
 */
export const useResponsive = (breakpoints: BreakpointConfig = defaultBreakpoints) => {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLandscape: true,
        isPortrait: false,
        breakpoint: 'lg' as const,
        isTouchDevice: false,
      };
    }

    return getResponsiveState(window.innerWidth, window.innerHeight, breakpoints);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setState(getResponsiveState(window.innerWidth, window.innerHeight, breakpoints));
    };

    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(() => {
        setState(getResponsiveState(window.innerWidth, window.innerHeight, breakpoints));
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [breakpoints]);

  return state;
};

/**
 * Get responsive state based on dimensions
 */
function getResponsiveState(
  width: number, 
  height: number, 
  breakpoints: BreakpointConfig
): ResponsiveState {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isLandscape = width > height;
  const isPortrait = height > width;

  let breakpoint: ResponsiveState['breakpoint'] = 'xs';
  if (width >= breakpoints['2xl']) breakpoint = '2xl';
  else if (width >= breakpoints.xl) breakpoint = 'xl';
  else if (width >= breakpoints.lg) breakpoint = 'lg';
  else if (width >= breakpoints.md) breakpoint = 'md';
  else if (width >= breakpoints.sm) breakpoint = 'sm';

  const isMobile = width < breakpoints.md;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isDesktop = width >= breakpoints.lg;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    breakpoint,
    isTouchDevice,
  };
}

/**
 * Hook for detecting mobile keyboard visibility
 */
export const useMobileKeyboard = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 0
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialHeight = window.innerHeight;
    setViewportHeight(initialHeight);

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialHeight - currentHeight;
      
      // Consider keyboard visible if height decreased by more than 150px
      const keyboardThreshold = 150;
      setIsKeyboardVisible(heightDifference > keyboardThreshold);
      setViewportHeight(currentHeight);
    };

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const heightDifference = initialHeight - window.visualViewport.height;
        setIsKeyboardVisible(heightDifference > 150);
        setViewportHeight(window.visualViewport.height);
      }
    };

    window.addEventListener('resize', handleResize);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
      }
    };
  }, []);

  return {
    isKeyboardVisible,
    viewportHeight,
  };
};

/**
 * Hook for touch gestures
 */
export const useTouchGestures = () => {
  const [touchState, setTouchState] = useState({
    isSwipeLeft: false,
    isSwipeRight: false,
    isSwipeUp: false,
    isSwipeDown: false,
    isPinching: false,
    scale: 1,
  });

  const handleTouchGestures = (element: HTMLElement | null) => {
    if (!element) return;

    let startX = 0;
    let startY = 0;
    let startDistance = 0;
    let startScale = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        startDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        setTouchState(prev => ({ ...prev, isPinching: true }));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        if (startDistance > 0) {
          const scale = currentDistance / startDistance;
          setTouchState(prev => ({ ...prev, scale: startScale * scale }));
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1 && !touchState.isPinching) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            setTouchState(prev => ({ ...prev, isSwipeRight: true }));
            setTimeout(() => setTouchState(prev => ({ ...prev, isSwipeRight: false })), 100);
          } else {
            setTouchState(prev => ({ ...prev, isSwipeLeft: true }));
            setTimeout(() => setTouchState(prev => ({ ...prev, isSwipeLeft: false })), 100);
          }
        } else if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            setTouchState(prev => ({ ...prev, isSwipeDown: true }));
            setTimeout(() => setTouchState(prev => ({ ...prev, isSwipeDown: false })), 100);
          } else {
            setTouchState(prev => ({ ...prev, isSwipeUp: true }));
            setTimeout(() => setTouchState(prev => ({ ...prev, isSwipeUp: false })), 100);
          }
        }
      }

      setTouchState(prev => ({ ...prev, isPinching: false }));
      startScale = touchState.scale;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  };

  return {
    touchState,
    handleTouchGestures,
  };
};

export default useResponsive;