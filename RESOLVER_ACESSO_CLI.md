# 🔧 RESOLVER ACESSO CLI - INSTITUTO CORAÇÃO VALENTE

## ❌ Problema Identificado

O token de acesso `sbp_3c7e1ec4b6ca7f83bbb4b0adf71451bce8a08fda` não tem permissões para acessar o projeto `corrklfwxfuqusfzwbls`.

**Erro:** "Your account does not have the necessary privileges to access this endpoint"

---

## 🎯 Solução

O token precisa ser gerado pela **mesma conta** que criou/tem acesso ao projeto no Supabase.

### Opção 1: Gerar Token Correto (RECOMENDADO)

1. **Faça login no Supabase Dashboard** com a conta que tem acesso ao projeto:
   - https://supabase.com/dashboard

2. **Verifique se você vê o projeto** `corrklfwxfuqusfzwbls`:
   - https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls
   - Se não conseguir acessar, você não tem permissões nessa conta

3. **Gere um novo Access Token**:
   - Acesse: https://supabase.com/dashboard/account/tokens
   - Clique em "Generate new token"
   - Nome: "Kiro CLI - Instituto Coração Valente"
   - Copie o token (formato: `sbp_xxxxx...`)

4. **Faça login novamente**:
   ```bash
   supabase logout
   supabase login
   # Cole o NOVO token
   ```

5. **Linke ao projeto**:
   ```bash
   supabase link --project-ref corrklfwxfuqusfzwbls
   ```

---

### Opção 2: Usar Python para Acesso Direto (ALTERNATIVA)

Se você não conseguir resolver o acesso CLI, pode usar Python com a Service Role Key:

```python
from supabase import create_client

# Credenciais do Instituto Coração Valente
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvZXJtYXlveGphYW9temptdWhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMjAyMywiZXhwIjoyMDcwNjk4MDIzfQ.hF81PulOVABE4oiAn_LLePl19OG6Aui-V1A6MXF2obI"

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Listar tabelas
response = supabase.table('profiles').select('*').limit(5).execute()
print(f"Profiles: {len(response.data)} registros")
print(response.data)

# Contar doações
response = supabase.table('donations').select('*', count='exact').execute()
print(f"Donations: {response.count} registros")
```

**Vantagens:**
- ✅ Acesso total ao banco (Service Role Key)
- ✅ Não depende de permissões CLI
- ✅ Funciona para análise e verificação

**Desvantagens:**
- ❌ Não pode fazer deploy de Edge Functions
- ❌ Não pode gerenciar migrações via CLI
- ❌ Não pode gerenciar secrets

---

### Opção 3: Conexão Direta PostgreSQL

Se você tem a senha do banco, pode conectar diretamente:

```bash
# Instalar psql (se não tiver)
scoop install postgresql

# Conectar ao banco
psql "postgresql://postgres.corrklfwxfuqusfzwbls:ghJSz3aKXvAfUFgd@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"

# Executar queries
SELECT COUNT(*) FROM profiles;
SELECT * FROM donations LIMIT 5;
```

---

## 🔍 Verificar Conta Correta

Para saber qual conta tem acesso ao projeto:

1. Acesse: https://supabase.com/dashboard
2. Veja se o projeto "Instituto Coração Valente" aparece na lista
3. Se não aparecer, você está logado na conta errada

**Possíveis cenários:**
- Projeto criado em conta pessoal, mas você está logado em conta de trabalho
- Projeto criado por outra pessoa da equipe
- Projeto em organização que você não tem acesso

---

## ✅ Credenciais Já Configuradas

Mesmo sem CLI, você já tem acesso via:

### 1. Dashboard Web
https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls

### 2. SQL Editor
https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/sql/new

### 3. Python (Service Role Key)
```python
from supabase import create_client
supabase = create_client(
    "https://corrklfwxfuqusfzwbls.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvZXJtYXlveGphYW9temptdWhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyMjAyMywiZXhwIjoyMDcwNjk4MDIzfQ.hF81PulOVABE4oiAn_LLePl19OG6Aui-V1A6MXF2obI"
)
```

### 4. PostgreSQL Direto
```bash
psql "postgresql://postgres.corrklfwxfuqusfzwbls:ghJSz3aKXvAfUFgd@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
```

---

## 🎯 Recomendação

**Para análise e verificação:** Use Python (Opção 2)
**Para migrações e deploy:** Resolva o acesso CLI (Opção 1)

---

## 📝 Próximos Passos

1. Verifique qual conta tem acesso ao projeto
2. Gere novo token com a conta correta
3. Ou use Python para acesso direto

Precisa de ajuda com alguma dessas opções?
