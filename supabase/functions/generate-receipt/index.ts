import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { sendEmailWithRetry } from "../_shared/email-service.ts";
import { receiptEmailTemplate, receiptEmailSubject } from "../_shared/email-templates.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateReceiptRequest {
  donationId: string;
  sendEmail?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { donationId, sendEmail: shouldSendEmail = true }: GenerateReceiptRequest = await req.json();

    console.log('🧾 Gerando recibo para doação:', donationId);

    // 1. Buscar dados da doação
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .select('*')
      .eq('id', donationId)
      .single();

    if (donationError || !donation) {
      throw new Error(`Doação não encontrada: ${donationId}`);
    }

    console.log('✅ Doação encontrada:', {
      id: donation.id,
      amount: donation.amount,
      donor_name: donation.donor_name
    });

    // 2. Verificar se já existe recibo para esta doação
    const { data: existingReceipt } = await supabase
      .from('receipts')
      .select('*')
      .eq('donation_id', donationId)
      .maybeSingle();

    if (existingReceipt) {
      console.log('ℹ️ Recibo já existe:', existingReceipt.receipt_number);
      
      // Se deve enviar email e ainda não foi enviado
      if (shouldSendEmail && !existingReceipt.email_sent) {
        await sendReceiptEmail(supabase, existingReceipt);
      }
      
      return new Response(JSON.stringify({
        success: true,
        receipt: existingReceipt,
        message: 'Recibo já existe'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 3. Converter valor para extenso
    const amountInWords = numberToWords(donation.amount);

    // 4. Criar registro do recibo
    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        donation_id: donation.id,
        user_id: donation.user_id,
        donor_name: donation.donor_name || 'Doador Anônimo',
        donor_document: donation.donor_document,
        donor_email: donation.donor_email,
        donor_phone: donation.donor_phone,
        amount: donation.amount,
        amount_in_words: amountInWords,
        currency: donation.currency || 'BRL',
        payment_method: donation.payment_method,
        payment_date: donation.donated_at || new Date().toISOString(),
        transaction_id: donation.transaction_id,
      })
      .select()
      .single();

    if (receiptError || !receipt) {
      throw new Error(`Erro ao criar recibo: ${receiptError?.message}`);
    }

    console.log('✅ Recibo criado:', receipt.receipt_number);

    // 5. TODO: Gerar PDF e fazer upload para Storage
    // Por enquanto, apenas criar o registro
    
    // 6. Enviar email se solicitado
    if (shouldSendEmail && receipt.donor_email) {
      await sendReceiptEmail(supabase, receipt);
    }

    return new Response(JSON.stringify({
      success: true,
      receipt: receipt,
      message: 'Recibo gerado com sucesso'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('❌ Erro ao gerar recibo:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

/**
 * Envia email com o recibo
 */
async function sendReceiptEmail(supabase: any, receipt: any): Promise<void> {
  try {
    console.log('📧 Enviando email do recibo para:', receipt.donor_email);

    const verificationUrl = `https://coracaovalente.org.br/verificar/${receipt.verification_hash}`;
    // 🔒 Incluir hash na URL para segurança (previne acesso não autorizado)
    const pdfUrl = receipt.pdf_url || `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-receipt-pdf?receiptId=${receipt.id}&hash=${receipt.verification_hash}`;

    const emailHtml = receiptEmailTemplate({
      donorName: receipt.donor_name,
      receiptNumber: receipt.receipt_number,
      amount: formatCurrency(receipt.amount),
      paymentDate: formatDate(receipt.payment_date),
      pdfUrl: pdfUrl,
      verificationUrl: verificationUrl
    });

    const result = await sendEmailWithRetry({
      to: receipt.donor_email,
      subject: receiptEmailSubject(receipt.receipt_number),
      html: emailHtml,
      replyTo: 'contato@coracaovalente.org.br'
    });

    // Atualizar status de envio
    await supabase
      .from('receipts')
      .update({
        email_sent: result.success,
        email_sent_at: result.success ? new Date().toISOString() : null,
        email_attempts: receipt.email_attempts + 1,
        last_email_error: result.error || null
      })
      .eq('id', receipt.id);

    if (result.success) {
      console.log('✅ Email enviado com sucesso');
    } else {
      console.error('❌ Falha ao enviar email:', result.error);
    }

  } catch (error: any) {
    console.error('❌ Erro ao enviar email:', error);
  }
}

/**
 * Converte número para extenso em português
 */
function numberToWords(value: number): string {
  // Implementação simplificada
  // TODO: Implementar conversão completa para extenso
  
  const intValue = Math.floor(value);
  const cents = Math.round((value - intValue) * 100);
  
  if (intValue === 100 && cents === 0) {
    return 'cem reais';
  }
  
  // Por enquanto, retornar formato simples
  return `${intValue} reais${cents > 0 ? ` e ${cents} centavos` : ''}`;
}

/**
 * Formata valor monetário
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata data
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

serve(handler);
