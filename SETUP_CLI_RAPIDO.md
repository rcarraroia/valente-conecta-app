# 🚀 SETUP RÁPIDO - SUPABASE CLI

## ✅ Status Atual

- ✅ Supabase CLI instalado (v2.51.0)
- ✅ Login realizado com sucesso
- ❌ Token sem permissões suficientes para linkar projeto

---

## 🔑 PRÓXIMO PASSO: Gerar Token com Permissões Corretas

### 1. Acesse o Dashboard de Tokens
https://supabase.com/dashboard/account/tokens

### 2. Gere um Novo Token
- Clique em **"Generate new token"**
- **Nome:** `Kiro CLI - Instituto Coração Valente - Full Access`
- **Permissões:** Certifique-se de que tem acesso ao projeto `corrklfwxfuqusfzwbls`

### 3. Faça Login Novamente
```bash
supabase logout
supabase login
# Cole o novo token quando solicitado
```

### 4. Linke ao Projeto
```bash
supabase link --project-ref corrklfwxfuqusfzwbls
```

---

## 🔍 Verificar se Funcionou

```bash
# Listar projetos
supabase projects list

# Testar query
supabase db execute "SELECT COUNT(*) FROM profiles"

# Ver estrutura
supabase db dump --schema public
```

---

## 📋 Credenciais do Projeto

**Project ID:** `corrklfwxfuqusfzwbls`
**Project URL:** `https://corrklfwxfuqusfzwbls.supabase.co`
**Dashboard:** https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls

---

## ⚠️ Credenciais Faltantes

Para completar o setup, você ainda precisa fornecer:

1. **Service Role Key** 
   - Obter em: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/settings/api
   - Adicionar no arquivo `docs/SUPABASE_CREDENTIALS.md`
   - Adicionar no `.env` como `SUPABASE_SERVICE_ROLE_KEY`

2. **Database Password**
   - Obter em: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/settings/database
   - Necessário para conexão direta via PostgreSQL

---

## 📝 Arquivos Atualizados

✅ `docs/SUPABASE_CREDENTIALS.md` - Credenciais do projeto
✅ `docs/SUPABASE_ACCESS.md` - Guia de acesso completo
✅ `supabase/config.toml` - Configuração corrigida
✅ `scripts/setup-supabase-cli.bat` - Script de setup automatizado

---

## 🎯 Comandos Úteis Após Setup

```bash
# Criar nova migração
supabase migration new nome_da_migration

# Aplicar migrações
supabase db push

# Ver histórico
supabase migration list

# Executar SQL
supabase db execute "SELECT * FROM donations LIMIT 5"

# Listar Edge Functions
supabase functions list

# Ver logs de function
supabase functions logs process-payment-v2 --tail

# Gerenciar secrets
supabase secrets list
supabase secrets set ASAAS_API_KEY=valor
```

---

## 🐍 Alternativa: Acesso via Python

Se preferir não usar CLI, você pode acessar via Python:

```python
from supabase import create_client

SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Listar tabelas (via query)
response = supabase.table('profiles').select('*').limit(5).execute()
print(response.data)
```

**⚠️ IMPORTANTE:** Para análise completa, use `SUPABASE_SERVICE_ROLE_KEY` ao invés da anon key!

---

**Próximo passo:** Gere um novo token com permissões corretas e execute os comandos acima.
