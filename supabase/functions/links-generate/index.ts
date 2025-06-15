
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
    const { destination_url, campaign_id } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verificar autenticação
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Gerando link rastreável para embaixador:', user.id)

    // Verificar se o usuário é um embaixador válido
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_volunteer, ambassador_code')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError)
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar perfil do usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!profile?.is_volunteer || !profile?.ambassador_code) {
      return new Response(
        JSON.stringify({ error: 'Usuário não é um embaixador válido' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Gerar URL único
    const linkId = crypto.randomUUID()
    const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://coracaovalente.com.br'
    const generatedUrl = `${baseUrl}/redirect/${linkId}`
    
    // Criar entrada na tabela de links
    const { data: linkData, error: linkError } = await supabaseClient
      .from('ambassador_links')
      .insert({
        ambassador_user_id: user.id,
        campaign_id: campaign_id || null,
        generated_url: generatedUrl,
        short_url: `${baseUrl}/r/${linkId.slice(0, 8)}`,
        status: 'active'
      })
      .select()
      .single()

    if (linkError) {
      console.error('Erro ao criar link:', linkError)
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar link', details: linkError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar/atualizar registro de performance do embaixador
    const { error: performanceError } = await supabaseClient
      .from('ambassador_performance')
      .upsert({
        ambassador_user_id: user.id,
        last_updated_at: new Date().toISOString()
      }, {
        onConflict: 'ambassador_user_id'
      })

    if (performanceError) {
      console.warn('Aviso - erro ao atualizar performance:', performanceError)
    }

    return new Response(
      JSON.stringify({
        link_id: linkData.id,
        generated_url: linkData.generated_url,
        short_url: linkData.short_url,
        destination_url: destination_url || `${baseUrl}/doar`,
        created_at: linkData.created_at
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
