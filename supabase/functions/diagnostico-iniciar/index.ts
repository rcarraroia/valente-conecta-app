
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
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Iniciando nova sessão de pré-diagnóstico para usuário:', user.id)

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
          error: 'Erro ao carregar perguntas', 
          details: questionsError.message,
          hint: 'Verifique se a tabela pre_diagnosis_questions existe e tem dados'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!questions || questions.length === 0) {
      console.log('Nenhuma pergunta encontrada na tabela pre_diagnosis_questions')
      return new Response(
        JSON.stringify({ 
          error: 'Nenhuma pergunta disponível',
          hint: 'A tabela pre_diagnosis_questions está vazia ou não tem perguntas ativas'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar nova sessão de pré-diagnóstico
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
          error: 'Erro ao iniciar sessão', 
          details: sessionError.message,
          hint: 'Verifique se a tabela pre_diagnosis_sessions existe'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Retornar primeira pergunta
    const firstQuestion = questions[0]
    
    return new Response(
      JSON.stringify({
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
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message,
        hint: 'Verifique os logs do servidor para mais detalhes'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
