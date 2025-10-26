#!/usr/bin/env python3
"""
Script de Análise Completa do Banco - Instituto Coração Valente
Lista TODAS as tabelas e informações do banco usando Service Role Key
"""

from supabase import create_client, Client
import json
from datetime import datetime

# Credenciais do Instituto Coração Valente (SERVICE ROLE para acesso total)
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczNTQxNSwiZXhwIjoyMDY1MzExNDE1fQ.f27cTcOvXM83cmnsqehYHJb0ao_kU3qirMbSUutdxlc"

def get_all_tables(supabase):
    """Busca todas as tabelas do schema public via query SQL"""
    try:
        # Query para listar todas as tabelas do schema public
        query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
        """
        
        response = supabase.rpc('exec_sql', {'query': query}).execute()
        
        # Se não funcionar via RPC, usar lista conhecida expandida
        return None
    except:
        return None

def test_connection():
    """Testa conexão com Supabase e lista TODAS as tabelas"""
    print("=" * 80)
    print("ANÁLISE COMPLETA DO BANCO - INSTITUTO CORAÇÃO VALENTE")
    print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Usando: SERVICE ROLE KEY (acesso total)")
    print("=" * 80)
    print()
    
    try:
        # Criar cliente com SERVICE ROLE
        print("🔌 Conectando ao Supabase com Service Role Key...")
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("✅ Conexão estabelecida com acesso total!")
        print()
        
        # Lista COMPLETA de TODAS as 38 tabelas reais (extraído do OpenAPI schema)
        tables = [
            'ambassador_links',
            'ambassador_performance',
            'analytics_engagement',
            'analytics_events',
            'analytics_performance',
            'analytics_summary',
            'appointments',
            'audit_log',
            'campaigns',
            'diagnosis_chat_sessions',
            'diagnosis_sessions',
            'diagnostics',
            'donations',
            'instituto_integration_config',
            'instituto_integration_logs',
            'instituto_integration_queue',
            'interacoes_agente',
            'library_categories',
            'library_resources',
            'link_clicks',
            'monitoring_alerts',
            'monitoring_health_checks',
            'news_articles',
            'onboarding_screens',
            'partners',
            'performance_summary',
            'pre_diagnosis_questions',
            'pre_diagnosis_sessions',
            'profiles',
            'relatorios_diagnostico',
            'schedules',
            'services',
            'subscriptions',
            'system_health_summary',
            'system_logs',
            'user_consent',
            'v_triagem_completa',
            'volunteer_applications',
        ]
        
        print("📊 VERIFICANDO TODAS AS TABELAS DO BANCO")
        print("-" * 80)
        
        total_records = 0
        tables_found = 0
        tables_with_data = 0
        table_details = []
        
        for table in tables:
            try:
                # Contar registros com Service Role (sem RLS)
                response = supabase.table(table).select('*', count='exact').execute()
                count = response.count
                
                status = "✅" if count > 0 else "⚪"
                print(f"{status} {table:35} | {count:6} registros")
                
                total_records += count
                tables_found += 1
                
                if count > 0:
                    tables_with_data += 1
                    table_details.append({
                        'name': table,
                        'count': count
                    })
                
            except Exception as e:
                error_msg = str(e)
                if "does not exist" in error_msg or "relation" in error_msg:
                    print(f"❌ {table:35} | Tabela não existe")
                else:
                    print(f"⚠️  {table:35} | Erro: {error_msg[:40]}")
        
        print("-" * 80)
        print(f"\n📈 RESUMO COMPLETO:")
        print(f"   Total de tabelas verificadas: {len(tables)}")
        print(f"   Tabelas encontradas: {tables_found}")
        print(f"   Tabelas com dados: {tables_with_data}")
        print(f"   Tabelas vazias: {tables_found - tables_with_data}")
        print(f"   Total de registros: {total_records:,}")
        print()
        
        if table_details:
            print("📋 TABELAS COM DADOS:")
            print("-" * 80)
            for detail in sorted(table_details, key=lambda x: x['count'], reverse=True):
                print(f"   {detail['name']:35} | {detail['count']:6} registros")
            print()
        
        # Testar uma query específica
        print("🔍 TESTANDO QUERY ESPECÍFICA")
        print("-" * 80)
        
        try:
            response = supabase.table('profiles').select('id, full_name, is_volunteer').limit(3).execute()
            print(f"✅ Query executada com sucesso!")
            print(f"   Retornou {len(response.data)} registros")
            
            if response.data:
                print("\n📋 Amostra de dados (profiles):")
                for i, record in enumerate(response.data, 1):
                    print(f"   {i}. {json.dumps(record, indent=6, default=str)}")
        except Exception as e:
            print(f"❌ Erro na query: {str(e)}")
        
        print()
        print("=" * 80)
        print("✅ TESTE CONCLUÍDO COM SUCESSO!")
        print("=" * 80)
        
        return True
        
    except Exception as e:
        print()
        print("=" * 80)
        print("❌ ERRO NA CONEXÃO!")
        print("=" * 80)
        print(f"Erro: {str(e)}")
        print()
        return False

if __name__ == "__main__":
    success = test_connection()
    exit(0 if success else 1)
