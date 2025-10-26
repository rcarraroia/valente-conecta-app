#!/usr/bin/env python3
"""
Executar migração RLS para permitir acesso público aos embaixadores
IMPORTANTE: Este script usa SERVICE ROLE KEY
"""
from supabase import create_client, Client

# Configurações do Instituto Coração Valente
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczNTQxNSwiZXhwIjoyMDY1MzExNDE1fQ.f27cTcOvXM83cmnsqehYHJb0ao_kU3qirMbSUutdxlc"

def executar_migracao():
    """Executar migração RLS"""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    print("=" * 80)
    print("EXECUTANDO MIGRAÇÃO RLS - EMBAIXADORES")
    print("=" * 80)
    
    # SQL da migração
    sql_policies = """
    -- 1. Permitir leitura pública de perfis com ambassador_code
    DROP POLICY IF EXISTS "Perfis de embaixadores são públicos" ON profiles;
    
    CREATE POLICY "Perfis de embaixadores são públicos"
    ON profiles FOR SELECT
    USING (ambassador_code IS NOT NULL);
    
    -- 2. Permitir leitura pública de dados de parceiros
    DROP POLICY IF EXISTS "Dados de parceiros são públicos para leitura" ON partners;
    
    CREATE POLICY "Dados de parceiros são públicos para leitura"
    ON partners FOR SELECT
    USING (true);
    """
    
    print("\n1. EXECUTANDO SQL...")
    print("-" * 80)
    
    try:
        # Executar SQL
        result = supabase.rpc('exec_sql', {'sql': sql_policies}).execute()
        print("✅ Migração executada com sucesso!")
        
    except Exception as e:
        # Tentar método alternativo
        print(f"⚠️ Método RPC não disponível, tentando método alternativo...")
        
        try:
            # Executar cada política separadamente
            print("\n   Criando política para profiles...")
            supabase.postgrest.rpc('exec_sql', {
                'sql': """
                DROP POLICY IF EXISTS "Perfis de embaixadores são públicos" ON profiles;
                CREATE POLICY "Perfis de embaixadores são públicos"
                ON profiles FOR SELECT
                USING (ambassador_code IS NOT NULL);
                """
            }).execute()
            print("   ✅ Política profiles criada")
            
            print("\n   Criando política para partners...")
            supabase.postgrest.rpc('exec_sql', {
                'sql': """
                DROP POLICY IF EXISTS "Dados de parceiros são públicos para leitura" ON partners;
                CREATE POLICY "Dados de parceiros são públicos para leitura"
                ON partners FOR SELECT
                USING (true);
                """
            }).execute()
            print("   ✅ Política partners criada")
            
        except Exception as e2:
            print(f"\n❌ Erro ao executar migração: {e2}")
            print("\n📋 SOLUÇÃO MANUAL:")
            print("   Execute este SQL no Supabase Dashboard:")
            print("\n" + sql_policies)
            return False
    
    print("\n2. VALIDANDO...")
    print("-" * 80)
    
    # Testar acesso com anon key
    supabase_anon = create_client(
        SUPABASE_URL,
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"
    )
    
    try:
        response = supabase_anon.table('profiles').select(
            'id, full_name, ambassador_code'
        ).not_.is_('ambassador_code', 'null').execute()
        
        if response.data and len(response.data) > 0:
            print(f"✅ Acesso público funcionando!")
            print(f"   Embaixadores visíveis: {len(response.data)}")
            
            for amb in response.data:
                print(f"\n   - {amb['full_name']} ({amb['ambassador_code']})")
            
            return True
        else:
            print("⚠️ Políticas criadas mas ainda não retornam dados")
            print("   Aguarde alguns segundos e teste novamente")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao validar: {e}")
        return False
    
    print("\n" + "=" * 80)
    print("MIGRAÇÃO CONCLUÍDA")
    print("=" * 80)

if __name__ == "__main__":
    sucesso = executar_migracao()
    
    if sucesso:
        print("\n✅ SUCESSO! Card do embaixador deve aparecer agora.")
        print("\nTeste em: http://localhost:8080/landing?ref=RMCC0408")
    else:
        print("\n⚠️ Execute manualmente no Supabase Dashboard")
