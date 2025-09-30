#!/usr/bin/env python3
from supabase import create_client, Client

# Configurações do Instituto Coração Valente
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

def complete_diagnosis_analysis():
    """Análise completa do sistema de pré-diagnóstico comportamental"""
    print("=== ANÁLISE COMPLETA DO SISTEMA DE PRÉ-DIAGNÓSTICO COMPORTAMENTAL ===\n")
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # 1. VERIFICAR TODAS AS TABELAS RELACIONADAS
        print("1. 📋 VERIFICAÇÃO DE TABELAS RELACIONADAS:")
        
        diagnosis_tables = [
            'diagnostics',
            'diagnosis_chat_sessions',
            'pre_diagnosis_sessions',
            'pre_diagnosis_questions',
            'relatorios_diagnostico',
            'user_consent',
            'diagnosis_reports'
        ]
        
        existing_tables = {}
        
        for table_name in diagnosis_tables:
            try:
                count_response = supabase.table(table_name).select('*', count='exact').execute()
                count = count_response.count
                
                # Tentar pegar estrutura da tabela
                sample_response = supabase.table(table_name).select('*').limit(1).execute()
                
                existing_tables[table_name] = {
                    'exists': True,
                    'count': count,
                    'structure': list(sample_response.data[0].keys()) if sample_response.data else []
                }
                
                print(f"   ✅ {table_name}: {count} registros")
                if sample_response.data:
                    print(f"      📋 Campos: {', '.join(sample_response.data[0].keys())}")
                else:
                    print(f"      📋 Tabela vazia")
                
            except Exception as e:
                error_msg = str(e)
                if "does not exist" in error_msg:
                    existing_tables[table_name] = {'exists': False, 'error': 'Não existe'}
                    print(f"   ❌ {table_name}: Tabela não existe")
                else:
                    existing_tables[table_name] = {'exists': False, 'error': error_msg}
                    print(f"   ⚠️ {table_name}: Erro - {error_msg}")
        
        # 2. VERIFICAR ESTRUTURA DETALHADA DAS TABELAS EXISTENTES
        print(f"\n2. 🔍 ESTRUTURA DETALHADA DAS TABELAS EXISTENTES:")
        
        for table_name, info in existing_tables.items():
            if info['exists']:
                print(f"\n   📋 TABELA: {table_name}")
                
                # Tentar descobrir campos adicionais testando campos comuns
                common_fields = [
                    'id', 'user_id', 'session_id', 'created_at', 'updated_at',
                    'status', 'data', 'result', 'content', 'type', 'name',
                    'consent_given', 'consent_date', 'terms_version',
                    'report_data', 'pdf_url', 'generated_at'
                ]
                
                confirmed_fields = []
                for field in common_fields:
                    try:
                        supabase.table(table_name).select(field).limit(1).execute()
                        confirmed_fields.append(field)
                    except:
                        pass
                
                print(f"      ✅ Campos confirmados: {', '.join(confirmed_fields)}")
        
        # 3. VERIFICAR RELACIONAMENTOS (FOREIGN KEYS)
        print(f"\n3. 🔗 ANÁLISE DE RELACIONAMENTOS:")
        
        # Tentar identificar relacionamentos através de campos user_id e session_id
        relationships = []
        
        for table_name, info in existing_tables.items():
            if info['exists'] and info['structure']:
                if 'user_id' in info['structure']:
                    relationships.append(f"{table_name}.user_id → auth.users.id")
                if 'session_id' in info['structure']:
                    relationships.append(f"{table_name}.session_id → possível FK")
        
        if relationships:
            print("   🔗 Relacionamentos identificados:")
            for rel in relationships:
                print(f"      - {rel}")
        else:
            print("   ⚠️ Nenhum relacionamento claro identificado")
        
        # 4. VERIFICAR DADOS DE EXEMPLO (se existirem)
        print(f"\n4. 📊 DADOS DE EXEMPLO:")
        
        for table_name, info in existing_tables.items():
            if info['exists'] and info['count'] > 0:
                try:
                    sample = supabase.table(table_name).select('*').limit(2).execute()
                    print(f"\n   📋 {table_name} (amostra):")
                    for i, record in enumerate(sample.data, 1):
                        print(f"      Registro {i}:")
                        for key, value in record.items():
                            # Mascarar dados sensíveis
                            if key in ['user_id', 'session_id', 'id']:
                                display_value = str(value)[:8] + "..." if value else "None"
                            elif isinstance(value, str) and len(value) > 50:
                                display_value = value[:50] + "..."
                            else:
                                display_value = value
                            print(f"         {key}: {display_value}")
                except Exception as e:
                    print(f"   ❌ Erro ao buscar dados de {table_name}: {str(e)}")
        
        # 5. RESUMO FINAL
        print(f"\n5. 📈 RESUMO EXECUTIVO:")
        
        total_tables = len(diagnosis_tables)
        existing_count = sum(1 for info in existing_tables.values() if info['exists'])
        tables_with_data = sum(1 for info in existing_tables.values() if info['exists'] and info.get('count', 0) > 0)
        
        print(f"   📊 Total de tabelas verificadas: {total_tables}")
        print(f"   ✅ Tabelas existentes: {existing_count}")
        print(f"   📋 Tabelas com dados: {tables_with_data}")
        print(f"   ❌ Tabelas faltando: {total_tables - existing_count}")
        
        if tables_with_data == 0:
            print(f"\n   🚨 IMPORTANTE: Todas as tabelas estão vazias - sistema nunca foi usado em produção")
        
        print("\n=== ANÁLISE COMPLETA CONCLUÍDA ===")
        
    except Exception as e:
        print(f"❌ Erro de conexão: {str(e)}")

if __name__ == "__main__":
    complete_diagnosis_analysis()