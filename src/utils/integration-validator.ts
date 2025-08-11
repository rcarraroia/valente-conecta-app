import { TestEnvironment } from './test-environment';
import { institutoIntegrationService } from '@/services/instituto-integration.service';
import { ErrorHandler } from './error-handler';
import { RateLimiter } from './rate-limiter';
import { InputSanitizer } from './input-sanitizer';
import { CredentialEncryption } from './encryption';

export interface ValidationResult {
  category: string;
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

export interface ValidationReport {
  timestamp: string;
  environment: string;
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: ValidationResult[];
  recommendations: string[];
}

export class IntegrationValidator {
  private results: ValidationResult[] = [];

  /**
   * Runs comprehensive validation of the integration system
   */
  async validateIntegration(): Promise<ValidationReport> {
    console.log('🔍 Starting integration validation...');
    
    this.results = [];

    // Run all validation categories
    await this.validateEnvironment();
    await this.validateSecurity();
    await this.validateDataHandling();
    await this.validateErrorHandling();
    await this.validatePerformance();
    await this.validateIntegrationFlow();

    return this.generateReport();
  }

  /**
   * Validates environment configuration
   */
  private async validateEnvironment(): Promise<void> {
    const category = 'Environment';

    // Test environment detection
    this.addResult(category, 'Environment Detection', 
      TestEnvironment.isEnabled(), 
      'Test environment should be properly detected'
    );

    // Test configuration
    try {
      TestEnvironment.configure({ mockResponses: true });
      this.addResult(category, 'Configuration', 
        TestEnvironment.isMockEnabled(), 
        'Test environment should accept configuration changes'
      );
    } catch (error) {
      this.addResult(category, 'Configuration', false, 
        `Configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test data generation
    try {
      const testData = TestEnvironment.generateTestUserData();
      const validation = TestEnvironment.validateTestData(testData);
      this.addResult(category, 'Test Data Generation', 
        validation.valid, 
        validation.valid ? 'Test data generation works correctly' : `Invalid test data: ${validation.errors.join(', ')}`
      );
    } catch (error) {
      this.addResult(category, 'Test Data Generation', false, 
        `Test data generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Reset environment
    TestEnvironment.reset();
  }

  /**
   * Validates security features
   */
  private async validateSecurity(): Promise<void> {
    const category = 'Security';

    // Test encryption
    try {
      const testData = { password: 'secret123', api_key: 'key123' };
      const encrypted = CredentialEncryption.encrypt(testData);
      const decrypted = CredentialEncryption.decrypt(encrypted);
      
      this.addResult(category, 'Encryption/Decryption', 
        decrypted.password === 'secret123' && decrypted.api_key === 'key123',
        'Encryption and decryption should work correctly'
      );
    } catch (error) {
      this.addResult(category, 'Encryption/Decryption', false, 
        `Encryption test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test input sanitization
    try {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = InputSanitizer.sanitizeUserInput(maliciousInput);
      
      this.addResult(category, 'Input Sanitization', 
        !sanitized.includes('<script>'),
        'Input sanitization should prevent XSS attacks'
      );
    } catch (error) {
      this.addResult(category, 'Input Sanitization', false, 
        `Sanitization test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test rate limiting
    try {
      const canMake1 = RateLimiter.canMakeRequest('test-user', { maxRequests: 2, windowMs: 60000 });
      const canMake2 = RateLimiter.canMakeRequest('test-user', { maxRequests: 2, windowMs: 60000 });
      const canMake3 = RateLimiter.canMakeRequest('test-user', { maxRequests: 2, windowMs: 60000 });
      
      this.addResult(category, 'Rate Limiting', 
        canMake1.allowed && canMake2.allowed && !canMake3.allowed,
        'Rate limiting should prevent excessive requests'
      );
      
      RateLimiter.clearLimits('test-user');
    } catch (error) {
      this.addResult(category, 'Rate Limiting', false, 
        `Rate limiting test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test encryption key validation
    const keyValidation = CredentialEncryption.validateEncryptionKey();
    this.addResult(category, 'Encryption Key Strength', 
      keyValidation,
      keyValidation ? 'Encryption key meets security requirements' : 'Encryption key is weak or default'
    );
  }

  /**
   * Validates data handling
   */
  private async validateDataHandling(): Promise<void> {
    const category = 'Data Handling';

    // Test CPF validation
    try {
      const validCPF = TestEnvironment.generateTestCPF();
      const testData = TestEnvironment.generateTestUserData({ cpf: validCPF });
      const validation = TestEnvironment.validateTestData(testData);
      
      const cpfErrors = validation.errors.filter(e => e.toLowerCase().includes('cpf'));
      this.addResult(category, 'CPF Validation', 
        cpfErrors.length === 0,
        'Generated CPFs should be valid'
      );
    } catch (error) {
      this.addResult(category, 'CPF Validation', false, 
        `CPF validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test email validation
    try {
      const testCases = [
        { email: 'valid@example.com', shouldPass: true },
        { email: 'invalid-email', shouldPass: false },
        { email: 'test@', shouldPass: false },
        { email: '@example.com', shouldPass: false }
      ];

      let allPassed = true;
      for (const testCase of testCases) {
        const testData = TestEnvironment.generateTestUserData({ email: testCase.email });
        const validation = TestEnvironment.validateTestData(testData);
        const emailErrors = validation.errors.filter(e => e.toLowerCase().includes('email'));
        
        const passed = testCase.shouldPass ? emailErrors.length === 0 : emailErrors.length > 0;
        if (!passed) {
          allPassed = false;
          break;
        }
      }

      this.addResult(category, 'Email Validation', 
        allPassed,
        'Email validation should correctly identify valid and invalid emails'
      );
    } catch (error) {
      this.addResult(category, 'Email Validation', false, 
        `Email validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test phone validation
    try {
      const testCases = [
        { phone: '11999999999', shouldPass: true },
        { phone: '1199999999', shouldPass: true },
        { phone: '123', shouldPass: false },
        { phone: '123456789012345', shouldPass: false }
      ];

      let allPassed = true;
      for (const testCase of testCases) {
        const testData = TestEnvironment.generateTestUserData({ telefone: testCase.phone });
        const validation = TestEnvironment.validateTestData(testData);
        const phoneErrors = validation.errors.filter(e => e.toLowerCase().includes('phone'));
        
        const passed = testCase.shouldPass ? phoneErrors.length === 0 : phoneErrors.length > 0;
        if (!passed) {
          allPassed = false;
          break;
        }
      }

      this.addResult(category, 'Phone Validation', 
        allPassed,
        'Phone validation should correctly identify valid and invalid phone numbers'
      );
    } catch (error) {
      this.addResult(category, 'Phone Validation', false, 
        `Phone validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validates error handling
   */
  private async validateErrorHandling(): Promise<void> {
    const category = 'Error Handling';

    // Test error reporting
    try {
      const testError = new Error('Test error for validation');
      const report = ErrorHandler.handleError(testError, { operation: 'validation_test' });
      
      this.addResult(category, 'Error Reporting', 
        report.id && report.message === 'Test error for validation',
        'Error handler should properly log and track errors'
      );
    } catch (error) {
      this.addResult(category, 'Error Reporting', false, 
        `Error reporting failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test error statistics
    try {
      ErrorHandler.handleError(new Error('Test error 1'), {}, 'error');
      ErrorHandler.handleError(new Error('Test warning 1'), {}, 'warning');
      
      const stats = ErrorHandler.getStats();
      
      this.addResult(category, 'Error Statistics', 
        stats.total > 0 && stats.byLevel.error > 0,
        'Error statistics should be collected and accessible'
      );
    } catch (error) {
      this.addResult(category, 'Error Statistics', false, 
        `Error statistics failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test error cleanup
    try {
      const initialCount = ErrorHandler.getReports().length;
      const cleaned = ErrorHandler.clearOldReports(0); // Clear all
      const finalCount = ErrorHandler.getReports().length;
      
      this.addResult(category, 'Error Cleanup', 
        finalCount < initialCount,
        'Error cleanup should remove old error reports'
      );
    } catch (error) {
      this.addResult(category, 'Error Cleanup', false, 
        `Error cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validates performance characteristics
   */
  private async validatePerformance(): Promise<void> {
    const category = 'Performance';

    // Test mock response time
    try {
      TestEnvironment.configure({ 
        enabled: true, 
        mockResponses: true, 
        delayMs: 100,
        logRequests: false 
      });

      const testData = TestEnvironment.generateTestUserData();
      const startTime = Date.now();
      
      await TestEnvironment.simulateApiResponse(testData);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.addResult(category, 'Mock Response Time', 
        duration >= 90 && duration <= 200, // Allow some variance
        `Mock responses should respect configured delay (expected ~100ms, got ${duration}ms)`
      );
      
      TestEnvironment.reset();
    } catch (error) {
      this.addResult(category, 'Mock Response Time', false, 
        `Performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test rate limiter performance
    try {
      const iterations = 1000;
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        RateLimiter.canMakeRequest(`user-${i}`, { maxRequests: 10, windowMs: 60000 });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      const avgTime = duration / iterations;
      
      this.addResult(category, 'Rate Limiter Performance', 
        avgTime < 1, // Should be less than 1ms per check
        `Rate limiter should be fast (${avgTime.toFixed(3)}ms per check)`
      );
      
      RateLimiter.cleanup();
    } catch (error) {
      this.addResult(category, 'Rate Limiter Performance', false, 
        `Rate limiter performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validates integration flow
   */
  private async validateIntegrationFlow(): Promise<void> {
    const category = 'Integration Flow';

    // Test successful flow
    try {
      TestEnvironment.configure({ 
        enabled: true, 
        mockResponses: true, 
        failureRate: 0,
        logRequests: false 
      });

      const testData = TestEnvironment.generateTestUserData();
      const result = await institutoIntegrationService.sendUserData(testData, 'validation-user');
      
      this.addResult(category, 'Successful Integration', 
        result.success === true,
        'Integration should complete successfully with valid data'
      );
    } catch (error) {
      this.addResult(category, 'Successful Integration', false, 
        `Integration flow failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test failure handling
    try {
      TestEnvironment.configure({ 
        enabled: true, 
        mockResponses: true, 
        failureRate: 1, // Force failure
        logRequests: false 
      });

      const testData = TestEnvironment.generateTestUserData();
      const result = await institutoIntegrationService.sendUserData(testData, 'validation-user-fail');
      
      this.addResult(category, 'Failure Handling', 
        result.success === false && result.error,
        'Integration should handle failures gracefully'
      );
    } catch (error) {
      this.addResult(category, 'Failure Handling', false, 
        `Failure handling test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test statistics
    try {
      const stats = await institutoIntegrationService.getStats();
      
      this.addResult(category, 'Statistics Collection', 
        typeof stats === 'object' && stats !== null,
        'Integration statistics should be available'
      );
    } catch (error) {
      this.addResult(category, 'Statistics Collection', false, 
        `Statistics test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    TestEnvironment.reset();
  }

  /**
   * Adds a validation result
   */
  private addResult(category: string, test: string, passed: boolean, message: string, details?: any): void {
    this.results.push({
      category,
      test,
      passed,
      message,
      details
    });
  }

  /**
   * Generates comprehensive validation report
   */
  private generateReport(): ValidationReport {
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = this.results.filter(r => !r.passed).length;
    const totalTests = this.results.length;

    let overallStatus: 'PASS' | 'FAIL' | 'WARNING';
    if (failedTests === 0) {
      overallStatus = 'PASS';
    } else if (failedTests / totalTests > 0.5) {
      overallStatus = 'FAIL';
    } else {
      overallStatus = 'WARNING';
    }

    const recommendations = this.generateRecommendations();

    return {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      overallStatus,
      totalTests,
      passedTests,
      failedTests,
      results: this.results,
      recommendations
    };
  }

  /**
   * Generates recommendations based on validation results
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const failedResults = this.results.filter(r => !r.passed);

    // Security recommendations
    const securityFailures = failedResults.filter(r => r.category === 'Security');
    if (securityFailures.length > 0) {
      recommendations.push('Review security configuration and ensure encryption keys are properly set');
    }

    // Performance recommendations
    const performanceFailures = failedResults.filter(r => r.category === 'Performance');
    if (performanceFailures.length > 0) {
      recommendations.push('Optimize performance-critical components and consider caching strategies');
    }

    // Data handling recommendations
    const dataFailures = failedResults.filter(r => r.category === 'Data Handling');
    if (dataFailures.length > 0) {
      recommendations.push('Review data validation rules and ensure all edge cases are handled');
    }

    // Integration flow recommendations
    const integrationFailures = failedResults.filter(r => r.category === 'Integration Flow');
    if (integrationFailures.length > 0) {
      recommendations.push('Test integration with actual API endpoints in sandbox environment');
    }

    // Environment recommendations
    const envFailures = failedResults.filter(r => r.category === 'Environment');
    if (envFailures.length > 0) {
      recommendations.push('Verify environment configuration and test data generation');
    }

    // General recommendations
    if (failedResults.length > 0) {
      recommendations.push('Run validation again after addressing failed tests');
      recommendations.push('Consider adding monitoring and alerting for production deployment');
    }

    if (recommendations.length === 0) {
      recommendations.push('All validations passed! The integration is ready for deployment.');
      recommendations.push('Consider running load tests with higher volumes before production use.');
    }

    return recommendations;
  }

  /**
   * Exports validation report as JSON
   */
  static exportReport(report: ValidationReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Prints validation report to console
   */
  static printReport(report: ValidationReport): void {
    console.log('\n🔍 Integration Validation Report');
    console.log('================================');
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Environment: ${report.environment}`);
    console.log(`Overall Status: ${report.overallStatus}`);
    console.log(`Tests: ${report.passedTests}/${report.totalTests} passed`);
    
    if (report.failedTests > 0) {
      console.log(`\n❌ Failed Tests (${report.failedTests}):`);
      report.results.filter(r => !r.passed).forEach(result => {
        console.log(`  • ${result.category} - ${result.test}: ${result.message}`);
      });
    }

    console.log('\n📋 Recommendations:');
    report.recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });

    console.log('\n================================\n');
  }
}