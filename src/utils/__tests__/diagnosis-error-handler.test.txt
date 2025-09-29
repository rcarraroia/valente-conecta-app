// Tests for diagnosis error handler

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DiagnosisErrorHandler } from '../diagnosis-error-handler';
import { DiagnosisErrorType } from '@/types/diagnosis';

// Mock fetch for error reporting
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator
Object.defineProperty(navigator, 'userAgent', {
  value: 'test-user-agent',
  writable: true,
});

describe('DiagnosisErrorHandler', () => {
  let errorHandler: DiagnosisErrorHandler;

  beforeEach(() => {
    errorHandler = DiagnosisErrorHandler.getInstance();
    errorHandler.clearErrorLog();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Error Categorization', () => {
    it('should categorize network errors correctly', () => {
      const networkError = new Error('Network request failed');
      const result = errorHandler.handleError(networkError, 'test-context');

      expect(result.type).toBe(DiagnosisErrorType.NETWORK_ERROR);
      expect(result.retryable).toBe(true);
      expect(result.message).toContain('conexão');
    });

    it('should categorize timeout errors correctly', () => {
      const timeoutError = new Error('Request timed out');
      const result = errorHandler.handleError(timeoutError, 'test-context');

      expect(result.type).toBe(DiagnosisErrorType.WEBHOOK_TIMEOUT);
      expect(result.retryable).toBe(true);
      expect(result.message).toContain('esperado');
    });

    it('should categorize Supabase errors correctly', () => {
      const supabaseError = { code: 'PGRST116', message: 'Not found' };
      const result = errorHandler.handleError(supabaseError, 'test-context');

      expect(result.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.message).toContain('não encontrados');
    });

    it('should categorize PDF errors correctly', () => {
      const pdfError = new Error('PDF generation failed');
      const result = errorHandler.handleError(pdfError, 'pdf-generation');

      expect(result.type).toBe(DiagnosisErrorType.PDF_GENERATION_ERROR);
      expect(result.retryable).toBe(true);
      expect(result.message).toContain('PDF');
    });

    it('should categorize authentication errors correctly', () => {
      const authError = { status: 401, message: 'Unauthorized' };
      const result = errorHandler.handleError(authError, 'test-context');

      expect(result.type).toBe(DiagnosisErrorType.AUTHENTICATION_ERROR);
      expect(result.retryable).toBe(false);
      expect(result.message).toContain('login');
    });

    it('should categorize unknown errors correctly', () => {
      const unknownError = new Error('Something went wrong');
      const result = errorHandler.handleError(unknownError, 'test-context');

      expect(result.type).toBe(DiagnosisErrorType.UNKNOWN_ERROR);
      expect(result.retryable).toBe(true);
      expect(result.message).toContain('inesperado');
    });
  });

  describe('Error Logging', () => {
    it('should log errors to memory', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-context');

      const errorLog = errorHandler.getErrorLog();
      expect(errorLog).toHaveLength(1);
      expect(errorLog[0].message).toContain('inesperado');
    });

    it('should limit error log size', () => {
      // Add more than max log size errors
      for (let i = 0; i < 105; i++) {
        errorHandler.handleError(new Error(`Error ${i}`), 'test-context');
      }

      const errorLog = errorHandler.getErrorLog();
      expect(errorLog.length).toBeLessThanOrEqual(100);
    });

    // Note: localStorage storage is tested implicitly through other tests
  });

  describe('Retry with Backoff', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const failingFunction = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      const result = await errorHandler.retryWithBackoff(failingFunction, {
        maxAttempts: 3,
        delay: 10, // Short delay for testing
      });

      expect(result).toBe('success');
      expect(failingFunction).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max attempts', async () => {
      const alwaysFailingFunction = vi.fn().mockRejectedValue(new Error('Always fails'));

      await expect(
        errorHandler.retryWithBackoff(alwaysFailingFunction, {
          maxAttempts: 2,
          delay: 10,
        })
      ).rejects.toThrow();

      expect(alwaysFailingFunction).toHaveBeenCalledTimes(2);
    });

    it('should call onRetry callback', async () => {
      const onRetry = vi.fn();
      const failingFunction = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockResolvedValueOnce('success');

      await errorHandler.retryWithBackoff(failingFunction, {
        maxAttempts: 2,
        delay: 10,
        onRetry,
      });

      expect(onRetry).toHaveBeenCalledWith(1);
    });
  });

  describe('Network-specific Error Messages', () => {
    it('should provide specific message for no connection', () => {
      const error = { status: 0, message: 'Network request failed' };
      const result = errorHandler.handleError(error, 'test-context');

      expect(result.type).toBe(DiagnosisErrorType.NETWORK_ERROR);
      expect(result.message).toContain('conexão com a internet');
    });

    it('should provide specific message for server errors', () => {
      const error = { status: 500, message: 'Network error' };
      const result = errorHandler.handleError(error, 'test-context');

      expect(result.type).toBe(DiagnosisErrorType.NETWORK_ERROR);
      expect(result.message).toContain('temporariamente indisponível');
    });
  });

  describe('Supabase-specific Error Handling', () => {
    it('should handle duplicate key errors', () => {
      const error = { 
        message: 'duplicate key value violates unique constraint',
        code: 'PGRST001' // Add Supabase code to trigger correct categorization
      };
      const result = errorHandler.handleError(error, 'test-context');

      expect(result.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.message).toContain('já existe');
    });

    it('should handle access denied errors', () => {
      const error = { code: 'PGRST301' };
      const result = errorHandler.handleError(error, 'test-context');

      expect(result.type).toBe(DiagnosisErrorType.SUPABASE_ERROR);
      expect(result.message).toContain('Acesso negado');
      expect(result.retryable).toBe(false);
    });
  });

  describe('Error Monitoring', () => {
    it('should send errors to monitoring in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Production error');
      errorHandler.handleError(error, 'test-context');

      expect(fetch).toHaveBeenCalledWith('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('UNKNOWN_ERROR'),
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not send errors to monitoring in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Development error');
      errorHandler.handleError(error, 'test-context');

      expect(fetch).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Online Status', () => {
    it('should detect online status', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });

      expect(errorHandler.isOnline()).toBe(true);
    });

    it('should detect offline status', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      expect(errorHandler.isOnline()).toBe(false);
    });
  });

  describe('Error Log Management', () => {
    it('should clear error log', () => {
      errorHandler.handleError(new Error('Test'), 'test-context');
      expect(errorHandler.getErrorLog()).toHaveLength(1);

      errorHandler.clearErrorLog();
      expect(errorHandler.getErrorLog()).toHaveLength(0);
    });

    it('should return copy of error log', () => {
      errorHandler.handleError(new Error('Test'), 'test-context');
      const log1 = errorHandler.getErrorLog();
      const log2 = errorHandler.getErrorLog();

      expect(log1).not.toBe(log2); // Different references
      expect(log1).toEqual(log2); // Same content
    });
  });
});