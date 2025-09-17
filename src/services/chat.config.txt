// Configuration and utilities for ChatService

import { ChatServiceOptions } from '@/types/diagnosis-services';
import { N8nWebhookRequest, N8nWebhookResponse } from '@/types/diagnosis';
import { N8N_CONFIG, DEFAULTS } from '@/lib/diagnosis-constants';
import { diagnosisConfig } from '@/lib/diagnosis-config';

/**
 * Default ChatService configuration
 */
export const DEFAULT_CHAT_CONFIG: ChatServiceOptions = {
  webhookUrl: diagnosisConfig.n8n.webhookUrl,
  timeout: diagnosisConfig.n8n.timeout,
  retryAttempts: N8N_CONFIG.RETRY_ATTEMPTS,
  retryDelay: N8N_CONFIG.RETRY_DELAY,
};

/**
 * Development ChatService configuration
 */
export const DEV_CHAT_CONFIG: ChatServiceOptions = {
  ...DEFAULT_CHAT_CONFIG,
  timeout: 10000, // Shorter timeout for development
  retryAttempts: 1, // Fewer retries for faster feedback
};

/**
 * Production ChatService configuration
 */
export const PROD_CHAT_CONFIG: ChatServiceOptions = {
  ...DEFAULT_CHAT_CONFIG,
  timeout: 30000, // Longer timeout for production
  retryAttempts: 3, // More retries for reliability
};

/**
 * Chat message templates
 */
export const CHAT_TEMPLATES = {
  INITIAL_MESSAGE: DEFAULTS.INITIAL_MESSAGE,
  GREETING: 'Olá! Sou seu assistente de pré-diagnóstico. Como posso ajudá-lo hoje?',
  ERROR_RETRY: 'Desculpe, ocorreu um erro. Vou tentar novamente.',
  SESSION_EXPIRED: 'Sua sessão expirou. Vamos começar uma nova conversa.',
  FINAL_MESSAGE: 'Obrigado por usar nosso serviço de pré-diagnóstico!',
} as const;

/**
 * Request/Response utilities
 */
export class ChatRequestBuilder {
  /**
   * Creates a standard chat request
   */
  static createChatRequest(
    userId: string,
    message: string,
    sessionId?: string
  ): N8nWebhookRequest {
    return {
      user_id: userId,
      text: message.trim(),
      session_id: sessionId,
    };
  }

  /**
   * Creates an initial session request
   */
  static createInitialRequest(
    userId: string,
    sessionId: string
  ): N8nWebhookRequest {
    return {
      user_id: userId,
      text: CHAT_TEMPLATES.INITIAL_MESSAGE,
      session_id: sessionId,
    };
  }

  /**
   * Creates a retry request
   */
  static createRetryRequest(
    originalRequest: N8nWebhookRequest
  ): N8nWebhookRequest {
    return {
      ...originalRequest,
      // Add retry indicator if needed
    };
  }
}

/**
 * Response utilities
 */
export class ChatResponseHandler {
  /**
   * Checks if response indicates session completion
   */
  static isSessionComplete(response: N8nWebhookResponse): boolean {
    return response.is_final === true || !!response.diagnosis_data;
  }

  /**
   * Checks if response contains an error
   */
  static hasError(response: N8nWebhookResponse): boolean {
    return !!response.error;
  }

  /**
   * Extracts error message from response
   */
  static getErrorMessage(response: N8nWebhookResponse): string | null {
    return response.error || null;
  }

  /**
   * Gets the AI response text
   */
  static getResponseText(response: N8nWebhookResponse): string {
    return response.response || '';
  }

  /**
   * Gets diagnosis data if available
   */
  static getDiagnosisData(response: N8nWebhookResponse) {
    return response.diagnosis_data || null;
  }

  /**
   * Formats response for display
   */
  static formatResponse(response: N8nWebhookResponse): {
    text: string;
    isComplete: boolean;
    hasError: boolean;
    diagnosisData?: any;
  } {
    return {
      text: this.getResponseText(response),
      isComplete: this.isSessionComplete(response),
      hasError: this.hasError(response),
      diagnosisData: this.getDiagnosisData(response),
    };
  }
}

/**
 * Chat session utilities
 */
export class ChatSessionManager {
  private static activeSessions = new Map<string, {
    userId: string;
    sessionId: string;
    startTime: Date;
    lastActivity: Date;
    messageCount: number;
  }>();

  /**
   * Registers a new chat session
   */
  static registerSession(userId: string, sessionId: string): void {
    this.activeSessions.set(sessionId, {
      userId,
      sessionId,
      startTime: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
    });
  }

  /**
   * Updates session activity
   */
  static updateActivity(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      session.messageCount++;
    }
  }

  /**
   * Removes a session
   */
  static removeSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }

  /**
   * Gets session info
   */
  static getSession(sessionId: string) {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Gets all active sessions for a user
   */
  static getUserSessions(userId: string) {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId);
  }

  /**
   * Cleans up expired sessions
   */
  static cleanupExpiredSessions(maxAgeMs: number = 30 * 60 * 1000): number {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > maxAgeMs) {
        this.activeSessions.delete(sessionId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Gets session statistics
   */
  static getStatistics() {
    const sessions = Array.from(this.activeSessions.values());
    const now = new Date();

    return {
      totalSessions: sessions.length,
      uniqueUsers: new Set(sessions.map(s => s.userId)).size,
      averageMessageCount: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + s.messageCount, 0) / sessions.length 
        : 0,
      averageSessionDuration: sessions.length > 0
        ? sessions.reduce((sum, s) => sum + (now.getTime() - s.startTime.getTime()), 0) / sessions.length
        : 0,
    };
  }
}

/**
 * Chat service health monitoring
 */
export class ChatHealthMonitor {
  private static healthHistory: Array<{
    timestamp: Date;
    healthy: boolean;
    responseTime: number;
    error?: string;
  }> = [];

  /**
   * Records a health check result
   */
  static recordHealthCheck(
    healthy: boolean, 
    responseTime: number, 
    error?: string
  ): void {
    this.healthHistory.push({
      timestamp: new Date(),
      healthy,
      responseTime,
      error,
    });

    // Keep only last 100 records
    if (this.healthHistory.length > 100) {
      this.healthHistory = this.healthHistory.slice(-100);
    }
  }

  /**
   * Gets health statistics
   */
  static getHealthStats(timeRangeMs: number = 60 * 60 * 1000) {
    const cutoff = new Date(Date.now() - timeRangeMs);
    const recentChecks = this.healthHistory.filter(
      check => check.timestamp >= cutoff
    );

    if (recentChecks.length === 0) {
      return {
        totalChecks: 0,
        healthyChecks: 0,
        healthRate: 0,
        averageResponseTime: 0,
        lastCheck: null,
      };
    }

    const healthyChecks = recentChecks.filter(check => check.healthy);
    const totalResponseTime = recentChecks.reduce(
      (sum, check) => sum + check.responseTime, 
      0
    );

    return {
      totalChecks: recentChecks.length,
      healthyChecks: healthyChecks.length,
      healthRate: healthyChecks.length / recentChecks.length,
      averageResponseTime: totalResponseTime / recentChecks.length,
      lastCheck: recentChecks[recentChecks.length - 1],
    };
  }

  /**
   * Checks if service is currently healthy
   */
  static isHealthy(thresholdMs: number = 5 * 60 * 1000): boolean {
    const stats = this.getHealthStats(thresholdMs);
    return stats.healthRate >= 0.8 && stats.averageResponseTime < 10000;
  }
}

/**
 * Gets appropriate configuration based on environment
 */
export const getChatServiceConfig = (): ChatServiceOptions => {
  if (process.env.NODE_ENV === 'development') {
    return DEV_CHAT_CONFIG;
  }
  
  if (process.env.NODE_ENV === 'production') {
    return PROD_CHAT_CONFIG;
  }
  
  return DEFAULT_CHAT_CONFIG;
};

/**
 * Validates chat service configuration
 */
export const validateChatConfig = (config: ChatServiceOptions): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!config.webhookUrl) {
    errors.push('Webhook URL is required');
  } else {
    try {
      new URL(config.webhookUrl);
    } catch {
      errors.push('Invalid webhook URL format');
    }
  }

  if (config.timeout < 1000 || config.timeout > 60000) {
    errors.push('Timeout must be between 1000ms and 60000ms');
  }

  if (config.retryAttempts < 0 || config.retryAttempts > 10) {
    errors.push('Retry attempts must be between 0 and 10');
  }

  if (config.retryDelay < 100 || config.retryDelay > 10000) {
    errors.push('Retry delay must be between 100ms and 10000ms');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};