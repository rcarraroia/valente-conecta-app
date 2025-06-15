
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
}

interface AsaasSplit {
  walletId: string;
  fixedValue?: number;
  percentualValue?: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== INÍCIO DO PROCESSO DE PAGAMENTO ===');
  
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

    console.log('Dados do pagamento recebidos:', {
      amount: paymentData.amount,
      type: paymentData.type,
      frequency: paymentData.frequency,
      paymentMethod: paymentData.paymentMethod,
      ambassadorCode: paymentData.ambassadorCode,
      donorName: paymentData.donor.name
    });

    if (!asaasApiKey) {
      console.error('ASAAS_API_KEY não encontrada');
      throw new Error('Configuração de pagamento não encontrada');
    }

    // 1. Validações básicas
    if (!paymentData.amount || paymentData.amount < 100) {
      throw new Error('Valor mínimo para doação é R$ 1,00');
    }

    if (!paymentData.donor.name || !paymentData.donor.email) {
      throw new Error('Nome e email são obrigatórios');
    }

    // 2. Buscar dados do embaixador se código fornecido
    let ambassadorData = null;
    let ambassadorLinkId = null;
    
    if (paymentData.ambassadorCode) {
      console.log('Buscando embaixador:', paymentData.ambassadorCode);
      
      const { data: ambassadorProfile, error: ambassadorError } = await supabase
        .from('profiles')
        .select('id, full_name, ambassador_wallet_id, is_volunteer')
        .eq('ambassador_code', paymentData.ambassadorCode)
        .eq('is_volunteer', true)
        .maybeSingle();

      if (ambassadorError) {
        console.warn('Erro ao buscar embaixador:', ambassadorError.message);
      } else if (ambassadorProfile) {
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

    // 3. Criar/buscar cliente no Asaas
    console.log('Criando cliente no Asaas...');
    const customerData = {
      name: paymentData.donor.name,
      email: paymentData.donor.email,
      phone: paymentData.donor.phone || undefined,
      cpfCnpj: paymentData.donor.document || undefined,
    };

    const customerResponse = await fetch('https://www.asaas.com/api/v3/customers', {
      method: 'POST',
      headers: {
        'access_token': asaasApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });

    if (!customerResponse.ok) {
      const errorData = await customerResponse.text();
      console.error('Erro ao criar cliente:', errorData);
      throw new Error('Erro ao criar cliente no sistema de pagamento');
    }

    const customer = await customerResponse.json();
    console.log('Cliente criado:', customer.id);

    // 4. Configurar split se necessário
    const splits: AsaasSplit[] = [];
    const instituteWalletId = 'f9c7d1dd-9e52-4e81-8194-8b666f276405';
    const totalAmountInReais = paymentData.amount / 100;
    
    let ambassadorShare = 0;
    let instituteShare = totalAmountInReais;

    if (ambassadorData?.ambassador_wallet_id && ambassadorData.ambassador_wallet_id !== instituteWalletId) {
      const ambassadorCommissionPercent = 10;
      ambassadorShare = Math.round((totalAmountInReais * ambassadorCommissionPercent) / 100 * 100) / 100;
      instituteShare = totalAmountInReais - ambassadorShare;

      splits.push({
        walletId: ambassadorData.ambassador_wallet_id,
        fixedValue: ambassadorShare
      });

      splits.push({
        walletId: instituteWalletId,
        fixedValue: instituteShare
      });

      console.log('Split configurado:', { ambassadorShare, instituteShare });
    }

    // 5. Criar pagamento/assinatura na Asaas
    const externalReference = `${paymentData.type.toUpperCase()}_${Date.now()}`;
    
    let asaasResponse;
    let asaasResult;
    
    if (paymentData.type === 'donation') {
      const paymentPayload = {
        customer: customer.id,
        billingType: paymentData.paymentMethod,
        value: totalAmountInReais,
        dueDate: new Date().toISOString().split('T')[0],
        description: `Doação - Instituto Coração Valente`,
        externalReference,
        split: splits.length > 0 ? splits : undefined,
      };

      console.log('Criando cobrança:', paymentPayload);

      asaasResponse = await fetch('https://www.asaas.com/api/v3/payments', {
        method: 'POST',
        headers: {
          'access_token': asaasApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentPayload),
      });

      if (!asaasResponse.ok) {
        const errorData = await asaasResponse.text();
        console.error('Erro da Asaas (doação):', errorData);
        throw new Error('Erro ao processar doação');
      }

      asaasResult = await asaasResponse.json();
      console.log('Doação criada:', asaasResult.id);

    } else if (paymentData.type === 'subscription') {
      const subscriptionPayload = {
        customer: customer.id,
        billingType: paymentData.paymentMethod || 'CREDIT_CARD',
        value: totalAmountInReais,
        cycle: paymentData.frequency === 'monthly' ? 'MONTHLY' : 'YEARLY',
        description: `Apoio ${paymentData.frequency === 'monthly' ? 'Mensal' : 'Anual'} - Instituto Coração Valente`,
        nextDueDate: new Date().toISOString().split('T')[0],
        externalReference,
        split: splits.length > 0 ? splits : undefined,
      };

      console.log('Criando assinatura:', subscriptionPayload);

      asaasResponse = await fetch('https://www.asaas.com/api/v3/subscriptions', {
        method: 'POST',
        headers: {
          'access_token': asaasApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionPayload),
      });

      if (!asaasResponse.ok) {
        const errorData = await asaasResponse.text();
        console.error('Erro da Asaas (assinatura):', errorData);
        throw new Error('Erro ao processar assinatura');
      }

      asaasResult = await asaasResponse.json();
      console.log('Assinatura criada:', asaasResult.id);

      // Para assinaturas, buscar a primeira cobrança gerada
      console.log('Buscando primeira cobrança da assinatura...');
      
      const paymentsResponse = await fetch(`https://www.asaas.com/api/v3/payments?subscription=${asaasResult.id}`, {
        method: 'GET',
        headers: {
          'access_token': asaasApiKey,
          'Content-Type': 'application/json',
        },
      });

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        if (paymentsData.data && paymentsData.data.length > 0) {
          const firstPayment = paymentsData.data[0];
          console.log('Primeira cobrança encontrada:', firstPayment.id);
          
          // Usar dados da primeira cobrança para o checkout
          asaasResult.invoiceUrl = firstPayment.invoiceUrl;
          asaasResult.pixQrCodeBase64 = firstPayment.pixQrCodeBase64;
        }
      }
    }

    // 6. Salvar no banco
    const { error: dbError } = await supabase.from('donations').insert({
      amount: totalAmountInReais,
      donor_name: paymentData.donor.name,
      donor_email: paymentData.donor.email,
      payment_method: paymentData.paymentMethod,
      transaction_id: asaasResult.id,
      status: 'pending',
      ambassador_link_id: ambassadorLinkId,
      currency: 'BRL'
    });

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
    }

    console.log('=== PROCESSAMENTO CONCLUÍDO ===');

    return new Response(JSON.stringify({
      success: true,
      payment: asaasResult,
      paymentUrl: asaasResult.invoiceUrl,
      pixQrCode: asaasResult.pixQrCodeBase64,
      split: {
        total: totalAmountInReais,
        instituto: instituteShare,
        embaixador: ambassadorShare,
        ambassador: ambassadorData ? {
          name: ambassadorData.full_name,
          code: paymentData.ambassadorCode
        } : null
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('=== ERRO NO PROCESSAMENTO ===');
    console.error('Erro detalhado:', error.message);
    
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

serve(handler);
