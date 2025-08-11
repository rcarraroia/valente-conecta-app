import { InstitutoUserData, InstitutoApiConfig, IntegrationResult } from '@/types/instituto-integration';

export interface TestConfig {
  enabled: boolean;
  mockResponses: boolean;
  delayMs: number;
  failureRate: number; // 0-1, percentage of requests that should fail
  logRequests: boolean;
}

export interface MockApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  delay?: number;
}

export class TestEnvironment {
  private static config: TestConfig = {
    enabled: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',
    mockResponses: false,
    delayMs: 1000,
    failureRate: 0,
    logRequests: true
  };

  private static mockResponses: Record<string, MockApiResponse> = {
    success: {
      success: true,
      data: { 
        id: 'mock-instituto-123', 
        status: 'created',
        message: 'Usuário cadastrado com sucesso no Instituto (MOCK)'
      }
    },
    validation_error: {
      success: false,
      error: 'Dados inválidos: CPF já cadastrado (MOCK)',
      delay: 500
    },
    network_error: {
      success: false,
      error: 'Erro de conexão com a API do Instituto (MOCK)',
      delay: 2000
    },
    server_error: {
      success: false,
      error: 'Erro interno do servidor do Instituto (MOCK)',
      delay: 1500
    },
    rate_limit: {
      success: false,
      error: 'Limite de requisições excedido (MOCK)',
      delay: 100
    }
  };

  /**
   * Configures the test environment
   */
  static configure(config: Partial<TestConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.config.logRequests) {
      console.log('Test Environment configured:', this.config);
    }
  }

  /**
   * Checks if test environment is enabled
   */
  static isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Checks if mock responses are enabled
   */
  static isMockEnabled(): boolean {
    return this.config.enabled && this.config.mockResponses;
  }

  /**
   * Generates test user data
   */
  static generateTestUserData(overrides: Partial<InstitutoUserData> = {}): InstitutoUserData {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    
    return {
      nome: `Usuário Teste ${randomId}`,
      email: `teste${timestamp}@exemplo.com`,
      telefone: `11${Math.floor(Math.random() * 900000000 + 100000000)}`,
      cpf: this.generateTestCPF(),
      origem_cadastro: 'visao_itinerante',
      consentimento_data_sharing: true,
      created_at: new Date().toISOString(),
      ...overrides
    };
  }

  /**
   * Generates a valid test CPF
   */
  static generateTestCPF(): string {
    // Generate a valid CPF for testing
    const digits = [];
    
    // Generate first 9 digits
    for (let i = 0; i < 9; i++) {
      digits.push(Math.floor(Math.random() * 10));
    }
    
    // Calculate first verification digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    digits.push(remainder);
    
    // Calculate second verification digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    digits.push(remainder);
    
    // Format as CPF
    const cpf = digits.join('');
    return `${cpf.substr(0, 3)}.${cpf.substr(3, 3)}.${cpf.substr(6, 3)}-${cpf.substr(9, 2)}`;
  }

  /**
   * Generates test API configuration
   */
  static generateTestApiConfig(overrides: Partial<InstitutoApiConfig> = {}): InstitutoApiConfig {
    return {
      endpoint: 'https://sandbox-api.instituto.com/users',
      method: 'POST',
      auth_type: 'api_key',
      api_key: 'test-api-key-123',
      sandbox_endpoint: 'https://sandbox-api.instituto.com/users',
      is_sandbox: true,
      retry_attempts: 3,
      retry_delay: 5000,
      is_active: true,
      ...overrides
    };
  }

  /**
   * Simulates API response based on configuration
   */
  static async simulateApiResponse(userData: InstitutoUserData): Promise<IntegrationResult> {
    if (!this.isMockEnabled()) {
      throw new Error('Mock responses are not enabled');
    }

    if (this.config.logRequests) {
      console.log('🧪 Test Environment: Simulating API request', {
        userData: this.sanitizeUserDataForLog(userData),
        config: this.config
      });
    }

    // Determine if this request should fail based on failure rate
    const shouldFail = Math.random() < this.config.failureRate;
    
    let responseType: string;
    if (shouldFail) {
      // Randomly choose a failure type
      const failureTypes = ['validation_error', 'network_error', 'server_error', 'rate_limit'];
      responseType = failureTypes[Math.floor(Math.random() * failureTypes.length)];
    } else {
      responseType = 'success';
    }

    const mockResponse = this.mockResponses[responseType];
    const delay = mockResponse.delay || this.config.delayMs;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, delay));

    if (this.config.logRequests) {
      console.log(`🧪 Test Environment: Returning ${responseType} response after ${delay}ms`);
    }

    return {
      success: mockResponse.success,
      data: mockResponse.data,
      error: mockResponse.error,
      log_id: `mock-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * Adds custom mock response
   */
  static addMockResponse(key: string, response: MockApiResponse): void {
    this.mockResponses[key] = response;
    
    if (this.config.logRequests) {
      console.log(`🧪 Test Environment: Added mock response '${key}'`, response);
    }
  }

  /**
   * Gets available mock response types
   */
  static getMockResponseTypes(): string[] {
    return Object.keys(this.mockResponses);
  }

  /**
   * Forces a specific mock response for the next request
   */
  static forceMockResponse(responseType: string): void {
    if (!this.mockResponses[responseType]) {
      throw new Error(`Mock response type '${responseType}' not found`);
    }

    // Temporarily set failure rate to force the response
    const originalFailureRate = this.config.failureRate;
    
    if (responseType === 'success') {
      this.config.failureRate = 0;
    } else {
      this.config.failureRate = 1;
      // Store the forced response type
      (this as any).forcedResponseType = responseType;
    }

    // Reset after a short delay
    setTimeout(() => {
      this.config.failureRate = originalFailureRate;
      delete (this as any).forcedResponseType;
    }, 100);
  }

  /**
   * Validates test data against production constraints
   */
  static validateTestData(userData: InstitutoUserData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for test markers in production
    if (process.env.NODE_ENV === 'production') {
      if (userData.email.includes('teste') || userData.email.includes('test')) {
        errors.push('Test email detected in production environment');
      }
      
      if (userData.nome.toLowerCase().includes('teste') || userData.nome.toLowerCase().includes('test')) {
        errors.push('Test name detected in production environment');
      }
    }

    // Validate CPF format
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(userData.cpf)) {
      errors.push('Invalid CPF format');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.push('Invalid email format');
    }

    // Validate phone format
    const phoneRegex = /^\d{10,11}$/;
    const cleanPhone = userData.telefone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      errors.push('Invalid phone format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Creates a test report
   */
  static generateTestReport(): {
    environment: string;
    config: TestConfig;
    mockResponseTypes: string[];
    sampleTestData: InstitutoUserData;
    timestamp: string;
  } {
    return {
      environment: process.env.NODE_ENV || 'unknown',
      config: this.config,
      mockResponseTypes: this.getMockResponseTypes(),
      sampleTestData: this.generateTestUserData(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Resets test environment to defaults
   */
  static reset(): void {
    this.config = {
      enabled: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',
      mockResponses: false,
      delayMs: 1000,
      failureRate: 0,
      logRequests: true
    };

    if (this.config.logRequests) {
      console.log('🧪 Test Environment: Reset to defaults');
    }
  }

  // Private helper methods

  private static sanitizeUserDataForLog(userData: InstitutoUserData): any {
    return {
      nome: userData.nome,
      email: userData.email.replace(/(.{2}).*@/, '$1***@'),
      telefone: userData.telefone.replace(/(\d{2}).*(\d{2})/, '$1***$2'),
      cpf: userData.cpf.replace(/(\d{3}).*(\d{2})/, '$1***$2'),
      origem_cadastro: userData.origem_cadastro,
      consentimento_data_sharing: userData.consentimento_data_sharing
    };
  }
}

// Auto-configure based on environment variables
if (typeof window !== 'undefined') {
  // Browser environment
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('mock') === 'true') {
    TestEnvironment.configure({ mockResponses: true });
  }
  
  if (urlParams.get('test_delay')) {
    const delay = parseInt(urlParams.get('test_delay') || '1000');
    TestEnvironment.configure({ delayMs: delay });
  }
  
  if (urlParams.get('failure_rate')) {
    const rate = parseFloat(urlParams.get('failure_rate') || '0');
    TestEnvironment.configure({ failureRate: Math.max(0, Math.min(1, rate)) });
  }
}

// Export for global access in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).TestEnvironment = TestEnvironment;
}