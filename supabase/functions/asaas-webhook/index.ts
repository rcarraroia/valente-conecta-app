
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
    console.log('Webhook recebido:', webhookData);

    const { event, payment } = webhookData;

    // Atualizar status do pagamento no banco
    if (payment && payment.id) {
      let newStatus = 'pending';
      
      switch (event) {
        case 'PAYMENT_CONFIRMED':
        case 'PAYMENT_RECEIVED':
          newStatus = 'completed';
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
        console.error('Erro ao atualizar status:', error);
      } else {
        console.log(`Status atualizado para ${newStatus} no pagamento ${payment.id}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
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
