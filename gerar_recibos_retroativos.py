#!/usr/bin/env python3
"""
Gerar recibos retroativos para doações confirmadas sem recibo
"""
from supabase import create_client
import requests
import time

SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczNTQxNSwiZXhwIjoyMDY1MzExNDE1fQ.f27cTcOvXM83cmnsqehYHJb0ao_kU3qirMbSUutdxlc"

supabase = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

print("=" * 100)
print("🧾 GERAÇÃO DE RECIBOS RETROATIVOS")
print("=" * 100)
print("\nBuscando doações confirmadas sem recibo...")

# Buscar doações confirmadas
response = supabase.table('donations').select('*').in_('status', ['completed', 'received']).order('donated_at', desc=True).execute()

if not response.data:
    print("\n⚠️ Nenhuma doação confirmada encontrada")
    exit(0)

print(f"\n✅ Encontradas {len(response.data)} doações confirmadas")

# Filtrar apenas as que não têm recibo
donations_without_receipt = []

for donation in response.data:
    receipt_response = supabase.table('receipts').select('id').eq('donation_id', donation['id']).execute()
    
    if not receipt_response.data:
        donations_without_receipt.append(donation)

print(f"📊 {len(donations_without_receipt)} doações SEM recibo")

if len(donations_without_receipt) == 0:
    print("\n✅ Todas as doações confirmadas já têm recibo!")
    exit(0)

print("\n" + "=" * 100)
print("DOAÇÕES QUE RECEBERÃO RECIBO:")
print("=" * 100)

for i, d in enumerate(donations_without_receipt, 1):
    print(f"\n{i}. {d.get('donor_name', 'N/A')}")
    print(f"   Email: {d.get('donor_email', 'N/A')}")
    print(f"   Valor: R$ {d.get('amount', 'N/A')}")
    print(f"   Data: {d.get('donated_at', 'N/A')[:10]}")
    print(f"   ID: {d['id']}")

print("\n" + "=" * 100)
input("Pressione ENTER para continuar e gerar os recibos...")
print("=" * 100)

# Gerar recibos
success_count = 0
error_count = 0

for i, donation in enumerate(donations_without_receipt, 1):
    print(f"\n[{i}/{len(donations_without_receipt)}] Gerando recibo para {donation.get('donor_name', 'N/A')}...")
    
    try:
        response = requests.post(
            f"{SUPABASE_URL}/functions/v1/generate-receipt",
            headers={
                'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'donationId': donation['id'],
                'sendEmail': True
            },
            timeout=30
        )
        
        if response.ok:
            data = response.json()
            receipt_number = data.get('receipt', {}).get('receipt_number', 'N/A')
            email_sent = data.get('receipt', {}).get('email_sent', False)
            
            print(f"   ✅ Recibo gerado: {receipt_number}")
            print(f"   📧 Email enviado: {'Sim' if email_sent else 'Não'}")
            
            success_count += 1
        else:
            print(f"   ❌ Erro HTTP {response.status_code}: {response.text[:200]}")
            error_count += 1
            
    except Exception as e:
        print(f"   ❌ Erro: {str(e)}")
        error_count += 1
    
    # Aguardar 2 segundos entre cada geração para não sobrecarregar
    if i < len(donations_without_receipt):
        time.sleep(2)

print("\n" + "=" * 100)
print("📊 RESUMO")
print("=" * 100)
print(f"\n✅ Recibos gerados com sucesso: {success_count}")
print(f"❌ Erros: {error_count}")
print(f"📧 Total processado: {success_count + error_count}")

if success_count > 0:
    print("\n🎉 Recibos gerados e emails enviados!")
    print("\nVerifique os emails dos doadores:")
    for d in donations_without_receipt[:success_count]:
        print(f"   - {d.get('donor_email', 'N/A')}")

print("\n" + "=" * 100)
