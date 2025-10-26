#!/usr/bin/env python3
from supabase import create_client, Client

SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

print("Testando código correto: RMCC040B")
print("=" * 60)

try:
    response = supabase.table('profiles').select(
        'id, full_name'
    ).eq('ambassador_code', 'RMCC040B').single().execute()
    
    if response.data:
        print(f"✅ SUCESSO! Embaixador encontrado:")
        print(f"   Nome: {response.data['full_name']}")
        print(f"   ID: {response.data['id']}")
        
        # Buscar dados do parceiro
        partner = supabase.table('partners').select(
            'professional_photo_url'
        ).eq('user_id', response.data['id']).maybeSingle().execute()
        
        if partner.data:
            print(f"   Foto: {partner.data.get('professional_photo_url', 'NULL')}")
        else:
            print(f"   Foto: Não é parceiro (usará ícone padrão)")
            
        print("\n✅ Card do embaixador deve aparecer em:")
        print(f"   http://localhost:8080/landing?ref=RMCC040B")
        
except Exception as e:
    print(f"❌ Erro: {e}")
