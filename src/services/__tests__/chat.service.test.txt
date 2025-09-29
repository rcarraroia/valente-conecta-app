// Chat service tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatService } from '../chat.service';
import { DiagnosisErrorType } from '@/types/diagnosis';

// Mock environment variables for tests
vi.mock('@/lib/diagnosis-config', () => ({
  diagnosisConfig: {
    supabase: {
      url: 'https://test.supabase.co',
      anonKey: 'test-key',
      storageBucket: 'test-bucket'
    },
    n8n: {
      webhookUrl: 'https://test-webhook.com',
      timeout: 30000
    },
    pdf: {
      maxSize: 10485760,
      allowedFormats: ['application/pdf']
    }
  },
  isFeatureEnabled: vi.fn(() => false),
  isDevelopment: false,
  isProduction: false,
  isDebugMode: false
}));

describe('ChatService', () => {
  let chatService: ChatService;
  let mockFetch: any;

  beforeEach(() => {
    // Mock fetch globally
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    chatService = new ChatService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const service = new ChatService();
      expect(service).toBeInstanceOf(ChatService);
    });

    it('should initialize with custom options', () => {
      const customOptions = {
        webhookUrl: 'https://custom-webhook.com',
        timeout: 60000,
        retryAttempts: 5,
        retryDelay: 2000,
      };

      const service = new ChatService(customOptions);
      expect(service).toBeInstanceOf(ChatService);
    });

    it('should throw error for invalid webhook URL', () => {
      expect(() => {
        new ChatService({ webhookUrl: 'invalid-url' });
      }).toThrow('Invalid webhook URL');
    });

    it('should throw error for invalid timeout', () => {
      expect(() => {
        new ChatService({ timeout: -1000 });
      }).toThrow('Timeout must be between 1000ms and 60000ms');
    });
  });

  describe('sendMessage', () => {
    const validRequest = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      text: 'Hello',
      session_id: 'session_123',
    };

    const validResponse = {
      response: 'Hello! How can I help you?',
      session_id: 'session_123',
      is_final: false,
    };

    it('should send message successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => validResponse,
      });

      const result = await chatService.sendMessage(validRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validResponse);
      expect(result.metadata?.duration).toBeGreaterThan(0);
    });

    it('should handle validation errors', async () => {
      const invalidRequest = {
        user_id: 'invalid-uuid',
        text: '',
        session_id: '',
      };

      const result = await chatService.sendMessage(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.NETWORK_ERROR);
      expect(result.error?.message).toContain('Invalid user ID format');
    });

    it('should handle network errors', async () => {
      // Mock all retry attempts to fail
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await chatService.sendMessage(validRequest);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.NETWORK_ERROR);
      expect(result.error?.retryable).toBe(true);
    }, 10000);

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'AbortError';
      // Mock all retry attempts to fail with timeout
      mockFetch.mockRejectedValue(timeoutError);

      const result = await chatService.sendMessage(validRequest);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(DiagnosisErrorType.WEBHOOK_TIMEOUT);
      expect(result.error?.retryable).toBe(true);
    }, 10000);
  });

  describe('validateWebhookResponse', () => {
    it('should validate correct response', () => {
      const validResponse = {
        response: 'Test response',
        session_id: 'session_123',
        is_final: false,
      };

      expect(chatService.validateWebhookResponse(validResponse)).toBe(true);
    });

    it('should reject invalid response', () => {
      const invalidResponse = {
        response: '',
        session_id: '',
      };

      expect(chatService.validateWebhookResponse(invalidResponse)).toBe(false);
    });

    it('should reject response without required fields', () => {
      const incompleteResponse = {
        response: 'Test response',
      };

      expect(chatService.validateWebhookResponse(incompleteResponse)).toBe(false);
    });
  });

  describe('createInitialRequest', () => {
    it('should create valid initial request', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const sessionId = 'session_123';

      const request = chatService.createInitialRequest(userId, sessionId);

      expect(request).toEqual({
        user_id: userId,
        text: 'iniciar',
        session_id: sessionId,
      });
    });
  });

  describe('metrics', () => {
    it('should initialize with zero metrics', () => {
      const metrics = chatService.getMetrics();

      expect(metrics.totalRequests).toBe(0);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.averageResponseTime).toBe(0);
    });

    it('should reset metrics', async () => {
      // Make a request to generate some metrics
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'Test',
          session_id: 'session_123',
          is_final: false,
        }),
      });

      await chatService.sendMessage({
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        text: 'Test',
        session_id: 'session_123',
      });

      const metricsBeforeReset = chatService.getMetrics();
      expect(metricsBeforeReset.totalRequests).toBeGreaterThan(0);

      chatService.resetMetrics();

      const metricsAfterReset = chatService.getMetrics();
      expect(metricsAfterReset.totalRequests).toBe(0);
      expect(metricsAfterReset.successfulRequests).toBe(0);
      expect(metricsAfterReset.failedRequests).toBe(0);
      expect(metricsAfterReset.averageResponseTime).toBe(0);
    });
  });

  describe('configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        webhookUrl: 'https://new-webhook.com',
        timeout: 45000,
      };

      chatService.updateConfiguration(newConfig);

      // Configuration should be updated (we can't directly test private properties)
      expect(() => chatService.updateConfiguration(newConfig)).not.toThrow();
    });

    it('should validate configuration on update', () => {
      const invalidConfig = {
        webhookUrl: 'invalid-url',
      };

      expect(() => {
        chatService.updateConfiguration(invalidConfig);
      }).toThrow('Invalid webhook URL');
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when service is available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      const health = await chatService.healthCheck();

      expect(health.healthy).toBe(true);
      expect(health.responseTime).toBeGreaterThanOrEqual(0);
      expect(health.error).toBeUndefined();
    });

    it('should return unhealthy status when service is unavailable', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const health = await chatService.healthCheck();

      expect(health.healthy).toBe(false);
      expect(health.responseTime).toBeGreaterThanOrEqual(0);
      expect(health.error).toBe('HTTP 500');
    });

    it('should handle network errors in health check', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const health = await chatService.healthCheck();

      expect(health.healthy).toBe(false);
      expect(health.responseTime).toBeGreaterThanOrEqual(0);
      expect(health.error).toBe('Network error');
    });
  });
});