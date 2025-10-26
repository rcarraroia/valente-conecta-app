#!/usr/bin/env python3
"""
Verificar embaixadores reais no banco
Testar com anon key (como a landing page faz)
"""
from supabase import create_client, Client

# Configurações do Instituto Coração Valente
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

def testar_acesso():
    """Testar acesso aos embaixadores com anon key"""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    print("=" * 80)
    print("TESTE DE ACESSO AOS EMBAIXADORES - ANON KEY")
    print("=" * 80)
    
    # Teste 1: Buscar todos os embaixadores
    print("\n1. BUSCAR TODOS OS EMBAIXADORES")
    print("-" * 80)
    
    try:
        response = supabase.table('profiles').select(
            'id, full_name, ambassador_code, ambassador_wallet_id'
        ).not_.is_('ambassador_code', 'null').execute()
        
        print(f"✅ Query executada com sucesso")
        print(f"   Registros retornados: {len(response.data)}")
        
        if response.data:
            print("\n   Embaixadores encontrados:")
            for amb in response.data:
                print(f"\n   - Nome: {amb['full_name']}")
                print(f"     Código: {amb['ambassador_code']}")
                print(f"     Wallet: {amb.get('ambassador_wallet_id', 'NULL')}")
                print(f"     ID: {amb['id']}")
        else:
            print("\n   ❌ PROBLEMA: Query retornou 0 registros!")
            print("   Isso significa que as políticas RLS estão bloqueando o acesso.")
            
    except Exception as e:
        print(f"❌ Erro na query: {e}")
    
    # Teste 2: Buscar por código específico (como a landing page faz)
    print("\n\n2. BUSCAR POR CÓDIGO ESPECÍFICO (RMCC0408)")
    print("-" * 80)
    
    try:
        response = supabase.table('profiles').select(
            'id, full_name'
        ).eq('ambassador_code', 'RMCC0408').single().execute()
        
        if response.data:
            print(f"✅ Embaixador encontrado!")
            print(f"   Nome: {response.data['full_name']}")
            print(f"   ID: {response.data['id']}")
        else:
            print(f"❌ Embaixador NÃO encontrado")
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        print("\n   Possíveis causas:")
        print("   1. Políticas RLS bloqueando acesso público")
        print("   2. Código não existe no banco")
        print("   3. Problema de permissões")
    
    # Teste 3: Verificar políticas RLS
    print("\n\n3. DIAGNÓSTICO DE POLÍTICAS RLS")
    print("-" * 80)
    
    print("\n   Para verificar as políticas RLS:")
    print("   1. Acesse: Supabase Dashboard > Authentication > Policies")
    print("   2. Procure por políticas na tabela 'profiles'")
    print("   3. Verifique se existe política permitindo SELECT público")
    print("\n   Política necessária:")
    print("   Nome: 'Perfis de embaixadores são públicos'")
    print("   Operação: SELECT")
    print("   Condição: ambassador_code IS NOT NULL")
    
    # Teste 4: Testar busca de parceiro
    print("\n\n4. TESTAR BUSCA DE DADOS DO PARCEIRO")
    print("-" * 80)
    
    try:
        # Primeiro buscar o embaixador
        profile_response = supabase.table('profiles').select(
            'id, full_name'
        ).eq('ambassador_code', 'RMCC0408').single().execute()
        
        if profile_response.data:
            user_id = profile_response.data['id']
            
            # Buscar dados do parceiro
            partner_response = supabase.table('partners').select(
                'professional_photo_url'
            ).eq('user_id', user_id).maybeSingle().execute()
            
            if partner_response.data:
                print(f"✅ Dados do parceiro encontrados")
                print(f"   Foto: {partner_response.data.get('professional_photo_url', 'NULL')}")
            else:
                print(f"⚠️ Usuário não é parceiro (sem foto profissional)")
        else:
            print(f"❌ Não foi possível buscar parceiro (perfil não encontrado)")
            
    except Exception as e:
        print(f"❌ Erro ao buscar parceiro: {e}")
    
    print("\n" + "=" * 80)
    print("FIM DO TESTE")
    print("=" * 80)

if __name__ == "__main__":
    testar_acesso()
