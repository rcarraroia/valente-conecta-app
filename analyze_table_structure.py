#!/usr/bin/env python3
from supabase import create_client, Client
import json

# Credenciais do projeto atual
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

def analyze_table_structure():
    """Análise detalhada da estrutura das tabelas"""
    print("=== ANÁLISE DETALHADA DA ESTRUTURA DAS TABELAS ===\n")
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Lista de tabelas relacionadas ao sistema de doações
        tables_to_check = [
            'donations',
            'ambassador_performance', 
            'ambassador_links',
            'profiles',
            'link_clicks'
        ]
        
        for table_name in tables_to_check:
            print(f"📋 TABELA: {table_name.upper()}")
            try:
                # Tentar inserir um registro vazio para descobrir a estrutura
                # (vai falhar mas mostrará os campos obrigatórios)
                response = supabase.table(table_name).insert({}).execute()
                print(f"   ✅ Tabela existe e aceita inserções vazias")
                
            except Exception as e:
                error_msg = str(e)
                print(f"   ✅ Tabela existe")
                
                # Extrair informações do erro para entender a estrutura
                if "null value in column" in error_msg:
                    print("   📝 Campos obrigatórios identificados no erro:")
                    lines = error_msg.split('\n')
                    for line in lines:
                        if "null value in column" in line:
                            print(f"      - {line.strip()}")
                
                # Tentar fazer um select para ver se há dados
                try:
                    sample = supabase.table(table_name).select('*').limit(1).execute()
                    if sample.data:
                        print("   📊 Estrutura baseada em dados existentes:")
                        for key in sample.data[0].keys():
                            value = sample.data[0][key]
                            value_type = type(value).__name__
                            print(f"      - {key}: {value_type}")
                    else:
                        print("   📊 Tabela vazia, mas existe")
                except Exception as inner_e:
                    print(f"   ❌ Erro ao fazer select: {str(inner_e)}")
            
            print()  # Linha em branco entre tabelas
        
        # Verificar se há usuários cadastrados
        print("👥 USUÁRIOS CADASTRADOS:")
        try:
            # Verificar profiles
            profiles = supabase.table('profiles').select('id, full_name, email, is_volunteer, ambassador_code').limit(10).execute()
            print(f"   📊 Total de perfis na amostra: {len(profiles.data)}")
            
            volunteers_count = 0
            ambassadors_count = 0
            
            for profile in profiles.data:
                if profile.get('is_volunteer'):
                    volunteers_count += 1
                if profile.get('ambassador_code'):
                    ambassadors_count += 1
                    
                print(f"   - {profile.get('full_name', 'N/A')} | Voluntário: {'✅' if profile.get('is_volunteer') else '❌'} | Código: {profile.get('ambassador_code', 'N/A')}")
            
            print(f"   📈 Voluntários: {volunteers_count}")
            print(f"   📈 Com código de embaixador: {ambassadors_count}")
            
        except Exception as e:
            print(f"   ❌ Erro ao verificar usuários: {str(e)}")
        
        print("\n=== ANÁLISE DE ESTRUTURA CONCLUÍDA ===")
        
    except Exception as e:
        print(f"❌ Erro de conexão: {str(e)}")

if __name__ == "__main__":
    analyze_table_structure()