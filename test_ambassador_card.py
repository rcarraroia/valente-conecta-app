#!/usr/bin/env python3
"""
Script para testar o card do embaixador na landing page
Verifica se o código de embaixador está configurado corretamente
"""
from supabase import create_client, Client

# Configurações do Instituto Coração Valente
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

def test_ambassador_card():
    """Testa a configuração do card do embaixador"""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print("=" * 80)
    print("TESTE DO CARD DO EMBAIXADOR - LANDING PAGE")
    print("=" * 80)
    
    # 1. Verificar se existem embaixadores cadastrados
    print("\n1. VERIFICANDO EMBAIXADORES CADASTRADOS")
    print("-" * 80)
    
    try:
        response = supabase.table('profiles').select(
            'id, full_name, ambassador_code, created_at'
        ).not_.is_('ambassador_code', 'null').execute()
        
        ambassadors = response.data
        
        if not ambassadors:
            print("❌ PROBLEMA: Nenhum embaixador cadastrado!")
            print("   Solução: Cadastre um usuário com ambassador_code")
            return
        
        print(f"✅ {len(ambassadors)} embaixador(es) encontrado(s):")
        for amb in ambassadors:
            print(f"\n   Nome: {amb['full_name']}")
            print(f"   Código: {amb['ambassador_code']}")
            print(f"   ID: {amb['id']}")
            print(f"   Cadastrado em: {amb['created_at']}")
            
            # Verificar se é parceiro (tem foto profissional)
            partner_response = supabase.table('partners').select(
                'professional_photo_url'
            ).eq('user_id', amb['id']).maybeSingle().execute()
            
            if partner_response.data:
                print(f"   Foto: {partner_response.data.get('professional_photo_url', 'Não configurada')}")
            else:
                print(f"   ⚠️ Não é parceiro (sem foto profissional)")
        
    except Exception as e:
        print(f"❌ Erro ao buscar embaixadores: {e}")
        return
    
    # 2. Testar busca por código específico
    print("\n\n2. TESTANDO BUSCA POR CÓDIGO")
    print("-" * 80)
    
    test_code = ambassadors[0]['ambassador_code'] if ambassadors else None
    
    if test_code:
        print(f"Testando com código: {test_code}")
        
        try:
            # Simular a query da landing page
            profile_response = supabase.table('profiles').select(
                'id, full_name'
            ).eq('ambassador_code', test_code).single().execute()
            
            if profile_response.data:
                print(f"✅ Perfil encontrado: {profile_response.data['full_name']}")
                
                # Buscar dados do parceiro
                partner_response = supabase.table('partners').select(
                    'professional_photo_url'
                ).eq('user_id', profile_response.data['id']).maybeSingle().execute()
                
                if partner_response.data:
                    print(f"✅ Dados do parceiro encontrados")
                    print(f"   Foto: {partner_response.data.get('professional_photo_url', 'Não configurada')}")
                else:
                    print(f"⚠️ Usuário não é parceiro (card aparecerá sem foto)")
            else:
                print(f"❌ Perfil não encontrado")
                
        except Exception as e:
            print(f"❌ Erro na busca: {e}")
    
    # 3. Verificar URLs de teste
    print("\n\n3. URLS DE TESTE")
    print("-" * 80)
    
    if ambassadors:
        for amb in ambassadors:
            code = amb['ambassador_code']
            print(f"\n✅ URL para testar {amb['full_name']}:")
            print(f"   https://seu-dominio.com/landing?ref={code}")
            print(f"   ou")
            print(f"   https://seu-dominio.com/landing/{code}")
    
    # 4. Verificar políticas RLS
    print("\n\n4. VERIFICANDO POLÍTICAS RLS")
    print("-" * 80)
    
    print("⚠️ IMPORTANTE: As políticas RLS podem estar bloqueando a leitura")
    print("   - Tabela 'profiles' deve permitir SELECT público")
    print("   - Tabela 'partners' deve permitir SELECT público")
    print("   - Verifique no Supabase Dashboard > Authentication > Policies")
    
    # 5. Diagnóstico final
    print("\n\n5. DIAGNÓSTICO")
    print("=" * 80)
    
    if not ambassadors:
        print("❌ PROBLEMA: Nenhum embaixador cadastrado")
        print("\nSOLUÇÃO:")
        print("1. Cadastre um usuário no sistema")
        print("2. Configure o campo 'ambassador_code' no perfil")
        print("3. Teste a URL: /landing?ref=CODIGO")
    else:
        print("✅ Embaixadores cadastrados corretamente")
        print("\nPOSSÍVEIS CAUSAS DO CARD NÃO APARECER:")
        print("1. URL incorreta (deve ser /landing?ref=CODIGO ou /landing/CODIGO)")
        print("2. Políticas RLS bloqueando leitura pública")
        print("3. Cache do navegador (testar em aba anônima)")
        print("4. Código do embaixador não corresponde ao cadastrado")
        print("\nTESTE:")
        print(f"Abra em aba anônima: /landing?ref={ambassadors[0]['ambassador_code']}")

if __name__ == "__main__":
    test_ambassador_card()
