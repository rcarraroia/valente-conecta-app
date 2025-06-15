
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('Iniciando geração de códigos de embaixador para usuários existentes...')

    // Buscar todos os usuários que não têm código de embaixador
    const { data: usersWithoutCode, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, created_at')
      .is('ambassador_code', null)

    if (fetchError) {
      console.error('Erro ao buscar usuários:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar usuários' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!usersWithoutCode || usersWithoutCode.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Todos os usuários já possuem códigos de embaixador', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Encontrados ${usersWithoutCode.length} usuários sem código de embaixador`)

    const results = []

    for (const user of usersWithoutCode) {
      try {
        // Gerar código único para o usuário
        const nameCode = (user.full_name || 'USER')
          .split(' ')
          .map(word => word.charAt(0))
          .join('')
          .toUpperCase()
          .substring(0, 3)

        const userIdCode = user.id.replace(/-/g, '').substring(0, 5).toUpperCase()
        const ambassadorCode = `${nameCode}${userIdCode}`

        // Atualizar o perfil do usuário
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            is_volunteer: true,
            ambassador_code: ambassadorCode,
            ambassador_opt_in_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateError) {
          console.error(`Erro ao atualizar usuário ${user.id}:`, updateError)
          results.push({
            user_id: user.id,
            success: false,
            error: updateError.message
          })
          continue
        }

        // Criar registro de performance do embaixador
        const { error: performanceError } = await supabaseClient
          .from('ambassador_performance')
          .upsert({
            ambassador_user_id: user.id,
            current_level: 'Iniciante',
            total_clicks: 0,
            total_donations_count: 0,
            total_donations_amount: 0,
            points: 0
          }, {
            onConflict: 'ambassador_user_id'
          })

        if (performanceError) {
          console.warn(`Erro ao criar performance para usuário ${user.id}:`, performanceError)
        }

        results.push({
          user_id: user.id,
          ambassador_code: ambassadorCode,
          success: true
        })

        console.log(`Código gerado para ${user.full_name}: ${ambassadorCode}`)

      } catch (error) {
        console.error(`Erro ao processar usuário ${user.id}:`, error)
        results.push({
          user_id: user.id,
          success: false,
          error: error.message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length

    console.log(`Processamento concluído: ${successCount} sucessos, ${errorCount} erros`)

    return new Response(
      JSON.stringify({
        message: 'Processamento concluído',
        total_processed: results.length,
        successful: successCount,
        errors: errorCount,
        results: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
