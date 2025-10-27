#!/usr/bin/env python3
"""
Verificar doações usando service_role key (bypass RLS)
"""
from supabase import create_client
import os

SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"

# Tentar obter service_role key do .env
try:
    with open('.env', 'r') as f:
        for line in f:
            if line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
                SUPABASE_SERVICE_KEY = line.split('=', 1)[1].strip()
                break
        else:
            print("❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env")
            exit(1)
except FileNotFoundError:
    print("❌ Arquivo .env não encontrado")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("=" * 80)
print("VERIFICAÇÃO COM SERVICE ROLE (BYPASS RLS)")
print("=" * 80)

# Verificar doações
print("\n📊 TODAS AS DOAÇÕES (incluindo com RLS):")
try:
    response = supabase.table('donations').select('*', count='exact').execute()
    
    print(f"   Total de doações: {response.count}")
    
    if response.data:
        print("\n   Últimas 5 doações:")
        for i, d in enumerate(response.data[:5], 1):
            print(f"\n   {i}. ID: {d['id']}")
            print(f"      Status: {d['status']}")
            print(f"      Valor: R$ {d['amount']}")
            print(f"      Email: {d.get('donor_email', 'N/A')}")
            print(f"      Nome: {d.get('donor_name', 'N/A')}")
            print(f"      Transaction ID: {d.get('transaction_id', 'N/A')}")
            print(f"      User ID: {d.get('user_id', 'N/A')}")
    else:
        print("   ⚠️ Nenhuma doação encontrada no banco")
except Exception as e:
    print(f"   ❌ Erro: {e}")

# Verificar recibos
print("\n\n🧾 TODOS OS RECIBOS:")
try:
    response = supabase.table('receipts').select('*', count='exact').execute()
    print(f"   Total de recibos: {response.count}")
    
    if response.data:
        for i, r in enumerate(response.data, 1):
            print(f"\n   {i}. Número: {r.get('receipt_number', 'N/A')}")
            print(f"      Doador: {r.get('donor_name', 'N/A')}")
            print(f"      Email enviado: {r.get('email_sent', False)}")
            print(f"      Tentativas: {r.get('email_attempts', 0)}")
            print(f"      Erro: {r.get('last_email_error', 'N/A')}")
except Exception as e:
    print(f"   ❌ Erro: {e}")

print("\n" + "=" * 80)
