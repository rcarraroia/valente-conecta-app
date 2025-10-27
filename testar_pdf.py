#!/usr/bin/env python3
"""
Testar geração de PDF com hash de segurança
"""
from supabase import create_client
import webbrowser

SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczNTQxNSwiZXhwIjoyMDY1MzExNDE1fQ.f27cTcOvXM83cmnsqehYHJb0ao_kU3qirMbSUutdxlc"

supabase = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

print("=" * 100)
print("🧪 TESTE DE GERAÇÃO DE PDF")
print("=" * 100)

# Buscar um recibo
response = supabase.table('receipts').select('*').limit(1).execute()

if response.data:
    receipt = response.data[0]
    
    print(f"\n✅ Recibo encontrado:")
    print(f"   Número: {receipt['receipt_number']}")
    print(f"   Doador: {receipt['donor_name']}")
    print(f"   ID: {receipt['id']}")
    print(f"   Hash: {receipt['verification_hash'][:20]}...")
    
    # Gerar URL com hash de segurança
    pdf_url = f"{SUPABASE_URL}/functions/v1/generate-receipt-pdf?receiptId={receipt['id']}&hash={receipt['verification_hash']}"
    
    print(f"\n📄 URL do PDF:")
    print(f"   {pdf_url}")
    
    print(f"\n🌐 Abrindo no navegador...")
    webbrowser.open(pdf_url)
    
    print(f"\n✅ Se o PDF abrir no navegador, está funcionando!")
    print(f"   O usuário pode usar Ctrl+P para salvar como PDF")
    
else:
    print("\n❌ Nenhum recibo encontrado")

print("\n" + "=" * 100)
