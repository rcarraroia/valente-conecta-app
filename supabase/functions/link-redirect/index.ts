
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
    const url = new URL(req.url)
    const linkId = url.pathname.split('/').pop()
    const userAgent = req.headers.get('user-agent') || ''
    const referrer = req.headers.get('referer') || ''
    
    // Obter IP do cliente
    const forwardedFor = req.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 
                     req.headers.get('x-real-ip') || 
                     'unknown'

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('Processando clique no link:', { linkId, ipAddress, userAgent })

    // Buscar o link pelo ID (verificar se é generated_url ou short_url)
    const { data: linkData, error: linkError } = await supabaseClient
      .from('ambassador_links')
      .select('*')
      .or(`generated_url.ilike.%${linkId}%,short_url.ilike.%${linkId}%`)
      .eq('status', 'active')
      .single()

    if (linkError || !linkData) {
      console.error('Link não encontrado:', linkId)
      // Redirecionar para página principal se link não existir
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': Deno.env.get('PUBLIC_SITE_URL') || 'https://coracaovalente.com.br'
        }
      })
    }

    // Registrar o clique
    const { error: clickError } = await supabaseClient
      .from('link_clicks')
      .insert({
        link_id: linkData.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer
      })

    if (clickError) {
      console.error('Erro ao registrar clique:', clickError)
    }

    // Atualizar performance do embaixador
    const { error: performanceError } = await supabaseClient
      .from('ambassador_performance')
      .update({
        total_clicks: supabaseClient.rpc('increment_total_clicks', { 
          ambassador_id: linkData.ambassador_user_id 
        }),
        last_updated_at: new Date().toISOString()
      })
      .eq('ambassador_user_id', linkData.ambassador_user_id)

    if (performanceError) {
      console.warn('Erro ao atualizar performance:', performanceError)
    }

    // Determinar URL de destino (por padrão, página de doação)
    const destinationUrl = Deno.env.get('DONATION_PAGE_URL') || 
                          `${Deno.env.get('PUBLIC_SITE_URL') || 'https://coracaovalente.com.br'}/doar?ref=${linkData.ambassador_user_id}`

    // Redirecionar para o destino
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': destinationUrl
      }
    })

  } catch (error) {
    console.error('Erro geral no redirecionamento:', error)
    // Redirecionar para página principal em caso de erro
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': Deno.env.get('PUBLIC_SITE_URL') || 'https://coracaovalente.com.br'
      }
    })
  }
})
