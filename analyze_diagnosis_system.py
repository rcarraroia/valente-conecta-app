#!/usr/bin/env python3
from supabase import create_client, Client

# Configurações do Instituto Coração Valente
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

def analyze_diagnosis_system():
    """Análise completa do sistema de diagnóstico/triagem"""
    print("=== ANÁLISE DO SISTEMA DE PRÉ-DIAGNÓSTICO/TRIAGEM ===\n")
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Tabelas relacionadas ao sistema de diagnóstico
        diagnosis_tables = [
            'diagnostics',
            'diagnosis_chat_sessions', 
            'diagnosis_reports',
            'diagnosis_questions',
            'diagnosis_responses'
        ]
        
        print("🔍 VERIFICANDO TABELAS DO SISTEMA DE DIAGNÓSTICO:")
        
        existing_tables = []
        for table_name in diagnosis_tables:
            try:
                count_response = supabase.table(table_name).select('*', count='exact').execute()
                count = count_response.count
                
                # Tentar pegar amostra de dados
                sample_response = supabase.table(table_name).select('*').limit(3).execute()
                sample = sample_response.data
                
                existing_tables.append(table_name)
                print(f"   ✅ {table_name}: {count} registros")
                
                if sample:
                    print(f"      📋 Estrutura baseada em dados:")
                    for key in sample[0].keys():
                        print(f"         - {key}")
                    
                    print(f"      📊 Amostra de dados:")
                    for i, record in enumerate(sample[:2], 1):
                        print(f"         Registro {i}:")
                        for key, value in record.items():
                            if key in ['session_id', 'user_id', 'id']:
                                # Mascarar IDs por segurança
                                display_value = str(value)[:8] + "..." if value else "None"
                                print(f"            {key}: {display_value}")
                            elif key in ['created_at', 'updated_at']:
                                print(f"            {key}: {value}")
                            else:
                                # Limitar tamanho de outros campos
                                display_value = str(value)[:50] + "..." if value and len(str(value)) > 50 else value
                                print(f"            {key}: {display_value}")
                else:
                    print(f"      📊 Tabela vazia")
                
                print()  # Linha em branco
                
            except Exception as e:
                error_msg = str(e)
                if "does not exist" in error_msg:
                    print(f"   ❌ {table_name}: Tabela não existe")
                else:
                    print(f"   ⚠️ {table_name}: Erro - {error_msg}")
        
        print(f"\n📋 TABELAS EXISTENTES: {', '.join(existing_tables)}")
        
        # Verificar relacionamentos se houver dados
        if existing_tables:
            print("\n🔗 ANÁLISE DE RELACIONAMENTOS:")
            
            # Verificar se diagnosis_chat_sessions tem session_id
            if 'diagnosis_chat_sessions' in existing_tables:
                try:
                    sessions = supabase.table('diagnosis_chat_sessions').select('session_id, user_id, created_at').limit(5).execute()
                    if sessions.data:
                        print("   📊 Padrões de session_id encontrados:")
                        for session in sessions.data:
                            session_id = session.get('session_id', 'N/A')
                            user_id = session.get('user_id', 'N/A')
                            # Mascarar IDs
                            masked_session = session_id[:15] + "..." if len(str(session_id)) > 15 else session_id
                            masked_user = str(user_id)[:8] + "..." if user_id else "None"
                            print(f"      - Session: {masked_session} | User: {masked_user}")
                    else:
                        print("   📊 Nenhuma sessão encontrada")
                except Exception as e:
                    print(f"   ❌ Erro ao analisar sessões: {str(e)}")
        
        # Verificar Edge Functions relacionadas
        print("\n🔧 EDGE FUNCTIONS DE DIAGNÓSTICO:")
        diagnosis_functions = [
            'diagnostico-iniciar',
            'diagnostico-resposta', 
            'process-diagnosis',
            'generate-diagnosis-report'
        ]
        
        for func in diagnosis_functions:
            print(f"   📡 {func}: Verificar se existe")
        
        print("\n=== ANÁLISE CONCLUÍDA ===")
        
    except Exception as e:
        print(f"❌ Erro de conexão: {str(e)}")

if __name__ == "__main__":
    analyze_diagnosis_system()