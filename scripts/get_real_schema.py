#!/usr/bin/env python3
"""
Acessa o schema real do banco via Supabase Management API
"""

import requests
import json
from datetime import datetime

# Credenciais
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczNTQxNSwiZXhwIjoyMDY1MzExNDE1fQ.f27cTcOvXM83cmnsqehYHJb0ao_kU3qirMbSUutdxlc"
PROJECT_ID = "corrklfwxfuqusfzwbls"

print("=" * 80)
print("ACESSANDO SCHEMA REAL VIA MANAGEMENT API")
print("=" * 80)
print()

# Tentar via PostgREST introspection
headers = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
}

# Endpoint de introspection do PostgREST
introspection_url = f"{SUPABASE_URL}/rest/v1/"

print("🔍 Tentando acessar endpoint de introspection...")
response = requests.get(introspection_url, headers=headers)

print(f"Status: {response.status_code}")
print(f"Headers: {dict(response.headers)}")
print()

if response.status_code == 200:
    print("✅ Resposta recebida!")
    print(response.text[:500])
else:
    print(f"❌ Erro: {response.text}")

print()
print("=" * 80)
print("SOLUÇÃO: Execute esta query no SQL Editor do Dashboard:")
print("=" * 80)
print("""
SELECT 
    t.table_name,
    COUNT(c.column_name) as column_count,
    obj_description(('"' || t.table_schema || '"."' || t.table_name || '"')::regclass) as table_comment
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
GROUP BY t.table_schema, t.table_name
ORDER BY t.table_name;
""")
print()
print("Depois cole o resultado aqui para eu atualizar os scripts!")
print("=" * 80)
