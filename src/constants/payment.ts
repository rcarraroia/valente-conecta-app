/**
 * Constantes de Pagamento - Instituto Coração Valente
 * 
 * Centralização de valores e configurações relacionadas a pagamentos,
 * doações e assinaturas para garantir consistência em todo o sistema.
 */

export const PAYMENT_CONSTANTS = {
  // Valores mínimos (em centavos e reais)
  MIN_DONATION_CENTS: 1500,  // R$ 15,00
  MIN_DONATION_REAIS: 15,
  
  // Valores sugeridos para doações e assinaturas (em reais)
  SUGGESTED_AMOUNTS: [25, 50, 100, 200],
  
  // Valores sugeridos em centavos (para uso interno)
  SUGGESTED_AMOUNTS_CENTS: [2500, 5000, 10000, 20000],
  
  // Planos de assinatura mensal
  SUBSCRIPTION_PLANS: [
    { value: 2500, label: 'R$ 25/mês', description: 'Apoiador Bronze' },
    { value: 5000, label: 'R$ 50/mês', description: 'Apoiador Prata' },
    { value: 10000, label: 'R$ 100/mês', description: 'Apoiador Ouro' },
    { value: 20000, label: 'R$ 200/mês', description: 'Apoiador Diamante' }
  ],
  
  // Mensagens de erro
  ERROR_MESSAGES: {
    MIN_VALUE: 'O valor mínimo para doação é R$ 15,00.',
    MIN_VALUE_SUBSCRIPTION: 'O valor mínimo para assinatura é R$ 15,00.',
    REQUIRED_FIELDS: 'Nome e email são obrigatórios.',
    CREDIT_CARD_REQUIRED: 'Preencha todos os dados do cartão de crédito.',
  }
} as const;

/**
 * Formata valor em centavos para moeda brasileira
 */
export const formatCurrency = (cents: number): string => {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

/**
 * Valida se o valor está acima do mínimo
 */
export const isValidDonationAmount = (cents: number): boolean => {
  return cents >= PAYMENT_CONSTANTS.MIN_DONATION_CENTS;
};
