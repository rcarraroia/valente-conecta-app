import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimiter, InstitutoRateLimiter } from '../rate-limiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    // Clear all rate limit data before each test
    RateLimiter.cleanup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    RateLimiter.cleanup();
  });

  describe('canMakeRequest', () => {
    it('should allow requests within limit', () => {
      const result1 = RateLimiter.canMakeRequest('user1', { maxRequests: 5, windowMs: 60000 });
      const result2 = RateLimiter.canMakeRequest('user1', { maxRequests: 5, windowMs: 60000 });

      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(4);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests when limit exceeded', () => {
      const config = { maxRequests: 2, windowMs: 60000 };

      // Make requests up to limit
      RateLimiter.canMakeRequest('user1', config);
      RateLimiter.canMakeRequest('user1', config);

      // This should be blocked
      const result = RateLimiter.canMakeRequest('user1', config);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should reset limits after window expires', async () => {
      const config = { maxRequests: 1, windowMs: 100 }; // 100ms window

      // Make request to reach limit
      const result1 = RateLimiter.canMakeRequest('user1', config);
      expect(result1.allowed).toBe(true);

      // Should be blocked
      const result2 = RateLimiter.canMakeRequest('user1', config);
      expect(result2.allowed).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be allowed again
      const result3 = RateLimiter.canMakeRequest('user1', config);
      expect(result3.allowed).toBe(true);
    });

    it('should handle different identifiers separately', () => {
      const config = { maxRequests: 1, windowMs: 60000 };

      const result1 = RateLimiter.canMakeRequest('user1', config);
      const result2 = RateLimiter.canMakeRequest('user2', config);

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });

    it('should use custom key generator', () => {
      const config = {
        maxRequests: 1,
        windowMs: 60000,
        keyGenerator: (id: string) => `custom:${id}`
      };

      const result1 = RateLimiter.canMakeRequest('user1', config);
      const result2 = RateLimiter.canMakeRequest('user1', config);

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(false);
    });
  });

  describe('recordRequest', () => {
    it('should record successful requests', () => {
      RateLimiter.recordRequest('user1', true);
      const status = RateLimiter.getStatus('user1');

      expect(status.count).toBe(1);
    });

    it('should record failed requests', () => {
      RateLimiter.recordRequest('user1', false);
      const status = RateLimiter.getStatus('user1');

      expect(status.count).toBe(1);
    });

    it('should skip successful requests when configured', () => {
      RateLimiter.recordRequest('user1', true, { skipSuccessfulRequests: true });
      const status = RateLimiter.getStatus('user1');

      expect(status.count).toBe(0);
    });

    it('should skip failed requests when configured', () => {
      RateLimiter.recordRequest('user1', false, { skipFailedRequests: true });
      const status = RateLimiter.getStatus('user1');

      expect(status.count).toBe(0);
    });
  });

  describe('getStatus', () => {
    it('should return correct status for new identifier', () => {
      const status = RateLimiter.getStatus('newuser', { maxRequests: 10 });

      expect(status.count).toBe(0);
      expect(status.remaining).toBe(10);
      expect(status.resetTime).toBeGreaterThan(Date.now());
    });

    it('should return correct status after requests', () => {
      const config = { maxRequests: 5, windowMs: 60000 };
      
      RateLimiter.canMakeRequest('user1', config);
      RateLimiter.canMakeRequest('user1', config);
      
      const status = RateLimiter.getStatus('user1', config);

      expect(status.count).toBe(2);
      expect(status.remaining).toBe(3);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      const config = { maxRequests: 1, windowMs: 50 };
      
      RateLimiter.canMakeRequest('user1', config);
      
      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const cleaned = RateLimiter.cleanup();
      expect(cleaned).toBeGreaterThan(0);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      RateLimiter.canMakeRequest('user1');
      RateLimiter.canMakeRequest('user2');
      RateLimiter.canMakeRequest('user1');

      const stats = RateLimiter.getStats();

      expect(stats.totalIdentifiers).toBe(2);
      expect(stats.totalRequests).toBe(3);
      expect(stats.averageRequestsPerIdentifier).toBe(1.5);
    });
  });
});

describe('InstitutoRateLimiter', () => {
  beforeEach(() => {
    RateLimiter.cleanup();
  });

  afterEach(() => {
    RateLimiter.cleanup();
  });

  describe('canSendUserData', () => {
    it('should allow user data sending within limits', () => {
      const result = InstitutoRateLimiter.canSendUserData('user123');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // 5 max - 1 used
    });

    it('should block after reaching user limit', () => {
      const userId = 'user123';
      
      // Use up all 5 requests
      for (let i = 0; i < 5; i++) {
        InstitutoRateLimiter.canSendUserData(userId);
      }

      const result = InstitutoRateLimiter.canSendUserData(userId);
      expect(result.allowed).toBe(false);
    });
  });

  describe('canMakeApiCall', () => {
    it('should allow API calls within global limits', () => {
      const result = InstitutoRateLimiter.canMakeApiCall();
      expect(result.allowed).toBe(true);
    });
  });

  describe('recordUserDataSend', () => {
    it('should record user data send attempts', () => {
      InstitutoRateLimiter.recordUserDataSend('user123', true);
      const status = InstitutoRateLimiter.getUserStatus('user123');
      
      expect(status.count).toBeGreaterThan(0);
    });
  });

  describe('recordApiCall', () => {
    it('should record API call attempts', () => {
      InstitutoRateLimiter.recordApiCall(true);
      const status = InstitutoRateLimiter.getApiStatus();
      
      expect(status.count).toBeGreaterThan(0);
    });
  });
});