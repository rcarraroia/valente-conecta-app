import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
  type: 'donation' | 'subscription';
  frequency?: 'monthly' | 'yearly';
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  donor: {
    name: string;
    email: string;
    phone?: string;
    document?: string;
  };
  ambassadorCode?: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
}

interface AsaasSplit {
  walletId: string;
  fixedValue?: number;
  percentualValue?: number;
}

interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpfCnpj?: string;
}

interface AsaasPayment {
  id: string;
  status: string;
  value: number;
  invoiceUrl: string;
  pixQrCodeBase64?: string;
  bankSlipUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== PROCESS PAYMENT V2 - BASEADO NA DOCUMENTAÇÃO ASAAS ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const paymentData: PaymentRequest = await req.json();
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY');

    console.log('1. Dados recebidos:', {
      amount: paymentData.amount,
      type: paymentData.type,
      paymentMethod: paymentData.paymentMethod,
      ambassadorCode: paymentData.ambassadorCode,
      donorName: paymentData.donor.name
    });

    if (!asaasApiKey) {
      throw new Error('ASAAS_API_KEY não configurada');
    }

    // Validações básicas
    if (!paymentData.amount || paymentData.amount < 500) {
      throw new Error('Valor mínimo para doação é R$ 5,00');
    }

    if (!paymentData.donor.name || !paymentData.donor.email) {
      throw new Error('Nome e email são obrigatórios');
    }

    // Para cartão de crédito, validar se tem dados do cartão
    if (paymentData.paymentMethod === 'CREDIT_CARD' && !paymentData.creditCard) {
      throw new Error('Dados do cartão de crédito são obrigatórios');
    }

    console.log('2. Validações básicas OK');

    // Buscar embaixador se código fornecido
    let ambassadorData = null;
    let ambassadorLinkId = null;
    
    if (paymentData.ambassadorCode) {
      console.log('3. Buscando embaixador:', paymentData.ambassadorCode);
      
      const { data: ambassadorProfile, error: ambassadorError } = await supabase
        .from('profiles')
        .select('id, full_name, ambassador_wallet_id, is_volunteer')
        .eq('ambassador_code', paymentData.ambassadorCode)
        .eq('is_volunteer', true)
        .maybeSingle();

      if (!ambassadorError && ambassadorProfile) {
        ambassadorData = ambassadorProfile;
        console.log('Embaixador encontrado:', ambassadorData.full_name);

        // Buscar link ativo do embaixador
        const { data: linkData } = await supabase
          .from('ambassador_links')
          .select('id')
          .eq('ambassador_user_id', ambassadorData.id)
          .eq('status', 'active')
          .maybeSingle();

        if (linkData) {
          ambassadorLinkId = linkData.id;
        }
      }
    }

    // Criar/buscar cliente no Asaas
    console.log('4. Criando cliente no Asaas...');
    const customer = await createAsaasCustomer(asaasApiKey, paymentData.donor);
    console.log('Cliente criado:', customer.id);

    // Configurar split
    console.log('5. Configurando split...');
    const splits = await configureSplit(ambassadorData, paymentData.amount);
    console.log('Split configurado:', splits);

    // Criar pagamento ou assinatura
    let result: AsaasPayment;
    
    if (paymentData.type === 'donation') {
      console.log('6. Criando doação...');
      result = await createDonation(asaasApiKey, customer, paymentData, splits);
    } else {
      console.log('6. Criando assinatura...');
      result = await createSubscription(asaasApiKey, customer, paymentData, splits);
    }

    console.log('7. Pagamento criado:', result.id);

    // Salvar no banco
    console.log('8. Salvando no banco...');
    const { error: dbError } = await supabase.from('donations').insert({
      amount: paymentData.amount / 100,
      donor_name: paymentData.donor.name,
      donor_email: paymentData.donor.email,
      payment_method: paymentData.paymentMethod,
      transaction_id: result.id,
      status: 'pending',
      ambassador_link_id: ambassadorLinkId,
      currency: 'BRL'
    });

    if (dbError) {
      console.warn('Erro ao salvar no banco:', dbError);
    }

    console.log('=== PROCESSAMENTO CONCLUÍDO ===');

    return new Response(JSON.stringify({
      success: true,
      payment: result,
      paymentUrl: result.invoiceUrl,
      pixQrCode: result.pixQrCodeBase64,
      bankSlipUrl: result.bankSlipUrl,
      split: splits.length > 0 ? {
        total: paymentData.amount / 100,
        splits: splits,
        ambassador: ambassadorData ? {
          name: ambassadorData.full_name,
          code: paymentData.ambassadorCode
        } : null
      } : null
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('=== ERRO NO PROCESSAMENTO ===');
    console.error('Erro:', error.message);
    console.error('Stack:', error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erro interno do servidor',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

// Função para criar cliente no Asaas
async function createAsaasCustomer(apiKey: string, donor: PaymentRequest['donor']): Promise<AsaasCustomer> {
  const customerData = {
    name: donor.name,
    email: donor.email,
    phone: donor.phone || undefined,
    cpfCnpj: donor.document || undefined,
  };

  const response = await fetch('https://www.asaas.com/api/v3/customers', {
    method: 'POST',
    headers: {
      'access_token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customerData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Erro ao criar cliente: ${response.status} - ${errorData}`);
  }

  return await response.json();
}

// Função para configurar split
async function configureSplit(ambassadorData: any, amount: number): Promise<AsaasSplit[]> {
  const splits: AsaasSplit[] = [];
  
  // WALLET IDs FIXAS - Confirmadas pelo cliente
  const WALLET_IDS = {
    // instituto: Recebe automaticamente via API Key (conta principal)
    renum: 'f9c7d1dd-9e52-4e81-8194-8b666f276405',     // Renum - Dona do sistema (10% sempre)
    noAmbassador: 'c0c31b6a-2481-4e3f-a6de-91c3ff834d1f' // Para doações sem embaixador (20%)
  };
  
  const totalAmountInReais = amount / 100;
  
  if (ambassadorData?.ambassador_wallet_id) {
    // COM embaixador: Embaixador 20%, Renum 10% (Instituto recebe 70% automaticamente)
    const ambassadorShare = Math.round((totalAmountInReais * 0.20) * 100) / 100;
    const renumShare = Math.round((totalAmountInReais * 0.10) * 100) / 100;

    splits.push(
      { walletId: ambassadorData.ambassador_wallet_id, fixedValue: ambassadorShare },
      { walletId: WALLET_IDS.renum, fixedValue: renumShare }
      // Instituto recebe automaticamente o restante (70%)
    );
  } else {
    // SEM embaixador: Renum 10%, Special 20% (Instituto recebe 70% automaticamente)
    const renumShare = Math.round((totalAmountInReais * 0.10) * 100) / 100;
    const specialShare = Math.round((totalAmountInReais * 0.20) * 100) / 100;

    splits.push(
      { walletId: WALLET_IDS.renum, fixedValue: renumShare },
      { walletId: WALLET_IDS.noAmbassador, fixedValue: specialShare }
      // Instituto recebe automaticamente o restante (70%)
    );
  }

  return splits;
}

// Função para criar doação (cobrança única)
async function createDonation(apiKey: string, customer: AsaasCustomer, paymentData: PaymentRequest, splits: AsaasSplit[]): Promise<AsaasPayment> {
  const paymentPayload: any = {
    customer: customer.id,
    billingType: paymentData.paymentMethod,
    value: paymentData.amount / 100,
    dueDate: new Date().toISOString().split('T')[0],
    description: 'Doação - Instituto Coração Valente',
    externalReference: `DONATION_${Date.now()}`,
  };

  // Adicionar split se configurado
  if (splits.length > 0) {
    paymentPayload.split = splits;
  }

  // Para cartão de crédito, adicionar dados do cartão
  if (paymentData.paymentMethod === 'CREDIT_CARD' && paymentData.creditCard) {
    paymentPayload.creditCard = {
      holderName: paymentData.creditCard.holderName,
      number: paymentData.creditCard.number,
      expiryMonth: paymentData.creditCard.expiryMonth,
      expiryYear: paymentData.creditCard.expiryYear,
      ccv: paymentData.creditCard.ccv
    };
    paymentPayload.creditCardHolderInfo = {
      name: customer.name,
      email: customer.email,
      cpfCnpj: customer.cpfCnpj,
      phone: customer.phone
    };
  }

  const response = await fetch('https://www.asaas.com/api/v3/payments', {
    method: 'POST',
    headers: {
      'access_token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentPayload),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Erro ao criar doação: ${response.status} - ${errorData}`);
  }

  return await response.json();
}

// Função para criar assinatura (cobrança recorrente)
async function createSubscription(apiKey: string, customer: AsaasCustomer, paymentData: PaymentRequest, splits: AsaasSplit[]): Promise<AsaasPayment> {
  const subscriptionPayload: any = {
    customer: customer.id,
    billingType: paymentData.paymentMethod,
    value: paymentData.amount / 100,
    cycle: paymentData.frequency === 'monthly' ? 'MONTHLY' : 'YEARLY',
    description: `Apoio ${paymentData.frequency === 'monthly' ? 'Mensal' : 'Anual'} - Instituto Coração Valente`,
    nextDueDate: new Date().toISOString().split('T')[0],
    externalReference: `SUBSCRIPTION_${Date.now()}`,
  };

  // Adicionar split se configurado
  if (splits.length > 0) {
    subscriptionPayload.split = splits;
  }

  // Para cartão de crédito, adicionar dados do cartão
  if (paymentData.paymentMethod === 'CREDIT_CARD' && paymentData.creditCard) {
    subscriptionPayload.creditCard = {
      holderName: paymentData.creditCard.holderName,
      number: paymentData.creditCard.number,
      expiryMonth: paymentData.creditCard.expiryMonth,
      expiryYear: paymentData.creditCard.expiryYear,
      ccv: paymentData.creditCard.ccv
    };
    subscriptionPayload.creditCardHolderInfo = {
      name: customer.name,
      email: customer.email,
      cpfCnpj: customer.cpfCnpj,
      phone: customer.phone
    };
  }

  const response = await fetch('https://www.asaas.com/api/v3/subscriptions', {
    method: 'POST',
    headers: {
      'access_token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscriptionPayload),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Erro ao criar assinatura: ${response.status} - ${errorData}`);
  }

  const subscription = await response.json();

  // Para assinaturas, buscar a primeira cobrança
  const paymentsResponse = await fetch(`https://www.asaas.com/api/v3/payments?subscription=${subscription.id}`, {
    method: 'GET',
    headers: {
      'access_token': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (paymentsResponse.ok) {
    const paymentsData = await paymentsResponse.json();
    if (paymentsData.data && paymentsData.data.length > 0) {
      const firstPayment = paymentsData.data[0];
      return {
        id: subscription.id,
        status: firstPayment.status,
        value: firstPayment.value,
        invoiceUrl: firstPayment.invoiceUrl,
        pixQrCodeBase64: firstPayment.pixQrCodeBase64,
        bankSlipUrl: firstPayment.bankSlipUrl
      };
    }
  }

  return {
    id: subscription.id,
    status: 'PENDING',
    value: subscription.value,
    invoiceUrl: '',
    pixQrCodeBase64: undefined,
    bankSlipUrl: undefined
  };
}

serve(handler);