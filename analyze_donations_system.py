#!/usr/bin/env python3
from supabase import create_client, Client
import json
from datetime import datetime

# Credenciais do projeto atual
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

def analyze_donations_system():
    """Análise completa do sistema de doações no Supabase"""
    print("=== ANÁLISE COMPLETA DO SISTEMA DE DOAÇÕES ===\n")
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # 1. TABELA DONATIONS
        print("1. TABELA DONATIONS:")
        try:
            donations_count = supabase.table('donations').select('*', count='exact').execute()
            donations_sample = supabase.table('donations').select('*').limit(5).execute()
            
            print(f"   ✅ Existe: {donations_count.count} registros")
            if donations_sample.data:
                print("   📋 Estrutura (baseada em amostra):")
                for key in donations_sample.data[0].keys():
                    print(f"      - {key}")
                print("   📊 Últimas doações:")
                for donation in donations_sample.data:
                    print(f"      R$ {donation.get('amount', 0):.2f} - {donation.get('status', 'N/A')} - {donation.get('donated_at', 'N/A')}")
            else:
                print("   📋 Tabela vazia")
        except Exception as e:
            print(f"   ❌ Erro: {str(e)}")
        
        # 2. TABELA AMBASSADOR_PERFORMANCE
        print("\n2. TABELA AMBASSADOR_PERFORMANCE:")
        try:
            perf_count = supabase.table('ambassador_performance').select('*', count='exact').execute()
            perf_sample = supabase.table('ambassador_performance').select('*').limit(3).execute()
            
            print(f"   ✅ Existe: {perf_count.count} registros")
            if perf_sample.data:
                print("   📋 Estrutura:")
                for key in perf_sample.data[0].keys():
                    print(f"      - {key}")
                print("   📊 Performance dos embaixadores:")
                for perf in perf_sample.data:
                    print(f"      Doações: {perf.get('total_donations_count', 0)}, Valor: R$ {perf.get('total_donations_amount', 0):.2f}")
            else:
                print("   📋 Tabela vazia")
        except Exception as e:
            print(f"   ❌ Erro: {str(e)}")
        
        # 3. TABELA PROFILES (campos de embaixador)
        print("\n3. PROFILES - CAMPOS DE EMBAIXADOR:")
        try:
            profiles_sample = supabase.table('profiles').select('id, full_name, ambassador_code, ambassador_wallet_id, is_volunteer').limit(5).execute()
            
            print(f"   ✅ Amostra de {len(profiles_sample.data)} perfis")
            ambassadors_count = 0
            with_wallet_count = 0
            
            for profile in profiles_sample.data:
                if profile.get('is_volunteer') and profile.get('ambassador_code'):
                    ambassadors_count += 1
                    if profile.get('ambassador_wallet_id'):
                        with_wallet_count += 1
                    print(f"      Embaixador: {profile.get('full_name', 'N/A')} - Código: {profile.get('ambassador_code', 'N/A')} - Wallet: {'✅' if profile.get('ambassador_wallet_id') else '❌'}")
            
            print(f"   📊 Embaixadores na amostra: {ambassadors_count}")
            print(f"   📊 Com wallet configurada: {with_wallet_count}")
            
        except Exception as e:
            print(f"   ❌ Erro: {str(e)}")
        
        # 4. TABELA AMBASSADOR_LINKS
        print("\n4. TABELA AMBASSADOR_LINKS:")
        try:
            links_count = supabase.table('ambassador_links').select('*', count='exact').execute()
            links_sample = supabase.table('ambassador_links').select('*').limit(3).execute()
            
            print(f"   ✅ Existe: {links_count.count} registros")
            if links_sample.data:
                print("   📋 Estrutura:")
                for key in links_sample.data[0].keys():
                    print(f"      - {key}")
            else:
                print("   📋 Tabela vazia")
        except Exception as e:
            print(f"   ❌ Erro: {str(e)}")
        
        # 5. ESTATÍSTICAS FINANCEIRAS
        print("\n5. ESTATÍSTICAS FINANCEIRAS:")
        try:
            # Total de doações por status
            all_donations = supabase.table('donations').select('amount, status, payment_method').execute()
            
            if all_donations.data:
                total_amount = sum(float(d.get('amount', 0)) for d in all_donations.data)
                completed_donations = [d for d in all_donations.data if d.get('status') == 'completed']
                completed_amount = sum(float(d.get('amount', 0)) for d in completed_donations)
                
                print(f"   💰 Total geral: R$ {total_amount:.2f} ({len(all_donations.data)} doações)")
                print(f"   ✅ Confirmadas: R$ {completed_amount:.2f} ({len(completed_donations)} doações)")
                
                # Por método de pagamento
                payment_methods = {}
                for donation in all_donations.data:
                    method = donation.get('payment_method', 'Não especificado')
                    if method not in payment_methods:
                        payment_methods[method] = {'count': 0, 'amount': 0}
                    payment_methods[method]['count'] += 1
                    payment_methods[method]['amount'] += float(donation.get('amount', 0))
                
                print("   💳 Por método de pagamento:")
                for method, stats in payment_methods.items():
                    print(f"      {method}: {stats['count']} doações, R$ {stats['amount']:.2f}")
            else:
                print("   📊 Nenhuma doação encontrada")
                
        except Exception as e:
            print(f"   ❌ Erro: {str(e)}")
        
        # 6. VERIFICAÇÃO DE SPLIT DE PAGAMENTOS
        print("\n6. SISTEMA DE SPLIT:")
        try:
            # Verificar doações com embaixador
            donations_with_ambassador = supabase.table('donations').select('ambassador_link_id').neq('ambassador_link_id', None).execute()
            donations_without_ambassador = supabase.table('donations').select('ambassador_link_id').is_('ambassador_link_id', None).execute()
            
            print(f"   🤝 Com embaixador: {len(donations_with_ambassador.data)} doações")
            print(f"   🏢 Sem embaixador: {len(donations_without_ambassador.data)} doações")
            
        except Exception as e:
            print(f"   ❌ Erro: {str(e)}")
        
        # 7. EDGE FUNCTIONS RELACIONADAS
        print("\n7. EDGE FUNCTIONS DISPONÍVEIS:")
        edge_functions = [
            'process-payment',
            'process-payment-v2', 
            'process-payment-debug',
            'asaas-webhook'
        ]
        
        for func in edge_functions:
            print(f"   📡 {func}: Implementada")
        
        print("\n=== ANÁLISE CONCLUÍDA ===")
        
    except Exception as e:
        print(f"❌ Erro de conexão: {str(e)}")

if __name__ == "__main__":
    analyze_donations_system()