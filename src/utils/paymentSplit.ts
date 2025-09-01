
import { SplitConfiguration, PaymentSplit, AsaasSplit } from '@/types/payment';
import { supabase } from '@/integrations/supabase/client';

// Configuração com dados reais do Asaas - Wallet ID atualizada
const SPLIT_CONFIG: SplitConfiguration = {
  instituteWalletId: 'eff311bc-7737-4870-93cd-16080c00d379', // Nova Wallet ID do instituto
  adminWalletId: 'f9c7d1dd-9e52-4e81-8194-8b666f276405', // Wallet ID da Renum (administrador)
  adminCommissionPercent: 10, // 10% para Renum quando há embaixador, 30% quando não há
  ambassadorCommissionPercent: 20, // 20% para embaixadores (aumentou de 10%)
  ambassadorWallets: {
    // Mapeamento será feito via banco de dados
  }
};

// Função para buscar dados completos do embaixador no banco
export const getAmbassadorData = async (ambassadorCode: string) => {
  try {
    console.log('Buscando dados do embaixador:', ambassadorCode);
    
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        ambassador_wallet_id,
        is_volunteer
      `)
      .eq('ambassador_code', ambassadorCode)
      .eq('is_volunteer', true)
      .single();

    if (error) {
      console.error('Erro ao buscar embaixador:', error);
      return null;
    }

    if (!data?.ambassador_wallet_id) {
      console.warn('Embaixador encontrado mas sem wallet ID configurado:', ambassadorCode);
      return null;
    }

    console.log('Dados do embaixador encontrados:', data);
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados do embaixador:', error);
    return null;
  }
};

// Função para registrar a doação no banco com link do embaixador
export const recordDonationWithAmbassador = async (
  donationData: {
    amount: number;
    donor_name: string;
    donor_email: string;
    payment_method: string;
    transaction_id: string;
    status: string;
  },
  ambassadorCode?: string
) => {
  try {
    let ambassadorLinkId = null;

    if (ambassadorCode) {
      // Buscar o link do embaixador
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('ambassador_code', ambassadorCode)
        .single();

      if (profileData) {
        const { data: linkData } = await supabase
          .from('ambassador_links')
          .select('id')
          .eq('ambassador_user_id', profileData.id)
          .eq('status', 'active')
          .single();

        if (linkData) {
          ambassadorLinkId = linkData.id;
        }
      }
    }

    const { data, error } = await supabase
      .from('donations')
      .insert({
        ...donationData,
        ambassador_link_id: ambassadorLinkId,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao registrar doação:', error);
      return null;
    }

    console.log('Doação registrada com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao registrar doação:', error);
    return null;
  }
};

// Função principal para calcular split com dados do banco
export const calculatePaymentSplitWithDB = async (
  amount: number,
  ambassadorCode?: string
): Promise<PaymentSplit> => {
  const splits: AsaasSplit[] = [];
  
  console.log('Calculando split para:', { amount, ambassadorCode });
  
  let ambassadorShare = 0;
  let adminShare = 0;
  let instituteShare = 0;
  let ambassadorWalletId = null;

  if (ambassadorCode) {
    // Buscar dados completos do embaixador
    const ambassadorData = await getAmbassadorData(ambassadorCode);
    
    if (ambassadorData && ambassadorData.ambassador_wallet_id) {
      ambassadorWalletId = ambassadorData.ambassador_wallet_id;
      
      // Cenário COM embaixador: Instituto 70%, Embaixador 20%, Renum 10%
      ambassadorShare = Math.round((amount * SPLIT_CONFIG.ambassadorCommissionPercent) / 100);
      adminShare = Math.round((amount * SPLIT_CONFIG.adminCommissionPercent) / 100);
      instituteShare = Math.round((amount * 70) / 100); // 70% fixo para o instituto

      // Adicionar split para o embaixador
      splits.push({
        walletId: ambassadorWalletId,
        fixedValue: ambassadorShare
      });

      console.log('Split configurado COM embaixador:', {
        walletId: ambassadorWalletId,
        ambassadorShare,
        adminShare,
        instituteShare,
        ambassadorName: ambassadorData.full_name
      });
    } else {
      console.warn('Embaixador não encontrado ou sem wallet configurado:', ambassadorCode);
      // Se embaixador não encontrado, tratar como cenário sem embaixador
      adminShare = Math.round((amount * 30) / 100); // 30% para Renum
      instituteShare = Math.round((amount * 70) / 100); // 70% para instituto
    }
  } else {
    // Cenário SEM embaixador: Instituto 70%, Renum 30%
    adminShare = Math.round((amount * 30) / 100); // 30% para Renum
    instituteShare = Math.round((amount * 70) / 100); // 70% para instituto
  }

  // Adicionar split para a Renum (sempre presente)
  splits.push({
    walletId: SPLIT_CONFIG.adminWalletId,
    fixedValue: adminShare
  });

  // Adicionar split para o instituto (sempre presente)
  splits.push({
    walletId: SPLIT_CONFIG.instituteWalletId,
    fixedValue: instituteShare
  });

  const result = {
    ambassadorCode,
    ambassadorShare,
    instituteShare,
    adminShare,
    splits
  };

  console.log('Split calculado:', result);
  return result;
};

// Função para atualizar performance do embaixador após doação
export const updateAmbassadorPerformance = async (
  ambassadorCode: string,
  donationAmount: number
) => {
  try {
    const ambassadorData = await getAmbassadorData(ambassadorCode);
    
    if (!ambassadorData) {
      console.warn('Embaixador não encontrado para atualizar performance:', ambassadorCode);
      return;
    }

    // Atualizar performance do embaixador
    const { error } = await supabase
      .from('ambassador_performance')
      .upsert({
        ambassador_user_id: ambassadorData.id,
        total_donations_amount: donationAmount, // Será somado via trigger/função
        total_donations_count: 1, // Será incrementado via trigger/função
        last_updated_at: new Date().toISOString()
      }, {
        onConflict: 'ambassador_user_id'
      });

    if (error) {
      console.error('Erro ao atualizar performance do embaixador:', error);
    } else {
      console.log('Performance do embaixador atualizada:', ambassadorCode);
    }
  } catch (error) {
    console.error('Erro ao atualizar performance:', error);
  }
};

// Funções legadas mantidas para compatibilidade
export const calculatePaymentSplit = (
  amount: number, 
  ambassadorCode?: string
): PaymentSplit => {
  console.warn('Usando função legada calculatePaymentSplit. Use calculatePaymentSplitWithDB para funcionalidade completa.');
  
  const splits: AsaasSplit[] = [];
  let ambassadorShare = 0;
  let adminShare = 0;
  let instituteShare = 0;

  if (ambassadorCode && SPLIT_CONFIG.ambassadorWallets[ambassadorCode]) {
    // Cenário COM embaixador: Instituto 70%, Embaixador 20%, Renum 10%
    ambassadorShare = Math.round((amount * SPLIT_CONFIG.ambassadorCommissionPercent) / 100);
    adminShare = Math.round((amount * SPLIT_CONFIG.adminCommissionPercent) / 100);
    instituteShare = Math.round((amount * 70) / 100);

    splits.push({
      walletId: SPLIT_CONFIG.ambassadorWallets[ambassadorCode],
      fixedValue: ambassadorShare
    });
  } else {
    // Cenário SEM embaixador: Instituto 70%, Renum 30%
    adminShare = Math.round((amount * 30) / 100);
    instituteShare = Math.round((amount * 70) / 100);
  }

  splits.push({
    walletId: SPLIT_CONFIG.adminWalletId,
    fixedValue: adminShare
  });

  splits.push({
    walletId: SPLIT_CONFIG.instituteWalletId,
    fixedValue: instituteShare
  });

  return {
    ambassadorCode,
    ambassadorShare,
    instituteShare,
    adminShare,
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

export const getDisplayPercentages = () => {
  return {
    institute: 70, // Instituto sempre recebe 70%
    ambassador: SPLIT_CONFIG.ambassadorCommissionPercent, // 20% para embaixadores
    renum: 10, // Renum recebe 10% com embaixador, 30% sem embaixador
  };
};

export const getAmbassadorWalletId = async (ambassadorCode: string): Promise<string | null> => {
  const data = await getAmbassadorData(ambassadorCode);
  return data?.ambassador_wallet_id || null;
};
