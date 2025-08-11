import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RetryStrategy } from '../retry-strategy';
import { IntegrationError, IntegrationErrorType } from '@/types/instituto-integration';

describe('RetryStrategy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('executeWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success');

      const result = await RetryStrategy.executeWithRetry(mockOperation);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new IntegrationError(IntegrationErrorType.NETWORK_ERROR, 'Network error', true))
        .mockRejectedValueOnce(new IntegrationError(IntegrationErrorType.SERVER_ERROR, 'Server error', true))
        .mockResolvedValue('success');

      const result = await RetryStrategy.executeWithRetry(mockOperation, { maxAttempts: 3 });

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValue(new IntegrationError(IntegrationErrorType.VALIDATION_ERROR, 'Validation error', false));

      await expect(RetryStrategy.executeWithRetry(mockOperation)).rejects.toThrow('Validation error');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should throw last error after max attempts', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValue(new IntegrationError(IntegrationErrorType.NETWORK_ERROR, 'Network error', true));

      await expect(RetryStrategy.executeWithRetry(mockOperation, { maxAttempts: 2 })).rejects.toThrow('Network error');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should use custom retry options', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new IntegrationError(IntegrationErrorType.NETWORK_ERROR, 'Network error', true))
        .mockResolvedValue('success');

      const result = await RetryStrategy.executeWithRetry(mockOperation, {
        maxAttempts: 5,
        baseDelay: 1000,
        backoffMultiplier: 1.5
      });

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });
  });

  describe('calculateDelay', () => {
    it('should calculate exponential backoff correctly', () => {
      const options = {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        jitter: false
      };

      expect(RetryStrategy.calculateDelay(1, options)).toBe(1000); // 1000 * 2^0
      expect(RetryStrategy.calculateDelay(2, options)).toBe(2000); // 1000 * 2^1
      expect(RetryStrategy.calculateDelay(3, options)).toBe(4000); // 1000 * 2^2
    });

    it('should respect maximum delay', () => {
      const options = {
        maxAttempts: 5,
        baseDelay: 1000,
        maxDelay: 3000,
        backoffMultiplier: 2,
        jitter: false
      };

      expect(RetryStrategy.calculateDelay(4, options)).toBe(3000); // Capped at maxDelay
    });

    it('should add jitter when enabled', () => {
      const options = {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        jitter: true
      };

      const delay1 = RetryStrategy.calculateDelay(1, options);
      const delay2 = RetryStrategy.calculateDelay(1, options);

      // With jitter, delays should be different (most of the time)
      // We'll just check they're in a reasonable range
      expect(delay1).toBeGreaterThan(800);
      expect(delay1).toBeLessThan(1200);
      expect(delay2).toBeGreaterThan(800);
      expect(delay2).toBeLessThan(1200);
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable IntegrationErrors', () => {
      const retryableError = new IntegrationError(IntegrationErrorType.NETWORK_ERROR, 'Network error', true);
      const nonRetryableError = new IntegrationError(IntegrationErrorType.VALIDATION_ERROR, 'Validation error', false);

      expect(RetryStrategy.isRetryableError(retryableError)).toBe(true);
      expect(RetryStrategy.isRetryableError(nonRetryableError)).toBe(false);
    });

    it('should identify retryable network errors', () => {
      const networkError = new TypeError('Failed to fetch');
      const timeoutError = new DOMException('Timeout', 'TimeoutError');
      const genericError = new Error('Generic error');

      expect(RetryStrategy.isRetryableError(networkError)).toBe(true);
      expect(RetryStrategy.isRetryableError(timeoutError)).toBe(true);
      expect(RetryStrategy.isRetryableError(genericError)).toBe(false);
    });
  });

  describe('getDelayForError', () => {
    it('should return appropriate delays for different error types', () => {
      const rateLimitError = new IntegrationError(IntegrationErrorType.RATE_LIMIT, 'Rate limit', true);
      const serverError = new IntegrationError(IntegrationErrorType.SERVER_ERROR, 'Server error', true);
      const networkError = new IntegrationError(IntegrationErrorType.NETWORK_ERROR, 'Network error', true);
      const genericError = new Error('Generic error');

      const rateLimitDelay = RetryStrategy.getDelayForError(rateLimitError, 1);
      const serverErrorDelay = RetryStrategy.getDelayForError(serverError, 1);
      const networkErrorDelay = RetryStrategy.getDelayForError(networkError, 1);
      const genericErrorDelay = RetryStrategy.getDelayForError(genericError, 1);

      // Rate limit errors should have longer delays
      expect(rateLimitDelay).toBeGreaterThan(serverErrorDelay);
      expect(serverErrorDelay).toBeGreaterThan(networkErrorDelay);
      expect(networkErrorDelay).toBeGreaterThan(0);
      expect(genericErrorDelay).toBeGreaterThan(0);
    });
  });
});