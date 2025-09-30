#!/usr/bin/env python3
from supabase import create_client, Client

# Credenciais do projeto atual
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

def check_profiles_structure():
    """Verificar estrutura real da tabela profiles"""
    print("=== VERIFICAÇÃO DA ESTRUTURA DA TABELA PROFILES ===\n")
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Tentar diferentes combinações de campos para descobrir a estrutura
        possible_fields = [
            'id',
            'full_name', 
            'user_id',
            'is_volunteer',
            'ambassador_code',
            'ambassador_wallet_id',
            'created_at',
            'updated_at',
            'phone',
            'city',
            'state',
            'birth_date',
            'gender',
            'ambassador_opt_in_at'
        ]
        
        print("🔍 Testando campos existentes na tabela profiles:")
        
        existing_fields = []
        for field in possible_fields:
            try:
                response = supabase.table('profiles').select(field).limit(1).execute()
                existing_fields.append(field)
                print(f"   ✅ {field}")
            except Exception as e:
                print(f"   ❌ {field} - {str(e).split(',')[0]}")
        
        print(f"\n📋 Campos confirmados: {', '.join(existing_fields)}")
        
        # Agora tentar buscar dados reais
        if existing_fields:
            print("\n👥 DADOS REAIS DOS USUÁRIOS:")
            try:
                # Usar apenas campos que existem
                select_fields = ', '.join(existing_fields[:10])  # Limitar para evitar erro
                profiles = supabase.table('profiles').select(select_fields).limit(5).execute()
                
                print(f"   📊 Total de perfis encontrados: {len(profiles.data)}")
                
                for i, profile in enumerate(profiles.data, 1):
                    print(f"\n   👤 Usuário {i}:")
                    for field in existing_fields[:10]:
                        if field in profile:
                            value = profile[field]
                            if field == 'ambassador_wallet_id' and value:
                                # Mascarar wallet ID por segurança
                                value = value[:8] + "..." + value[-4:]
                            print(f"      {field}: {value}")
                
            except Exception as e:
                print(f"   ❌ Erro ao buscar dados: {str(e)}")
        
        print("\n=== VERIFICAÇÃO CONCLUÍDA ===")
        
    except Exception as e:
        print(f"❌ Erro de conexão: {str(e)}")

if __name__ == "__main__":
    check_profiles_structure()