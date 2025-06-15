
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

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const partnerId = url.searchParams.get('partnerId')
      const date = url.searchParams.get('date')

      if (!partnerId || !date) {
        return new Response(
          JSON.stringify({ error: 'partnerId and date are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Buscar horários disponíveis para o profissional em uma data específica
      const { data: schedules, error: schedulesError } = await supabase
        .from('schedules')
        .select('*')
        .eq('partner_id', partnerId)
        .eq('is_available', true)

      if (schedulesError) {
        console.error('Error fetching schedules:', schedulesError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch schedules' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Buscar agendamentos já feitos para a data
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time, schedule_id')
        .eq('partner_id', partnerId)
        .eq('appointment_date', date)
        .in('status', ['pending', 'confirmed'])

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch appointments' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ schedules, appointments }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { user_id, partner_id, schedule_id, appointment_date, appointment_time, notes } = await req.json()

      // Criar o agendamento
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          user_id,
          partner_id,
          schedule_id,
          appointment_date,
          appointment_time,
          notes,
          status: 'pending'
        })
        .select()
        .single()

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError)
        return new Response(
          JSON.stringify({ error: 'Failed to create appointment' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Buscar dados do parceiro e usuário para notificação
      const { data: partner } = await supabase
        .from('partners')
        .select('full_name, contact_phone, contact_email')
        .eq('id', partner_id)
        .single()

      const { data: user } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user_id)
        .single()

      // Preparar dados para webhook do N8N
      const webhookData = {
        type: 'appointment_requested',
        appointment: {
          id: appointment.id,
          date: appointment_date,
          time: appointment_time,
          notes: notes || null,
          status: 'pending'
        },
        partner: {
          name: partner?.full_name,
          phone: partner?.contact_phone,
          email: partner?.contact_email
        },
        user: {
          name: user?.full_name,
          phone: user?.phone
        }
      }

      // TODO: Implementar webhook para N8N quando disponível
      console.log('Webhook data prepared:', webhookData)

      return new Response(
        JSON.stringify({ success: true, appointment }),
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
