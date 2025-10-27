#!/usr/bin/env python3
from supabase import create_client

SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczNTQxNSwiZXhwIjoyMDY1MzExNDE1fQ.f27cTcOvXM83cmnsqehYHJb0ao_kU3qirMbSUutdxlc"

supabase = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

print("=" * 100)
print("📊 STATUS DOS RECIBOS")
print("=" * 100)

response = supabase.table('receipts').select('*').order('created_at', desc=True).execute()

if response.data:
    print(f"\nTotal de recibos: {len(response.data)}")
    
    for i, r in enumerate(response.data, 1):
        print(f"\n{i}. {r.get('receipt_number', 'N/A')}")
        print(f"   Doador: {r.get('donor_name', 'N/A')}")
        print(f"   Email: {r.get('donor_email', 'N/A')}")
        print(f"   Email enviado: {r.get('email_sent', False)}")
        print(f"   Enviado em: {r.get('email_sent_at', 'N/A')}")
        print(f"   Tentativas: {r.get('email_attempts', 0)}")
        print(f"   Último erro: {r.get('last_email_error', 'N/A')[:100] if r.get('last_email_error') else 'N/A'}")
else:
    print("\nNenhum recibo encontrado")

print("\n" + "=" * 100)
