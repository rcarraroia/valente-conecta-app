import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EnhancedCommonFormFields from '../EnhancedCommonFormFields';

describe('EnhancedCommonFormFields', () => {
  const mockProps = {
    fullName: '',
    setFullName: vi.fn(),
    email: '',
    setEmail: vi.fn(),
    phone: '',
    setPhone: vi.fn(),
    city: '',
    setCity: vi.fn(),
    password: '',
    setPassword: vi.fn(),
    cpf: '',
    setCpf: vi.fn(),
    consentDataSharing: false,
    setConsentDataSharing: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<EnhancedCommonFormFields {...mockProps} />);

    expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Telefone')).toBeInTheDocument();
    expect(screen.getByLabelText('CPF')).toBeInTheDocument();
    expect(screen.getByLabelText('Cidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
  });

  it('should render consent checkbox', () => {
    render(<EnhancedCommonFormFields {...mockProps} />);

    expect(screen.getByText(/Autorizo o compartilhamento dos meus dados/)).toBeInTheDocument();
  });

  it('should format CPF input correctly', () => {
    render(<EnhancedCommonFormFields {...mockProps} />);

    const cpfInput = screen.getByLabelText('CPF');
    fireEvent.change(cpfInput, { target: { value: '12345678901' } });

    expect(mockProps.setCpf).toHaveBeenCalledWith('123.456.789-01');
  });

  it('should call setters when inputs change', () => {
    render(<EnhancedCommonFormFields {...mockProps} />);

    fireEvent.change(screen.getByLabelText('Nome Completo'), {
      target: { value: 'João Silva' }
    });
    expect(mockProps.setFullName).toHaveBeenCalledWith('João Silva');

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'joao@example.com' }
    });
    expect(mockProps.setEmail).toHaveBeenCalledWith('joao@example.com');

    fireEvent.change(screen.getByLabelText('Telefone'), {
      target: { value: '11999999999' }
    });
    expect(mockProps.setPhone).toHaveBeenCalledWith('11999999999');

    fireEvent.change(screen.getByLabelText('Cidade'), {
      target: { value: 'São Paulo' }
    });
    expect(mockProps.setCity).toHaveBeenCalledWith('São Paulo');

    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'password123' }
    });
    expect(mockProps.setPassword).toHaveBeenCalledWith('password123');
  });

  it('should show CPF error when provided', () => {
    render(
      <EnhancedCommonFormFields 
        {...mockProps} 
        cpfError="CPF inválido" 
      />
    );

    expect(screen.getByText('CPF inválido')).toBeInTheDocument();
  });

  it('should show consent error when provided', () => {
    render(
      <EnhancedCommonFormFields 
        {...mockProps} 
        consentError="Consentimento é obrigatório" 
      />
    );

    expect(screen.getByText('Consentimento é obrigatório')).toBeInTheDocument();
  });

  it('should handle consent checkbox change', () => {
    render(<EnhancedCommonFormFields {...mockProps} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockProps.setConsentDataSharing).toHaveBeenCalledWith(true);
  });

  it('should limit CPF input to 14 characters', () => {
    render(<EnhancedCommonFormFields {...mockProps} />);

    const cpfInput = screen.getByLabelText('CPF') as HTMLInputElement;
    expect(cpfInput.maxLength).toBe(14);
  });

  it('should require name, email, phone, cpf and password fields', () => {
    render(<EnhancedCommonFormFields {...mockProps} />);

    expect(screen.getByLabelText('Nome Completo')).toHaveAttribute('required');
    expect(screen.getByLabelText('Email')).toHaveAttribute('required');
    expect(screen.getByLabelText('Telefone')).toHaveAttribute('required');
    expect(screen.getByLabelText('CPF')).toHaveAttribute('required');
    expect(screen.getByLabelText('Senha')).toHaveAttribute('required');
  });

  it('should set minimum password length', () => {
    render(<EnhancedCommonFormFields {...mockProps} />);

    const passwordInput = screen.getByLabelText('Senha') as HTMLInputElement;
    expect(passwordInput.minLength).toBe(6);
  });
});