
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData = await req.json();
    console.log('🔔 Webhook Asaas recebido:', {
      event: webhookData.event,
      paymentId: webhookData.payment?.id,
      timestamp: new Date().toISOString()
    });
    console.log('📋 Payload completo:', JSON.stringify(webhookData, null, 2));

    const { event, payment, subscription } = webhookData;

    // 🔔 PROCESSAR EVENTOS DE ASSINATURA
    if (subscription && subscription.id) {
      console.log('📋 Processando evento de assinatura:', {
        event,
        subscriptionId: subscription.id,
        status: subscription.status,
        value: subscription.value
      });

      let subscriptionStatus = 'active';
      
      switch (event) {
        case 'SUBSCRIPTION_CREATED':
          subscriptionStatus = 'active';
          console.log('✅ Nova assinatura criada:', subscription.id);
          break;
        case 'SUBSCRIPTION_UPDATED':
          subscriptionStatus = 'active';
          console.log('📝 Assinatura atualizada:', subscription.id);
          break;
        case 'SUBSCRIPTION_INACTIVATED':
          subscriptionStatus = 'inactive';
          console.log('⏸️ Assinatura inativada:', subscription.id);
          break;
        case 'SUBSCRIPTION_DELETED':
          subscriptionStatus = 'deleted';
          console.log('🗑️ Assinatura removida:', subscription.id);
          break;
        default:
          console.log('📋 Evento de assinatura não tratado:', event);
      }

      // TODO: Salvar/atualizar na tabela subscriptions quando ela existir
      console.log('💾 Dados da assinatura para salvar:', {
        subscription_id: subscription.id,
        customer: subscription.customer,
        value: subscription.value,
        cycle: subscription.cycle,
        status: subscriptionStatus,
        next_due_date: subscription.nextDueDate
      });
    }

    // 💳 PROCESSAR EVENTOS DE PAGAMENTO (código existente)
    if (payment && payment.id) {
      let newStatus = 'pending';
      
      switch (event) {
        case 'PAYMENT_CONFIRMED':
        case 'PAYMENT_RECEIVED':
          newStatus = 'completed';
          
          // 🔔 Se pagamento pertence a uma assinatura, logar
          if (payment.subscription) {
            console.log('💰 Pagamento mensal de assinatura recebido:', {
              paymentId: payment.id,
              subscriptionId: payment.subscription,
              value: payment.value
            });
          }
          break;
        case 'PAYMENT_OVERDUE':
          newStatus = 'overdue';
          break;
        case 'PAYMENT_DELETED':
        case 'PAYMENT_REFUNDED':
          newStatus = 'cancelled';
          break;
      }

      const { error } = await supabase
        .from('donations')
        .update({ status: newStatus })
        .eq('transaction_id', payment.id);

      if (error) {
        console.error('❌ Erro ao atualizar status no banco:', error);
        return new Response(JSON.stringify({
          error: 'Database update failed',
          details: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      } else {
        console.log(`✅ Status atualizado: ${payment.id} → ${newStatus}`);
      }
    }

    return new Response(JSON.stringify({ 
      received: true,
      processed: !!payment?.id,
      event: event,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Erro no webhook:', error);
    return new Response(JSON.stringify({
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
