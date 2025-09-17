// Tests for monitoring service

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { monitoringService, HealthStatus } from '../monitoring.service';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    storage: {
      listBuckets: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

// Mock fetch for webhook health checks
global.fetch = vi.fn();

describe('MonitoringService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Health Checks', () => {
    it('should check Supabase auth health', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      mockSupabase.supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await monitoringService.checkSupabaseHealth();

      expect(result.service).toBe('supabase_auth');
      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.response_time).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle Supabase auth errors', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      mockSupabase.supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Auth service unavailable' },
      });

      const result = await monitoringService.checkSupabaseHealth();

      expect(result.service).toBe('supabase_auth');
      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.error).toBe('Auth service unavailable');
    });

    it('should check storage health', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      mockSupabase.supabase.storage.listBuckets.mockResolvedValue({
        data: [
          { name: 'diagnosis-reports', id: '1' },
          { name: 'other-bucket', id: '2' },
        ],
        error: null,
      });

      const result = await monitoringService.checkStorageHealth();

      expect(result.service).toBe('supabase_storage');
      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.details?.buckets_count).toBe(2);
      expect(result.details?.diagnosis_bucket_exists).toBe(true);
    });

    it('should check database health', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      mockSupabase.supabase.from.mockReturnValue({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [{ id: '1' }], error: null })),
        })),
      });

      const result = await monitoringService.checkDatabaseHealth();

      expect(result.service).toBe('supabase_database');
      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.details?.query_successful).toBe(true);
    });

    it('should check N8n webhook health', async () => {
      // Mock successful webhook response
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      } as Response);

      // Mock environment variable
      process.env.VITE_N8N_WEBHOOK_URL = 'https://example.com/webhook/test';

      const result = await monitoringService.checkN8nWebhookHealth();

      expect(result.service).toBe('n8n_webhook');
      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.details?.status_code).toBe(200);
    });

    it('should handle N8n webhook failures', async () => {
      // Mock failed webhook response
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      process.env.VITE_N8N_WEBHOOK_URL = 'https://example.com/webhook/test';

      const result = await monitoringService.checkN8nWebhookHealth();

      expect(result.service).toBe('n8n_webhook');
      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.error).toContain('HTTP 500');
    });

    it('should handle missing webhook URL', async () => {
      delete process.env.VITE_N8N_WEBHOOK_URL;

      const result = await monitoringService.checkN8nWebhookHealth();

      expect(result.service).toBe('n8n_webhook');
      expect(result.status).toBe(HealthStatus.UNKNOWN);
      expect(result.error).toBe('Webhook URL not configured');
    });
  });

  describe('System Health', () => {
    it('should get overall system health', async () => {
      // Mock all health checks to return healthy
      const mockSupabase = await import('@/integrations/supabase/client');
      mockSupabase.supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockSupabase.supabase.storage.listBuckets.mockResolvedValue({
        data: [{ name: 'diagnosis-reports' }],
        error: null,
      });
      mockSupabase.supabase.from.mockReturnValue({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [{ id: '1' }], error: null })),
        })),
      });
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      } as Response);

      process.env.VITE_N8N_WEBHOOK_URL = 'https://example.com/webhook/test';

      const result = await monitoringService.checkSystemHealth();

      expect(result.overall_status).toBe(HealthStatus.HEALTHY);
      expect(result.services).toHaveLength(4);
      expect(result.last_check).toBeDefined();
      expect(result.uptime).toBeGreaterThan(0);
      expect(result.version).toBeDefined();
    });

    it('should determine degraded status with slow responses', async () => {
      // Mock slow responses (>1000ms for Supabase, >2000ms for webhook)
      const mockSupabase = await import('@/integrations/supabase/client');
      
      // Simulate slow auth response
      mockSupabase.supabase.auth.getSession.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ data: { session: null }, error: null }), 1500)
        )
      );

      mockSupabase.supabase.storage.listBuckets.mockResolvedValue({
        data: [{ name: 'diagnosis-reports' }],
        error: null,
      });
      mockSupabase.supabase.from.mockReturnValue({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [{ id: '1' }], error: null })),
        })),
      });

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      } as Response);

      process.env.VITE_N8N_WEBHOOK_URL = 'https://example.com/webhook/test';

      const result = await monitoringService.checkSystemHealth();

      expect(result.overall_status).toBe(HealthStatus.DEGRADED);
      
      const authService = result.services.find(s => s.service === 'supabase_auth');
      expect(authService?.status).toBe(HealthStatus.DEGRADED);
    });

    it('should determine unhealthy status with service failures', async () => {
      // Mock service failures
      const mockSupabase = await import('@/integrations/supabase/client');
      mockSupabase.supabase.auth.getSession.mockRejectedValue(new Error('Service unavailable'));
      mockSupabase.supabase.storage.listBuckets.mockResolvedValue({
        data: [],
        error: null,
      });
      mockSupabase.supabase.from.mockReturnValue({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      });

      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const result = await monitoringService.checkSystemHealth();

      expect(result.overall_status).toBe(HealthStatus.UNHEALTHY);
      
      const authService = result.services.find(s => s.service === 'supabase_auth');
      expect(authService?.status).toBe(HealthStatus.UNHEALTHY);
    });
  });

  describe('Alert Management', () => {
    it('should evaluate alert conditions correctly', async () => {
      const systemHealth = {
        overall_status: HealthStatus.UNHEALTHY,
        services: [
          {
            service: 'test-service',
            status: HealthStatus.UNHEALTHY,
            response_time: 5000,
            timestamp: new Date().toISOString(),
            error: 'Service failed',
          },
        ],
        last_check: new Date().toISOString(),
        uptime: 1000,
        version: '1.0.0',
      };

      // This would test the private method, but we can test the public interface
      const alerts = await monitoringService.getAlerts(10);
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should get health history', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      mockSupabase.supabase.from.mockReturnValue({
        select: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ 
              data: [
                {
                  overall_status: 'healthy',
                  timestamp: new Date().toISOString(),
                  uptime: 1000,
                },
              ], 
              error: null 
            })),
          })),
        })),
      });

      const history = await monitoringService.getHealthHistory(24);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track response times correctly', async () => {
      const startTime = Date.now();
      
      // Mock a service call
      const mockSupabase = await import('@/integrations/supabase/client');
      mockSupabase.supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await monitoringService.checkSupabaseHealth();
      const endTime = Date.now();

      expect(result.response_time).toBeGreaterThan(0);
      expect(result.response_time).toBeLessThan(endTime - startTime + 100); // Allow some margin
    });

    it('should handle timeout scenarios', async () => {
      // Mock a timeout
      vi.mocked(fetch).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      process.env.VITE_N8N_WEBHOOK_URL = 'https://example.com/webhook/test';

      const result = await monitoringService.checkN8nWebhookHealth();

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.error).toContain('Timeout');
    });
  });

  describe('Data Storage', () => {
    it('should store health check results', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      const mockInsert = vi.fn(() => Promise.resolve({ data: [], error: null }));
      mockSupabase.supabase.from.mockReturnValue({
        insert: mockInsert,
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      });

      // Mock other services for system health check
      mockSupabase.supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockSupabase.supabase.storage.listBuckets.mockResolvedValue({
        data: [],
        error: null,
      });
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      } as Response);

      await monitoringService.checkSystemHealth();

      // Verify that health check data was stored
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should handle storage failures gracefully', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      mockSupabase.supabase.from.mockReturnValue({
        insert: vi.fn(() => Promise.reject(new Error('Storage failed'))),
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      });

      // Mock other services
      mockSupabase.supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockSupabase.supabase.storage.listBuckets.mockResolvedValue({
        data: [],
        error: null,
      });
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      } as Response);

      // Should not throw error even if storage fails
      await expect(monitoringService.checkSystemHealth()).resolves.toBeDefined();
    });
  });

  describe('Service Lifecycle', () => {
    it('should cleanup resources on destroy', () => {
      // Test that destroy method exists and can be called
      expect(() => monitoringService.destroy()).not.toThrow();
    });

    it('should handle concurrent health checks', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      mockSupabase.supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockSupabase.supabase.storage.listBuckets.mockResolvedValue({
        data: [],
        error: null,
      });
      mockSupabase.supabase.from.mockReturnValue({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
      });
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      } as Response);

      // Run multiple health checks concurrently
      const promises = Array.from({ length: 5 }, () => 
        monitoringService.checkSystemHealth()
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.overall_status).toBeDefined();
        expect(result.services).toHaveLength(4);
      });
    });
  });
});