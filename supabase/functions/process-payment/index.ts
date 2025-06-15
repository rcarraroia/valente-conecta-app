
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

    console.log('Processando pagamento:', paymentData);

    // 1. Criar/buscar cliente no Asaas
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
    console.log('Cliente criado/encontrado:', customer);

    // 2. Calcular split
    const splits = [];
    if (paymentData.ambassadorCode) {
      const ambassadorShare = Math.round((paymentData.amount * 10) / 100); // 10%
      splits.push({
        walletId: 'f9c7d1dd-9e52-4e81-8194-8b666f276405', // Wallet do embaixador (por enquanto mesmo wallet)
        fixedValue: ambassadorShare
      });
    }

    // 3. Criar pagamento ou assinatura
    let asaasResponse;
    
    if (paymentData.type === 'donation') {
      // Pagamento único
      const paymentPayload = {
        customer: customer.id,
        billingType: paymentData.paymentMethod,
        value: paymentData.amount / 100, // Converter de centavos para reais
        dueDate: new Date().toISOString().split('T')[0],
        description: 'Doação - Instituto Coração Valente',
        externalReference: `DON_${Date.now()}`,
        split: splits.length > 0 ? splits : undefined,
      };

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
        value: paymentData.amount / 100,
        cycle: paymentData.frequency === 'monthly' ? 'MONTHLY' : 'YEARLY',
        description: `Apoio ${paymentData.frequency === 'monthly' ? 'Mensal' : 'Anual'} - Instituto Coração Valente`,
        nextDueDate: new Date().toISOString().split('T')[0],
        split: splits.length > 0 ? splits : undefined,
      };

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
    console.log('Resposta do Asaas:', result);

    if (!asaasResponse.ok) {
      throw new Error(`Erro do Asaas: ${JSON.stringify(result)}`);
    }

    // 4. Salvar no banco de dados
    const { error: dbError } = await supabase.from('donations').insert({
      amount: paymentData.amount / 100,
      donor_name: paymentData.donor.name,
      donor_email: paymentData.donor.email,
      payment_method: paymentData.paymentMethod,
      transaction_id: result.id,
      status: 'pending',
      ambassador_link_id: paymentData.ambassadorCode ? null : null, // TODO: buscar link do embaixador
    });

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
    }

    return new Response(JSON.stringify({
      success: true,
      payment: result,
      paymentUrl: result.invoiceUrl,
      pixQrCode: result.pixQrCodeBase64,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Erro no processamento:', error);
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
