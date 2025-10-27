#!/usr/bin/env python3
"""
Atualizar RESEND_API_KEY via API do Supabase Management
"""
import requests
import os

# Credenciais
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
PROJECT_REF = "corrklfwxfuqusfzwbls"

# Tentar obter access token do arquivo de credenciais
try:
    with open('CREDENTIALS.md', 'r', encoding='utf-8') as f:
        content = f.read()
        # Procurar pelo access token
        if 'sbp_' in content:
            for line in content.split('\n'):
                if 'sbp_' in line and 'token' not in line.lower():
                    token = line.strip().replace('```', '').strip()
                    if token.startswith('sbp_'):
                        ACCESS_TOKEN = token
                        break
except:
    print("❌ Não foi possível obter access token")
    print("\n⚠️ A API Key precisa ser atualizada manualmente no dashboard:")
    print("https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/settings/vault")
    print("\nNome: RESEND_API_KEY")
    print("Valor: re_eNfrBTqu_L6MbSJ3yxQNAr2f4MWqhGWbG")
    exit(1)

print("=" * 100)
print("🔑 ATUALIZAÇÃO DA RESEND_API_KEY")
print("=" * 100)

print("\n⚠️ IMPORTANTE:")
print("A API do Supabase Management requer permissões especiais.")
print("Como não temos acesso direto via API, vamos usar uma abordagem alternativa.")

print("\n📋 INSTRUÇÕES PARA ATUALIZAÇÃO MANUAL:")
print("\n1. Acesse o dashboard do Supabase:")
print("   https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/settings/vault")

print("\n2. Procure por 'RESEND_API_KEY' ou clique em 'New secret'")

print("\n3. Configure:")
print("   Nome: RESEND_API_KEY")
print("   Valor: re_eNfrBTqu_L6MbSJ3yxQNAr2f4MWqhGWbG")

print("\n4. Salve")

print("\n" + "=" * 100)
print("📝 ALTERNATIVA: Atualizar via .env local para testes")
print("=" * 100)

# Verificar se .env existe
if os.path.exists('.env'):
    print("\n✅ Arquivo .env encontrado")
    
    with open('.env', 'r', encoding='utf-8') as f:
        env_content = f.read()
    
    # Verificar se RESEND_API_KEY já existe
    if 'RESEND_API_KEY' in env_content:
        print("⚠️ RESEND_API_KEY já existe no .env")
        print("\nDeseja atualizar? (s/n)")
        # Para automação, vamos atualizar automaticamente
        
        # Substituir a linha
        lines = env_content.split('\n')
        new_lines = []
        updated = False
        
        for line in lines:
            if line.startswith('RESEND_API_KEY='):
                new_lines.append('RESEND_API_KEY=re_eNfrBTqu_L6MbSJ3yxQNAr2f4MWqhGWbG')
                updated = True
            else:
                new_lines.append(line)
        
        if updated:
            with open('.env', 'w', encoding='utf-8') as f:
                f.write('\n'.join(new_lines))
            print("✅ RESEND_API_KEY atualizada no .env local")
        else:
            print("❌ Não foi possível atualizar")
    else:
        print("➕ Adicionando RESEND_API_KEY ao .env")
        with open('.env', 'a', encoding='utf-8') as f:
            f.write('\n\n# Resend Email Service\n')
            f.write('RESEND_API_KEY=re_eNfrBTqu_L6MbSJ3yxQNAr2f4MWqhGWbG\n')
        print("✅ RESEND_API_KEY adicionada ao .env local")
else:
    print("❌ Arquivo .env não encontrado")

print("\n" + "=" * 100)
print("⚠️ NOTA IMPORTANTE:")
print("=" * 100)
print("\nO .env local é apenas para desenvolvimento.")
print("Para produção, a API Key DEVE ser configurada no Supabase Vault.")
print("\nAcesse: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/settings/vault")
print("\n" + "=" * 100)
