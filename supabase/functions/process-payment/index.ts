
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const paymentData: PaymentRequest = await req.json();
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY');

    if (!asaasApiKey) {
      throw new Error('ASAAS_API_KEY não configurada');
    }

    console.log('=== INÍCIO DO PROCESSAMENTO DE PAGAMENTO ===');
    console.log('Dados recebidos:', {
      amount: paymentData.amount,
      type: paymentData.type,
      ambassadorCode: paymentData.ambassadorCode,
      donor: paymentData.donor.name
    });

    // 1. Buscar dados do embaixador se código fornecido
    let ambassadorData = null;
    let ambassadorLinkId = null;
    
    if (paymentData.ambassadorCode) {
      console.log('Buscando dados do embaixador:', paymentData.ambassadorCode);
      
      const { data: ambassadorProfile, error: ambassadorError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          ambassador_wallet_id,
          is_volunteer
        `)
        .eq('ambassador_code', paymentData.ambassadorCode)
        .eq('is_volunteer', true)
        .single();

      if (ambassadorError) {
        console.warn('Erro ao buscar embaixador:', ambassadorError);
      } else if (ambassadorProfile) {
        ambassadorData = ambassadorProfile;
        console.log('Embaixador encontrado:', {
          name: ambassadorData.full_name,
          hasWallet: !!ambassadorData.ambassador_wallet_id
        });

        // Buscar link ativo do embaixador
        const { data: linkData } = await supabase
          .from('ambassador_links')
          .select('id')
          .eq('ambassador_user_id', ambassadorData.id)
          .eq('status', 'active')
          .maybeSingle();

        if (linkData) {
          ambassadorLinkId = linkData.id;
          console.log('Link do embaixador encontrado:', ambassadorLinkId);
        }
      }
    }

    // 2. Criar/buscar cliente no Asaas
    console.log('Criando cliente no Asaas...');
    const customerData = {
      name: paymentData.donor.name,
      email: paymentData.donor.email,
      phone: paymentData.donor.phone,
      cpfCnpj: paymentData.donor.document,
    };

    const customerResponse = await fetch('https://www.asaas.com/api/v3/customers', {
      method: 'POST',
      headers: {
        'access_token': asaasApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });

    const customer = await customerResponse.json();
    console.log('Cliente no Asaas:', customer.id);

    // 3. Configurar split de pagamentos
    const splits: AsaasSplit[] = [];
    const instituteWalletId = 'f9c7d1dd-9e52-4e81-8194-8b666f276405';
    const adminWalletId = 'f9c7d1dd-9e52-4e81-8194-8b666f276405'; // Mesmo wallet por enquanto
    
    // Calcular valores do split
    const totalAmountInReais = paymentData.amount / 100;
    const adminCommissionPercent = 10;
    const ambassadorCommissionPercent = 10;
    
    const adminShare = Math.round((totalAmountInReais * adminCommissionPercent) / 100 * 100) / 100;
    let ambassadorShare = 0;
    let instituteShare = totalAmountInReais - adminShare;

    // Configurar split para embaixador se aplicável
    if (ambassadorData && ambassadorData.ambassador_wallet_id) {
      ambassadorShare = Math.round((totalAmountInReais * ambassadorCommissionPercent) / 100 * 100) / 100;
      instituteShare = totalAmountInReais - adminShare - ambassadorShare;

      splits.push({
        walletId: ambassadorData.ambassador_wallet_id,
        fixedValue: ambassadorShare
      });

      console.log('Split do embaixador configurado:', {
        walletId: ambassadorData.ambassador_wallet_id,
        value: ambassadorShare
      });
    } else if (paymentData.ambassadorCode) {
      console.warn('Embaixador informado mas não possui wallet configurado');
    }

    // Adicionar split para admin (sempre presente, mas oculto)
    splits.push({
      walletId: adminWalletId,
      fixedValue: adminShare
    });

    // Adicionar split para instituto (valor restante)
    splits.push({
      walletId: instituteWalletId,
      fixedValue: instituteShare
    });

    console.log('Split final configurado:', {
      total: totalAmountInReais,
      instituto: instituteShare,
      embaixador: ambassadorShare,
      admin: adminShare,
      splitsCount: splits.length
    });

    // 4. Criar pagamento ou assinatura na Asaas
    let asaasResponse;
    const externalReference = paymentData.ambassadorCode 
      ? `${paymentData.type.toUpperCase()}_${paymentData.ambassadorCode}_${Date.now()}`
      : `${paymentData.type.toUpperCase()}_${Date.now()}`;

    if (paymentData.type === 'donation') {
      // Pagamento único
      const paymentPayload = {
        customer: customer.id,
        billingType: paymentData.paymentMethod,
        value: totalAmountInReais,
        dueDate: new Date().toISOString().split('T')[0],
        description: `Doação - Instituto Coração Valente${paymentData.ambassadorCode ? ` (Embaixador: ${paymentData.ambassadorCode})` : ''}`,
        externalReference: externalReference,
        split: splits.length > 1 ? splits : undefined, // Só incluir split se houver mais de 1 destinatário
      };

      console.log('Criando cobrança única na Asaas:', {
        value: paymentPayload.value,
        billingType: paymentPayload.billingType,
        hasSplit: !!paymentPayload.split,
        splitCount: paymentPayload.split?.length || 0
      });

      asaasResponse = await fetch('https://www.asaas.com/api/v3/payments', {
        method: 'POST',
        headers: {
          'access_token': asaasApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentPayload),
      });
    } else {
      // Assinatura
      const subscriptionPayload = {
        customer: customer.id,
        billingType: paymentData.paymentMethod,
        value: totalAmountInReais,
        cycle: paymentData.frequency === 'monthly' ? 'MONTHLY' : 'YEARLY',
        description: `Apoio ${paymentData.frequency === 'monthly' ? 'Mensal' : 'Anual'} - Instituto Coração Valente${paymentData.ambassadorCode ? ` (Embaixador: ${paymentData.ambassadorCode})` : ''}`,
        nextDueDate: new Date().toISOString().split('T')[0],
        externalReference: externalReference,
        split: splits.length > 1 ? splits : undefined,
      };

      console.log('Criando assinatura na Asaas:', {
        value: subscriptionPayload.value,
        cycle: subscriptionPayload.cycle,
        hasSplit: !!subscriptionPayload.split
      });

      asaasResponse = await fetch('https://www.asaas.com/api/v3/subscriptions', {
        method: 'POST',
        headers: {
          'access_token': asaasApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionPayload),
      });
    }

    const result = await asaasResponse.json();
    console.log('Resposta da Asaas:', {
      success: asaasResponse.ok,
      id: result.id,
      status: result.status
    });

    if (!asaasResponse.ok) {
      console.error('Erro detalhado da Asaas:', result);
      throw new Error(`Erro do Asaas: ${JSON.stringify(result)}`);
    }

    // 5. Salvar no banco de dados
    console.log('Salvando doação no banco...');
    const { error: dbError } = await supabase.from('donations').insert({
      amount: totalAmountInReais,
      donor_name: paymentData.donor.name,
      donor_email: paymentData.donor.email,
      payment_method: paymentData.paymentMethod,
      transaction_id: result.id,
      status: 'pending',
      ambassador_link_id: ambassadorLinkId,
      currency: 'BRL'
    });

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
    } else {
      console.log('Doação salva no banco com sucesso');
    }

    // 6. Atualizar performance do embaixador se aplicável
    if (ambassadorData && ambassadorLinkId) {
      console.log('Atualizando performance do embaixador...');
      
      const { error: perfError } = await supabase
        .from('ambassador_performance')
        .upsert({
          ambassador_user_id: ambassadorData.id,
          total_donations_amount: totalAmountInReais,
          total_donations_count: 1,
          last_updated_at: new Date().toISOString()
        }, {
          onConflict: 'ambassador_user_id'
        });

      if (perfError) {
        console.error('Erro ao atualizar performance:', perfError);
      } else {
        console.log('Performance do embaixador atualizada');
      }
    }

    console.log('=== PROCESSAMENTO CONCLUÍDO COM SUCESSO ===');

    return new Response(JSON.stringify({
      success: true,
      payment: result,
      paymentUrl: result.invoiceUrl,
      pixQrCode: result.pixQrCodeBase64,
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
    console.error('Detalhes do erro:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
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
