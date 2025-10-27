#!/usr/bin/env python3
"""
Verificar doações recentes e status de recibos
"""
from supabase import create_client

SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 80)
print("VERIFICAÇÃO DE DOAÇÕES E RECIBOS")
print("=" * 80)

# Verificar doações recentes
print("\n📊 DOAÇÕES RECENTES:")
try:
    response = supabase.table('donations').select('*').order('donated_at', desc=True).limit(5).execute()
    
    if response.data:
        for i, d in enumerate(response.data, 1):
            print(f"\n{i}. Doação ID: {d['id']}")
            print(f"   Status: {d['status']}")
            print(f"   Valor: R$ {d['amount']}")
            print(f"   Email: {d.get('donor_email', 'N/A')}")
            print(f"   Nome: {d.get('donor_name', 'N/A')}")
            print(f"   Transaction ID: {d.get('transaction_id', 'N/A')}")
            print(f"   Doado em: {d.get('donated_at', 'N/A')}")
    else:
        print("   Nenhuma doação encontrada")
except Exception as e:
    print(f"   ❌ Erro: {e}")

# Verificar se tabela receipts existe
print("\n\n🧾 TABELA DE RECIBOS:")
try:
    response = supabase.table('receipts').select('*', count='exact').limit(1).execute()
    print(f"   ✅ Tabela existe com {response.count} recibos")
    
    if response.data:
        print("\n   Recibo mais recente:")
        r = response.data[0]
        print(f"   - Número: {r.get('receipt_number', 'N/A')}")
        print(f"   - Doador: {r.get('donor_name', 'N/A')}")
        print(f"   - Email enviado: {r.get('email_sent', False)}")
except Exception as e:
    print(f"   ❌ Tabela não existe ou erro: {e}")

print("\n" + "=" * 80)
