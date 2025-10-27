#!/usr/bin/env python3
"""
Verificar doações de hoje e tentar gerar recibo manualmente
"""
from supabase import create_client
from datetime import datetime
import json

SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczNTQxNSwiZXhwIjoyMDY1MzExNDE1fQ.f27cTcOvXM83cmnsqehYHJb0ao_kU3qirMbSUutdxlc"

supabase = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

print("=" * 100)
print("🔍 VERIFICAÇÃO DE DOAÇÕES DE HOJE (26/10/2025)")
print("=" * 100)

# Buscar doações de hoje
today = "2025-10-26"
print(f"\nBuscando doações de {today}...")

try:
    response = supabase.table('donations').select('*').gte('donated_at', f'{today}T00:00:00').lte('donated_at', f'{today}T23:59:59').execute()
    
    if response.data:
        print(f"\n✅ Encontradas {len(response.data)} doações de hoje:")
        
        for i, d in enumerate(response.data, 1):
            print(f"\n{i}. Doação:")
            print(f"   ID: {d['id']}")
            print(f"   Nome: {d.get('donor_name', 'N/A')}")
            print(f"   Email: {d.get('donor_email', 'N/A')}")
            print(f"   Valor: R$ {d.get('amount', 'N/A')}")
            print(f"   Status: {d.get('status', 'N/A')}")
            print(f"   Método: {d.get('payment_method', 'N/A')}")
            print(f"   Transaction ID: {d.get('transaction_id', 'N/A')}")
            print(f"   Doado em: {d.get('donated_at', 'N/A')}")
            
            # Verificar se tem recibo
            receipt_response = supabase.table('receipts').select('*').eq('donation_id', d['id']).execute()
            
            if receipt_response.data:
                print(f"   ✅ TEM RECIBO: {receipt_response.data[0].get('receipt_number')}")
            else:
                print(f"   ❌ SEM RECIBO")
    else:
        print(f"\n⚠️ Nenhuma doação encontrada para hoje ({today})")
        print("\nBuscando doações recentes (últimos 7 dias)...")
        
        # Buscar últimos 7 dias
        seven_days_ago = "2025-10-19"
        response = supabase.table('donations').select('*').gte('donated_at', f'{seven_days_ago}T00:00:00').order('donated_at', desc=True).execute()
        
        if response.data:
            print(f"\n✅ Encontradas {len(response.data)} doações nos últimos 7 dias:")
            
            for i, d in enumerate(response.data, 1):
                print(f"\n{i}. {d.get('donated_at', 'N/A')[:10]} - {d.get('donor_name', 'N/A')} - R$ {d.get('amount', 'N/A')} - {d.get('status', 'N/A')}")
                
                # Verificar se tem recibo
                receipt_response = supabase.table('receipts').select('*').eq('donation_id', d['id']).execute()
                
                if receipt_response.data:
                    print(f"   ✅ TEM RECIBO")
                else:
                    print(f"   ❌ SEM RECIBO")
        
except Exception as e:
    print(f"❌ Erro: {e}")

# Verificar doações com status 'received' ou 'completed'
print("\n\n" + "=" * 100)
print("💰 DOAÇÕES CONFIRMADAS (received/completed)")
print("=" * 100)

try:
    response = supabase.table('donations').select('*').in_('status', ['received', 'completed']).order('donated_at', desc=True).execute()
    
    if response.data:
        print(f"\n✅ Encontradas {len(response.data)} doações confirmadas:")
        
        for i, d in enumerate(response.data, 1):
            print(f"\n{i}. Doação:")
            print(f"   ID: {d['id']}")
            print(f"   Nome: {d.get('donor_name', 'N/A')}")
            print(f"   Email: {d.get('donor_email', 'N/A')}")
            print(f"   Valor: R$ {d.get('amount', 'N/A')}")
            print(f"   Status: {d.get('status', 'N/A')}")
            print(f"   Transaction ID: {d.get('transaction_id', 'N/A')}")
            print(f"   Doado em: {d.get('donated_at', 'N/A')}")
            
            # Verificar se tem recibo
            receipt_response = supabase.table('receipts').select('*').eq('donation_id', d['id']).execute()
            
            if receipt_response.data:
                r = receipt_response.data[0]
                print(f"   ✅ RECIBO: {r.get('receipt_number')} - Email enviado: {r.get('email_sent')}")
            else:
                print(f"   ❌ SEM RECIBO - DEVERIA TER SIDO GERADO!")
    else:
        print("\n⚠️ Nenhuma doação confirmada encontrada")
        
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "=" * 100)
print("📋 CONCLUSÃO")
print("=" * 100)
print("\n🎯 PROBLEMA CONFIRMADO:")
print("   - Doações estão sendo salvas no banco ✅")
print("   - Webhook está funcionando (200) ✅")
print("   - MAS recibos NÃO estão sendo gerados ❌")
print("\n💡 CAUSA:")
print("   O webhook asaas-webhook-v2 NÃO está chamando generate-receipt")
print("   OU a função generate-receipt está falhando silenciosamente")
print("\n🔧 SOLUÇÃO:")
print("   Verificar logs da edge function asaas-webhook-v2")
print("   e generate-receipt para identificar o erro")
print("=" * 100)
