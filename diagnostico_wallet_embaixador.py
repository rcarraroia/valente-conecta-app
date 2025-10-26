#!/usr/bin/env python3
"""
Script de Diagnóstico Completo - Wallet e Embaixador
Verifica configuração completa do sistema de embaixadores
"""
from supabase import create_client, Client
import json
from datetime import datetime

# Configurações do Instituto Coração Valente
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

def print_header(title):
    """Imprime cabeçalho formatado"""
    print("\n" + "=" * 80)
    print(f" {title}")
    print("=" * 80)

def print_section(title):
    """Imprime seção formatada"""
    print("\n" + "-" * 80)
    print(f" {title}")
    print("-" * 80)

def diagnostico_completo():
    """Diagnóstico completo do sistema de embaixadores"""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print_header("DIAGNÓSTICO COMPLETO - SISTEMA DE EMBAIXADORES")
    print(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"Projeto: ONG Coração Valente")
    
    # 1. VERIFICAR EMBAIXADORES
    print_section("1. EMBAIXADORES CADASTRADOS")
    
    try:
        response = supabase.table('profiles').select(
            'id, full_name, ambassador_code, ambassador_wallet_id, created_at'
        ).not_.is_('ambassador_code', 'null').execute()
        
        ambassadors = response.data
        
        if not ambassadors:
            print("❌ PROBLEMA CRÍTICO: Nenhum embaixador cadastrado!")
            print("\n📋 SOLUÇÃO:")
            print("   Execute o seguinte SQL no Supabase:")
            print("   ")
            print("   UPDATE profiles")
            print("   SET ambassador_code = 'RMCC0408'")
            print("   WHERE id = 'SEU_USER_ID';")
            print("\n   Depois teste em: /landing?ref=RMCC0408")
            return False
        
        print(f"✅ {len(ambassadors)} embaixador(es) encontrado(s):\n")
        
        for i, amb in enumerate(ambassadors, 1):
            print(f"   {i}. {amb['full_name']}")
            print(f"      Código: {amb['ambassador_code']}")
            print(f"      Wallet: {amb.get('ambassador_wallet_id', 'Não configurada')}")
            print(f"      ID: {amb['id']}")
            print(f"      Cadastrado: {amb['created_at']}")
            
            # Verificar se é parceiro
            partner_response = supabase.table('partners').select(
                'professional_photo_url, specialty'
            ).eq('user_id', amb['id']).maybeSingle().execute()
            
            if partner_response.data:
                print(f"      Tipo: Parceiro/Profissional")
                print(f"      Foto: {partner_response.data.get('professional_photo_url', 'Não configurada')}")
                print(f"      Especialidade: {partner_response.data.get('specialty', 'N/A')}")
            else:
                print(f"      Tipo: Embaixador (sem perfil profissional)")
            
            print()
        
    except Exception as e:
        print(f"❌ Erro ao buscar embaixadores: {e}")
        return False
    
    # 2. TESTAR BUSCA POR CÓDIGO
    print_section("2. TESTE DE BUSCA POR CÓDIGO")
    
    test_code = ambassadors[0]['ambassador_code']
    print(f"Testando busca com código: {test_code}\n")
    
    try:
        # Simular query da landing page
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
                photo_url = partner_response.data.get('professional_photo_url')
                if photo_url:
                    print(f"   Foto: {photo_url}")
                else:
                    print(f"   ⚠️ Foto não configurada (usará ícone padrão)")
            else:
                print(f"⚠️ Usuário não é parceiro (card aparecerá sem foto)")
        else:
            print(f"❌ Perfil não encontrado")
            
    except Exception as e:
        print(f"❌ Erro na busca: {e}")
    
    # 3. VERIFICAR WALLET ASAAS
    print_section("3. CONFIGURAÇÃO DE WALLET ASAAS")
    
    for amb in ambassadors:
        print(f"\n{amb['full_name']} ({amb['ambassador_code']}):")
        
        wallet_id = amb.get('ambassador_wallet_id')
        
        if wallet_id:
            print(f"   ✅ Wallet configurada: {wallet_id}")
            
            # Verificar formato
            if len(wallet_id) == 36 and wallet_id.count('-') == 4:
                print(f"   ✅ Formato UUID válido")
            else:
                print(f"   ⚠️ Formato pode estar incorreto (esperado UUID)")
        else:
            print(f"   ❌ Wallet NÃO configurada")
            print(f"   📋 Para configurar:")
            print(f"      1. Login no sistema")
            print(f"      2. Perfil > Dashboard do Embaixador")
            print(f"      3. Configurar Wallet Asaas")
    
    # 4. VERIFICAR LINKS GERADOS
    print_section("4. LINKS DE EMBAIXADOR")
    
    try:
        links_response = supabase.table('ambassador_links').select(
            'id, ambassador_user_id, generated_url, short_url, created_at'
        ).execute()
        
        links = links_response.data
        
        if not links:
            print("⚠️ Nenhum link gerado ainda")
            print("   Links são gerados automaticamente ao acessar o Dashboard do Embaixador")
        else:
            print(f"✅ {len(links)} link(s) gerado(s):\n")
            
            for link in links:
                # Buscar nome do embaixador
                amb_name = next(
                    (a['full_name'] for a in ambassadors if a['id'] == link['ambassador_user_id']),
                    'Desconhecido'
                )
                
                print(f"   Embaixador: {amb_name}")
                print(f"   URL: {link['generated_url']}")
                if link.get('short_url'):
                    print(f"   URL Curta: {link['short_url']}")
                print(f"   Criado: {link['created_at']}")
                print()
                
    except Exception as e:
        print(f"⚠️ Erro ao buscar links: {e}")
    
    # 5. VERIFICAR CLIQUES
    print_section("5. TRACKING DE CLIQUES")
    
    try:
        clicks_response = supabase.table('link_clicks').select(
            'id, link_id, clicked_at, ip_address'
        ).execute()
        
        clicks = clicks_response.data
        
        if not clicks:
            print("⚠️ Nenhum clique registrado ainda")
            print("   Cliques serão registrados quando alguém acessar via link do embaixador")
        else:
            print(f"✅ {len(clicks)} clique(s) registrado(s)")
            
            # Agrupar por embaixador
            clicks_by_ambassador = {}
            for click in clicks:
                link_id = click['link_id']
                # Buscar link
                link = next((l for l in links if l['id'] == link_id), None)
                if link:
                    amb_id = link['ambassador_user_id']
                    if amb_id not in clicks_by_ambassador:
                        clicks_by_ambassador[amb_id] = 0
                    clicks_by_ambassador[amb_id] += 1
            
            print("\n   Cliques por embaixador:")
            for amb_id, count in clicks_by_ambassador.items():
                amb_name = next(
                    (a['full_name'] for a in ambassadors if a['id'] == amb_id),
                    'Desconhecido'
                )
                print(f"   - {amb_name}: {count} clique(s)")
                
    except Exception as e:
        print(f"⚠️ Erro ao buscar cliques: {e}")
    
    # 6. VERIFICAR CONVERSÕES
    print_section("6. CONVERSÕES E COMISSÕES")
    
    try:
        donations_response = supabase.table('donations').select(
            'id, amount, ambassador_code, created_at'
        ).not_.is_('ambassador_code', 'null').execute()
        
        donations = donations_response.data
        
        if not donations:
            print("⚠️ Nenhuma doação via embaixador ainda")
            print("   Doações com código de embaixador serão rastreadas aqui")
        else:
            print(f"✅ {len(donations)} doação(ões) via embaixador:\n")
            
            # Agrupar por embaixador
            donations_by_ambassador = {}
            total_by_ambassador = {}
            
            for donation in donations:
                code = donation['ambassador_code']
                if code not in donations_by_ambassador:
                    donations_by_ambassador[code] = 0
                    total_by_ambassador[code] = 0
                donations_by_ambassador[code] += 1
                total_by_ambassador[code] += donation['amount']
            
            for code, count in donations_by_ambassador.items():
                amb_name = next(
                    (a['full_name'] for a in ambassadors if a['ambassador_code'] == code),
                    'Desconhecido'
                )
                total = total_by_ambassador[code]
                commission = total * 0.30  # 30% de comissão
                
                print(f"   {amb_name} ({code}):")
                print(f"   - Doações: {count}")
                print(f"   - Total arrecadado: R$ {total:.2f}")
                print(f"   - Comissão (30%): R$ {commission:.2f}")
                print()
                
    except Exception as e:
        print(f"⚠️ Erro ao buscar doações: {e}")
    
    # 7. URLS DE TESTE
    print_section("7. URLS PARA TESTE")
    
    print("\n✅ URLs para testar cada embaixador:\n")
    
    for amb in ambassadors:
        code = amb['ambassador_code']
        print(f"   {amb['full_name']}:")
        print(f"   - https://seu-dominio.com/landing?ref={code}")
        print(f"   - https://seu-dominio.com/landing/{code}")
        print()
    
    # 8. CHECKLIST FINAL
    print_section("8. CHECKLIST DE CONFIGURAÇÃO")
    
    print("\n✅ = Configurado | ❌ = Falta configurar | ⚠️ = Opcional\n")
    
    for amb in ambassadors:
        print(f"{amb['full_name']} ({amb['ambassador_code']}):")
        
        # Verificações
        has_code = bool(amb.get('ambassador_code'))
        has_wallet = bool(amb.get('ambassador_wallet_id'))
        
        # Verificar se é parceiro
        partner = supabase.table('partners').select('professional_photo_url').eq(
            'user_id', amb['id']
        ).maybeSingle().execute()
        
        has_photo = bool(partner.data and partner.data.get('professional_photo_url'))
        
        print(f"   {'✅' if has_code else '❌'} Código de embaixador")
        print(f"   {'✅' if has_wallet else '❌'} Wallet Asaas configurada")
        print(f"   {'✅' if has_photo else '⚠️'} Foto profissional (opcional)")
        print()
    
    # 9. DIAGNÓSTICO FINAL
    print_section("9. DIAGNÓSTICO FINAL")
    
    print("\n📊 RESUMO:")
    print(f"   - Embaixadores cadastrados: {len(ambassadors)}")
    print(f"   - Com wallet configurada: {sum(1 for a in ambassadors if a.get('ambassador_wallet_id'))}")
    print(f"   - Links gerados: {len(links) if 'links' in locals() else 0}")
    print(f"   - Cliques registrados: {len(clicks) if 'clicks' in locals() else 0}")
    print(f"   - Doações via embaixador: {len(donations) if 'donations' in locals() else 0}")
    
    print("\n✅ STATUS GERAL:")
    
    if len(ambassadors) > 0:
        print("   ✅ Sistema de embaixadores FUNCIONAL")
        print("   ✅ Card do embaixador deve aparecer na landing page")
        
        if any(a.get('ambassador_wallet_id') for a in ambassadors):
            print("   ✅ Sistema de comissões ATIVO")
        else:
            print("   ⚠️ Configure Wallet Asaas para ativar comissões")
    else:
        print("   ❌ Sistema de embaixadores NÃO FUNCIONAL")
        print("   ❌ Cadastre pelo menos 1 embaixador")
    
    print("\n" + "=" * 80)
    print(" FIM DO DIAGNÓSTICO")
    print("=" * 80)
    
    return True

if __name__ == "__main__":
    try:
        diagnostico_completo()
    except Exception as e:
        print(f"\n❌ ERRO CRÍTICO: {e}")
        print("\nVerifique:")
        print("1. Conexão com internet")
        print("2. Credenciais do Supabase")
        print("3. Permissões de acesso")
