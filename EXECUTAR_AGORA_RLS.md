# 🚀 EXECUTAR AGORA - FIX RLS EMBAIXADORES

**Tempo:** 1 minuto  
**Dificuldade:** Fácil  

---

## 📋 PASSO A PASSO

### 1. Abrir SQL Editor

**URL Direta:**
```
https://supabase.com/dashboard/project/corrklfwxfuqusfzwbls/sql/new
```

Ou:
1. Ir em Supabase Dashboard
2. Clicar em "SQL Editor" no menu lateral
3. Clicar em "New query"

---

### 2. Copiar e Colar Este SQL

```sql
-- Permitir leitura pública de perfis com ambassador_code
DROP POLICY IF EXISTS "Perfis de embaixadores são públicos" ON profiles;

CREATE POLICY "Perfis de embaixadores são públicos"
ON profiles FOR SELECT
USING (ambassador_code IS NOT NULL);

-- Permitir leitura pública de dados de parceiros
DROP POLICY IF EXISTS "Dados de parceiros são públicos para leitura" ON partners;

CREATE POLICY "Dados de parceiros são públicos para leitura"
ON partners FOR SELECT
USING (true);
```

---

### 3. Executar

- Clicar no botão **"Run"** (ou pressionar `Ctrl+Enter`)
- Aguardar mensagem de sucesso

**Resultado esperado:**
```
✅ Success. No rows returned
```

---

### 4. Validar

**Executar este script:**
```bash
python verificar_embaixadores_real.py
```

**Resultado esperado:**
```
✅ Query executada com sucesso
   Registros retornados: 3

   Embaixadores encontrados:
   - Nome: [Nome]
     Código: RMCC0408
     Wallet: 94d4a3d1-fb07-461f-92aa-59a31774fe51
```

---

### 5. Testar Landing Page

**Acessar:**
```
http://localhost:8080/landing?ref=RMCC0408
```

**Verificar:**
- ✅ Card do embaixador aparece no topo
- ✅ Nome está correto
- ✅ Animação funciona

---

## ✅ PRONTO!

Depois de executar, o card do embaixador deve aparecer imediatamente.

**Tempo total:** ~1 minuto
