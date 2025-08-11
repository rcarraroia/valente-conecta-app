import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InstitutoConfigForm } from '../InstitutoConfigForm';
import { useInstitutoConfig } from '@/hooks/useInstitutoConfig';
import React from 'react';

// Mock the hook
vi.mock('@/hooks/useInstitutoConfig', () => ({
  useInstitutoConfig: vi.fn()
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
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

describe('InstitutoConfigForm', () => {
  const mockHookReturn = {
    config: null,
    isLoading: false,
    error: null,
    saveConfig: { mutate: vi.fn(), isPending: false },
    testConfig: { mutate: vi.fn(), isPending: false, data: undefined, error: null },
    deleteConfig: { mutate: vi.fn(), isPending: false },
    isSaving: false,
    isTesting: false,
    isDeleting: false,
    testResult: undefined,
    testError: null,
    getDefaultConfig: vi.fn(() => ({
      method: 'POST',
      auth_type: 'api_key',
      is_sandbox: true,
      retry_attempts: 3,
      retry_delay: 5000,
      is_active: true
    })),
    validateEncryption: vi.fn(() => true),
    refetch: vi.fn(),
    resetSaveState: vi.fn(),
    resetTestState: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useInstitutoConfig as any).mockReturnValue(mockHookReturn);
  });

  it('should render loading state', () => {
    (useInstitutoConfig as any).mockReturnValue({
      ...mockHookReturn,
      isLoading: true
    });

    render(<InstitutoConfigForm />, { wrapper: createWrapper() });

    expect(screen.getByText('Carregando configuração...')).toBeInTheDocument();
  });

  it('should render form with default values', () => {
    render(<InstitutoConfigForm />, { wrapper: createWrapper() });

    expect(screen.getByText('Configuração da Integração Instituto Coração Valente')).toBeInTheDocument();
    expect(screen.getByLabelText('Endpoint da API *')).toBeInTheDocument();
    expect(screen.getByLabelText('Método HTTP')).toBeInTheDocument();
    expect(screen.getByText('Salvar Configuração')).toBeInTheDocument();
  });

  it('should show error alert when there is an error', () => {
    (useInstitutoConfig as any).mockReturnValue({
      ...mockHookReturn,
      error: new Error('Failed to load config')
    });

    render(<InstitutoConfigForm />, { wrapper: createWrapper() });

    expect(screen.getByText('Erro ao carregar configuração: Failed to load config')).toBeInTheDocument();
  });

  it('should populate form when config is loaded', () => {
    const mockConfig = {
      id: '123',
      endpoint: 'https://api.instituto.com/users',
      method: 'POST',
      auth_type: 'api_key',
      api_key: '***',
      is_sandbox: false,
      retry_attempts: 5,
      retry_delay: 10000,
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };

    (useInstitutoConfig as any).mockReturnValue({
      ...mockHookReturn,
      config: mockConfig
    });

    render(<InstitutoConfigForm />, { wrapper: createWrapper() });

    const endpointInput = screen.getByLabelText('Endpoint da API *') as HTMLInputElement;
    expect(endpointInput.value).toBe('https://api.instituto.com/users');
  });

  it('should show API key field when auth_type is api_key', async () => {
    render(<InstitutoConfigForm />, { wrapper: createWrapper() });

    // Click on Authentication tab
    fireEvent.click(screen.getByText('Autenticação'));

    await waitFor(() => {
      expect(screen.getByLabelText('API Key *')).toBeInTheDocument();
    });
  });

  it('should show bearer token field when auth_type is bearer', async () => {
    render(<InstitutoConfigForm />, { wrapper: createWrapper() });

    // Click on Authentication tab
    fireEvent.click(screen.getByText('Autenticação'));

    // Change auth type to bearer
    const authTypeSelect = screen.getByRole('combobox');
    fireEvent.click(authTypeSelect);
    fireEvent.click(screen.getByText('Bearer Token'));

    await waitFor(() => {
      expect(screen.getByLabelText('Bearer Token *')).toBeInTheDocument();
    });
  });

  it('should show basic auth fields when auth_type is basic', async () => {
    render(<InstitutoConfigForm />, { wrapper: createWrapper() });

    // Click on Authentication tab
    fireEvent.click(screen.getByText('Autenticação'));

    // Change auth type to basic
    const authTypeSelect = screen.getByRole('combobox');
    fireEvent.click(authTypeSelect);
    fireEvent.click(screen.getByText('Basic Auth'));

    await waitFor(() => {
      expect(screen.getByLabelText('Usuário *')).toBeInTheDocument();
      expect(screen.getByLabelText('Senha *')).toBeInTheDocument();
    });
  });

  it('should call saveConfig when form is submitted', async () => {
    const mockSaveConfig = vi.fn();
    (useInstitutoConfig as any).mockReturnValue({
      ...mockHookReturn,
      saveConfig: { mutate: mockSaveConfig, isPending: false }
    });

    render(<InstitutoConfigForm />, { wrapper: createWrapper() });

    // Fill required fields
    fireEvent.change(screen.getByLabelText('Endpoint da API *'), {
      target: { value: 'https://api.test.com/users' }
    });

    // Go to auth tab and fill API key
    fireEvent.click(screen.getByText('Autenticação'));
    fireEvent.change(screen.getByLabelText('API Key *'), {
      target: { value: 'test-api-key' }
    });

    // Submit form
    fireEvent.click(screen.getByText('Salvar Configuração'));

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: 'https://api.test.com/users',
          api_key: 'test-api-key'
        })
      );
    });
  });

  it('should call testConfig when test button is clicked', async () => {
    const mockTestConfig = vi.fn();
    (useInstitutoConfig as any).mockReturnValue({
      ...mockHookReturn,
      testConfig: { mutate: mockTestConfig, isPending: false, data: undefined, error: null }
    });

    render(<InstitutoConfigForm />, { wrapper: createWrapper() });

    // Fill required fields first
    fireEvent.change(screen.getByLabelText('Endpoint da API *'), {
      target: { value: 'https://api.test.com/users' }
    });

    fireEvent.click(screen.getByText('Autenticação'));
    fireEvent.change(screen.getByLabelText('API Key *'), {
      target: { value: 'test-api-key' }
    });

    // Click test button
    fireEvent.click(screen.getByText('Testar Conectividade'));

    await waitFor(() => {
      expect(mockTestConfig).toHaveBeenCalled();
    });
  });

  it('should show test success message', () => {
    (useInstitutoConfig as any).mockReturnValue({
      ...mockHookReturn,
      testResult: true
    });

    render(<InstitutoConfigForm />, { wrapper: createWrapper() });

    expect(screen.getByText('Teste de conectividade bem-sucedido! A API está acessível.')).toBeInTheDocument();
  });

  it('should show test failure message', () => {
    (useInstitutoConfig as any).mockReturnValue({
      ...mockHookReturn,
      testResult: false
    });

    render(<InstitutoConfigForm />, { wrapper: createWrapper() });

    expect(screen.getByText('Teste de conectividade falhou. Verifique as configurações.')).toBeInTheDocument();
  });

  it('should show delete button when config exists', () => {
    (useInstitutoConfig as any).mockReturnValue({
      ...mockHookReturn,
      config: { id: '123', endpoint: 'https://api.test.com' }
    });

    render(<InstitutoConfigForm />, { wrapper: createWrapper() });

    expect(screen.getByText('Desativar')).toBeInTheDocument();
  });

  it('should call deleteConfig when delete button is clicked and confirmed', async () => {
    const mockDeleteConfig = vi.fn();
    (useInstitutoConfig as any).mockReturnValue({
      ...mockHookReturn,
      config: { id: '123', endpoint: 'https://api.test.com' },
      deleteConfig: { mutate: mockDeleteConfig, isPending: false }
    });

    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    render(<InstitutoConfigForm />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText('Desativar'));

    await waitFor(() => {
      expect(mockDeleteConfig).toHaveBeenCalled();
    });

    // Restore original confirm
    window.confirm = originalConfirm;
  });
});