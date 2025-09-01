// Chat service for n8n webhook communication

import { 
  ChatServiceInterface, 
  ChatServiceOptions, 
  ChatServiceMetrics,
  ServiceResponse 
} from '@/types/diagnosis-services';
import { 
  N8nWebhookResponse, 
  DiagnosisError,
  DiagnosisErrorType 
} from '@/types/diagnosis';
// Simple validation functions to avoid schema import issues

// Removed validateN8nWebhookResponse - n8n returns different format (output/mensagem)
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
  async sendMessage(request: any): Promise<ServiceResponse<N8nWebhookResponse>> {
    console.log('🎯 ChatService: sendMessage called with request:', request);
    const startTime = Date.now();
    const currentRequestId = ++this.requestId;

    try {
      // Validate request (simplified for n8n format)
      if (!request.chatInput || typeof request.chatInput !== 'string') {
        console.error('🎯 ChatService: Invalid request - missing chatInput:', request);
        const error = createDiagnosisError(
          DiagnosisErrorType.NETWORK_ERROR,
          'Invalid request: chatInput is required',
          request,
          false
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      console.log('🎯 ChatService: Request validation passed, proceeding with HTTP request');

      this.logRequest(request, currentRequestId);

      // Send request with retry logic
      const response = await retryWithBackoff(
        () => this.makeHttpRequest(request),
        this.options.retryAttempts,
        this.options.retryDelay
      );

      // Process n8n response format (array with output/mensagem)
      let processedResponse;
      if (Array.isArray(response) && response.length > 0) {
        const firstItem = response[0];
        processedResponse = {
          message: firstItem.output || firstItem.mensagem || firstItem.message || 'Resposta recebida',
          session_id: request.session_id,
          timestamp: new Date().toISOString()
        };
      } else if (response && typeof response === 'object') {
        processedResponse = {
          message: response.output || response.mensagem || response.message || 'Resposta recebida',
          session_id: request.session_id || response.session_id,
          timestamp: new Date().toISOString()
        };
      } else {
        const error = createDiagnosisError(
          DiagnosisErrorType.NETWORK_ERROR,
          'Invalid response format from n8n webhook',
          response,
          true
        );
        return this.createErrorResponse(error, startTime, currentRequestId);
      }

      response = processedResponse;

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
  private async makeHttpRequest(request: any): Promise<N8nWebhookResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);
    const requestTimestamp = new Date().toISOString();
    const requestId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`🚀 [${requestId}] [${requestTimestamp}] Making request to n8n:`, {
      url: this.options.webhookUrl,
      method: 'POST',
      body: request,
      timeout: this.options.timeout
    });
    
    // Log detailed request information
    console.log(`📝 [${requestId}] Request details:`, {
      chatInput: request.chatInput,
      user_id: request.user_id,
      session_id: request.session_id,
      timestamp: request.timestamp,
      messageLength: request.chatInput ? request.chatInput.length : 0
    });

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

      console.log(`📡 [${requestId}] Response received:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      // Always try to get response as text first
      const responseText = await response.text();
      console.log(`📄 [${requestId}] Response text:`, responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log(`📊 [${requestId}] Parsed response data:`, data);
      } catch (parseError) {
        console.error(`❌ [${requestId}] Failed to parse response as JSON:`, parseError);
        console.log(`📄 [${requestId}] Raw response:`, responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
      }
      
      // Check for service unavailable errors even in 200 responses
      if (data && data.error === 'service_unavailable') {
        throw createDiagnosisError(
          DiagnosisErrorType.WEBHOOK_TIMEOUT,
          data.user_message || 'O assistente de pré-diagnóstico está temporariamente indisponível.',
          { error: data },
          true
        );
      }

      // Check for empty response (n8n workflow not returning data)
      if (!data || (typeof data === 'object' && Object.keys(data).length === 0) || data === '') {
        throw createDiagnosisError(
          DiagnosisErrorType.WEBHOOK_TIMEOUT,
          'O workflow do n8n não está retornando resposta. Verifique se há um nó "Respond to Webhook" configurado.',
          { emptyResponse: true, responseText },
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
      
      console.error(`💥 [${requestId}] Request failed:`, {
        error: error.message,
        name: error.name,
        stack: error.stack,
        url: this.options.webhookUrl,
        requestBody: request
      });

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
   * Validates n8n webhook response - simplified for n8n format
   */
  validateWebhookResponse(response: any): boolean {
    // N8n returns array with output/mensagem or object with those fields
    if (Array.isArray(response) && response.length > 0) {
      const firstItem = response[0];
      return !!(firstItem.output || firstItem.mensagem || firstItem.message);
    }
    return !!(response && (response.output || response.mensagem || response.message));
  }

  /**
   * Creates initial request for starting a chat session
   */
  createInitialRequest(userId: string, sessionId: string): any {
    return {
      chatInput: DEFAULTS.INITIAL_MESSAGE,
      user_id: userId,
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
  private logRequest(request: any, requestId: number): void {
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