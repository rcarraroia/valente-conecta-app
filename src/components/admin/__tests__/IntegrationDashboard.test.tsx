import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IntegrationDashboard } from '../IntegrationDashboard';
import { useInstitutoIntegrationAdmin } from '@/hooks/useInstitutoIntegration';
import React from 'react';

// Mock the hook
vi.mock('@/hooks/useInstitutoIntegration', () => ({
  useInstitutoIntegrationAdmin: vi.fn()
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('IntegrationDashboard', () => {
  const mockHookReturn = {
    stats: {
      total_attempts: 100,
      successful_sends: 85,
      failed_sends: 15,
      pending_retries: 5,
      success_rate: 85,
      last_24h_attempts: 20,
      last_24h_success_rate: 90
    },
    isLoadingStats: false,
    statsError: null,
    queueStats: {
      total_items: 10,
      ready_to_process: 3,
      failed_items: 2,
      average_wait_time: 300
    },
    isLoadingQueueStats: false,
    queueStatsError: null,
    refreshStats: vi.fn(),
    processQueueNow: { mutate: vi.fn() },
    isProcessingQueue: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useInstitutoIntegrationAdmin as any).mockReturnValue(mockHookReturn);
  });

  it('should render dashboard with statistics', () => {
    render(<IntegrationDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Dashboard de Integração')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument(); // Total attempts
    expect(screen.getByText('85')).toBeInTheDocument(); // Successful sends
    expect(screen.getByText('15')).toBeInTheDocument(); // Failed sends
    expect(screen.getByText('5')).toBeInTheDocument(); // Pending retries
  });

  it('should display success rates', () => {
    render(<IntegrationDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('85.0%')).toBeInTheDocument(); // Overall success rate
    expect(screen.getByText('90.0%')).toBeInTheDocument(); // 24h success rate
  });

  it('should show queue statistics', () => {
    render(<IntegrationDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Status da Fila de Retry')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Total items
    expect(screen.getByText('3')).toBeInTheDocument(); // Ready to process
    expect(screen.getByText('2')).toBeInTheDocument(); // Failed items
    expect(screen.getByText('5min')).toBeInTheDocument(); // Average wait time
  });

  it('should show loading state', () => {
    (useInstitutoIntegrationAdmin as any).mockReturnValue({
      ...mockHookReturn,
      isLoadingStats: true,
      stats: null
    });

    render(<IntegrationDashboard />, { wrapper: createWrapper() });

    expect(screen.getAllByText('...')).toHaveLength(8); // Loading placeholders
  });

  it('should show error state', () => {
    (useInstitutoIntegrationAdmin as any).mockReturnValue({
      ...mockHookReturn,
      statsError: new Error('Failed to load stats')
    });

    render(<IntegrationDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Erro ao carregar dados do dashboard: Failed to load stats')).toBeInTheDocument();
  });

  it('should call refreshStats when refresh button is clicked', () => {
    const mockRefreshStats = vi.fn();
    (useInstitutoIntegrationAdmin as any).mockReturnValue({
      ...mockHookReturn,
      refreshStats: mockRefreshStats
    });

    render(<IntegrationDashboard />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText('Atualizar'));
    expect(mockRefreshStats).toHaveBeenCalled();
  });

  it('should call processQueueNow when process queue button is clicked', () => {
    const mockProcessQueue = vi.fn();
    (useInstitutoIntegrationAdmin as any).mockReturnValue({
      ...mockHookReturn,
      processQueueNow: { mutate: mockProcessQueue }
    });

    render(<IntegrationDashboard />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText('Processar Fila'));
    expect(mockProcessQueue).toHaveBeenCalled();
  });

  it('should show alert for low success rate', () => {
    (useInstitutoIntegrationAdmin as any).mockReturnValue({
      ...mockHookReturn,
      stats: {
        ...mockHookReturn.stats,
        success_rate: 60 // Below 70%
      }
    });

    render(<IntegrationDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText(/A taxa de sucesso está abaixo de 70%/)).toBeInTheDocument();
  });

  it('should show alert for accumulated queue', () => {
    (useInstitutoIntegrationAdmin as any).mockReturnValue({
      ...mockHookReturn,
      queueStats: {
        ...mockHookReturn.queueStats,
        ready_to_process: 15 // Above 10
      }
    });

    render(<IntegrationDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText(/Há 15 itens prontos para processamento/)).toBeInTheDocument();
  });

  it('should show alert for many pending retries', () => {
    (useInstitutoIntegrationAdmin as any).mockReturnValue({
      ...mockHookReturn,
      stats: {
        ...mockHookReturn.stats,
        pending_retries: 25 // Above 20
      }
    });

    render(<IntegrationDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText(/Há 25 tentativas pendentes de retry/)).toBeInTheDocument();
  });

  it('should show excellent badge for high success rate', () => {
    (useInstitutoIntegrationAdmin as any).mockReturnValue({
      ...mockHookReturn,
      stats: {
        ...mockHookReturn.stats,
        success_rate: 95 // Above 90%
      }
    });

    render(<IntegrationDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Excelente')).toBeInTheDocument();
  });

  it('should show needs attention badge for low success rate', () => {
    (useInstitutoIntegrationAdmin as any).mockReturnValue({
      ...mockHookReturn,
      stats: {
        ...mockHookReturn.stats,
        success_rate: 60 // Below 70%
      }
    });

    render(<IntegrationDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Precisa Atenção')).toBeInTheDocument();
  });
});