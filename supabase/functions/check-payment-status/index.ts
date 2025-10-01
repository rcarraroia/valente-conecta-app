import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckPaymentRequest {
  paymentId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🔍 CHECK PAYMENT STATUS - Verificando status do pagamento');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { paymentId }: CheckPaymentRequest = await req.json();
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY');

    console.log('Verificando pagamento:', paymentId);

    if (!paymentId) {
      throw new Error('Payment ID é obrigatório');
    }

    if (!asaasApiKey) {
      throw new Error('ASAAS_API_KEY não configurada');
    }

    // 1. Verificar no banco local primeiro
    const { data: donation, error: dbError } = await supabase
      .from('donations')
      .select('*')
      .eq('transaction_id', paymentId)
      .maybeSingle();

    if (dbError) {
      console.warn('Erro ao buscar no banco local:', dbError);
    }

    if (donation && (donation.status === 'received' || donation.status === 'confirmed')) {
      console.log('✅ Pagamento confirmado no banco local');
      return new Response(JSON.stringify({
        success: true,
        status: donation.status,
        amount: donation.amount * 100, // converter para centavos
        paidAt: donation.updated_at,
        method: donation.payment_method,
        source: 'database'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // 2. Se não encontrou no banco ou ainda está pendente, verificar na API do Asaas
    console.log('Verificando na API do Asaas...');
    
    const asaasResponse = await fetch(`https://www.asaas.com/api/v3/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'access_token': asaasApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!asaasResponse.ok) {
      const errorText = await asaasResponse.text();
      console.error('Erro da API Asaas:', errorText);
      throw new Error(`Erro ao consultar Asaas: ${asaasResponse.status}`);
    }

    const asaasPayment = await asaasResponse.json();
    console.log('Status do Asaas:', asaasPayment.status);

    // 3. Atualizar banco local se status mudou
    if (asaasPayment.status === 'RECEIVED' && donation && donation.status !== 'received') {
      console.log('Atualizando status no banco local...');
      
      const { error: updateError } = await supabase
        .from('donations')
        .update({ 
          status: 'received',
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', paymentId);

      if (updateError) {
        console.warn('Erro ao atualizar status no banco:', updateError);
      }
    }

    // 4. Mapear status do Asaas para nosso formato
    let mappedStatus = 'pending';
    if (asaasPayment.status === 'RECEIVED' || asaasPayment.status === 'CONFIRMED') {
      mappedStatus = 'received';
    } else if (asaasPayment.status === 'OVERDUE' || asaasPayment.status === 'REFUNDED') {
      mappedStatus = 'failed';
    }

    return new Response(JSON.stringify({
      success: true,
      status: mappedStatus,
      amount: asaasPayment.value * 100, // converter para centavos
      paidAt: asaasPayment.paymentDate || asaasPayment.confirmedDate,
      method: asaasPayment.billingType,
      source: 'asaas_api',
      asaasStatus: asaasPayment.status
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('=== ERRO NA VERIFICAÇÃO DE STATUS ===');
    console.error('Erro:', error.message);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erro interno do servidor',
      status: 'error'
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