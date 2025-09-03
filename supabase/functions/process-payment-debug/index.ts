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
  console.log('=== DEBUG PROCESS PAYMENT ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('1. Iniciando processamento...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    console.log('2. Supabase client criado');

    const paymentData: PaymentRequest = await req.json();
    console.log('3. Dados recebidos:', JSON.stringify(paymentData, null, 2));

    const asaasApiKey = Deno.env.get('ASAAS_API_KEY');
    console.log('4. ASAAS_API_KEY existe:', !!asaasApiKey);

    if (!asaasApiKey) {
      throw new Error('ASAAS_API_KEY não encontrada');
    }

    // Validações básicas
    if (!paymentData.amount || paymentData.amount < 500) {
      throw new Error('Valor mínimo para doação é R$ 5,00');
    }

    if (!paymentData.donor.name || !paymentData.donor.email) {
      throw new Error('Nome e email são obrigatórios');
    }

    console.log('5. Validações básicas OK');

    // Criar cliente no Asaas (versão simplificada)
    const customerData = {
      name: paymentData.donor.name,
      email: paymentData.donor.email,
      phone: paymentData.donor.phone || undefined,
      cpfCnpj: paymentData.donor.document || undefined,
    };

    console.log('6. Criando cliente no Asaas...');
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
      console.error('7. Erro ao criar cliente:', errorData);
      throw new Error(`Erro ao criar cliente: ${customerResponse.status} - ${errorData}`);
    }

    const customer = await customerResponse.json();
    console.log('8. Cliente criado:', customer.id);

    // Criar pagamento SEM split primeiro (para testar)
    const totalAmountInReais = paymentData.amount / 100;
    const paymentPayload = {
      customer: customer.id,
      billingType: paymentData.paymentMethod,
      value: totalAmountInReais,
      dueDate: new Date().toISOString().split('T')[0],
      description: `Doação Teste - Instituto Coração Valente`,
      externalReference: `TEST_${Date.now()}`,
      // split: undefined // SEM SPLIT PARA TESTE
    };

    console.log('9. Criando pagamento (sem split):', JSON.stringify(paymentPayload, null, 2));

    const paymentResponse = await fetch('https://www.asaas.com/api/v3/payments', {
      method: 'POST',
      headers: {
        'access_token': asaasApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.text();
      console.error('10. Erro ao criar pagamento:', {
        status: paymentResponse.status,
        statusText: paymentResponse.statusText,
        errorData: errorData
      });
      throw new Error(`Erro ao criar pagamento: ${paymentResponse.status} - ${errorData}`);
    }

    const paymentResult = await paymentResponse.json();
    console.log('11. Pagamento criado:', paymentResult.id);

    // Salvar no banco (versão simplificada)
    console.log('12. Salvando no banco...');
    const { error: dbError } = await supabase.from('donations').insert({
      amount: totalAmountInReais,
      donor_name: paymentData.donor.name,
      donor_email: paymentData.donor.email,
      payment_method: paymentData.paymentMethod,
      transaction_id: paymentResult.id,
      status: 'pending',
      currency: 'BRL'
    });

    if (dbError) {
      console.error('13. Erro ao salvar no banco:', dbError);
      // Não falhar por causa do banco, continuar
    } else {
      console.log('13. Salvo no banco com sucesso');
    }

    console.log('=== PROCESSAMENTO CONCLUÍDO COM SUCESSO ===');

    return new Response(JSON.stringify({
      success: true,
      payment: paymentResult,
      paymentUrl: paymentResult.invoiceUrl,
      pixQrCode: paymentResult.pixQrCodeBase64,
      debug: {
        message: 'Pagamento criado sem split para teste',
        amount: totalAmountInReais,
        customer: customer.id,
        payment: paymentResult.id
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
    console.error('Erro detalhado:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erro interno do servidor',
      debug: {
        errorType: error.constructor.name,
        stack: error.stack
      }
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