import { supabase } from '@/integrations/supabase/client';

// Wallets reservadas do sistema
export const SYSTEM_WALLETS = [
  'eff311bc-7737-4870-93cd-16080c00d379', // Instituto Coração Valente
  'f9c7d1dd-9e52-4e81-8194-8b666f276405', // Renum (Administrador)
  'c0c31b6a-2481-4e3f-a6de-91c3ff834d1f'  // Wallet Especial (sem embaixador)
];

export interface WalletValidationResult {
  isValid: boolean;
  message: string;
  errorType?: 'format' | 'system' | 'duplicate' | 'network';
}

/**
 * Valida formato UUID de uma Wallet ID
 */
export const validateWalletFormat = (walletId: string): boolean => {
  if (!walletId || walletId.length < 10) return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(walletId);
};

/**
 * Verifica se a wallet é reservada do sistema
 */
export const isSystemWallet = (walletId: string): boolean => {
  return SYSTEM_WALLETS.includes(walletId.toLowerCase());
};

/**
 * Verifica se a wallet já está em uso por outro embaixador
 */
export const checkWalletDuplicate = async (
  walletId: string, 
  currentUserId?: string
): Promise<{ isDuplicate: boolean; ownerName?: string }> => {
  try {
    const query = supabase
      .from('profiles')
      .select('id, full_name')
      .eq('ambassador_wallet_id', walletId);

    // Se temos um usuário atual, excluir ele da busca
    if (currentUserId) {
      query.neq('id', currentUserId);
    }

    const { data, error } = await query.maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar duplicata de wallet:', error);
      throw error;
    }

    return {
      isDuplicate: !!data,
      ownerName: data?.full_name || undefined
    };
  } catch (error) {
    console.error('Erro na verificação de duplicata:', error);
    throw error;
  }
};

/**
 * Validação completa de Wallet ID
 */
export const validateWalletId = async (
  walletId: string,
  currentUserId?: string
): Promise<WalletValidationResult> => {
  // 1. Validar formato
  if (!validateWalletFormat(walletId)) {
    return {
      isValid: false,
      message: 'Formato inválido. Use formato UUID (ex: f9c7d1dd-9e52-4e81-8194-8b666f276405)',
      errorType: 'format'
    };
  }

  // 2. Verificar se é wallet do sistema
  if (isSystemWallet(walletId)) {
    return {
      isValid: false,
      message: 'Esta Wallet ID é reservada para o sistema e não pode ser usada',
      errorType: 'system'
    };
  }

  // 3. Verificar duplicatas
  try {
    const { isDuplicate, ownerName } = await checkWalletDuplicate(walletId, currentUserId);
    
    if (isDuplicate) {
      return {
        isValid: false,
        message: `Wallet já em uso por ${ownerName || 'outro embaixador'}`,
        errorType: 'duplicate'
      };
    }

    return {
      isValid: true,
      message: 'Wallet ID válida e disponível'
    };
  } catch (error) {
    return {
      isValid: false,
      message: 'Erro ao verificar disponibilidade da Wallet ID',
      errorType: 'network'
    };
  }
};

/**
 * Utilitário para obter mensagem de erro amigável
 */
export const getWalletErrorMessage = (result: WalletValidationResult): string => {
  switch (result.errorType) {
    case 'format':
      return 'Formato inválido. Verifique se o Wallet ID está correto.';
    case 'system':
      return 'Esta Wallet ID é reservada e não pode ser usada.';
    case 'duplicate':
      return result.message;
    case 'network':
      return 'Erro de conexão. Tente novamente.';
    default:
      return result.message;
  }
};

/**
 * Utilitário para logging de validações (para auditoria)
 */
export const logWalletValidation = (
  walletId: string,
  result: WalletValidationResult,
  userId?: string
) => {
  console.log('Wallet Validation:', {
    walletId: walletId.substring(0, 8) + '...', // Log parcial por segurança
    isValid: result.isValid,
    errorType: result.errorType,
    userId: userId?.substring(0, 8) + '...',
    timestamp: new Date().toISOString()
  });
};