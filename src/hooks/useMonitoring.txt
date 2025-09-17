// Hook for monitoring and analytics integration

import { useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService, AnalyticsEvent } from '@/services/analytics.service';
import { loggingService, LogLevel, LogCategory } from '@/services/logging.service';
import { monitoringService } from '@/services/monitoring.service';

export const useMonitoring = () => {
  const { user } = useAuth();

  // Track page views
  const trackPageView = useCallback((pageName: string, additionalData?: Record<string, any>) => {
    if (analyticsService) {
      analyticsService.track(AnalyticsEvent.FEATURE_USED, {
        feature: 'page_view',
        page: pageName,
        ...additionalData,
      }, user?.id);
    }

    if (loggingService) {
      loggingService.logUserAction(`Page view: ${pageName}`, user?.id || 'anonymous', undefined, additionalData);
    }
  }, [user?.id]);

  // Track user actions
  const trackUserAction = useCallback((action: string, details?: Record<string, any>) => {
    if (!user?.id) return;

    if (analyticsService) {
      analyticsService.trackDiagnosisJourney(user.id, details?.sessionId, action, details);
    }
    
    if (loggingService) {
      loggingService.logUserAction(action, user.id, details?.sessionId, details);
    }
  }, [user?.id]);

  // Track errors
  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    if (analyticsService) {
      analyticsService.trackError(error, context, user?.id, context?.sessionId);
    }
    
    if (loggingService) {
      loggingService.logError(error, LogCategory.SYSTEM, {
        user_id: user?.id,
        ...context,
      });
    }
  }, [user?.id]);

  // Track performance metrics
  const trackPerformance = useCallback((metric: string, value: number, unit: string, context?: Record<string, any>) => {
    if (analyticsService) {
      analyticsService.trackPerformance(metric, value, unit as any, context);
    }
    
    if (loggingService) {
      loggingService.logPerformanceMetric(metric, value, unit, context);
    }
  }, []);

  // Track diagnosis events
  const trackDiagnosisEvent = useCallback((event: string, sessionId?: string, details?: Record<string, any>) => {
    if (!user?.id) return;

    if (analyticsService) {
      analyticsService.trackDiagnosisJourney(user.id, sessionId || '', event, details);
    }
    
    if (loggingService) {
      loggingService.info(`Diagnosis event: ${event}`, LogCategory.CHAT, {
        user_id: user.id,
        session_id: sessionId,
        ...details,
      });
    }
  }, [user?.id]);

  // Track chat interactions
  const trackChatInteraction = useCallback((type: 'message_sent' | 'message_received' | 'session_started' | 'session_ended', sessionId: string, details?: Record<string, any>) => {
    if (!user?.id) return;

    if (analyticsService) {
      analyticsService.trackChatInteraction(user.id, sessionId, type, details);
    }
    
    if (loggingService) {
      loggingService.logChatInteraction(type, user.id, sessionId, details);
    }
  }, [user?.id]);

  // Track PDF operations
  const trackPDFOperation = useCallback((operation: 'generation_started' | 'generation_completed' | 'generation_failed' | 'downloaded' | 'viewed', sessionId?: string, details?: Record<string, any>) => {
    if (!user?.id) return;

    if (analyticsService) {
      analyticsService.trackPDFOperation(user.id, sessionId || '', operation, details);
    }
    
    if (loggingService) {
      loggingService.logPDFOperation(operation, user.id, sessionId, details);
    }
  }, [user?.id]);

  // Track authentication events
  const trackAuthEvent = useCallback((event: 'login' | 'logout' | 'token_refresh' | 'auth_failure', details?: Record<string, any>) => {
    if (analyticsService) {
      analyticsService.track(
        event === 'login' ? AnalyticsEvent.USER_LOGIN : AnalyticsEvent.USER_LOGOUT,
        details,
        user?.id
      );
    }

    if (loggingService) {
      loggingService.logAuthEvent(event, user?.id, details);
    }
  }, [user?.id]);

  // Get system health
  const getSystemHealth = useCallback(async () => {
    return await monitoringService.getHealthStatus();
  }, []);

  // Get analytics summary
  const getAnalyticsSummary = useCallback(async (startDate: string, endDate: string) => {
    if (!analyticsService) {
      return null;
    }
    return await analyticsService.getAnalyticsSummary(startDate, endDate);
  }, []);

  // Auto-track page views on route changes
  useEffect(() => {
    const handleRouteChange = () => {
      const pageName = window.location.pathname;
      trackPageView(pageName, {
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
      });
    };

    // Track initial page load
    handleRouteChange();

    // Listen for route changes (for SPA navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    // Custom event for programmatic navigation
    window.addEventListener('route-change', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('route-change', handleRouteChange);
    };
  }, [trackPageView]);

  // Auto-track authentication events
  useEffect(() => {
    if (user?.id) {
      trackAuthEvent('login', {
        user_id: user.id,
        email: user.email,
        login_time: new Date().toISOString(),
      });
    }

    return () => {
      if (user?.id) {
        trackAuthEvent('logout', {
          user_id: user.id,
          logout_time: new Date().toISOString(),
        });
      }
    };
  }, [user?.id, trackAuthEvent]);

  // Auto-track performance metrics
  useEffect(() => {
    // Track page load performance
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        trackPerformance('page_load_time', navigation.loadEventEnd - navigation.navigationStart, 'ms', {
          page: window.location.pathname,
        });

        trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.navigationStart, 'ms', {
          page: window.location.pathname,
        });
      }
    }
  }, [trackPerformance]);

  // Error boundary integration
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'unhandled_error',
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
      });
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  return {
    // Tracking methods
    trackPageView,
    trackUserAction,
    trackError,
    trackPerformance,
    trackDiagnosisEvent,
    trackChatInteraction,
    trackPDFOperation,
    trackAuthEvent,
    
    // Data retrieval methods
    getSystemHealth,
    getAnalyticsSummary,
    
    // Services (for advanced usage)
    analyticsService,
    loggingService,
    monitoringService,
  };
};

// Higher-order component for automatic monitoring
export const withMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return (props: P) => {
    const { trackPageView, trackError } = useMonitoring();

    useEffect(() => {
      trackPageView(componentName, {
        component: componentName,
        props: Object.keys(props as any),
      });
    }, [trackPageView]);

    // Error boundary for the component
    useEffect(() => {
      const handleComponentError = (error: Error) => {
        trackError(error, {
          component: componentName,
          props: props,
        });
      };

      // This would be better implemented with an actual Error Boundary
      // but this provides basic error tracking
      window.addEventListener('error', handleComponentError);

      return () => {
        window.removeEventListener('error', handleComponentError);
      };
    }, [trackError]);

    return <WrappedComponent {...props} />;
  };
};