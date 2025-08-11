interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (identifier: string) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  requests: number[];
}

export class RateLimiter {
  private static requests: Map<string, RateLimitEntry> = new Map();
  private static readonly DEFAULT_CONFIG: RateLimitConfig = {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  };

  /**
   * Checks if a request should be allowed based on rate limiting rules
   */
  static canMakeRequest(
    identifier: string, 
    config: Partial<RateLimitConfig> = {}
  ): { allowed: boolean; resetTime?: number; remaining?: number } {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const key = finalConfig.keyGenerator ? finalConfig.keyGenerator(identifier) : identifier;
    const now = Date.now();
    
    // Get or create entry for this identifier
    let entry = this.requests.get(key);
    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + finalConfig.windowMs,
        requests: []
      };
      this.requests.set(key, entry);
    }

    // Clean up old requests outside the window
    entry.requests = entry.requests.filter(time => now - time < finalConfig.windowMs);
    entry.count = entry.requests.length;

    // Reset window if expired
    if (now >= entry.resetTime) {
      entry.count = 0;
      entry.requests = [];
      entry.resetTime = now + finalConfig.windowMs;
    }

    // Check if limit exceeded
    if (entry.count >= finalConfig.maxRequests) {
      return {
        allowed: false,
        resetTime: entry.resetTime,
        remaining: 0
      };
    }

    // Allow request and record it
    entry.requests.push(now);
    entry.count++;

    return {
      allowed: true,
      resetTime: entry.resetTime,
      remaining: finalConfig.maxRequests - entry.count
    };
  }

  /**
   * Records a request attempt (for tracking purposes)
   */
  static recordRequest(
    identifier: string,
    success: boolean,
    config: Partial<RateLimitConfig> = {}
  ): void {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    // Skip recording based on configuration
    if (success && finalConfig.skipSuccessfulRequests) return;
    if (!success && finalConfig.skipFailedRequests) return;

    const key = finalConfig.keyGenerator ? finalConfig.keyGenerator(identifier) : identifier;
    const now = Date.now();
    
    let entry = this.requests.get(key);
    if (!entry) {
      entry = {
        count: 1,
        resetTime: now + finalConfig.windowMs,
        requests: [now]
      };
      this.requests.set(key, entry);
    } else {
      entry.requests.push(now);
      entry.count++;
    }
  }

  /**
   * Gets current rate limit status for an identifier
   */
  static getStatus(
    identifier: string,
    config: Partial<RateLimitConfig> = {}
  ): { count: number; remaining: number; resetTime: number } {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const key = finalConfig.keyGenerator ? finalConfig.keyGenerator(identifier) : identifier;
    const now = Date.now();
    
    const entry = this.requests.get(key);
    if (!entry) {
      return {
        count: 0,
        remaining: finalConfig.maxRequests,
        resetTime: now + finalConfig.windowMs
      };
    }

    // Clean up old requests
    entry.requests = entry.requests.filter(time => now - time < finalConfig.windowMs);
    entry.count = entry.requests.length;

    return {
      count: entry.count,
      remaining: Math.max(0, finalConfig.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }

  /**
   * Clears rate limit data for an identifier
   */
  static clearLimits(identifier: string, config: Partial<RateLimitConfig> = {}): void {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const key = finalConfig.keyGenerator ? finalConfig.keyGenerator(identifier) : identifier;
    this.requests.delete(key);
  }

  /**
   * Cleans up expired entries to prevent memory leaks
   */
  static cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.requests.entries()) {
      // Remove entries that are completely expired
      if (now >= entry.resetTime && entry.requests.length === 0) {
        this.requests.delete(key);
        cleaned++;
      } else {
        // Clean up old requests within entries
        const originalLength = entry.requests.length;
        entry.requests = entry.requests.filter(time => now - time < 300000); // Keep last 5 minutes
        entry.count = entry.requests.length;
        
        if (entry.requests.length === 0 && now >= entry.resetTime) {
          this.requests.delete(key);
          cleaned++;
        }
      }
    }

    return cleaned;
  }

  /**
   * Gets statistics about current rate limiting state
   */
  static getStats(): {
    totalIdentifiers: number;
    totalRequests: number;
    averageRequestsPerIdentifier: number;
  } {
    const identifiers = this.requests.size;
    let totalRequests = 0;

    for (const entry of this.requests.values()) {
      totalRequests += entry.count;
    }

    return {
      totalIdentifiers: identifiers,
      totalRequests,
      averageRequestsPerIdentifier: identifiers > 0 ? totalRequests / identifiers : 0
    };
  }
}

// Specific rate limiters for different operations
export class InstitutoRateLimiter {
  private static readonly INTEGRATION_CONFIG: RateLimitConfig = {
    maxRequests: 5, // 5 requests per user
    windowMs: 300000, // 5 minutes
    keyGenerator: (userId: string) => `instituto_integration:${userId}`
  };

  private static readonly API_CONFIG: RateLimitConfig = {
    maxRequests: 100, // 100 requests total
    windowMs: 3600000, // 1 hour
    keyGenerator: () => 'instituto_api_global'
  };

  static canSendUserData(userId: string): { allowed: boolean; resetTime?: number; remaining?: number } {
    return RateLimiter.canMakeRequest(userId, this.INTEGRATION_CONFIG);
  }

  static canMakeApiCall(): { allowed: boolean; resetTime?: number; remaining?: number } {
    return RateLimiter.canMakeRequest('global', this.API_CONFIG);
  }

  static recordUserDataSend(userId: string, success: boolean): void {
    RateLimiter.recordRequest(userId, success, this.INTEGRATION_CONFIG);
  }

  static recordApiCall(success: boolean): void {
    RateLimiter.recordRequest('global', success, this.API_CONFIG);
  }

  static getUserStatus(userId: string): { count: number; remaining: number; resetTime: number } {
    return RateLimiter.getStatus(userId, this.INTEGRATION_CONFIG);
  }

  static getApiStatus(): { count: number; remaining: number; resetTime: number } {
    return RateLimiter.getStatus('global', this.API_CONFIG);
  }
}

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    const cleaned = RateLimiter.cleanup();
    if (cleaned > 0) {
      console.log(`Rate limiter cleaned up ${cleaned} expired entries`);
    }
  }, 300000); // 5 minutes
}