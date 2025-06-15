
import { SplitConfiguration, PaymentSplit, AsaasSplit } from '@/types/payment';

// Configuração com dados reais do Asaas
const SPLIT_CONFIG: SplitConfiguration = {
  instituteWalletId: 'f9c7d1dd-9e52-4e81-8194-8b666f276405', // Wallet ID fornecido
  adminWalletId: 'f9c7d1dd-9e52-4e81-8194-8b666f276405', // Usando o mesmo wallet por enquanto
  adminCommissionPercent: 10, // 10% para administrador do app
  ambassadorCommissionPercent: 10, // 10% para embaixadores
  ambassadorWallets: {
    // Mapeamento de códigos de embaixadores para IDs de carteiras
    // Exemplo: 'AMB001': 'WALLET_AMBASSADOR_1_ID'
  }
};

export const calculatePaymentSplit = (
  amount: number, 
  ambassadorCode?: string
): PaymentSplit => {
  const splits: AsaasSplit[] = [];
  
  // Calcular comissão do administrador (sempre aplicada)
  const adminShare = Math.round((amount * SPLIT_CONFIG.adminCommissionPercent) / 100);
  
  let ambassadorShare = 0;
  let instituteShare = amount - adminShare; // Instituto recebe o que sobra após a comissão do admin

  if (ambassadorCode && SPLIT_CONFIG.ambassadorWallets[ambassadorCode]) {
    // Calcular comissão do embaixador sobre o valor total
    ambassadorShare = Math.round((amount * SPLIT_CONFIG.ambassadorCommissionPercent) / 100);
    
    // Instituto recebe 80% do total (ou seja, valor total menos admin e embaixador)
    instituteShare = amount - adminShare - ambassadorShare;

    // Adicionar split para o embaixador
    splits.push({
      walletId: SPLIT_CONFIG.ambassadorWallets[ambassadorCode],
      fixedValue: ambassadorShare
    });
  }

  // Adicionar split para o administrador (sempre presente, mas oculto na UI)
  splits.push({
    walletId: SPLIT_CONFIG.adminWalletId,
    fixedValue: adminShare
  });

  // Adicionar split para o instituto (valor restante)
  splits.push({
    walletId: SPLIT_CONFIG.instituteWalletId,
    fixedValue: instituteShare
  });

  return {
    ambassadorCode,
    ambassadorShare,
    instituteShare,
    adminShare, // Incluído para rastreamento interno
    splits
  };
};

export const updateSplitConfiguration = (config: Partial<SplitConfiguration>) => {
  Object.assign(SPLIT_CONFIG, config);
};

export const addAmbassadorWallet = (ambassadorCode: string, walletId: string) => {
  SPLIT_CONFIG.ambassadorWallets[ambassadorCode] = walletId;
};

export const getSplitConfiguration = (): SplitConfiguration => {
  return { ...SPLIT_CONFIG };
};

// Função para calcular percentuais para exibição na UI (oculta a comissão do admin)
export const getDisplayPercentages = () => {
  return {
    institute: 80,
    ambassador: SPLIT_CONFIG.ambassadorCommissionPercent,
    // adminCommission não é retornado para manter oculto na UI
  };
};
