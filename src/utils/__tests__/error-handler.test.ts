import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorHandler } from '../error-handler';
import { IntegrationError, IntegrationErrorType } from '@/types/instituto-integration';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn()
  }
}));

describe('ErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear error reports before each test
    ErrorHandler.clearOldReports(0);
  });

  afterEach(() => {
    ErrorHandler.clearOldReports(0);
  });

  describe('handleError', () => {
    it('should handle string errors', () => {
      const errorMessage = 'Test error message';
      const report = ErrorHandler.handleError(errorMessage);

      expect(report.message).toBe(errorMessage);
      expect(report.level).toBe('error');
      expect(report.id).toMatch(/^err_/);
      expect(report.timestamp).toBeDefined();
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const report = ErrorHandler.handleError(error);

      expect(report.message).toBe('Test error');
      expect(report.error).toBe(error);
      expect(report.stack).toBe(error.stack);
    });

    it('should include context information', () => {
      const error = new Error('Test error');
      const context = {
        userId: 'user123',
        operation: 'test_operation',
        component: 'TestComponent',
        metadata: { key: 'value' }
      };

      const report = ErrorHandler.handleError(error, context);

      expect(report.context).toEqual(expect.objectContaining({
        userId: 'user123',
        operation: 'test_operation',
        component: 'TestComponent'
      }));
    });

    it('should sanitize sensitive context data', () => {
      const error = new Error('Test error');
      const context = {
        metadata: {
          password: 'secret123',
          email: 'test@example.com',
          normalField: 'normal value'
        }
      };

      const report = ErrorHandler.handleError(error, context);

      expect(report.context?.metadata?.password).toBe('***');
      expect(report.context?.metadata?.email).toMatch(/te\*\*\*@example\.com/);
      expect(report.context?.metadata?.normalField).toBe('normal value');
    });

    it('should handle different error levels', () => {
      const error = new Error('Test error');
      
      const errorReport = ErrorHandler.handleError(error, {}, 'error');
      const warningReport = ErrorHandler.handleError(error, {}, 'warning');
      const infoReport = ErrorHandler.handleError(error, {}, 'info');

      expect(errorReport.level).toBe('error');
      expect(warningReport.level).toBe('warning');
      expect(infoReport.level).toBe('info');
    });
  });

  describe('handleIntegrationError', () => {
    it('should handle integration errors with enhanced context', () => {
      const integrationError = new IntegrationError(
        IntegrationErrorType.NETWORK_ERROR,
        'Network connection failed',
        true,
        500
      );

      const report = ErrorHandler.handleIntegrationError(integrationError, {
        userId: 'user123'
      });

      expect(report.context?.operation).toBe('instituto_integration');
      expect(report.context?.errorType).toBe(IntegrationErrorType.NETWORK_ERROR);
      expect(report.context?.retryable).toBe(true);
      expect(report.context?.statusCode).toBe(500);
    });
  });

  describe('handleNetworkError', () => {
    it('should identify connectivity issues', () => {
      const networkError = new Error('Failed to fetch');
      const report = ErrorHandler.handleNetworkError(networkError);

      expect(report.context?.operation).toBe('network_request');
      expect(report.context?.networkError).toBe(true);
      expect(report.context?.metadata?.connectivity).toBe('poor');
    });

    it('should handle timeout errors', () => {
      const timeoutError = new Error('Request timeout');
      const report = ErrorHandler.handleNetworkError(timeoutError);

      expect(report.context?.networkError).toBe(true);
    });
  });

  describe('handleValidationError', () => {
    it('should handle field validation errors', () => {
      const fieldErrors = {
        email: 'Email is required',
        password: 'Password must be at least 6 characters'
      };

      const report = ErrorHandler.handleValidationError(fieldErrors);

      expect(report.level).toBe('warning');
      expect(report.message).toContain('email, password');
      expect(report.context?.operation).toBe('validation');
      expect(report.context?.fieldErrors).toEqual(fieldErrors);
    });
  });

  describe('getReports', () => {
    it('should return recent error reports', () => {
      ErrorHandler.handleError('Error 1');
      ErrorHandler.handleError('Error 2');
      ErrorHandler.handleError('Error 3');

      const reports = ErrorHandler.getReports(2);

      expect(reports).toHaveLength(2);
      expect(reports[0].message).toBe('Error 2');
      expect(reports[1].message).toBe('Error 3');
    });

    it('should return all reports when limit is higher than total', () => {
      ErrorHandler.handleError('Error 1');
      ErrorHandler.handleError('Error 2');

      const reports = ErrorHandler.getReports(10);

      expect(reports).toHaveLength(2);
    });
  });

  describe('getStats', () => {
    it('should return error statistics', () => {
      ErrorHandler.handleError('Error 1', {}, 'error');
      ErrorHandler.handleError('Warning 1', {}, 'warning');
      ErrorHandler.handleError('Info 1', {}, 'info');
      ErrorHandler.handleError('Error 2', { operation: 'test_op' }, 'error');

      const stats = ErrorHandler.getStats();

      expect(stats.total).toBe(4);
      expect(stats.byLevel.error).toBe(2);
      expect(stats.byLevel.warning).toBe(1);
      expect(stats.byLevel.info).toBe(1);
      expect(stats.byOperation.test_op).toBe(1);
    });

    it('should count recent errors correctly', () => {
      // Create an error that would be considered recent
      ErrorHandler.handleError('Recent error', {}, 'error');

      const stats = ErrorHandler.getStats();

      expect(stats.recentErrors).toBe(1);
    });
  });

  describe('clearOldReports', () => {
    it('should clear old reports', () => {
      ErrorHandler.handleError('Error 1');
      ErrorHandler.handleError('Error 2');

      const initialCount = ErrorHandler.getReports().length;
      expect(initialCount).toBe(2);

      const cleared = ErrorHandler.clearOldReports(0); // Clear all
      expect(cleared).toBe(2);

      const remainingCount = ErrorHandler.getReports().length;
      expect(remainingCount).toBe(0);
    });
  });

  describe('listeners', () => {
    it('should notify listeners when errors occur', () => {
      const listener = vi.fn();
      ErrorHandler.addListener(listener);

      const error = new Error('Test error');
      ErrorHandler.handleError(error);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          level: 'error'
        })
      );

      ErrorHandler.removeListener(listener);
    });

    it('should remove listeners correctly', () => {
      const listener = vi.fn();
      ErrorHandler.addListener(listener);
      ErrorHandler.removeListener(listener);

      ErrorHandler.handleError('Test error');

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('exportReports', () => {
    it('should export sanitized reports as JSON', () => {
      ErrorHandler.handleError('Test error', {
        metadata: {
          password: 'secret',
          email: 'test@example.com'
        }
      });

      const exported = ErrorHandler.exportReports();
      const reports = JSON.parse(exported);

      expect(reports).toHaveLength(1);
      expect(reports[0].message).toBe('Test error');
      expect(reports[0].context.metadata.password).toBe('***');
    });
  });

  describe('logInfo and logWarning', () => {
    it('should log info messages', () => {
      const report = ErrorHandler.logInfo('Info message', { operation: 'test' });

      expect(report.level).toBe('info');
      expect(report.message).toBe('Info message');
    });

    it('should log warning messages', () => {
      const report = ErrorHandler.logWarning('Warning message', { operation: 'test' });

      expect(report.level).toBe('warning');
      expect(report.message).toBe('Warning message');
    });
  });
});