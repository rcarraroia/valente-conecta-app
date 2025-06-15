
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'PUT') {
      const { appointment_id, status, partner_user_id } = await req.json()

      if (!appointment_id || !status || !partner_user_id) {
        return new Response(
          JSON.stringify({ error: 'appointment_id, status, and partner_user_id are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verificar se o usuário é realmente o parceiro responsável pelo agendamento
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          *,
          partners!inner(user_id)
        `)
        .eq('id', appointment_id)
        .single()

      if (appointmentError || !appointment) {
        return new Response(
          JSON.stringify({ error: 'Appointment not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (appointment.partners.user_id !== partner_user_id) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Atualizar status do agendamento
      const { data: updatedAppointment, error: updateError } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointment_id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating appointment:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update appointment' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Buscar dados para notificação
      const { data: partner } = await supabase
        .from('partners')
        .select('full_name')
        .eq('id', appointment.partner_id)
        .single()

      const { data: user } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', appointment.user_id)
        .single()

      // Preparar dados para webhook do N8N
      const webhookData = {
        type: status === 'confirmed' ? 'appointment_confirmed' : 'appointment_cancelled',
        appointment: {
          id: appointment_id,
          date: appointment.appointment_date,
          time: appointment.appointment_time,
          status
        },
        partner: {
          name: partner?.full_name
        },
        user: {
          name: user?.full_name,
          phone: user?.phone
        }
      }

      // TODO: Implementar webhook para N8N quando disponível
      console.log('Webhook data prepared:', webhookData)

      return new Response(
        JSON.stringify({ success: true, appointment: updatedAppointment }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
