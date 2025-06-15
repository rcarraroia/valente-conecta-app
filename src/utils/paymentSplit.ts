
import { SplitConfiguration, PaymentSplit, AsaasSplit } from '@/types/payment';

// Configuração de exemplo - deve ser movida para variáveis de ambiente ou banco de dados
const SPLIT_CONFIG: SplitConfiguration = {
  instituteWalletId: 'WALLET_INSTITUTO_ID', // ID da carteira do instituto no Asaas
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
  let ambassadorShare = 0;
  let instituteShare = amount;

  if (ambassadorCode && SPLIT_CONFIG.ambassadorWallets[ambassadorCode]) {
    // Calcular comissão do embaixador
    ambassadorShare = Math.round((amount * SPLIT_CONFIG.ambassadorCommissionPercent) / 100);
    instituteShare = amount - ambassadorShare;

    // Adicionar split para o embaixador
    splits.push({
      walletId: SPLIT_CONFIG.ambassadorWallets[ambassadorCode],
      fixedValue: ambassadorShare
    });

    // Adicionar split para o instituto (valor restante)
    splits.push({
      walletId: SPLIT_CONFIG.instituteWalletId,
      fixedValue: instituteShare
    });
  } else {
    // Sem embaixador, 100% vai para o instituto
    splits.push({
      walletId: SPLIT_CONFIG.instituteWalletId,
      fixedValue: amount
    });
  }

  return {
    ambassadorCode,
    ambassadorShare,
    instituteShare,
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
