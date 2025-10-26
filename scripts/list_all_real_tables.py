#!/usr/bin/env python3
"""
Lista TODAS as tabelas reais do banco PostgreSQL
Conecta diretamente ao banco para ver a estrutura real
"""

import psycopg2
from datetime import datetime

# Credenciais do Instituto Coração Valente
DB_HOST = "aws-0-sa-east-1.pooler.supabase.com"
DB_PORT = "6543"
DB_NAME = "postgres"
DB_USER = "postgres.corrklfwxfuqusfzwbls"
DB_PASSWORD = "ghJSz3aKXvAfUFgd"

def list_all_tables():
    """Lista todas as tabelas do schema public"""
    print("=" * 80)
    print("LISTAGEM COMPLETA DE TABELAS - INSTITUTO CORAÇÃO VALENTE")
    print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()
    
    try:
        # Conectar ao PostgreSQL
        print("🔌 Conectando ao PostgreSQL...")
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()
        print("✅ Conexão estabelecida!")
        print()
        
        # Query para listar todas as tabelas
        query = """
        SELECT 
            schemaname,
            tablename,
            tableowner
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
        """
        
        cursor.execute(query)
        tables = cursor.fetchall()
        
        print(f"📊 TABELAS ENCONTRADAS NO SCHEMA PUBLIC")
        print("-" * 80)
        
        for i, (schema, table, owner) in enumerate(tables, 1):
            print(f"{i:3}. {table}")
        
        print("-" * 80)
        print(f"\n✅ Total de tabelas: {len(tables)}")
        print()
        
        # Contar registros em cada tabela
        print("📈 CONTAGEM DE REGISTROS POR TABELA")
        print("-" * 80)
        
        total_records = 0
        tables_with_data = 0
        
        for schema, table, owner in tables:
            try:
                cursor.execute(f'SELECT COUNT(*) FROM "{table}"')
                count = cursor.fetchone()[0]
                
                status = "✅" if count > 0 else "⚪"
                print(f"{status} {table:40} | {count:8,} registros")
                
                total_records += count
                if count > 0:
                    tables_with_data += 1
                    
            except Exception as e:
                print(f"❌ {table:40} | Erro: {str(e)[:30]}")
        
        print("-" * 80)
        print(f"\n📊 RESUMO:")
        print(f"   Total de tabelas: {len(tables)}")
        print(f"   Tabelas com dados: {tables_with_data}")
        print(f"   Tabelas vazias: {len(tables) - tables_with_data}")
        print(f"   Total de registros: {total_records:,}")
        print()
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO: {str(e)}")
        return False

if __name__ == "__main__":
    success = list_all_tables()
    exit(0 if success else 1)
