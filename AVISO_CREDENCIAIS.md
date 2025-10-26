# ⚠️ AVISO IMPORTANTE SOBRE CREDENCIAIS

## 🚨 NUNCA COMMITAR ESTES ARQUIVOS NO GIT!

Os seguintes arquivos contêm credenciais sensíveis e **NUNCA** devem ser commitados:

### Arquivos Protegidos no `.gitignore`:

- ✅ `.env` - Variáveis de ambiente
- ✅ `.env.local` - Variáveis locais
- ✅ `.env.production` - Variáveis de produção
- ✅ `.env.development` - Variáveis de desenvolvimento
- ✅ `CREDENTIALS.md` - Credenciais completas do projeto
- ✅ `docs/SUPABASE_CREDENTIALS.md` - Credenciais do Supabase

---

## ✅ ANTES DE FAZER COMMIT

**SEMPRE verifique:**

```bash
# Ver arquivos que serão commitados
git status

# Verificar se .env ou credenciais estão na lista
# Se estiverem, NÃO FAÇA COMMIT!

# Verificar .gitignore
cat .gitignore | grep -E "\.env|CREDENTIALS"
```

---

## 🔍 SE VOCÊ COMMITOU CREDENCIAIS POR ENGANO

### 1. Remover do último commit (se ainda não fez push)
```bash
git reset HEAD~1
git add .
git commit -m "sua mensagem"
```

### 2. Se já fez push para o repositório
```bash
# 1. Remover arquivo do histórico
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch CREDENTIALS.md" \
  --prune-empty --tag-name-filter cat -- --all

# 2. Forçar push (CUIDADO!)
git push origin --force --all

# 3. REVOGAR TODAS AS CREDENCIAIS IMEDIATAMENTE!
```

### 3. Revogar credenciais comprometidas
1. Acessar: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/settings/api
2. Clicar em "Reset" em todas as keys
3. Gerar novas credenciais
4. Atualizar `.env` e `CREDENTIALS.md`
5. Notificar equipe

---

## 📋 CHECKLIST DE SEGURANÇA

Antes de cada commit:

- [ ] Verificou `git status`?
- [ ] Nenhum arquivo `.env*` na lista?
- [ ] Nenhum arquivo `*CREDENTIALS*` na lista?
- [ ] `.gitignore` está atualizado?
- [ ] Não há credenciais em código-fonte?
- [ ] Não há senhas em comentários?

---

## 🎯 ARQUIVOS SEGUROS PARA COMMITAR

Estes arquivos SÃO SEGUROS para commitar:

- ✅ `.env.example` - Template sem credenciais reais
- ✅ `README.md` - Documentação pública
- ✅ Código-fonte sem credenciais
- ✅ Configurações sem secrets

---

## 📚 MAIS INFORMAÇÕES

- Documentação completa: `CREDENTIALS.md` (NÃO COMMITAR!)
- Template de variáveis: `.env.example` (PODE COMMITAR)
- Guia de setup: `docs/SUPABASE_ACCESS.md`

---

**🔐 SEGURANÇA É RESPONSABILIDADE DE TODOS!**

Se tiver dúvidas, pergunte antes de commitar.
