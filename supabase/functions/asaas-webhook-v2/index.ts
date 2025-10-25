import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  event: string;
  dateCreated: string;
  payment: {
    id: string;
    status: string;
    value: number;
    billingType: string;
    customer: string;
    description?: string;
    confirmedDate?: string;
    paymentDate?: string;
    externalReference?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🔔 WEBHOOK ASAAS V2 - Processando evento');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData: WebhookPayload = await req.json();
    
    console.log('📨 Evento recebido:', {
      event: webhookData.event,
      paymentId: webhookData.payment?.id,
      status: webhookData.payment?.status,
      value: webhookData.payment?.value,
      timestamp: new Date().toISOString()
    });

    const { event, payment } = webhookData;

    if (!payment || !payment.id) {
      console.warn('⚠️ Webhook sem dados de pagamento válidos');
      return new Response(JSON.stringify({ received: true, warning: 'No payment data' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 1. Mapear status do Asaas para nosso sistema
    let newStatus = 'pending';
    let shouldNotify = false;
    
    switch (event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        newStatus = 'received';
        shouldNotify = true; // 🔔 Notificar quando pagamento for confirmado
        console.log('✅ Pagamento confirmado - preparando notificação');
        break;
      case 'PAYMENT_OVERDUE':
        newStatus = 'overdue';
        break;
      case 'PAYMENT_DELETED':
      case 'PAYMENT_REFUNDED':
        newStatus = 'cancelled';
        break;
      default:
        console.log('📋 Evento não requer atualização de status:', event);
    }

    // 2. Atualizar status no banco de dados
    const { data: updatedDonation, error: updateError } = await supabase
      .from('donations')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', payment.id)
      .select('*')
      .maybeSingle();

    if (updateError) {
      console.error('❌ Erro ao atualizar doação:', updateError);
    } else if (updatedDonation) {
      console.log('✅ Doação atualizada:', {
        id: updatedDonation.id,
        transaction_id: updatedDonation.transaction_id,
        status: updatedDonation.status,
        amount: updatedDonation.amount
      });
    } else {
      console.warn('⚠️ Doação não encontrada para transaction_id:', payment.id);
    }

    // 3. 🧾 GERAR RECIBO AUTOMATICAMENTE
    if (shouldNotify && updatedDonation) {
      console.log('🧾 Gerando recibo automaticamente para doação:', updatedDonation.id);
      
      try {
        // Chamar função de geração de recibo
        const receiptResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-receipt`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              donationId: updatedDonation.id,
              sendEmail: true
            })
          }
        );
        
        if (receiptResponse.ok) {
          const receiptData = await receiptResponse.json();
          console.log('✅ Recibo gerado com sucesso:', {
            receiptNumber: receiptData.receipt?.receipt_number,
            emailSent: receiptData.receipt?.email_sent
          });
        } else {
          const errorData = await receiptResponse.text();
          console.error('❌ Erro ao gerar recibo:', errorData);
        }
        
      } catch (receiptError: any) {
        console.error('❌ Erro ao chamar função de recibo:', receiptError.message);
        // Não falhar o webhook por causa de erro no recibo
      }
    }

    // 4. Log de auditoria
    console.log('📊 Webhook processado com sucesso:', {
      event,
      paymentId: payment.id,
      newStatus,
      shouldNotify,
      donationUpdated: !!updatedDonation,
      processingTime: Date.now()
    });

    // 5. Resposta rápida para o Asaas
    return new Response(JSON.stringify({ 
      received: true,
      processed: true,
      paymentId: payment.id,
      status: newStatus,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('💥 ERRO NO WEBHOOK V2:', error);
    
    // Sempre retornar 200 para evitar reenvios desnecessários do Asaas
    return new Response(JSON.stringify({
      received: true,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

serve(handler);