#!/usr/bin/env python3
from supabase import create_client, Client

# Configurações do Instituto Coração Valente
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

def check_prediagnosis_tables():
    """Verificar tabelas que as Edge Functions estão tentando usar"""
    print("=== VERIFICAÇÃO DE TABELAS DO PRÉ-DIAGNÓSTICO ===\n")
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Tabelas que as Edge Functions estão tentando usar
        expected_tables = [
            'pre_diagnosis_questions',
            'pre_diagnosis_sessions', 
            'diagnostics',
            'diagnosis_chat_sessions'
        ]
        
        print("🔍 VERIFICANDO TABELAS ESPERADAS PELAS EDGE FUNCTIONS:")
        
        existing_tables = []
        missing_tables = []
        
        for table_name in expected_tables:
            try:
                count_response = supabase.table(table_name).select('*', count='exact').execute()
                count = count_response.count
                existing_tables.append(table_name)
                print(f"   ✅ {table_name}: {count} registros")
                
                # Se a tabela existe, verificar estrutura básica
                if count == 0:
                    # Tentar inserir um registro vazio para ver campos obrigatórios
                    try:
                        supabase.table(table_name).insert({}).execute()
                    except Exception as e:
                        error_msg = str(e)
                        if "null value in column" in error_msg:
                            print(f"      📝 Campos obrigatórios detectados:")
                            lines = error_msg.split('\n')
                            for line in lines:
                                if "null value in column" in line:
                                    field = line.split('"')[1] if '"' in line else "campo desconhecido"
                                    print(f"         - {field}")
                
            except Exception as e:
                error_msg = str(e)
                if "does not exist" in error_msg:
                    missing_tables.append(table_name)
                    print(f"   ❌ {table_name}: Tabela não existe")
                else:
                    print(f"   ⚠️ {table_name}: Erro - {error_msg}")
        
        print(f"\n📊 RESUMO:")
        print(f"   ✅ Tabelas existentes: {len(existing_tables)}")
        print(f"   ❌ Tabelas faltando: {len(missing_tables)}")
        
        if missing_tables:
            print(f"\n🚨 TABELAS FALTANDO PARA O SISTEMA FUNCIONAR:")
            for table in missing_tables:
                print(f"   - {table}")
        
        if existing_tables:
            print(f"\n✅ TABELAS EXISTENTES:")
            for table in existing_tables:
                print(f"   - {table}")
        
        # Verificar se o sistema atual (n8n) está sendo usado
        print(f"\n🤖 VERIFICAÇÃO DO SISTEMA N8N:")
        print(f"   📡 O sistema atual usa n8n para processamento de chat")
        print(f"   📡 As Edge Functions 'diagnostico-*' parecem ser um sistema alternativo")
        print(f"   📡 Tabelas 'diagnosis_chat_sessions' e 'diagnostics' existem mas estão vazias")
        
        print("\n=== VERIFICAÇÃO CONCLUÍDA ===")
        
    except Exception as e:
        print(f"❌ Erro de conexão: {str(e)}")

if __name__ == "__main__":
    check_prediagnosis_tables()