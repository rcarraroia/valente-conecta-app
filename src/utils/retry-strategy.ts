import { IntegrationError, IntegrationErrorType } from '@/types/instituto-integration';

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

export class RetryStrategy {
  private static readonly DEFAULT_OPTIONS: RetryOptions = {
    maxAttempts: 3,
    baseDelay: 5000, // 5 seconds
    maxDelay: 300000, // 5 minutes
    backoffMultiplier: 2,
    jitter: true
  };

  /**
   * Executes an operation with retry logic
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    let lastError: Error;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if it's not a retryable error
        if (error instanceof IntegrationError && !error.retryable) {
          throw error;
        }
        
        // Don't retry on the last attempt
        if (attempt === config.maxAttempts) {
          break;
        }
        
        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, config);
        
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error);
        
        await this.delay(delay);
      }
    }
    
    throw lastError!;
  }

  /**
   * Calculates delay for retry attempt with exponential backoff
   */
  static calculateDelay(attempt: number, options: RetryOptions): number {
    // Calculate exponential backoff
    let delay = options.baseDelay * Math.pow(options.backoffMultiplier, attempt - 1);
    
    // Apply maximum delay limit
    delay = Math.min(delay, options.maxDelay);
    
    // Add jitter to prevent thundering herd
    if (options.jitter) {
      const jitterAmount = delay * 0.1; // 10% jitter
      delay += (Math.random() - 0.5) * 2 * jitterAmount;
    }
    
    return Math.floor(delay);
  }

  /**
   * Determines if an error is retryable
   */
  static isRetryableError(error: Error): boolean {
    if (error instanceof IntegrationError) {
      return error.retryable;
    }
    
    // Network errors are generally retryable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }
    
    // Timeout errors are retryable
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return true;
    }
    
    return false;
  }

  /**
   * Gets retry delay based on error type
   */
  static getDelayForError(error: Error, attempt: number): number {
    let baseDelay = this.DEFAULT_OPTIONS.baseDelay;
    
    if (error instanceof IntegrationError) {
      switch (error.type) {
        case IntegrationErrorType.RATE_LIMIT:
          baseDelay = 60000; // 1 minute for rate limits
          break;
        case IntegrationErrorType.SERVER_ERROR:
          baseDelay = 30000; // 30 seconds for server errors
          break;
        case IntegrationErrorType.NETWORK_ERROR:
          baseDelay = 10000; // 10 seconds for network errors
          break;
        default:
          baseDelay = this.DEFAULT_OPTIONS.baseDelay;
      }
    }
    
    return this.calculateDelay(attempt, {
      ...this.DEFAULT_OPTIONS,
      baseDelay
    });
  }

  /**
   * Creates a delay promise
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Retry decorator for methods
 */
export function withRetry(options: Partial<RetryOptions> = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      return RetryStrategy.executeWithRetry(
        () => originalMethod.apply(this, args),
        options
      );
    };
    
    return descriptor;
  };
}