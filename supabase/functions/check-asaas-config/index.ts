import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== VERIFICAÇÃO DE CONFIGURAÇÃO ASAAS ===');
    
    // Verificar variáveis de ambiente
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    const config = {
      asaas: {
        hasApiKey: !!asaasApiKey,
        apiKeyLength: asaasApiKey ? asaasApiKey.length : 0,
        apiKeyPrefix: asaasApiKey ? asaasApiKey.substring(0, 10) + '...' : 'N/A'
      },
      supabase: {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'N/A'
      },
      wallets: {
        instituto: 'eff311bc-7737-4870-93cd-16080c00d379',
        renum: 'f9c7d1dd-9e52-4e81-8194-8b666f276405',
        especial: 'c0c31b6a-2481-4e3f-a6de-91c3ff834d1f'
      }
    };

    console.log('Configuração encontrada:', JSON.stringify(config, null, 2));

    // Testar conexão com Asaas se API Key existir
    let asaasTest = null;
    if (asaasApiKey) {
      try {
        console.log('Testando conexão com Asaas...');
        const testResponse = await fetch('https://www.asaas.com/api/v3/customers?limit=1', {
          method: 'GET',
          headers: {
            'access_token': asaasApiKey,
            'Content-Type': 'application/json',
          },
        });

        asaasTest = {
          status: testResponse.status,
          statusText: testResponse.statusText,
          isValid: testResponse.ok
        };

        if (testResponse.ok) {
          const data = await testResponse.json();
          asaasTest.hasData = !!data;
          console.log('✅ Conexão com Asaas OK');
        } else {
          const errorData = await testResponse.text();
          asaasTest.error = errorData;
          console.log('❌ Erro na conexão com Asaas:', errorData);
        }
      } catch (error) {
        asaasTest = {
          error: error.message,
          isValid: false
        };
        console.log('❌ Erro ao testar Asaas:', error.message);
      }
    }

    const result = {
      success: true,
      config,
      asaasTest,
      recommendations: []
    };

    // Adicionar recomendações
    if (!asaasApiKey) {
      result.recommendations.push('⚠️ ASAAS_API_KEY não configurada - necessária para processar pagamentos');
    }
    
    if (!supabaseUrl || !supabaseServiceKey) {
      result.recommendations.push('⚠️ Configuração do Supabase incompleta');
    }

    if (asaasTest && !asaasTest.isValid) {
      result.recommendations.push('⚠️ API Key do Asaas inválida ou expirada');
    }

    if (result.recommendations.length === 0) {
      result.recommendations.push('✅ Todas as configurações estão OK');
    }

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Erro na verificação:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      recommendations: [
        '❌ Erro crítico na verificação de configuração',
        'Verifique os logs do Supabase para mais detalhes'
      ]
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

serve(handler);