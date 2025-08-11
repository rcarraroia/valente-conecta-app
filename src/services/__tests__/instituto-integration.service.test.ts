import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InstitutoIntegrationService } from '../instituto-integration.service';
import { InstitutoUserData, IntegrationErrorType } from '@/types/instituto-integration';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn()
  }
}));

// Mock encryption utility
vi.mock('@/utils/encryption', () => ({
  CredentialEncryption: {
    decrypt: vi.fn().mockReturnValue({
      api_key: 'test-api-key'
    })
  }
}));

// Mock fetch
global.fetch = vi.fn();

describe('InstitutoIntegrationService', () => {
  let service: InstitutoIntegrationService;
  const mockUserData: InstitutoUserData = {
    nome: 'João Silva',
    email: 'joao@example.com',
    telefone: '11999999999',
    cpf: '12345678901',
    origem_cadastro: 'visao_itinerante',
    consentimento_data_sharing: true,
    created_at: new Date().toISOString()
  };

  beforeEach(() => {
    service = InstitutoIntegrationService.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('sendUserData', () => {
    it('should send user data successfully', async () => {
      // Mock config fetch
      const mockSupabaseFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: '123',
                endpoint: 'https://api.instituto.com/users',
                method: 'POST',
                auth_type: 'api_key',
                encrypted_credentials: 'encrypted-data',
                is_sandbox: false,
                is_active: true,
                retry_attempts: 3,
                retry_delay: 5000
              },
              error: null
            })
          })
        })
      });

      const mockSupabaseInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'log-123' },
            error: null
          })
        })
      });

      const mockSupabaseUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          error: null
        })
      });

      (supabase.from as any)
        .mockReturnValueOnce(mockSupabaseFrom) // Config fetch
        .mockReturnValueOnce({ insert: mockSupabaseInsert }) // Log insert
        .mockReturnValueOnce({ update: mockSupabaseUpdate }); // Log update

      // Mock successful API response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'instituto-123', status: 'created' })
      });

      const result = await service.sendUserData(mockUserData, 'user-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 'instituto-123', status: 'created' });
      expect(result.log_id).toBe('log-123');
    });

    it('should handle validation errors', async () => {
      const invalidUserData = {
        ...mockUserData,
        email: 'invalid-email' // Invalid email format
      };

      const result = await service.sendUserData(invalidUserData as InstitutoUserData, 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Dados inválidos');
    });

    it('should handle missing configuration', async () => {
      // Mock config not found
      const mockSupabaseFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' } // No rows returned
            })
          })
        })
      });

      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      const result = await service.sendUserData(mockUserData, 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Configuração da integração não encontrada');
    });

    it('should handle API errors and schedule retry', async () => {
      // Mock config fetch
      const mockSupabaseFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: '123',
                endpoint: 'https://api.instituto.com/users',
                method: 'POST',
                auth_type: 'api_key',
                encrypted_credentials: 'encrypted-data',
                is_sandbox: false,
                is_active: true,
                retry_attempts: 3,
                retry_delay: 5000
              },
              error: null
            })
          })
        })
      });

      const mockSupabaseInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'log-123' },
            error: null
          })
        })
      });

      const mockSupabaseUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          error: null
        })
      });

      const mockSupabaseRpc = vi.fn().mockResolvedValue({
        data: 'queue-123',
        error: null
      });

      (supabase.from as any)
        .mockReturnValueOnce(mockSupabaseFrom) // Config fetch
        .mockReturnValueOnce({ insert: mockSupabaseInsert }) // Log insert
        .mockReturnValueOnce({ update: mockSupabaseUpdate }); // Log update

      (supabase.rpc as any).mockReturnValue(mockSupabaseRpc);

      // Mock API error response
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' })
      });

      const result = await service.sendUserData(mockUserData, 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Internal server error');
      expect(supabase.rpc).toHaveBeenCalledWith('schedule_integration_retry', {
        p_log_id: 'log-123',
        p_delay_seconds: 5
      });
    });

    it('should handle network errors', async () => {
      // Mock config fetch
      const mockSupabaseFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: '123',
                endpoint: 'https://api.instituto.com/users',
                method: 'POST',
                auth_type: 'api_key',
                encrypted_credentials: 'encrypted-data',
                is_sandbox: false,
                is_active: true,
                retry_attempts: 3,
                retry_delay: 5000
              },
              error: null
            })
          })
        })
      });

      const mockSupabaseInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'log-123' },
            error: null
          })
        })
      });

      const mockSupabaseUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          error: null
        })
      });

      (supabase.from as any)
        .mockReturnValueOnce(mockSupabaseFrom) // Config fetch
        .mockReturnValueOnce({ insert: mockSupabaseInsert }) // Log insert
        .mockReturnValueOnce({ update: mockSupabaseUpdate }); // Log update

      // Mock network error
      (global.fetch as any).mockRejectedValue(new TypeError('Failed to fetch'));

      const result = await service.sendUserData(mockUserData, 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Erro de conexão com a API do Instituto');
    });
  });

  describe('validateConfig', () => {
    it('should validate config successfully', async () => {
      const mockConfig = {
        endpoint: 'https://api.instituto.com/users',
        method: 'POST' as const,
        auth_type: 'api_key' as const,
        api_key: 'test-key',
        is_sandbox: false,
        retry_attempts: 3,
        retry_delay: 5000,
        is_active: true
      };

      // Mock successful health check
      (global.fetch as any).mockResolvedValue({
        ok: true
      });

      const result = await service.validateConfig(mockConfig);

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.instituto.com/users/health',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-API-Key': 'test-key'
          })
        })
      );
    });

    it('should fail validation for invalid config', async () => {
      const invalidConfig = {
        endpoint: 'invalid-url', // Invalid URL
        method: 'POST' as const,
        auth_type: 'api_key' as const,
        is_sandbox: false,
        retry_attempts: 3,
        retry_delay: 5000,
        is_active: true
      };

      const result = await service.validateConfig(invalidConfig);

      expect(result).toBe(false);
    });

    it('should fail validation when health check fails', async () => {
      const mockConfig = {
        endpoint: 'https://api.instituto.com/users',
        method: 'POST' as const,
        auth_type: 'api_key' as const,
        api_key: 'test-key',
        is_sandbox: false,
        retry_attempts: 3,
        retry_delay: 5000,
        is_active: true
      };

      // Mock failed health check
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404
      });

      const result = await service.validateConfig(mockConfig);

      expect(result).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return integration statistics', async () => {
      const mockStats = {
        total_attempts: 100,
        successful_sends: 85,
        failed_sends: 15,
        pending_retries: 5,
        success_rate: 85,
        last_24h_attempts: 20,
        last_24h_success_rate: 90
      };

      (supabase.rpc as any).mockResolvedValue({
        data: mockStats,
        error: null
      });

      const result = await service.getStats();

      expect(result).toEqual(mockStats);
      expect(supabase.rpc).toHaveBeenCalledWith('get_instituto_integration_stats');
    });

    it('should return default stats on error', async () => {
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await service.getStats();

      expect(result).toEqual({
        total_attempts: 0,
        successful_sends: 0,
        failed_sends: 0,
        pending_retries: 0,
        success_rate: 0,
        last_24h_attempts: 0,
        last_24h_success_rate: 0
      });
    });
  });
});