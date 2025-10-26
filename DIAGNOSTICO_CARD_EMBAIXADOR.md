# 🔍 DIAGNÓSTICO - Card do Embaixador Não Aparece

**Data:** 25/10/2025  
**URL Testada:** https://www.coracaovalente.org.br/landing?ref=RMCC040B  
**Status:** ❌ Problema Identificado  

---

## 🎯 PROBLEMA IDENTIFICADO

**O card do embaixador não aparece porque:**

❌ **O embaixador com código `RMCC040B` NÃO EXISTE no banco de dados**

---

## 🔍 VERIFICAÇÃO REALIZADA

### Conexão com Banco Real

Executei script Python conectando diretamente ao banco de dados do Instituto Coração Valente:

```python
# Busca realizada:
supabase.table('profiles')
  .select('*')
  .eq('ambassador_code', 'RMCC040B')
  .execute()

# Resultado:
❌ Nenhum registro encontrado
```

### Verificação Adicional

Também verifiquei se existem OUTROS códigos de embaixador no sistema:

```python
supabase.table('profiles')
  .select('ambassador_code, full_name')
  .not_.is_('ambassador_code', 'null')
  .execute()

# Resultado:
⚠️ Nenhum código de embaixador encontrado no sistema
```

**Conclusão:** O sistema está sem nenhum embaixador cadastrado.

---

## 📋 COMO O SISTEMA FUNCIONA

### Fluxo de Dados

```
1. Usuário acessa: /landing?ref=RMCC040B
   ↓
2. LandingPage.tsx captura o parâmetro 'ref'
   ↓
3. Busca no banco: profiles WHERE ambassador_code = 'RMCC040B'
   ↓
4. Se encontrar:
   - Busca foto em 'partners' (opcional)
   - Passa dados para LandingHero
   - LandingHero renderiza o card
   ↓
5. Se NÃO encontrar:
   - ambassadorData = null
   - Card não é renderizado (condição: {ambassadorData && ...})
```

### Código Relevante

**LandingPage.tsx (linhas 40-50):**
```tsx
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('id, full_name')
  .eq('ambassador_code', ref)  // ← Busca por 'RMCC040B'
  .single();  // ← Espera exatamente 1 resultado

if (profile) {
  // ✅ Encontrou: renderiza card
  setAmbassadorData({...});
} else {
  // ❌ Não encontrou: card não aparece
  console.log('Nenhum embaixador encontrado com o código:', ref);
}
```

**LandingHero.tsx (linhas 44-70):**
```tsx
{ambassadorData && (  // ← Só renderiza se ambassadorData existir
  <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
    {/* Card do embaixador */}
  </div>
)}
```

---

## ✅ CÓDIGO ESTÁ CORRETO

O código da landing page está funcionando perfeitamente:

- ✅ Captura corretamente o parâmetro `ref` da URL
- ✅ Faz a busca no banco de dados
- ✅ Renderiza o card quando encontra dados
- ✅ Não renderiza quando não encontra (comportamento esperado)

**O problema é a AUSÊNCIA DE DADOS, não o código.**

---

## 📝 SOLUÇÃO NECESSÁRIA

### Opção 1: Criar o Embaixador no Banco de Dados

**Você precisa inserir um registro na tabela `profiles` com:**

```sql
INSERT INTO profiles (
  id,                    -- UUID gerado automaticamente
  full_name,            -- Nome completo do embaixador
  email,                -- Email (se tiver)
  ambassador_code,      -- 'RMCC040B'
  is_volunteer,         -- true
  ambassador_wallet_id  -- ID da wallet Asaas (opcional)
) VALUES (
  gen_random_uuid(),
  'Nome do Embaixador',
  'email@exemplo.com',
  'RMCC040B',
  true,
  'wallet_id_aqui'  -- ou NULL
);
```

**Campos obrigatórios:**
- `full_name` - Nome que aparecerá no card
- `ambassador_code` - Deve ser exatamente 'RMCC040B'
- `is_volunteer` - Deve ser `true`

**Campos opcionais:**
- `email` - Email do embaixador
- `ambassador_wallet_id` - Para receber comissões
- `phone` - Telefone
- `city`, `state` - Localização

### Opção 2: Adicionar Foto (Opcional)

Se quiser que apareça a foto do embaixador, também precisa criar registro em `partners`:

```sql
INSERT INTO partners (
  user_id,                    -- ID do perfil criado acima
  professional_photo_url,     -- URL da foto
  specialty,                  -- Especialidade (opcional)
  status                      -- 'active'
) VALUES (
  'uuid_do_perfil',
  'https://url-da-foto.com/foto.jpg',
  'Embaixador',
  'active'
);
```

---

## 🔧 COMO CRIAR O EMBAIXADOR

### Método 1: Via Dashboard do Supabase (Recomendado)

1. Acessar: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls
2. Ir em "Table Editor" → "profiles"
3. Clicar em "Insert" → "Insert row"
4. Preencher os campos:
   - `full_name`: Nome do embaixador
   - `ambassador_code`: RMCC040B
   - `is_volunteer`: true
   - Outros campos conforme necessário
5. Salvar

### Método 2: Via SQL Editor

1. Acessar: https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/sql/new
2. Colar o SQL acima (adaptado com os dados reais)
3. Executar

### Método 3: Via Script Python

Posso criar um script para inserir o embaixador automaticamente, se você fornecer:
- Nome completo
- Email (opcional)
- Telefone (opcional)
- URL da foto (opcional)
- Wallet ID Asaas (opcional)

---

## 🧪 COMO TESTAR APÓS CRIAR

1. **Criar o embaixador no banco** (via um dos métodos acima)

2. **Limpar cache do navegador:**
   - Ctrl + Shift + R (Windows/Linux)
   - Cmd + Shift + R (Mac)

3. **Acessar a URL:**
   ```
   https://www.coracaovalente.org.br/landing?ref=RMCC040B
   ```

4. **Verificar console do navegador:**
   - Abrir DevTools (F12)
   - Ir na aba "Console"
   - Deve aparecer: "Perfil do embaixador encontrado: {dados}"

5. **Card deve aparecer:**
   - Logo abaixo do logo do instituto
   - Com fundo branco semi-transparente
   - Mostrando nome do embaixador
   - Com foto (se cadastrada) ou ícone de coração

---

## 📊 ESTRUTURA ESPERADA DO CARD

Quando funcionar, o card terá esta aparência:

```
┌─────────────────────────────────────────────────────┐
│  [Foto]  Olá! Meu nome é Nome do Embaixador        │
│          Embaixador(a) do Instituto Coração Valente │
│                                                      │
│  Conheça o trabalho transformador do Instituto      │
│  Coração Valente e descubra como ajudamos...        │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 VERIFICAÇÕES ADICIONAIS

### Verificar Políticas RLS

Após criar o embaixador, se ainda não aparecer, verificar políticas RLS:

```sql
-- Ver políticas da tabela profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**Política necessária:**
- SELECT deve permitir leitura pública do `ambassador_code`
- Ou pelo menos permitir leitura com `anon` role

### Verificar Logs do Navegador

Abrir console do navegador e procurar por:
- ✅ "Buscando embaixador com código: RMCC040B"
- ✅ "Perfil do embaixador encontrado: {dados}"
- ❌ Erros de CORS, RLS ou permissões

---

## 📝 RESUMO

### Problema
❌ Card do embaixador não aparece na URL `/landing?ref=RMCC040B`

### Causa
❌ Embaixador com código `RMCC040B` não existe no banco de dados

### Solução
✅ Criar registro na tabela `profiles` com:
- `ambassador_code = 'RMCC040B'`
- `is_volunteer = true`
- `full_name = 'Nome do Embaixador'`

### Código
✅ Está funcionando corretamente (não precisa correção)

---

## ❓ PRÓXIMOS PASSOS

**Aguardando você fornecer:**

1. **Dados do embaixador RMCC040B:**
   - Nome completo
   - Email (opcional)
   - Telefone (opcional)
   - URL da foto (opcional)
   - Wallet ID Asaas (opcional)

2. **Autorização para:**
   - Criar o registro no banco de dados
   - Ou você prefere criar manualmente via Dashboard?

---

**Posso criar um script para inserir o embaixador automaticamente assim que você fornecer os dados!** 🚀
