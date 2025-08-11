import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestEnvironment } from '../test-environment';

describe('TestEnvironment', () => {
  beforeEach(() => {
    TestEnvironment.reset();
  });

  afterEach(() => {
    TestEnvironment.reset();
  });

  describe('configuration', () => {
    it('should configure test environment', () => {
      TestEnvironment.configure({
        mockResponses: true,
        delayMs: 2000,
        failureRate: 0.5,
        logRequests: false
      });

      expect(TestEnvironment.isMockEnabled()).toBe(true);
    });

    it('should check if test environment is enabled', () => {
      const isEnabled = TestEnvironment.isEnabled();
      expect(typeof isEnabled).toBe('boolean');
    });

    it('should check if mock is enabled', () => {
      TestEnvironment.configure({ mockResponses: true });
      expect(TestEnvironment.isMockEnabled()).toBe(true);

      TestEnvironment.configure({ mockResponses: false });
      expect(TestEnvironment.isMockEnabled()).toBe(false);
    });
  });

  describe('test data generation', () => {
    it('should generate valid test user data', () => {
      const userData = TestEnvironment.generateTestUserData();

      expect(userData.nome).toMatch(/^Usuário Teste/);
      expect(userData.email).toMatch(/^teste\d+@exemplo\.com$/);
      expect(userData.telefone).toMatch(/^11\d{9}$/);
      expect(userData.cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
      expect(userData.origem_cadastro).toBe('visao_itinerante');
      expect(userData.consentimento_data_sharing).toBe(true);
      expect(userData.created_at).toBeDefined();
    });

    it('should generate test user data with overrides', () => {
      const overrides = {
        nome: 'João Teste',
        email: 'joao@teste.com'
      };

      const userData = TestEnvironment.generateTestUserData(overrides);

      expect(userData.nome).toBe('João Teste');
      expect(userData.email).toBe('joao@teste.com');
      expect(userData.origem_cadastro).toBe('visao_itinerante');
    });

    it('should generate valid test CPF', () => {
      const cpf = TestEnvironment.generateTestCPF();

      expect(cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
      
      // Validate CPF algorithm
      const cleanCPF = cpf.replace(/\D/g, '');
      expect(cleanCPF).toHaveLength(11);
      
      // Should not be all same digits
      expect(/^(\d)\1{10}$/.test(cleanCPF)).toBe(false);
    });

    it('should generate test API configuration', () => {
      const config = TestEnvironment.generateTestApiConfig();

      expect(config.endpoint).toBe('https://sandbox-api.instituto.com/users');
      expect(config.method).toBe('POST');
      expect(config.auth_type).toBe('api_key');
      expect(config.api_key).toBe('test-api-key-123');
      expect(config.is_sandbox).toBe(true);
      expect(config.is_active).toBe(true);
    });

    it('should generate test API configuration with overrides', () => {
      const overrides = {
        endpoint: 'https://custom-test.com/api',
        method: 'PUT' as const
      };

      const config = TestEnvironment.generateTestApiConfig(overrides);

      expect(config.endpoint).toBe('https://custom-test.com/api');
      expect(config.method).toBe('PUT');
      expect(config.auth_type).toBe('api_key'); // Default value
    });
  });

  describe('mock responses', () => {
    beforeEach(() => {
      TestEnvironment.configure({ 
        enabled: true, 
        mockResponses: true,
        logRequests: false // Disable logs for cleaner test output
      });
    });

    it('should simulate successful API response', async () => {
      TestEnvironment.configure({ failureRate: 0 }); // Force success
      
      const userData = TestEnvironment.generateTestUserData();
      const result = await TestEnvironment.simulateApiResponse(userData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.log_id).toMatch(/^mock-log-/);
    });

    it('should simulate failed API response', async () => {
      TestEnvironment.configure({ failureRate: 1 }); // Force failure
      
      const userData = TestEnvironment.generateTestUserData();
      const result = await TestEnvironment.simulateApiResponse(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.log_id).toMatch(/^mock-log-/);
    });

    it('should respect delay configuration', async () => {
      const delay = 100;
      TestEnvironment.configure({ delayMs: delay });
      
      const userData = TestEnvironment.generateTestUserData();
      const startTime = Date.now();
      
      await TestEnvironment.simulateApiResponse(userData);
      
      const endTime = Date.now();
      const actualDelay = endTime - startTime;
      
      expect(actualDelay).toBeGreaterThanOrEqual(delay - 10); // Allow small margin
    });

    it('should add custom mock response', () => {
      const customResponse = {
        success: true,
        data: { custom: 'response' },
        delay: 500
      };

      TestEnvironment.addMockResponse('custom_test', customResponse);
      
      const responseTypes = TestEnvironment.getMockResponseTypes();
      expect(responseTypes).toContain('custom_test');
    });

    it('should force specific mock response', async () => {
      TestEnvironment.configure({ failureRate: 0 }); // Default to success
      TestEnvironment.forceMockResponse('validation_error');
      
      const userData = TestEnvironment.generateTestUserData();
      const result = await TestEnvironment.simulateApiResponse(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('MOCK');
    });

    it('should throw error when mock is not enabled', async () => {
      TestEnvironment.configure({ mockResponses: false });
      
      const userData = TestEnvironment.generateTestUserData();
      
      await expect(TestEnvironment.simulateApiResponse(userData))
        .rejects.toThrow('Mock responses are not enabled');
    });
  });

  describe('data validation', () => {
    it('should validate correct test data', () => {
      const userData = TestEnvironment.generateTestUserData();
      const validation = TestEnvironment.validateTestData(userData);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid CPF format', () => {
      const userData = TestEnvironment.generateTestUserData({
        cpf: '123.456.789'
      });
      
      const validation = TestEnvironment.validateTestData(userData);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid CPF format');
    });

    it('should detect invalid email format', () => {
      const userData = TestEnvironment.generateTestUserData({
        email: 'invalid-email'
      });
      
      const validation = TestEnvironment.validateTestData(userData);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid email format');
    });

    it('should detect invalid phone format', () => {
      const userData = TestEnvironment.generateTestUserData({
        telefone: '123'
      });
      
      const validation = TestEnvironment.validateTestData(userData);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid phone format');
    });
  });

  describe('test report generation', () => {
    it('should generate comprehensive test report', () => {
      TestEnvironment.configure({
        mockResponses: true,
        delayMs: 1500,
        failureRate: 0.2
      });

      const report = TestEnvironment.generateTestReport();

      expect(report.environment).toBeDefined();
      expect(report.config).toBeDefined();
      expect(report.config.mockResponses).toBe(true);
      expect(report.config.delayMs).toBe(1500);
      expect(report.config.failureRate).toBe(0.2);
      expect(report.mockResponseTypes).toBeInstanceOf(Array);
      expect(report.sampleTestData).toBeDefined();
      expect(report.timestamp).toBeDefined();
    });
  });

  describe('reset functionality', () => {
    it('should reset to default configuration', () => {
      // Change configuration
      TestEnvironment.configure({
        mockResponses: true,
        delayMs: 5000,
        failureRate: 0.8,
        logRequests: false
      });

      // Reset
      TestEnvironment.reset();

      // Check if reset to defaults
      expect(TestEnvironment.isMockEnabled()).toBe(false);
      
      const report = TestEnvironment.generateTestReport();
      expect(report.config.delayMs).toBe(1000);
      expect(report.config.failureRate).toBe(0);
      expect(report.config.logRequests).toBe(true);
    });
  });
});