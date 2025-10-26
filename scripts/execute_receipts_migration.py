#!/usr/bin/env python3
"""
Executa a migration da tabela receipts via API
"""

from supabase import create_client
from datetime import datetime

SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTczNTQxNSwiZXhwIjoyMDY1MzExNDE1fQ.f27cTcOvXM83cmnsqehYHJb0ao_kU3qirMbSUutdxlc"

print("=" * 80)
print("EXECUTANDO MIGRATION - TABELA RECEIPTS")
print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 80)
print()

# Ler o arquivo SQL
print("📄 Lendo arquivo de migration...")
with open('sql/create_receipts_table_EXECUTAR_MANUALMENTE.sql', 'r', encoding='utf-8') as f:
    sql_content = f.read()

print("✅ Arquivo lido com sucesso")
print(f"📊 Tamanho: {len(sql_content)} caracteres")
print()

# Conectar ao Supabase
print("🔌 Conectando ao Supabase...")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
print("✅ Conectado!")
print()

# Executar via RPC (se disponível) ou instruir execução manual
print("⚠️  ATENÇÃO: A migration deve ser executada manualmente no SQL Editor")
print()
print("📋 INSTRUÇÕES:")
print("1. Acesse: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/sql/new")
print("2. Copie o conteúdo do arquivo: sql/create_receipts_table_EXECUTAR_MANUALMENTE.sql")
print("3. Cole no SQL Editor")
print("4. Clique em 'Run' para executar")
print()

# Verificar se a tabela já existe
print("🔍 Verificando se a tabela 'receipts' já existe...")
try:
    response = supabase.table('receipts').select('*').limit(1).execute()
    print("✅ Tabela 'receipts' JÁ EXISTE!")
    print(f"📊 Registros: {len(response.data)}")
    print()
    print("✨ Migration já foi executada anteriormente!")
except Exception as e:
    error_msg = str(e)
    if "does not exist" in error_msg or "relation" in error_msg:
        print("❌ Tabela 'receipts' NÃO EXISTE")
        print()
        print("🚨 AÇÃO NECESSÁRIA:")
        print("Execute a migration manualmente conforme instruções acima!")
    else:
        print(f"⚠️  Erro ao verificar: {error_msg}")

print()
print("=" * 80)
