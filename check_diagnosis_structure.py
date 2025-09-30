#!/usr/bin/env python3
from supabase import create_client, Client

# Configurações do Instituto Coração Valente
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

def check_diagnosis_structure():
    """Verificar estrutura real das tabelas de diagnóstico"""
    print("=== ESTRUTURA DAS TABELAS DE DIAGNÓSTICO ===\n")
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Verificar campos da tabela diagnostics
        print("📋 TABELA: diagnostics")
        diagnostics_fields = [
            'id', 'user_id', 'session_id', 'status', 'result', 'score',
            'recommendations', 'created_at', 'updated_at', 'completed_at',
            'questions_answered', 'total_questions', 'diagnosis_type'
        ]
        
        existing_diagnostics_fields = []
        for field in diagnostics_fields:
            try:
                response = supabase.table('diagnostics').select(field).limit(1).execute()
                existing_diagnostics_fields.append(field)
                print(f"   ✅ {field}")
            except Exception as e:
                print(f"   ❌ {field} - {str(e).split(',')[0]}")
        
        print(f"\n   📋 Campos confirmados: {', '.join(existing_diagnostics_fields)}")
        
        # Verificar campos da tabela diagnosis_chat_sessions
        print("\n📋 TABELA: diagnosis_chat_sessions")
        sessions_fields = [
            'id', 'session_id', 'user_id', 'status', 'messages', 'context',
            'created_at', 'updated_at', 'completed_at', 'last_message_at',
            'n8n_session_id', 'chat_history', 'current_question', 'responses'
        ]
        
        existing_sessions_fields = []
        for field in sessions_fields:
            try:
                response = supabase.table('diagnosis_chat_sessions').select(field).limit(1).execute()
                existing_sessions_fields.append(field)
                print(f"   ✅ {field}")
            except Exception as e:
                print(f"   ❌ {field} - {str(e).split(',')[0]}")
        
        print(f"\n   📋 Campos confirmados: {', '.join(existing_sessions_fields)}")
        
        # Verificar se há dados de exemplo
        print("\n🔍 VERIFICANDO DADOS EXISTENTES:")
        
        # Diagnostics
        try:
            diagnostics_data = supabase.table('diagnostics').select('*').limit(1).execute()
            print(f"   📊 diagnostics: {len(diagnostics_data.data)} registros")
        except Exception as e:
            print(f"   ❌ diagnostics: Erro - {str(e)}")
        
        # Sessions
        try:
            sessions_data = supabase.table('diagnosis_chat_sessions').select('*').limit(1).execute()
            print(f"   📊 diagnosis_chat_sessions: {len(sessions_data.data)} registros")
        except Exception as e:
            print(f"   ❌ diagnosis_chat_sessions: Erro - {str(e)}")
        
        print("\n=== VERIFICAÇÃO CONCLUÍDA ===")
        
    except Exception as e:
        print(f"❌ Erro de conexão: {str(e)}")

if __name__ == "__main__":
    check_diagnosis_structure()