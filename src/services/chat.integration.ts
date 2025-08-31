// Integration utilities for ChatService with logging and monitoring

import { ChatService } from './chat.service';
import { ChatHealthMonitor, ChatSessionManager } from './chat.config';
import { N8nWebhookRequest, N8nWebhookResponse, DiagnosisError } from '@/types/diagnosis';
import { ServiceResponse } from '@/types/diagnosis-services';
import { isFeatureEnabled } from '@/lib/diagnosis-config';

/**
 * Enhanced ChatService with integrated logging and monitoring
 */
export class EnhancedChatService extends ChatService {
  private sessionCleanupInterval?: NodeJS.Timeout;

  constructor(options?: any) {
    super(options);
    this.setupSessionCleanup();
  }

  /**
   * Enhanced sendMessage with integrated monitoring
   */
  async sendMessage(request: N8nWebhookRequest): Promise<ServiceResponse<N8nWebhookResponse>> {
    // Update session activity
    if (request.session_id) {
      ChatSessionManager.updateActivity(request.session_id);
    }

    // Call parent method
    const result = await super.sendMessage(request);

    // Log analytics if enabled
    if (isFeatureEnabled('ENABLE_ANALYTICS')) {
      this.logAnalytics(request, result);
    }

    // Update health monitoring
    if (isFeatureEnabled('ENABLE_PERFORMANCE_MONITORING')) {
      this.updateHealthMonitoring(result);
    }

    return result;
  }

  /**
   * Starts a new chat session with monitoring
   */
  async startSession(userId: string, sessionId: string): Promise<ServiceResponse<N8nWebhookResponse>> {
    // Register session
    ChatSessionManager.registerSession(userId, sessionId);

    // Create initial request
    const request = this.createInitialRequest(userId, sessionId);

    // Send initial message
    const result = await this.sendMessage(request);

    // Log session start
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.log(`[ChatService] Session started: ${sessionId} for user: ${userId}`);
    }

    return result;
  }

  /**
   * Ends a chat session
   */
  endSession(sessionId: string): void {
    ChatSessionManager.removeSession(sessionId);

    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.log(`[ChatService] Session ended: ${sessionId}`);
    }
  }

  /**
   * Gets session information
   */
  getSessionInfo(sessionId: string) {
    return ChatSessionManager.getSession(sessionId);
  }

  /**
   * Gets user's active sessions
   */
  getUserSessions(userId: string) {
    return ChatSessionManager.getUserSessions(userId);
  }

  /**
   * Gets session statistics
   */
  getSessionStatistics() {
    return ChatSessionManager.getStatistics();
  }

  /**
   * Enhanced health check with monitoring
   */
  async healthCheck(): Promise<{ healthy: boolean; responseTime?: number; error?: string }> {
    const result = await super.healthCheck();

    // Record health check result
    ChatHealthMonitor.recordHealthCheck(
      result.healthy,
      result.responseTime || 0,
      result.error
    );

    return result;
  }

  /**
   * Gets health statistics
   */
  getHealthStats(timeRangeMs?: number) {
    return ChatHealthMonitor.getHealthStats(timeRangeMs);
  }

  /**
   * Checks if service is currently healthy
   */
  isServiceHealthy(thresholdMs?: number): boolean {
    return ChatHealthMonitor.isHealthy(thresholdMs);
  }

  /**
   * Sets up automatic session cleanup
   */
  private setupSessionCleanup(): void {
    // Clean up expired sessions every 5 minutes
    this.sessionCleanupInterval = setInterval(() => {
      const cleanedCount = ChatSessionManager.cleanupExpiredSessions();
      
      if (cleanedCount > 0 && isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
        console.log(`[ChatService] Cleaned up ${cleanedCount} expired sessions`);
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Logs analytics data
   */
  private logAnalytics(
    request: N8nWebhookRequest, 
    result: ServiceResponse<N8nWebhookResponse>
  ): void {
    const analyticsData = {
      event: 'chat_message',
      userId: request.user_id,
      sessionId: request.session_id,
      success: result.success,
      responseTime: result.metadata?.duration,
      timestamp: new Date(),
      messageLength: request.text.length,
      hasError: !result.success,
      errorType: result.error?.type,
    };

    // In a real implementation, this would send to an analytics service
    if (isFeatureEnabled('ENABLE_DETAILED_LOGGING')) {
      console.log('[ChatService] Analytics:', analyticsData);
    }
  }

  /**
   * Updates health monitoring
   */
  private updateHealthMonitoring(result: ServiceResponse<N8nWebhookResponse>): void {
    const responseTime = result.metadata?.duration || 0;
    const healthy = result.success;
    const error = result.error?.message;

    ChatHealthMonitor.recordHealthCheck(healthy, responseTime, error);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.sessionCleanupInterval) {
      clearInterval(this.sessionCleanupInterval);
    }
  }
}

/**
 * Chat service factory with monitoring
 */
export class ChatServiceFactory {
  private static instance: EnhancedChatService | null = null;

  /**
   * Gets singleton instance
   */
  static getInstance(options?: any): EnhancedChatService {
    if (!this.instance) {
      this.instance = new EnhancedChatService(options);
    }
    return this.instance;
  }

  /**
   * Creates new instance
   */
  static createInstance(options?: any): EnhancedChatService {
    return new EnhancedChatService(options);
  }

  /**
   * Destroys singleton instance
   */
  static destroyInstance(): void {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
  }
}

/**
 * Chat service middleware for request/response processing
 */
export class ChatServiceMiddleware {
  private middlewares: Array<{
    name: string;
    beforeRequest?: (request: N8nWebhookRequest) => Promise<N8nWebhookRequest>;
    afterResponse?: (
      request: N8nWebhookRequest, 
      response: ServiceResponse<N8nWebhookResponse>
    ) => Promise<ServiceResponse<N8nWebhookResponse>>;
  }> = [];

  /**
   * Adds middleware
   */
  use(middleware: {
    name: string;
    beforeRequest?: (request: N8nWebhookRequest) => Promise<N8nWebhookRequest>;
    afterResponse?: (
      request: N8nWebhookRequest, 
      response: ServiceResponse<N8nWebhookResponse>
    ) => Promise<ServiceResponse<N8nWebhookResponse>>;
  }): void {
    this.middlewares.push(middleware);
  }

  /**
   * Processes request through middleware chain
   */
  async processRequest(request: N8nWebhookRequest): Promise<N8nWebhookRequest> {
    let processedRequest = request;

    for (const middleware of this.middlewares) {
      if (middleware.beforeRequest) {
        processedRequest = await middleware.beforeRequest(processedRequest);
      }
    }

    return processedRequest;
  }

  /**
   * Processes response through middleware chain
   */
  async processResponse(
    request: N8nWebhookRequest,
    response: ServiceResponse<N8nWebhookResponse>
  ): Promise<ServiceResponse<N8nWebhookResponse>> {
    let processedResponse = response;

    for (const middleware of this.middlewares) {
      if (middleware.afterResponse) {
        processedResponse = await middleware.afterResponse(request, processedResponse);
      }
    }

    return processedResponse;
  }
}

/**
 * Built-in middleware functions
 */
export const ChatMiddlewares = {
  /**
   * Request sanitization middleware
   */
  sanitizeRequest: {
    name: 'sanitize-request',
    beforeRequest: async (request: N8nWebhookRequest): Promise<N8nWebhookRequest> => {
      return {
        ...request,
        text: request.text.trim().substring(0, 1000), // Limit message length
      };
    },
  },

  /**
   * Rate limiting middleware
   */
  rateLimit: {
    name: 'rate-limit',
    beforeRequest: async (request: N8nWebhookRequest): Promise<N8nWebhookRequest> => {
      // In a real implementation, this would check rate limits
      // For now, just pass through
      return request;
    },
  },

  /**
   * Error logging middleware
   */
  errorLogging: {
    name: 'error-logging',
    afterResponse: async (
      request: N8nWebhookRequest,
      response: ServiceResponse<N8nWebhookResponse>
    ): Promise<ServiceResponse<N8nWebhookResponse>> => {
      if (!response.success && response.error) {
        console.error('[ChatService] Error:', {
          userId: request.user_id,
          sessionId: request.session_id,
          error: response.error,
          timestamp: new Date().toISOString(),
        });
      }
      return response;
    },
  },

  /**
   * Performance monitoring middleware
   */
  performanceMonitoring: {
    name: 'performance-monitoring',
    afterResponse: async (
      request: N8nWebhookRequest,
      response: ServiceResponse<N8nWebhookResponse>
    ): Promise<ServiceResponse<N8nWebhookResponse>> => {
      if (isFeatureEnabled('ENABLE_PERFORMANCE_MONITORING') && response.metadata?.duration) {
        // Log slow requests
        if (response.metadata.duration > 5000) {
          console.warn('[ChatService] Slow request detected:', {
            duration: response.metadata.duration,
            userId: request.user_id,
            sessionId: request.session_id,
          });
        }
      }
      return response;
    },
  },
};

/**
 * Default enhanced chat service instance
 */
export const enhancedChatService = ChatServiceFactory.getInstance();