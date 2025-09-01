// Chat service for n8n webhook communication

import { 
  ChatServiceInterface, 
  ChatServiceOptions, 
  ChatServiceMetrics,
  ServiceResponse 
} from '@/types/diagnosis-services';
import { 
  N8nWebhookRequest, 
  N8nWebhookResponse, 
  DiagnosisError,
  DiagnosisErrorType 
} from '@/types/diagnosis';
// Simple validation functions to avoid schema import issues
const validateN8nWebhookRequest = (request: any): void => {
  if (!request.user_id || typeof request.user_id !== 'string') {
    throw new Error('Invalid user ID');
  }
  if (!request.message || typeof request.message !== 'string') {
    throw new Error('Invalid message');
  }
  if (!request.session_id || typeof request.session_id !== 'string') {
    throw new Error('Invalid session ID');
  }
};

const validateN8nWebhookResponse = (response: any): boolean => {
  return response && 
         typeof response.message === 'string' && 
         response.message.length > 0 &&
         typeof response.session_id === 'string' &&
         response.session_id.length > 0;
};
// Simple utility functions to avoid import issues
const extractErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.toString) return error.toString();
  return 'Unknown error';
};

const createDiagnosisError = (type: DiagnosisErrorType, message: string, originalError?: any, retryable = false): DiagnosisError => {
  return {
    type,
    message,
    originalError,
    retryable,
    timestamp: new Date(),
  };
};

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  delay: number
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      
      // Wait with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError;
};
// Constants to avoid import issues
const N8N_CONFIG = {
  WEBHOOK_URL: '/api/webhook-proxy', // Always use proxy to avoid CORS
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000,
};

const DEFAULTS = {
  INITIAL_MESSAGE: 'Olá! Vou te ajudar com um pré-diagnóstico. Vamos começar?',
};

export class ChatService implements ChatServiceInterface {
  private options: ChatServiceOptions;
  private metrics: ChatServiceMetrics;
  private requestId: number = 0;

  constructor(options?: Partial<ChatServiceOptions>) {
    this.options = {
      webhookUrl: options?.webhookUrl || N8N_CONFIG.WEBHOOK_URL,
      timeout: options?.timeout || N8N_CONFIG.TIMEOUT,
      retryAttempts: options?.retryAttempts || N8N_CONFIG.RETRY_ATTEMPTS,
      retryDelay: options?.retryDelay || N8N_CONFIG.RETRY_DELAY,
    };

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
    };

    this.validateConfiguration();
  }

  /**
   * Validates the service configuration
   */
  private validateConfiguration(): void {
    if (!this.options.webhookUrl) {
      console.warn('Webhook URL is missing, using fallback');
      this.options.webhookUrl = '/api/webhook-proxy';
    }

    // Skip URL validation for relative paths (proxy)
    if (!this.options.webhookUrl.startsWith('/')) {
      try {
        new URL(this.options.webhookUrl);
      } catch (error) {
        console.warn('Invalid webhook URL, using fallback:', error);
        this.options.webhookUrl = '/api/webhook-proxy';
      }
    } else {
      console.log('Using relative URL (proxy):', this.options.webhookUrl);
    }

    if (this.options.timeout < 1000 || this.options.timeout > 60000) {
      console.warn('Invalid timeout, using default');
      this.options.timeout = 30000;
    }
  }

  /**
   * Sends a message to the n8n webhook
   */
  async sendMessage(request: N8nWebhookRequest): Promise<ServiceResponse<N8nWebhookResponse>> {
    const startTime = Date.now();
    const currentRequestId = ++this.requestId;

    try {
      // Validate request
      try {
        validateN8nWebhookRequest(request);
      } catch (validationError) {
        const error = createDiagnosisError(
          DiagnosisErrorType.NETWORK_ERROR,
          `Invalid request: ${extractErrorMessage(validationError)}`,
          validationError,
          false
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      this.logRequest(request, currentRequestId);

      // Send request with retry logic
      const response = await retryWithBackoff(
        () => this.makeHttpRequest(request),
        this.options.retryAttempts,
        this.options.retryDelay
      );

      // Validate response
      if (!this.validateWebhookResponse(response)) {
        const error = createDiagnosisError(
          DiagnosisErrorType.NETWORK_ERROR,
          'Invalid response format from n8n webhook',
          response,
          true
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      const duration = Date.now() - startTime;
      this.updateMetrics(true, duration);
      this.logResponse(response, currentRequestId, duration);

      return {
        success: true,
        data: response,
        metadata: {
          timestamp: new Date(),
          requestId: `req_${currentRequestId}`,
          duration,
        },
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.updateMetrics(false, duration);

      const diagnosisError = this.handleError(error);
      this.logError(diagnosisError, currentRequestId, duration);

      return this.createErrorResponse(diagnosisError, startTime, currentRequestId);
    }
  }

  /**
   * Makes the actual HTTP request to n8n webhook
   */
  private async makeHttpRequest(request: N8nWebhookRequest): Promise<N8nWebhookResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

    try {
      const response = await fetch(this.options.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Valente-Conecta-App/1.0',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      
      // Check for n8n workflow errors even in 200 responses
      if (data && data.error === 'workflow_inactive') {
        throw createDiagnosisError(
          DiagnosisErrorType.WEBHOOK_TIMEOUT,
          data.user_message || 'O sistema de diagnóstico está temporariamente indisponível.',
          { error: data, technical_details: data.technical_details },
          true
        );
      }

      if (!response.ok) {
        // Handle specific N8N workflow errors
        if (response.status === 500) {
          try {
            if (data.message && data.message.includes('Workflow could not be started')) {
              throw createDiagnosisError(
                DiagnosisErrorType.WEBHOOK_TIMEOUT,
                'O workflow de diagnóstico não está ativo. Verifique se o fluxo N8N está publicado e funcionando.',
                { status: response.status, error: data },
                true
              );
            }
          } catch (parseError) {
            // If we can't parse the error, fall back to generic error
          }
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return data as N8nWebhookResponse;

    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw createDiagnosisError(
          DiagnosisErrorType.WEBHOOK_TIMEOUT,
          `Request timed out after ${this.options.timeout}ms`,
          { timeout: this.options.timeout },
          true
        );
      }

      throw error;
    }
  }

  /**
   * Validates n8n webhook response
   */
  validateWebhookResponse(response: any): boolean {
    try {
      validateN8nWebhookResponse(response);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Creates initial request for starting a chat session
   */
  createInitialRequest(userId: string, sessionId: string): N8nWebhookRequest {
    return {
      user_id: userId,
      message: DEFAULTS.INITIAL_MESSAGE,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      message_history: [],
    };
  }

  /**
   * Handles and categorizes errors
   */
  private handleError(error: any): DiagnosisError {
    if (error && typeof error === 'object' && error.type && Object.values(DiagnosisErrorType).includes(error.type)) {
      return error;
    }

    const message = extractErrorMessage(error);

    // Network-related errors
    if (error.name === 'TypeError' && message.includes('fetch')) {
      return createDiagnosisError(
        DiagnosisErrorType.NETWORK_ERROR,
        'Network connection failed. Please check your internet connection.',
        error,
        true
      );
    }

    // Timeout errors
    if (error.name === 'AbortError' || message.includes('timeout')) {
      return createDiagnosisError(
        DiagnosisErrorType.WEBHOOK_TIMEOUT,
        'Request timed out. The server took too long to respond.',
        error,
        true
      );
    }

    // HTTP errors
    if (message.includes('HTTP')) {
      return createDiagnosisError(
        DiagnosisErrorType.NETWORK_ERROR,
        `Server error: ${message}`,
        error,
        true
      );
    }

    // Generic error
    return createDiagnosisError(
      DiagnosisErrorType.NETWORK_ERROR,
      message,
      error,
      true
    );
  }

  /**
   * Creates error response
   */
  private createErrorResponse(
    error: DiagnosisError, 
    startTime: number, 
    requestId: number
  ): ServiceResponse<N8nWebhookResponse> {
    return {
      success: false,
      error,
      metadata: {
        timestamp: new Date(),
        requestId: `req_${requestId}`,
        duration: Date.now() - startTime,
      },
    };
  }

  /**
   * Updates service metrics
   */
  private updateMetrics(success: boolean, duration: number): void {
    this.metrics.totalRequests++;
    this.metrics.lastRequestTime = new Date();

    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Update average response time
    const totalTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + duration;
    this.metrics.averageResponseTime = totalTime / this.metrics.totalRequests;
  }

  /**
   * Gets current service metrics
   */
  getMetrics(): ChatServiceMetrics {
    return { ...this.metrics };
  }

  /**
   * Resets service metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
    };
  }

  /**
   * Gets service configuration
   */
  getConfiguration(): ChatServiceOptions {
    return { ...this.options };
  }

  /**
   * Updates service configuration
   */
  updateConfiguration(options: Partial<ChatServiceOptions>): void {
    this.options = { ...this.options, ...options };
    this.validateConfiguration();
  }

  /**
   * Logs request (if debugging is enabled)
   */
  private logRequest(request: N8nWebhookRequest, requestId: number): void {
    if (import.meta.env.MODE === 'development') {
      console.log(`[ChatService] Request ${requestId}:`, {
        url: this.options.webhookUrl,
        payload: request,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Logs response (if debugging is enabled)
   */
  private logResponse(response: N8nWebhookResponse, requestId: number, duration: number): void {
    if (import.meta.env.MODE === 'development') {
      console.log(`[ChatService] Response ${requestId}:`, {
        response,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Logs error (if debugging is enabled)
   */
  private logError(error: DiagnosisError, requestId: number, duration: number): void {
    console.error(`[ChatService] Error ${requestId}:`, {
      error: {
        type: error.type,
        message: error.message,
        retryable: error.retryable,
      },
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{ healthy: boolean; responseTime?: number; error?: string }> {
    const startTime = Date.now();

    try {
      // Simple ping to check if webhook is reachable
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check

      const response = await fetch(this.options.webhookUrl, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      return {
        healthy: response.ok,
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };

    } catch (error: any) {
      return {
        healthy: false,
        responseTime: Date.now() - startTime,
        error: extractErrorMessage(error),
      };
    }
  }
}

// Factory function for creating ChatService instances
export const createChatService = (options?: Partial<ChatServiceOptions>): ChatService => {
  return new ChatService(options);
};

// Default ChatService instance - create with error handling
let chatServiceInstance: ChatService | null = null;

try {
  const webhookUrl = '/api/webhook-proxy'; // Always use proxy
    
  console.log('Initializing ChatService with URL:', webhookUrl);
  
  chatServiceInstance = new ChatService({
    webhookUrl,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 2000
  });
  
  console.log('✅ ChatService initialized successfully');
} catch (error) {
  console.warn('ChatService initialization failed:', error);
  // Try with fallback configuration
  try {
    const fallbackUrl = '/api/webhook-proxy';
      
    chatServiceInstance = new ChatService({
      webhookUrl: fallbackUrl,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 2000
    });
    
    console.log('✅ ChatService initialized with fallback');
  } catch (fallbackError) {
    console.error('❌ ChatService fallback initialization failed:', fallbackError);
    chatServiceInstance = null;
  }
}

export const chatService = chatServiceInstance;