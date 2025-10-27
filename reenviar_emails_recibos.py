#!/usr/bin/env python3
"""
Reenviar emails dos recibos que falharam
"""
from supabase import create_client
import requests
import time

SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczNTQxNSwiZXhwIjoyMDY1MzExNDE1fQ.f27cTcOvXM83cmnsqehYHJb0ao_kU3qirMbSUutdxlc"

supabase = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

print("=" * 100)
print("📧 REENVIO DE EMAILS DE RECIBOS")
print("=" * 100)
print("\nBuscando recibos com email não enviado...")

# Buscar recibos que não foram enviados
response = supabase.table('receipts').select('*').eq('email_sent', False).order('created_at', desc=True).execute()

if not response.data:
    print("\n✅ Todos os recibos já foram enviados!")
    exit(0)

print(f"\n📊 Encontrados {len(response.data)} recibos com email não enviado")

print("\n" + "=" * 100)
print("RECIBOS QUE RECEBERÃO EMAIL:")
print("=" * 100)

for i, r in enumerate(response.data, 1):
    print(f"\n{i}. {r.get('receipt_number', 'N/A')}")
    print(f"   Doador: {r.get('donor_name', 'N/A')}")
    print(f"   Email: {r.get('donor_email', 'N/A')}")
    print(f"   Valor: R$ {r.get('amount', 'N/A')}")
    print(f"   Tentativas anteriores: {r.get('email_attempts', 0)}")
    print(f"   Último erro: {r.get('last_email_error', 'N/A')[:100]}")

print("\n" + "=" * 100)
print("⚠️ IMPORTANTE: Certifique-se de que o email foi corrigido para coracaovalenteorg@gmail.com")
print("⚠️ E que a edge function foi deployada com a correção!")
print("=" * 100)
input("\nPressione ENTER para continuar e reenviar os emails...")
print("=" * 100)

# Reenviar emails
success_count = 0
error_count = 0

for i, receipt in enumerate(response.data, 1):
    print(f"\n[{i}/{len(response.data)}] Reenviando email para {receipt.get('donor_name', 'N/A')}...")
    
    try:
        # Chamar a função generate-receipt novamente com o mesmo donation_id
        # Ela vai detectar que o recibo já existe e apenas reenviar o email
        response_api = requests.post(
            f"{SUPABASE_URL}/functions/v1/generate-receipt",
            headers={
                'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'donationId': receipt['donation_id'],
                'sendEmail': True
            },
            timeout=30
        )
        
        if response_api.ok:
            data = response_api.json()
            email_sent = data.get('receipt', {}).get('email_sent', False)
            
            if email_sent:
                print(f"   ✅ Email enviado com sucesso!")
                success_count += 1
            else:
                error_msg = data.get('receipt', {}).get('last_email_error', 'Erro desconhecido')
                print(f"   ❌ Falha ao enviar: {error_msg[:100]}")
                error_count += 1
        else:
            print(f"   ❌ Erro HTTP {response_api.status_code}: {response_api.text[:200]}")
            error_count += 1
            
    except Exception as e:
        print(f"   ❌ Erro: {str(e)}")
        error_count += 1
    
    # Aguardar 2 segundos entre cada envio
    if i < len(response.data):
        time.sleep(2)

print("\n" + "=" * 100)
print("📊 RESUMO")
print("=" * 100)
print(f"\n✅ Emails enviados com sucesso: {success_count}")
print(f"❌ Erros: {error_count}")
print(f"📧 Total processado: {success_count + error_count}")

if success_count > 0:
    print("\n🎉 Emails reenviados!")
    print("\nVerifique as caixas de entrada:")
    for r in response.data[:success_count]:
        print(f"   - {r.get('donor_email', 'N/A')}")

if error_count > 0:
    print("\n⚠️ Alguns emails falharam. Verifique:")
    print("   1. Se a edge function foi deployada com o email corrigido")
    print("   2. Se o email coracaovalenteorg@gmail.com está verificado no Resend")
    print("   3. Os logs da edge function para mais detalhes")

print("\n" + "=" * 100)
