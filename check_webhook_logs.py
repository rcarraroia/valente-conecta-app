#!/usr/bin/env python3
"""
Verificar logs de webhook e doações recentes
"""
from supabase import create_client
from datetime import datetime, timedelta

SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 80)
print("VERIFICAÇÃO DE WEBHOOKS E DOAÇÕES - HOJE")
print("=" * 80)

# Data de hoje
today = datetime.now().date()
print(f"\nData de hoje: {today}")

# Verificar logs de webhook
print("\n📨 LOGS DE WEBHOOK (últimos 10):")
try:
    response = supabase.table('asaas_webhook_logs').select('*').order('created_at', desc=True).limit(10).execute()
    
    if response.data:
        for i, log in enumerate(response.data, 1):
            created = log.get('created_at', 'N/A')
            event = log.get('event_type', 'N/A')
            payment_id = log.get('payment_id', 'N/A')
            status = log.get('status', 'N/A')
            
            print(f"\n{i}. Webhook:")
            print(f"   Evento: {event}")
            print(f"   Payment ID: {payment_id}")
            print(f"   Status: {status}")
            print(f"   Criado: {created}")
    else:
        print("   Nenhum log de webhook encontrado")
except Exception as e:
    print(f"   ❌ Erro ou tabela não existe: {e}")

# Verificar doações
print("\n\n💰 DOAÇÕES (últimas 10):")
try:
    response = supabase.table('donations').select('*').order('donated_at', desc=True).limit(10).execute()
    
    if response.data:
        for i, d in enumerate(response.data, 1):
            print(f"\n{i}. Doação:")
            print(f"   ID: {d['id']}")
            print(f"   Nome: {d.get('donor_name', 'N/A')}")
            print(f"   Email: {d.get('donor_email', 'N/A')}")
            print(f"   Valor: R$ {d['amount']}")
            print(f"   Status: {d['status']}")
            print(f"   Transaction ID: {d.get('transaction_id', 'N/A')}")
            print(f"   Doado em: {d.get('donated_at', 'N/A')}")
    else:
        print("   Nenhuma doação encontrada")
except Exception as e:
    print(f"   ❌ Erro: {e}")

# Verificar recibos
print("\n\n🧾 RECIBOS (últimos 10):")
try:
    response = supabase.table('receipts').select('*').order('created_at', desc=True).limit(10).execute()
    
    if response.data:
        for i, r in enumerate(response.data, 1):
            print(f"\n{i}. Recibo:")
            print(f"   Número: {r.get('receipt_number', 'N/A')}")
            print(f"   Doador: {r.get('donor_name', 'N/A')}")
            print(f"   Email: {r.get('donor_email', 'N/A')}")
            print(f"   Valor: R$ {r.get('amount', 'N/A')}")
            print(f"   Email enviado: {r.get('email_sent', False)}")
            print(f"   Tentativas: {r.get('email_attempts', 0)}")
            print(f"   Erro: {r.get('last_email_error', 'N/A')}")
            print(f"   Criado: {r.get('created_at', 'N/A')}")
    else:
        print("   Nenhum recibo encontrado")
except Exception as e:
    print(f"   ❌ Erro: {e}")

print("\n" + "=" * 80)
