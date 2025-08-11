import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestEnvironment } from '@/utils/test-environment';
import { institutoIntegrationService } from '@/services/instituto-integration.service';
import { useInstitutoIntegration } from '@/hooks/useInstitutoIntegration';
import { InstitutoUserData } from '@/types/instituto-integration';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'config-123',
              endpoint: 'https://sandbox-api.instituto.com/users',
              method: 'POST',
              auth_type: 'api_key',
              encrypted_credentials: JSON.stringify({ api_key: 'test-key' }),
              is_sandbox: true,
              is_active: true,
              retry_attempts: 3,
              retry_delay: 5000
            },
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: 'log-123' },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    })),
    rpc: vi.fn(() => Promise.resolve({
      data: {
        total_attempts: 10,
        successful_sends: 8,
        failed_sends: 2,
        pending_retries: 1,
        success_rate: 80,
        last_24h_attempts: 5,
        last_24h_success_rate: 100
      },
      error: null
    }))
  }
}));

// Mock auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
    isAuthenticated: true
  })
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Instituto Integration E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestEnvironment.reset();
  });

  afterEach(() => {
    TestEnvironment.reset();
  });

  describe('Complete Integration Flow', () => {
    it('should complete full integration flow with mock environment', async () => {
      // Configure test environment
      TestEnvironment.configure({
        enabled: true,
        mockResponses: true,
        delayMs: 100,
        failureRate: 0,
        logRequests: false
      });

      // Generate test data
      const testUserData = TestEnvironment.generateTestUserData({
        nome: 'João Silva E2E Test',
        email: 'joao.e2e@teste.com'
      });

      // Test the complete flow
      const result = await institutoIntegrationService.sendUserData(testUserData, 'user-123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.log_id).toBeDefined();
    });

    it('should handle validation errors in complete flow', async () => {
      TestEnvironment.configure({
        enabled: true,
        mockResponses: true,
        logRequests: false
      });

      // Invalid user data
      const invalidUserData: InstitutoUserData = {
        nome: '', // Empty name
        email: 'invalid-email', // Invalid email
        telefone: '123', // Invalid phone
        cpf: '123', // Invalid CPF
        origem_cadastro: 'visao_itinerante',
        consentimento_data_sharing: true,
        created_at: new Date().toISOString()
      };

      const result = await institutoIntegrationService.sendUserData(invalidUserData, 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Dados inválidos');
    });

    it('should handle network errors gracefully', async () => {
      TestEnvironment.configure({
        enabled: true,
        mockResponses: true,
        failureRate: 1, // Force failure
        logRequests: false
      });

      TestEnvironment.forceMockResponse('network_error');

      const testUserData = TestEnvironment.generateTestUserData();
      const result = await institutoIntegrationService.sendUserData(testUserData, 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('MOCK');
    });

    it('should respect rate limiting', async () => {
      TestEnvironment.configure({
        enabled: true,
        mockResponses: true,
        logRequests: false
      });

      const testUserData = TestEnvironment.generateTestUserData();
      const userId = 'rate-limit-test-user';

      // Make multiple requests to trigger rate limiting
      const results = [];
      for (let i = 0; i < 6; i++) { // Exceed the limit of 5
        const result = await institutoIntegrationService.sendUserData(testUserData, userId);
        results.push(result);
      }

      // At least one should be rate limited
      const rateLimitedResults = results.filter(r => !r.success && r.error?.includes('Limite'));
      expect(rateLimitedResults.length).toBeGreaterThan(0);
    });
  });

  describe('Hook Integration Tests', () => {
    const TestComponent = () => {
      const { sendRegistrationData, isSending, sendError, lastSendResult } = useInstitutoIntegration();

      const handleTest = () => {
        sendRegistrationData.mutate({
          name: 'Test User',
          email: 'test@example.com',
          phone: '11999999999',
          cpf: '123.456.789-01',
          consent_data_sharing: true
        });
      };

      return (
        <div>
          <button onClick={handleTest} disabled={isSending}>
            {isSending ? 'Enviando...' : 'Enviar Dados'}
          </button>
          {sendError && <div data-testid="error">{sendError.message}</div>}
          {lastSendResult && (
            <div data-testid="result">
              {lastSendResult.success ? 'Sucesso' : 'Falha'}
            </div>
          )}
        </div>
      );
    };

    it('should handle successful registration through hook', async () => {
      TestEnvironment.configure({
        enabled: true,
        mockResponses: true,
        failureRate: 0,
        logRequests: false
      });

      render(<TestComponent />, { wrapper: createWrapper() });

      const button = screen.getByText('Enviar Dados');
      fireEvent.click(button);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Enviando...')).toBeInTheDocument();
      });

      // Should show success result
      await waitFor(() => {
        expect(screen.getByTestId('result')).toHaveTextContent('Sucesso');
      }, { timeout: 3000 });
    });

    it('should handle failed registration through hook', async () => {
      TestEnvironment.configure({
        enabled: true,
        mockResponses: true,
        failureRate: 1, // Force failure
        logRequests: false
      });

      render(<TestComponent />, { wrapper: createWrapper() });

      const button = screen.getByText('Enviar Dados');
      fireEvent.click(button);

      // Should show error
      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Data Validation Tests', () => {
    it('should validate all required fields', () => {
      const testCases = [
        { field: 'nome', value: '', shouldFail: true },
        { field: 'nome', value: 'João Silva', shouldFail: false },
        { field: 'email', value: 'invalid-email', shouldFail: true },
        { field: 'email', value: 'joao@example.com', shouldFail: false },
        { field: 'telefone', value: '123', shouldFail: true },
        { field: 'telefone', value: '11999999999', shouldFail: false },
        { field: 'cpf', value: '123', shouldFail: true },
        { field: 'cpf', value: '123.456.789-01', shouldFail: false }
      ];

      testCases.forEach(({ field, value, shouldFail }) => {
        const testData = TestEnvironment.generateTestUserData({
          [field]: value
        });

        const validation = TestEnvironment.validateTestData(testData);

        if (shouldFail) {
          expect(validation.valid).toBe(false);
          expect(validation.errors.length).toBeGreaterThan(0);
        } else {
          // Note: This might still fail due to other fields, but the specific field should be valid
          const fieldSpecificErrors = validation.errors.filter(error => 
            error.toLowerCase().includes(field.toLowerCase())
          );
          expect(fieldSpecificErrors.length).toBe(0);
        }
      });
    });

    it('should generate valid test CPFs', () => {
      // Generate multiple CPFs and validate them
      for (let i = 0; i < 10; i++) {
        const cpf = TestEnvironment.generateTestCPF();
        const testData = TestEnvironment.generateTestUserData({ cpf });
        const validation = TestEnvironment.validateTestData(testData);
        
        const cpfErrors = validation.errors.filter(error => 
          error.toLowerCase().includes('cpf')
        );
        expect(cpfErrors.length).toBe(0);
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      TestEnvironment.configure({
        enabled: true,
        mockResponses: true,
        delayMs: 50,
        failureRate: 0,
        logRequests: false
      });

      const concurrentRequests = 5;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        const testData = TestEnvironment.generateTestUserData({
          email: `concurrent-test-${i}@example.com`
        });
        promises.push(
          institutoIntegrationService.sendUserData(testData, `user-${i}`)
        );
      }

      const results = await Promise.all(promises);

      // All requests should complete
      expect(results).toHaveLength(concurrentRequests);
      
      // Most should succeed (allowing for some rate limiting)
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBeGreaterThan(0);
    });

    it('should complete requests within reasonable time', async () => {
      TestEnvironment.configure({
        enabled: true,
        mockResponses: true,
        delayMs: 100,
        failureRate: 0,
        logRequests: false
      });

      const testData = TestEnvironment.generateTestUserData();
      const startTime = Date.now();

      await institutoIntegrationService.sendUserData(testData, 'user-123');

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (allowing for some overhead)
      expect(duration).toBeLessThan(1000); // 1 second max
    });
  });

  describe('Error Recovery Tests', () => {
    it('should recover from temporary failures', async () => {
      TestEnvironment.configure({
        enabled: true,
        mockResponses: true,
        logRequests: false
      });

      const testData = TestEnvironment.generateTestUserData();

      // First request fails
      TestEnvironment.forceMockResponse('server_error');
      const failResult = await institutoIntegrationService.sendUserData(testData, 'user-123');
      expect(failResult.success).toBe(false);

      // Second request succeeds
      TestEnvironment.forceMockResponse('success');
      const successResult = await institutoIntegrationService.sendUserData(testData, 'user-123');
      expect(successResult.success).toBe(true);
    });
  });

  describe('Configuration Tests', () => {
    it('should validate API configuration', async () => {
      const validConfig = TestEnvironment.generateTestApiConfig();
      const isValid = await institutoIntegrationService.validateConfig(validConfig);
      
      // In test environment, this should return true for valid config
      expect(typeof isValid).toBe('boolean');
    });

    it('should handle invalid API configuration', async () => {
      const invalidConfig = TestEnvironment.generateTestApiConfig({
        endpoint: 'invalid-url'
      });

      const isValid = await institutoIntegrationService.validateConfig(invalidConfig);
      expect(isValid).toBe(false);
    });
  });

  describe('Statistics Tests', () => {
    it('should return integration statistics', async () => {
      const stats = await institutoIntegrationService.getStats();

      expect(stats).toBeDefined();
      expect(typeof stats.total_attempts).toBe('number');
      expect(typeof stats.successful_sends).toBe('number');
      expect(typeof stats.failed_sends).toBe('number');
      expect(typeof stats.success_rate).toBe('number');
    });
  });
});