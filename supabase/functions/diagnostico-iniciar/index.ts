
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
    console.log('=== INÍCIO DA FUNÇÃO DIAGNOSTICO-INICIAR ===')
    
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
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      console.error('Erro de autenticação:', authError)
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado. Faça login e tente novamente.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Usuário autenticado:', user.id)

    // Verificar se as tabelas existem
    console.log('Verificando tabelas do banco de dados...')

    // Buscar perguntas ativas do pré-diagnóstico
    const { data: questions, error: questionsError } = await supabaseClient
      .from('pre_diagnosis_questions')
      .select('*')
      .eq('is_active', true)
      .order('order_position', { ascending: true })

    if (questionsError) {
      console.error('Erro ao buscar perguntas:', questionsError)
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao carregar perguntas do banco de dados', 
          details: questionsError.message,
          hint: 'Verifique se as tabelas foram criadas corretamente'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Encontradas ${questions?.length || 0} perguntas ativas`)

    if (!questions || questions.length === 0) {
      console.log('Nenhuma pergunta encontrada')
      return new Response(
        JSON.stringify({ 
          error: 'Nenhuma pergunta disponível no sistema',
          hint: 'As perguntas de pré-diagnóstico foram criadas mas podem não estar ativas'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar nova sessão de pré-diagnóstico
    console.log('Criando nova sessão...')
    const { data: session, error: sessionError } = await supabaseClient
      .from('pre_diagnosis_sessions')
      .insert({
        user_id: user.id,
        session_status: 'started',
        total_questions: questions.length,
        answered_questions: 0
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Erro ao criar sessão:', sessionError)
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao iniciar nova sessão', 
          details: sessionError.message,
          hint: 'Verifique se as tabelas de sessão foram criadas corretamente'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Sessão criada com sucesso:', session.id)

    // Retornar primeira pergunta
    const firstQuestion = questions[0]
    console.log('Primeira pergunta:', firstQuestion.question_text)
    
    const response = {
      session_id: session.id,
      question: {
        id: firstQuestion.id,
        text: firstQuestion.question_text,
        type: firstQuestion.question_type,
        options: firstQuestion.options,
        position: firstQuestion.order_position
      },
      progress: {
        current: 1,
        total: questions.length
      }
    }

    console.log('Resposta enviada:', response)
    console.log('=== FIM DA FUNÇÃO DIAGNOSTICO-INICIAR ===')
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('=== ERRO GERAL NA FUNÇÃO ===', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message,
        hint: 'Verifique os logs da função para mais detalhes'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
