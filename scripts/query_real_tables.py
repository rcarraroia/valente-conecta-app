#!/usr/bin/env python3
"""
Query direta para listar todas as tabelas reais do banco
Usa postgrest para executar query SQL
"""

import requests
from datetime import datetime

# Credenciais do Instituto Coração Valente
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczNTQxNSwiZXhwIjoyMDY1MzExNDE1fQ.f27cTcOvXM83cmnsqehYHJb0ao_kU3qirMbSUutdxlc"

def list_all_tables():
    """Lista todas as tabelas usando RPC"""
    print("=" * 80)
    print("LISTAGEM REAL DE TABELAS - INSTITUTO CORAÇÃO VALENTE")
    print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()
    
    # Tentar via API REST do Supabase
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Listar todas as tabelas via endpoint
    print("🔍 Buscando tabelas via Supabase REST API...")
    print()
    
    # Lista de tabelas conhecidas para testar
    known_tables = [
        'profiles', 'donations', 'ambassador_performance', 'ambassador_links',
        'link_clicks', 'volunteer_applications', 'library_resources', 
        'library_categories', 'services', 'appointments', 'diagnosis_sessions',
        'subscriptions', 'payment_history', 'transactions', 'wallets',
        'referrals', 'commissions', 'notifications', 'messages', 'conversations',
        'posts', 'comments', 'likes', 'follows', 'tags', 'categories',
        'settings', 'logs', 'audit_trail', 'sessions', 'tokens', 'permissions',
        'roles', 'user_roles'
    ]
    
    print("📊 TESTANDO TABELAS CONHECIDAS")
    print("-" * 80)
    
    found_tables = []
    
    for table in sorted(known_tables):
        try:
            url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=0"
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                # Tabela existe
                # Agora contar registros
                count_url = f"{SUPABASE_URL}/rest/v1/{table}?select=count"
                count_response = requests.head(count_url, headers=headers)
                
                count_header = count_response.headers.get('Content-Range', '0-0/0')
                count = int(count_header.split('/')[-1]) if '/' in count_header else 0
                
                status = "✅" if count > 0 else "⚪"
                print(f"{status} {table:40} | {count:8} registros")
                found_tables.append((table, count))
                
            elif response.status_code == 404 or 'does not exist' in response.text:
                pass  # Tabela não existe, não mostrar
            else:
                print(f"⚠️  {table:40} | Status: {response.status_code}")
                
        except Exception as e:
            pass  # Ignorar erros
    
    print("-" * 80)
    print(f"\n📈 RESUMO:")
    print(f"   Tabelas encontradas: {len(found_tables)}")
    print(f"   Tabelas com dados: {sum(1 for _, count in found_tables if count > 0)}")
    print(f"   Total de registros: {sum(count for _, count in found_tables):,}")
    print()
    
    if found_tables:
        print("📋 TABELAS COM DADOS:")
        print("-" * 80)
        for table, count in sorted(found_tables, key=lambda x: x[1], reverse=True):
            if count > 0:
                print(f"   {table:40} | {count:8} registros")
    
    print()
    print("=" * 80)
    print("✅ ANÁLISE CONCLUÍDA")
    print("=" * 80)

if __name__ == "__main__":
    list_all_tables()
