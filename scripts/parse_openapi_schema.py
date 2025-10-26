#!/usr/bin/env python3
"""
Extrai lista de tabelas do OpenAPI schema do Supabase
"""

import requests
import json
from datetime import datetime

SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczNTQxNSwiZXhwIjoyMDY1MzExNDE1fQ.f27cTcOvXM83cmnsqehYHJb0ao_kU3qirMbSUutdxlc"

print("=" * 80)
print("EXTRAINDO TABELAS DO OPENAPI SCHEMA")
print("=" * 80)
print()

headers = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
}

print("🔍 Baixando OpenAPI schema...")
response = requests.get(f"{SUPABASE_URL}/rest/v1/", headers=headers)

if response.status_code == 200:
    schema = response.json()
    
    print("✅ Schema recebido!")
    print()
    
    # Extrair definições (tabelas)
    definitions = schema.get('definitions', {})
    
    print(f"📊 TABELAS ENCONTRADAS NO SCHEMA")
    print("-" * 80)
    
    tables = []
    for table_name, table_def in sorted(definitions.items()):
        # Filtrar apenas tabelas (não views ou tipos)
        if table_def.get('type') == 'object':
            properties = table_def.get('properties', {})
            column_count = len(properties)
            
            print(f"✅ {table_name:40} | {column_count:3} colunas")
            tables.append(table_name)
    
    print("-" * 80)
    print(f"\n📈 TOTAL DE TABELAS: {len(tables)}")
    print()
    
    # Salvar lista em arquivo
    with open('LISTA_TABELAS_REAIS.txt', 'w', encoding='utf-8') as f:
        f.write("# LISTA COMPLETA DE TABELAS - Instituto Coração Valente\n")
        f.write(f"# Extraído em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"# Total: {len(tables)} tabelas\n\n")
        for i, table in enumerate(tables, 1):
            f.write(f"{i}. {table}\n")
    
    print("💾 Lista salva em: LISTA_TABELAS_REAIS.txt")
    print()
    
    # Gerar código Python para o script
    print("📝 CÓDIGO PARA ATUALIZAR test_supabase_connection.py:")
    print("-" * 80)
    print("tables = [")
    for table in tables:
        print(f"    '{table}',")
    print("]")
    print()
    
else:
    print(f"❌ Erro: {response.status_code}")
    print(response.text)

print("=" * 80)
