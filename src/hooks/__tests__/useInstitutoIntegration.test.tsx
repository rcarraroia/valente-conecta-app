import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInstitutoIntegration } from '../useInstitutoIntegration';
import { institutoIntegrationService } from '@/services/instituto-integration.service';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';

// Mock dependencies
vi.mock('@/services/instituto-integration.service', () => ({
  institutoIntegrationService: {
    sendUserData: vi.fn(),
    getStats: vi.fn()
  }
}));

vi.mock('@/services/integration-queue.service', () => ({
  integrationQueueService: {
    getQueueStats: vi.fn(),
    processQueue: vi.fn()
  }
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useInstitutoIntegration', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: mockUser
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useInstitutoIntegration(), {
      wrapper: createWrapper()
    });

    expect(result.current.isSending).toBe(false);
    expect(result.current.isLoadingStats).toBe(true); // Initially loading
    expect(result.current.stats).toBeUndefined();
  });

  it('should send user data successfully', async () => {
    const mockResult = {
      success: true,
      data: { id: 'instituto-123' },
      log_id: 'log-123'
    };

    (institutoIntegrationService.sendUserData as any).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useInstitutoIntegration(), {
      wrapper: createWrapper()
    });

    const userData = {
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '11999999999',
      cpf: '12345678901',
      origem_cadastro: 'visao_itinerante' as const,
      consentimento_data_sharing: true,
      created_at: new Date().toISOString()
    };

    result.current.sendUserData.mutate(userData);

    await waitFor(() => {
      expect(result.current.sendUserData.isSuccess).toBe(true);
    });

    expect(institutoIntegrationService.sendUserData).toHaveBeenCalledWith(userData, mockUser.id);
    expect(result.current.lastSendResult).toEqual(mockResult);
  });

  it('should handle send user data error', async () => {
    const mockError = new Error('API Error');
    (institutoIntegrationService.sendUserData as any).mockRejectedValue(mockError);

    const { result } = renderHook(() => useInstitutoIntegration(), {
      wrapper: createWrapper()
    });

    const userData = {
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '11999999999',
      cpf: '12345678901',
      origem_cadastro: 'visao_itinerante' as const,
      consentimento_data_sharing: true,
      created_at: new Date().toISOString()
    };

    result.current.sendUserData.mutate(userData);

    await waitFor(() => {
      expect(result.current.sendUserData.isError).toBe(true);
    });

    expect(result.current.sendError).toEqual(mockError);
  });

  it('should send registration data successfully', async () => {
    const mockResult = {
      success: true,
      data: { id: 'instituto-123' },
      log_id: 'log-123'
    };

    (institutoIntegrationService.sendUserData as any).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useInstitutoIntegration(), {
      wrapper: createWrapper()
    });

    const registrationData = {
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '(11) 99999-9999',
      cpf: '123.456.789-01',
      consent_data_sharing: true
    };

    result.current.sendRegistrationData.mutate(registrationData);

    await waitFor(() => {
      expect(result.current.sendRegistrationData.isSuccess).toBe(true);
    });

    expect(institutoIntegrationService.sendUserData).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'João Silva',
        email: 'joao@example.com',
        telefone: '11999999999', // Cleaned phone
        cpf: '12345678901', // Cleaned CPF
        origem_cadastro: 'visao_itinerante',
        consentimento_data_sharing: true
      }),
      mockUser.id
    );
  });

  it('should reject registration data without consent', async () => {
    const { result } = renderHook(() => useInstitutoIntegration(), {
      wrapper: createWrapper()
    });

    const registrationData = {
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '11999999999',
      cpf: '12345678901',
      consent_data_sharing: false
    };

    result.current.sendRegistrationData.mutate(registrationData);

    await waitFor(() => {
      expect(result.current.sendRegistrationData.isError).toBe(true);
    });

    expect(result.current.sendError?.message).toContain('Consentimento');
  });

  it('should load statistics', async () => {
    const mockStats = {
      total_attempts: 100,
      successful_sends: 85,
      failed_sends: 15,
      pending_retries: 5,
      success_rate: 85,
      last_24h_attempts: 20,
      last_24h_success_rate: 90
    };

    (institutoIntegrationService.getStats as any).mockResolvedValue(mockStats);

    const { result } = renderHook(() => useInstitutoIntegration(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoadingStats).toBe(false);
    });

    expect(result.current.stats).toEqual(mockStats);
  });

  it('should handle unauthenticated user', async () => {
    (useAuth as any).mockReturnValue({
      user: null
    });

    const { result } = renderHook(() => useInstitutoIntegration(), {
      wrapper: createWrapper()
    });

    const userData = {
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '11999999999',
      cpf: '12345678901',
      origem_cadastro: 'visao_itinerante' as const,
      consentimento_data_sharing: true,
      created_at: new Date().toISOString()
    };

    result.current.sendUserData.mutate(userData);

    await waitFor(() => {
      expect(result.current.sendUserData.isError).toBe(true);
    });

    expect(result.current.sendError?.message).toContain('não autenticado');
  });

  it('should reset send state', () => {
    const { result } = renderHook(() => useInstitutoIntegration(), {
      wrapper: createWrapper()
    });

    result.current.resetSendState();

    expect(result.current.sendUserData.status).toBe('idle');
    expect(result.current.sendRegistrationData.status).toBe('idle');
  });
});