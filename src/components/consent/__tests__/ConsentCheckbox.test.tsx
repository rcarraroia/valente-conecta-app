import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConsentCheckbox } from '../ConsentCheckbox';

describe('ConsentCheckbox', () => {
  const mockOnCheckedChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render consent checkbox with label', () => {
    render(
      <ConsentCheckbox
        checked={false}
        onCheckedChange={mockOnCheckedChange}
      />
    );

    expect(screen.getByText(/Autorizo o compartilhamento dos meus dados/)).toBeInTheDocument();
    expect(screen.getByText(/Seus dados serão utilizados para campanhas/)).toBeInTheDocument();
  });

  it('should show required indicator when required is true', () => {
    render(
      <ConsentCheckbox
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        required={true}
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should not show required indicator when required is false', () => {
    render(
      <ConsentCheckbox
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        required={false}
      />
    );

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should call onCheckedChange when checkbox is clicked', () => {
    render(
      <ConsentCheckbox
        checked={false}
        onCheckedChange={mockOnCheckedChange}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnCheckedChange).toHaveBeenCalledWith(true);
  });

  it('should show error message when error prop is provided', () => {
    const errorMessage = 'Consentimento é obrigatório';
    
    render(
      <ConsentCheckbox
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should show warning when required but not checked', () => {
    render(
      <ConsentCheckbox
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        required={true}
      />
    );

    expect(screen.getByText(/O consentimento é obrigatório para prosseguir/)).toBeInTheDocument();
  });

  it('should not show warning when required and checked', () => {
    render(
      <ConsentCheckbox
        checked={true}
        onCheckedChange={mockOnCheckedChange}
        required={true}
      />
    );

    expect(screen.queryByText(/O consentimento é obrigatório para prosseguir/)).not.toBeInTheDocument();
  });

  it('should show details button when showDetails is true', () => {
    render(
      <ConsentCheckbox
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        showDetails={true}
      />
    );

    expect(screen.getByText(/Ver detalhes sobre o compartilhamento/)).toBeInTheDocument();
  });

  it('should not show details button when showDetails is false', () => {
    render(
      <ConsentCheckbox
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        showDetails={false}
      />
    );

    expect(screen.queryByText(/Ver detalhes sobre o compartilhamento/)).not.toBeInTheDocument();
  });

  it('should open dialog when details button is clicked', () => {
    render(
      <ConsentCheckbox
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        showDetails={true}
      />
    );

    fireEvent.click(screen.getByText(/Ver detalhes sobre o compartilhamento/));

    expect(screen.getByText('Compartilhamento de Dados com Instituto Coração Valente')).toBeInTheDocument();
    expect(screen.getByText('Dados Compartilhados')).toBeInTheDocument();
    expect(screen.getByText('Finalidade do Uso')).toBeInTheDocument();
    expect(screen.getByText('Seus Direitos')).toBeInTheDocument();
    expect(screen.getByText('Segurança')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-consent-class';
    
    render(
      <ConsentCheckbox
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        className={customClass}
      />
    );

    const container = screen.getByRole('checkbox').closest('.custom-consent-class');
    expect(container).toBeInTheDocument();
  });

  it('should be checked when checked prop is true', () => {
    render(
      <ConsentCheckbox
        checked={true}
        onCheckedChange={mockOnCheckedChange}
      />
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('should be unchecked when checked prop is false', () => {
    render(
      <ConsentCheckbox
        checked={false}
        onCheckedChange={mockOnCheckedChange}
      />
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });
});