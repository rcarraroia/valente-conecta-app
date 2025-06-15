
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
    const { session_id, question_id, answer, answer_text } = await req.json()

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

    console.log('Processando resposta:', { session_id, question_id, answer })

    // Verificar se a sessão existe e pertence ao usuário
    const { data: session, error: sessionError } = await supabaseClient
      .from('pre_diagnosis_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Sessão não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar todas as perguntas ordenadas
    const { data: questions, error: questionsError } = await supabaseClient
      .from('pre_diagnosis_questions')
      .select('*')
      .eq('is_active', true)
      .order('order_position', { ascending: true })

    if (questionsError) {
      return new Response(
        JSON.stringify({ error: 'Erro ao carregar perguntas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Salvar resposta na sessão (atualizar diagnosis_result com a resposta)
    const currentAnswers = session.diagnosis_result || {}
    const updatedAnswers = {
      ...currentAnswers,
      [question_id]: {
        answer,
        answer_text,
        timestamp: new Date().toISOString()
      }
    }

    const newAnsweredCount = session.answered_questions + 1
    const isLastQuestion = newAnsweredCount >= questions.length

    // Atualizar sessão
    const { error: updateError } = await supabaseClient
      .from('pre_diagnosis_sessions')
      .update({
        diagnosis_result: updatedAnswers,
        answered_questions: newAnsweredCount,
        session_status: isLastQuestion ? 'completed' : 'in_progress',
        finished_at: isLastQuestion ? new Date().toISOString() : null
      })
      .eq('id', session_id)

    if (updateError) {
      console.error('Erro ao atualizar sessão:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar resposta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Se não é a última pergunta, retornar próxima pergunta
    if (!isLastQuestion) {
      const nextQuestion = questions[newAnsweredCount]
      
      return new Response(
        JSON.stringify({
          session_id,
          question: {
            id: nextQuestion.id,
            text: nextQuestion.question_text,
            type: nextQuestion.question_type,
            options: nextQuestion.options,
            position: nextQuestion.order_position
          },
          progress: {
            current: newAnsweredCount + 1,
            total: questions.length
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Se é a última pergunta, processar resultado final
    const result = processPreDiagnosisResult(updatedAnswers, questions)
    
    // Salvar resultado final
    await supabaseClient
      .from('diagnostics')
      .insert({
        user_id: user.id,
        symptoms: generateSymptomsText(updatedAnswers, questions),
        ai_response: result.analysis,
        severity_level: result.severity_level,
        recommendations: result.recommendations,
        status: 'pendente'
      })

    return new Response(
      JSON.stringify({
        session_id,
        completed: true,
        result: {
          analysis: result.analysis,
          severity_level: result.severity_level,
          recommendations: result.recommendations,
          next_steps: result.next_steps
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function processPreDiagnosisResult(answers: any, questions: any[]): any {
  // Lógica simplificada de processamento - deve ser refinada com especialistas
  const positiveAnswers = Object.values(answers).filter((answer: any) => 
    answer.answer === 'yes' || answer.answer === 'sim' || answer.answer === true
  ).length

  const totalQuestions = questions.length
  const riskPercentage = (positiveAnswers / totalQuestions) * 100

  let severity_level = 1
  let analysis = ""
  let recommendations = ""
  let next_steps = ""

  if (riskPercentage >= 70) {
    severity_level = 5
    analysis = "As respostas indicam sinais que merecem atenção imediata. É altamente recomendável buscar avaliação profissional."
    recommendations = "Procurar um profissional especializado o quanto antes para avaliação detalhada."
    next_steps = "Agendar consulta com neurologista infantil ou pediatra do desenvolvimento."
  } else if (riskPercentage >= 50) {
    severity_level = 4
    analysis = "Alguns sinais identificados sugerem acompanhamento profissional."
    recommendations = "Buscar orientação de um profissional de saúde para avaliação."
    next_steps = "Consultar pediatra ou profissional especializado em desenvolvimento infantil."
  } else if (riskPercentage >= 30) {
    severity_level = 3
    analysis = "Alguns pontos de atenção identificados. Observação contínua é recomendada."
    recommendations = "Manter observação e considerar consulta profissional se os sinais persistirem."
    next_steps = "Observar desenvolvimento e buscar orientação se necessário."
  } else if (riskPercentage >= 15) {
    severity_level = 2
    analysis = "Desenvolvimento dentro de parâmetros esperados, com alguns pontos para observação."
    recommendations = "Continuar acompanhamento regular e observação do desenvolvimento."
    next_steps = "Manter acompanhamento pediátrico regular."
  } else {
    severity_level = 1
    analysis = "Respostas indicam desenvolvimento dentro dos parâmetros esperados."
    recommendations = "Continuar estimulação adequada e acompanhamento regular."
    next_steps = "Manter rotina de acompanhamento pediátrico preventivo."
  }

  return {
    severity_level,
    analysis,
    recommendations,
    next_steps
  }
}

function generateSymptomsText(answers: any, questions: any[]): string {
  const symptoms = []
  
  for (const questionId in answers) {
    const question = questions.find(q => q.id === questionId)
    const answer = answers[questionId]
    
    if (question && (answer.answer === 'yes' || answer.answer === 'sim' || answer.answer === true)) {
      symptoms.push(question.question_text)
    }
  }
  
  return symptoms.join('; ')
}
