// Analytics service for diagnosis system

import { supabase } from '@/integrations/supabase/client';

// Analytics event types
export enum AnalyticsEvent {
  // User Journey Events
  DIAGNOSIS_STARTED = 'diagnosis_started',
  DIAGNOSIS_COMPLETED = 'diagnosis_completed',
  DIAGNOSIS_ABANDONED = 'diagnosis_abandoned',
  
  // Chat Events
  CHAT_SESSION_STARTED = 'chat_session_started',
  CHAT_MESSAGE_SENT = 'chat_message_sent',
  CHAT_MESSAGE_RECEIVED = 'chat_message_received',
  CHAT_SESSION_ENDED = 'chat_session_ended',
  
  // PDF Events
  PDF_GENERATION_STARTED = 'pdf_generation_started',
  PDF_GENERATION_COMPLETED = 'pdf_generation_completed',
  PDF_GENERATION_FAILED = 'pdf_generation_failed',
  PDF_DOWNLOADED = 'pdf_downloaded',
  PDF_VIEWED = 'pdf_viewed',
  
  // Error Events
  ERROR_OCCURRED = 'error_occurred',
  ERROR_RECOVERED = 'error_recovered',
  
  // Performance Events
  PAGE_LOAD_TIME = 'page_load_time',
  COMPONENT_RENDER_TIME = 'component_render_time',
  API_RESPONSE_TIME = 'api_response_time',
  
  // User Engagement
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  FEATURE_USED = 'feature_used',
  HELP_ACCESSED = 'help_accessed',
}

// Analytics event data structure
export interface AnalyticsEventData {
  event: AnalyticsEvent;
  user_id?: string;
  session_id?: string;
  timestamp: string;
  properties: Record<string, any>;
  metadata?: {
    user_agent?: string;
    screen_resolution?: string;
    viewport_size?: string;
    device_type?: 'mobile' | 'tablet' | 'desktop';
    browser?: string;
    os?: string;
    referrer?: string;
    page_url?: string;
  };
}

// Performance metrics
export interface PerformanceMetric {
  metric_name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: string;
  user_id?: string;
  session_id?: string;
  context?: Record<string, any>;
}

// User engagement metrics
export interface EngagementMetric {
  user_id: string;
  session_id?: string;
  event_type: string;
  duration?: number;
  interactions_count?: number;
  completion_rate?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private isEnabled: boolean;
  private batchSize: number = 10;
  private flushInterval: number = 30000; // 30 seconds
  private eventQueue: AnalyticsEventData[] = [];
  private performanceQueue: PerformanceMetric[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production' || 
                    process.env.VITE_ENABLE_ANALYTICS === 'true';
    
    if (this.isEnabled) {
      this.startBatchFlush();
      this.setupPerformanceObserver();
    }
  }

  // Track analytics events
  async track(event: AnalyticsEvent, properties: Record<string, any> = {}, userId?: string, sessionId?: string): Promise<void> {
    if (!this.isEnabled) {
      console.log('Analytics (dev):', event, properties);
      return;
    }

    const eventData: AnalyticsEventData = {
      event,
      user_id: userId,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      properties,
      metadata: this.getDeviceMetadata(),
    };

    this.eventQueue.push(eventData);

    // Flush immediately for critical events
    if (this.isCriticalEvent(event)) {
      await this.flush();
    }
  }

  // Track performance metrics
  async trackPerformance(metricName: string, value: number, unit: PerformanceMetric['unit'], context?: Record<string, any>): Promise<void> {
    if (!this.isEnabled) {
      console.log('Performance (dev):', metricName, value, unit);
      return;
    }

    // Validate metric data before adding to queue
    if (!metricName || typeof value !== 'number' || isNaN(value) || !unit) {
      console.warn('Invalid performance metric data:', { metricName, value, unit });
      return;
    }

    const metric: PerformanceMetric = {
      metric_name: metricName,
      value: Math.round(value * 100) / 100, // Round to 2 decimal places
      unit,
      timestamp: new Date().toISOString(),
      context: context || {},
    };

    this.performanceQueue.push(metric);
  }

  // Track user engagement
  async trackEngagement(userId: string, eventType: string, data: Partial<EngagementMetric>): Promise<void> {
    if (!this.isEnabled) {
      console.log('Engagement (dev):', eventType, data);
      return;
    }

    const engagement: EngagementMetric = {
      user_id: userId,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      ...data,
    };

    try {
      await supabase
        .from('analytics_engagement')
        .insert([engagement]);
    } catch (error) {
      console.error('Failed to track engagement:', error);
    }
  }

  // Track diagnosis journey
  async trackDiagnosisJourney(userId: string, sessionId: string, stage: string, data: Record<string, any> = {}): Promise<void> {
    await this.track(AnalyticsEvent.FEATURE_USED, {
      feature: 'diagnosis',
      stage,
      ...data,
    }, userId, sessionId);
  }

  // Track chat interactions
  async trackChatInteraction(userId: string, sessionId: string, type: 'message_sent' | 'message_received' | 'session_started' | 'session_ended', data: Record<string, any> = {}): Promise<void> {
    const eventMap = {
      message_sent: AnalyticsEvent.CHAT_MESSAGE_SENT,
      message_received: AnalyticsEvent.CHAT_MESSAGE_RECEIVED,
      session_started: AnalyticsEvent.CHAT_SESSION_STARTED,
      session_ended: AnalyticsEvent.CHAT_SESSION_ENDED,
    };

    await this.track(eventMap[type], data, userId, sessionId);
  }

  // Track PDF operations
  async trackPDFOperation(userId: string, sessionId: string, operation: 'generation_started' | 'generation_completed' | 'generation_failed' | 'downloaded' | 'viewed', data: Record<string, any> = {}): Promise<void> {
    const eventMap = {
      generation_started: AnalyticsEvent.PDF_GENERATION_STARTED,
      generation_completed: AnalyticsEvent.PDF_GENERATION_COMPLETED,
      generation_failed: AnalyticsEvent.PDF_GENERATION_FAILED,
      downloaded: AnalyticsEvent.PDF_DOWNLOADED,
      viewed: AnalyticsEvent.PDF_VIEWED,
    };

    await this.track(eventMap[operation], data, userId, sessionId);
  }

  // Track errors
  async trackError(error: Error, context: Record<string, any> = {}, userId?: string, sessionId?: string): Promise<void> {
    await this.track(AnalyticsEvent.ERROR_OCCURRED, {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context,
    }, userId, sessionId);
  }

  // Track error recovery
  async trackErrorRecovery(errorType: string, recoveryMethod: string, userId?: string, sessionId?: string): Promise<void> {
    await this.track(AnalyticsEvent.ERROR_RECOVERED, {
      error_type: errorType,
      recovery_method: recoveryMethod,
    }, userId, sessionId);
  }

  // Get analytics summary
  async getAnalyticsSummary(startDate: string, endDate: string): Promise<any> {
    if (!this.isEnabled) {
      return { message: 'Analytics disabled in development' };
    }

    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      if (error) throw error;

      return this.processAnalyticsData(data || []);
    } catch (error) {
      console.error('Failed to get analytics summary:', error);
      return null;
    }
  }

  // Get performance metrics
  async getPerformanceMetrics(startDate: string, endDate: string): Promise<any> {
    if (!this.isEnabled) {
      return { message: 'Performance tracking disabled in development' };
    }

    try {
      const { data, error } = await supabase
        .from('analytics_performance')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      if (error) throw error;

      return this.processPerformanceData(data || []);
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return null;
    }
  }

  // Private methods
  private startBatchFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0 && this.performanceQueue.length === 0) {
      return;
    }

    try {
      // Flush events
      if (this.eventQueue.length > 0) {
        const events = this.eventQueue.splice(0, this.batchSize);
        try {
          await supabase
            .from('analytics_events')
            .insert(events);
        } catch (error) {
          console.warn('Failed to insert analytics events:', error);
          // Don't re-throw to prevent breaking the main flow
        }
      }

      // Flush performance metrics
      if (this.performanceQueue.length > 0) {
        const metrics = this.performanceQueue.splice(0, this.batchSize);
        try {
          await supabase
            .from('analytics_performance')
            .insert(metrics);
        } catch (error) {
          console.warn('Failed to insert performance metrics:', error);
          // Don't re-throw to prevent breaking the main flow
        }
      }
    } catch (error) {
      console.error('Failed to flush analytics data:', error);
      // Re-queue failed events (with limit to prevent infinite growth)
      if (this.eventQueue.length < 100) {
        // Keep some events for retry
      }
    }
  }

  private isCriticalEvent(event: AnalyticsEvent): boolean {
    return [
      AnalyticsEvent.ERROR_OCCURRED,
      AnalyticsEvent.DIAGNOSIS_COMPLETED,
      AnalyticsEvent.PDF_GENERATION_FAILED,
    ].includes(event);
  }

  private getDeviceMetadata() {
    if (typeof window === 'undefined') return {};

    return {
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      device_type: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS(),
      referrer: document.referrer,
      page_url: window.location.href,
    };
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.trackPerformance('page_load_time', navEntry.loadEventEnd - navEntry.navigationStart, 'ms');
            this.trackPerformance('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.navigationStart, 'ms');
            this.trackPerformance('first_paint', navEntry.responseEnd - navEntry.navigationStart, 'ms');
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (resourceEntry.name.includes('api') || resourceEntry.name.includes('webhook')) {
              this.trackPerformance('api_response_time', resourceEntry.responseEnd - resourceEntry.requestStart, 'ms', {
                url: resourceEntry.name,
                size: resourceEntry.transferSize,
              });
            }
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackPerformance('largest_contentful_paint', entry.startTime, 'ms');
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Observe first input delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackPerformance('first_input_delay', entry.processingStart - entry.startTime, 'ms');
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

    } catch (error) {
      console.warn('Performance observer setup failed:', error);
    }
  }

  private processAnalyticsData(data: any[]): any {
    const summary = {
      total_events: data.length,
      unique_users: new Set(data.map(d => d.user_id).filter(Boolean)).size,
      unique_sessions: new Set(data.map(d => d.session_id).filter(Boolean)).size,
      events_by_type: {} as Record<string, number>,
      events_by_day: {} as Record<string, number>,
      top_events: [] as any[],
    };

    // Process events by type
    data.forEach(event => {
      summary.events_by_type[event.event] = (summary.events_by_type[event.event] || 0) + 1;
      
      const day = event.timestamp.split('T')[0];
      summary.events_by_day[day] = (summary.events_by_day[day] || 0) + 1;
    });

    // Get top events
    summary.top_events = Object.entries(summary.events_by_type)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([event, count]) => ({ event, count }));

    return summary;
  }

  private processPerformanceData(data: any[]): any {
    const summary = {
      total_metrics: data.length,
      metrics_by_name: {} as Record<string, { count: number; avg: number; min: number; max: number }>,
      performance_trends: {} as Record<string, any[]>,
    };

    // Process metrics by name
    data.forEach(metric => {
      if (!summary.metrics_by_name[metric.metric_name]) {
        summary.metrics_by_name[metric.metric_name] = {
          count: 0,
          avg: 0,
          min: Infinity,
          max: -Infinity,
        };
      }

      const m = summary.metrics_by_name[metric.metric_name];
      m.count++;
      m.avg = (m.avg * (m.count - 1) + metric.value) / m.count;
      m.min = Math.min(m.min, metric.value);
      m.max = Math.max(m.max, metric.value);
    });

    return summary;
  }

  // Cleanup
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Final flush
    this.flush();
  }
}

// Export singleton instance with error handling
export const analyticsService = (() => {
  try {
    return new AnalyticsService();
  } catch (error) {
    console.warn('AnalyticsService initialization failed:', error);
    return null;
  }
})();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    analyticsService.destroy();
  });
}