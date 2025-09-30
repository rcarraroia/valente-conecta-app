/**
 * Serviço de Persistência para Sistema de Triagem Comportamental (STC)
 * 
 * Este serviço gerencia a persistência de dados do Sistema de Triagem Comportamental,
 * incluindo consentimentos, sessões de chat e resultados de diagnóstico.
 */

import { supabase } from '@/integrations/supabase/client';

export interface ConsentData {
  user_id: string;
  consent_type?: string;
  consent_version?: string;
  ip_address?: string;
  user_agent?: string;
  accepted_terms?: Record<string, any>;
}

export interface ChatSessionData {
  session_id: string;
  user_id: string;
  status: string;
  messages: any[];
}

export interface DiagnosticResultData {
  user_id: string;
  session_id: string;
  behavioral_score: number;
  severity_level?: number;
  recommendations: string;
  sub_agent_tea?: any;
  sub_agent_tdah?: any;
  sub_agent_linguagem?: any;
  sub_agent_sindromes?: any;
  interview_duration_minutes?: number;
  completed_steps?: string[];
  risk_indicators?: string[];
}

/**
 * Serviço de Persistência para Sistema de Triagem Comportamental (STC)
 */
export class ScreeningPersistenceService {
  
  /**
   * Registra consentimento do usuário para triagem comportamental
   * 
   * @param userId - ID do usuário
   * @param ipAddress - IP do usuário (opcional)
   * @param userAgent - User agent do navegador (opcional)
   * @returns Dados do consentimento registrado
   */
  async recordConsent(
    userId: string, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<any> {
    try {
      console.log('🔒 STC: Registrando consentimento para usuário:', userId);
      
      // Verificar se já existe consentimento ativo
      const { data: existingConsent } = await supabase
        .from('user_consent')
        .select('id, consent_date')
        .eq('user_id', userId)
        .eq('consent_type', 'triagem_comportamental')
        .is('updated_at', null) // Não revogado
        .single();
      
      if (existingConsent) {
        console.log('✅ STC: Consentimento já existe:', existingConsent.id);
        return existingConsent;
      }
      
      // Criar novo consentimento
      const consentData: ConsentData = {
        user_id: userId,
        consent_type: 'triagem_comportamental',
        consent_version: '1.0',
        ip_address: ipAddress,
        user_agent: userAgent,
        accepted_terms: {
          timestamp: new Date().toISOString(),
          screen: 'diagnosis_chat',
          version: '1.0',
          lgpd_compliant: true
        }
      };
      
      const { data, error } = await supabase
        .from('user_consent')
        .insert({
          ...consentData,
          consent_date: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ STC: Erro ao registrar consentimento:', error);
        throw new Error(`Erro ao registrar consentimento: ${error.message}`);
      }
      
      console.log('✅ STC: Consentimento registrado com sucesso:', data.id);
      return data;
      
    } catch (error: any) {
      console.error('❌ STC: Falha ao registrar consentimento:', error);
      throw error;
    }
  }
  
  /**
   * Cria ou atualiza sessão de chat no banco de dados
   * 
   * @param sessionData - Dados da sessão
   * @returns Dados da sessão persistida
   */
  async upsertChatSession(sessionData: ChatSessionData): Promise<any> {
    try {
      console.log('💾 STC: Persistindo sessão:', sessionData.session_id);
      
      const sessionPayload = {
        session_id: sessionData.session_id,
        user_id: sessionData.user_id,
        status: sessionData.status,
        messages: sessionData.messages,
        total_messages: sessionData.messages.length,
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('diagnosis_chat_sessions')
        .upsert(sessionPayload, {
          onConflict: 'session_id'
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ STC: Erro ao persistir sessão:', error);
        throw new Error(`Erro ao persistir sessão: ${error.message}`);
      }
      
      console.log('✅ STC: Sessão persistida com sucesso:', data.id);
      return data;
      
    } catch (error: any) {
      console.error('❌ STC: Falha ao persistir sessão:', error);
      throw error;
    }
  }
  
  /**
   * Marca consentimento como registrado na sessão
   * 
   * @param sessionId - ID da sessão
   */
  async markConsentRecorded(sessionId: string): Promise<void> {
    try {
      console.log('✅ STC: Marcando consentimento registrado para sessão:', sessionId);
      
      const { error } = await supabase
        .from('diagnosis_chat_sessions')
        .update({ 
          consent_recorded: true,
          last_activity_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);
      
      if (error) {
        console.error('❌ STC: Erro ao marcar consentimento:', error);
        throw new Error(`Erro ao marcar consentimento: ${error.message}`);
      }
      
      console.log('✅ STC: Consentimento marcado na sessão');
      
    } catch (error: any) {
      console.error('❌ STC: Falha ao marcar consentimento:', error);
      throw error;
    }
  }
  
  /**
   * Salva resultado final da triagem comportamental
   * 
   * @param diagnosticData - Dados do diagnóstico
   * @returns Dados do diagnóstico salvo
   */
  async saveDiagnosticResult(diagnosticData: DiagnosticResultData): Promise<any> {
    try {
      console.log('🧠 STC: Salvando resultado da triagem para usuário:', diagnosticData.user_id);
      
      // Buscar o ID da sessão no banco
      const { data: session, error: sessionError } = await supabase
        .from('diagnosis_chat_sessions')
        .select('id')
        .eq('session_id', diagnosticData.session_id)
        .single();
      
      if (sessionError || !session) {
        console.error('❌ STC: Sessão não encontrada:', sessionError);
        throw new Error('Sessão não encontrada no banco de dados');
      }
      
      // Preparar dados do diagnóstico
      const diagnosticPayload = {
        user_id: diagnosticData.user_id,
        session_id: session.id, // FK para diagnosis_chat_sessions.id
        screening_type: 'comportamental',
        behavioral_score: diagnosticData.behavioral_score,
        recommendations: diagnosticData.recommendations,
        sub_agent_tea: diagnosticData.sub_agent_tea || null,
        sub_agent_tdah: diagnosticData.sub_agent_tdah || null,
        sub_agent_linguagem: diagnosticData.sub_agent_linguagem || null,
        sub_agent_sindromes: diagnosticData.sub_agent_sindromes || null,
        interview_duration_minutes: diagnosticData.interview_duration_minutes || null,
        completed_steps: diagnosticData.completed_steps || [],
        risk_indicators: diagnosticData.risk_indicators || [],
        status: 'concluido',
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('diagnostics')
        .insert(diagnosticPayload)
        .select()
        .single();
      
      if (error) {
        console.error('❌ STC: Erro ao salvar diagnóstico:', error);
        throw new Error(`Erro ao salvar diagnóstico: ${error.message}`);
      }
      
      // Atualizar status da sessão para concluída
      await supabase
        .from('diagnosis_chat_sessions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString()
        })
        .eq('id', session.id);
      
      console.log('✅ STC: Resultado da triagem salvo com sucesso:', data.id);
      return data;
      
    } catch (error: any) {
      console.error('❌ STC: Falha ao salvar resultado:', error);
      throw error;
    }
  }
  
  /**
   * Busca sessões ativas do usuário
   * 
   * @param userId - ID do usuário
   * @returns Lista de sessões ativas
   */
  async getActiveSessions(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('diagnosis_chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'in_progress'])
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('❌ STC: Erro ao buscar sessões ativas:', error);
        throw new Error(`Erro ao buscar sessões: ${error.message}`);
      }
      
      return data || [];
      
    } catch (error: any) {
      console.error('❌ STC: Falha ao buscar sessões ativas:', error);
      throw error;
    }
  }
  
  /**
   * Busca histórico completo de triagens do usuário
   * 
   * @param userId - ID do usuário
   * @returns Histórico de triagens
   */
  async getUserScreeningHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('v_triagem_completa')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });
      
      if (error) {
        console.error('❌ STC: Erro ao buscar histórico:', error);
        throw new Error(`Erro ao buscar histórico: ${error.message}`);
      }
      
      return data || [];
      
    } catch (error: any) {
      console.error('❌ STC: Falha ao buscar histórico:', error);
      throw error;
    }
  }
  
  /**
   * Verifica se usuário tem consentimento ativo
   * 
   * @param userId - ID do usuário
   * @returns True se tem consentimento ativo
   */
  async hasActiveConsent(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_consent')
        .select('id')
        .eq('user_id', userId)
        .eq('consent_type', 'triagem_comportamental')
        .is('updated_at', null) // Não revogado
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ STC: Erro ao verificar consentimento:', error);
        return false;
      }
      
      return !!data;
      
    } catch (error: any) {
      console.error('❌ STC: Falha ao verificar consentimento:', error);
      return false;
    }
  }
  
  /**
   * Calcula score comportamental baseado nos dados da IA
   * 
   * @param diagnosisData - Dados retornados pela IA
   * @returns Score de 0-100
   */
  calculateBehavioralScore(diagnosisData: any): number {
    try {
      // Lógica de cálculo baseada nos dados da IA
      let score = 50; // Score base
      
      // Ajustar baseado no nível de urgência
      if (diagnosisData.nivel_urgencia === 'Alta') {
        score += 30;
      } else if (diagnosisData.nivel_urgencia === 'Moderada') {
        score += 15;
      }
      
      // Ajustar baseado no número de indicadores
      const indicators = diagnosisData.indicadores_comportamentais || [];
      score += Math.min(indicators.length * 5, 20);
      
      // Garantir que está entre 0-100
      return Math.max(0, Math.min(100, score));
      
    } catch (error) {
      console.error('❌ STC: Erro ao calcular score:', error);
      return 50; // Score padrão em caso de erro
    }
  }
}

// Instância singleton do serviço
export const screeningPersistence = new ScreeningPersistenceService();

// Função utilitária para extrair dados dos sub-agentes
export const extractSubAgentData = (diagnosisData: any) => {
  return {
    tea_analysis: diagnosisData.tea_analysis || diagnosisData.analise_tea || null,
    tdah_analysis: diagnosisData.tdah_analysis || diagnosisData.analise_tdah || null,
    linguagem_analysis: diagnosisData.linguagem_analysis || diagnosisData.analise_linguagem || null,
    sindromes_analysis: diagnosisData.sindromes_analysis || diagnosisData.analise_sindromes || null,
  };
};

// Função utilitária para extrair indicadores de risco
export const extractRiskIndicators = (diagnosisData: any): string[] => {
  const indicators: string[] = [];
  
  if (diagnosisData.indicadores_comportamentais) {
    indicators.push(...diagnosisData.indicadores_comportamentais);
  }
  
  if (diagnosisData.sinais_alerta) {
    indicators.push(...diagnosisData.sinais_alerta);
  }
  
  if (diagnosisData.areas_preocupacao) {
    indicators.push(...diagnosisData.areas_preocupacao);
  }
  
  return [...new Set(indicators)]; // Remove duplicatas
};