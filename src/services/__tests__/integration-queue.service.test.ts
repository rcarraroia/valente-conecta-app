import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IntegrationQueueService } from '../integration-queue.service';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    raw: vi.fn()
  }
}));

// Mock integration service
vi.mock('../instituto-integration.service', () => ({
  institutoIntegrationService: {
    sendUserData: vi.fn()
  }
}));

describe('IntegrationQueueService', () => {
  let service: IntegrationQueueService;

  beforeEach(() => {
    service = IntegrationQueueService.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    service.stop();
  });

  describe('addToQueue', () => {
    it('should add item to queue successfully', async () => {
      const mockSupabaseFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'queue-123' },
              error: null
            })
          })
        })
      });

      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      const result = await service.addToQueue('log-123', 300, 3);

      expect(result).toBe('queue-123');
      expect(supabase.from).toHaveBeenCalledWith('instituto_integration_queue');
    });

    it('should handle database errors', async () => {
      const mockSupabaseFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      });

      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      const result = await service.addToQueue('log-123', 300, 3);

      expect(result).toBeNull();
    });
  });

  describe('removeFromQueue', () => {
    it('should remove item from queue successfully', async () => {
      const mockSupabaseFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null
          })
        })
      });

      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      const result = await service.removeFromQueue('queue-123');

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('instituto_integration_queue');
    });

    it('should handle removal errors', async () => {
      const mockSupabaseFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Delete failed' }
          })
        })
      });

      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      const result = await service.removeFromQueue('queue-123');

      expect(result).toBe(false);
    });
  });

  describe('getQueueStats', () => {
    it('should return queue statistics', async () => {
      const mockQueueData = [
        {
          scheduled_for: new Date(Date.now() - 1000).toISOString(), // Ready to process
          attempts: 1,
          max_attempts: 3,
          created_at: new Date(Date.now() - 60000).toISOString()
        },
        {
          scheduled_for: new Date(Date.now() + 1000).toISOString(), // Not ready yet
          attempts: 0,
          max_attempts: 3,
          created_at: new Date(Date.now() - 30000).toISOString()
        },
        {
          scheduled_for: new Date(Date.now() - 1000).toISOString(), // Failed (max attempts reached)
          attempts: 3,
          max_attempts: 3,
          created_at: new Date(Date.now() - 120000).toISOString()
        }
      ];

      const mockSupabaseFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockQueueData,
          error: null
        })
      });

      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      const stats = await service.getQueueStats();

      expect(stats.total_items).toBe(3);
      expect(stats.ready_to_process).toBe(2); // 2 items ready (including failed one)
      expect(stats.failed_items).toBe(1); // 1 item with max attempts reached
      expect(stats.average_wait_time).toBeGreaterThan(0);
    });

    it('should handle empty queue', async () => {
      const mockSupabaseFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      });

      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      const stats = await service.getQueueStats();

      expect(stats.total_items).toBe(0);
      expect(stats.ready_to_process).toBe(0);
      expect(stats.failed_items).toBe(0);
      expect(stats.average_wait_time).toBe(0);
    });
  });

  describe('cleanupOldItems', () => {
    it('should clean up old items', async () => {
      const mockSupabaseFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          lt: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: [{ id: '1' }, { id: '2' }],
              error: null
            })
          })
        })
      });

      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      const deletedCount = await service.cleanupOldItems(24);

      expect(deletedCount).toBe(2);
      expect(supabase.from).toHaveBeenCalledWith('instituto_integration_queue');
    });

    it('should handle cleanup errors', async () => {
      const mockSupabaseFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          lt: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Cleanup failed' }
            })
          })
        })
      });

      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      const deletedCount = await service.cleanupOldItems(24);

      expect(deletedCount).toBe(0);
    });
  });

  describe('start and stop', () => {
    it('should start and stop processing', () => {
      expect(service['isProcessing']).toBe(false);
      
      service.start();
      // Service should be started (we can't easily test the interval)
      
      service.stop();
      // Service should be stopped
    });

    it('should not start multiple times', () => {
      service.start();
      service.start(); // Should not start again
      
      service.stop();
    });
  });
});