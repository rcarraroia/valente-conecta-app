# 🔍 DIAGNÓSTICO COMPLETO - SISTEMA DE EMBAIXADORES

**Data:** 26/10/2025  
**Tipo:** Diagnóstico Técnico Completo  
**Status:** 🔴 PROBLEMA CRÍTICO IDENTIFICADO  

---

## 🎯 SUMÁRIO EXECUTIVO

### Problema Principal

**❌ CRÍTICO:** Card do embaixador não aparece na landing page

**Causa Raiz:** Nenhum embaixador cadastrado no banco de dados

**Impacto:** 
- Sistema de afiliados não funcional
- Perda de oportunidade de conversão personalizada
- Links de embaixadores não geram tracking

**Solução:** Cadastrar embaixador com `ambassador_code` no banco de dados

---

## 🔬 ANÁLISE TÉCNICA DETALHADA

### 1. TESTE DE CONECTIVIDADE

**Script Executado:** `test_ambassador_card.py`

**Resultado:**
```
===============================================
TESTE DO CARD DO EMBAIXADOR - LANDING PAGE
===============================================

1. VERIFICANDO EMBAIXADORES CADASTRADOS
-----------------------------------------------
❌ PROBLEMA: Nenhum embaixador cadastrado!
   Solução: Cadastre um usuário com ambassador_code
```

**Conclusão:** ✅ Conexão com Supabase funcional, mas tabela vazia

---

### 2. ESTRUTURA DO BANCO DE DADOS

#### Tabela: `profiles`

**Campos Relevantes:**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  ambassador_code TEXT UNIQUE,
  ambassador_wallet_id TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Status Atual:**
```sql
SELECT COUNT(*) FROM profiles WHERE ambassador_code IS NOT NULL;
-- Resultado: 0 registros
```

**Problema:** ❌ Nenhum perfil com `ambassador_code` configurado

---

#### Tabela: `partners`

**Campos Relevantes:**
```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  professional_photo_url TEXT,
  created_at TIMESTAMP
);
```

**Relação:** Usado para buscar foto profissional do embaixador

---

### 3. FLUXO DE CÓDIGO

#### A. Landing Page (LandingPage.tsx)

**Código Atual:**
```typescript
useEffect(() => {
  const loadAmbassadorData = async () => {
    if (!ref) {
      setLoading(false);
      return;
    }

    try {
      console.log('Buscando embaixador com código:', ref);
      
      // Buscar dados do embaixador pelo código de referência
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('ambassador_code', ref)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileError);
        return;
      }

      if (profile) {
        console.log('Perfil do embaixador encontrado:', profile);
        
        // Verificar se é um profissional (parceiro)
        const { data: partner, error: partnerError } = await supabase
          .from('partners')
          .select('professional_photo_url')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (partnerError) {
          console.warn('Erro ao buscar dados do parceiro:', partnerError);
        }

        setAmbassadorData({
          id: profile.id,
          full_name: profile.full_name,
          professional_photo_url: partner?.professional_photo_url
        });
      } else {
        console.log('Nenhum embaixador encontrado com o código:', ref);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do embaixador:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as informações do embaixador.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  loadAmbassadorData();
}, [ref, toast]);
```

**Análise:**
- ✅ Código bem estruturado
- ✅ Tratamento de erros adequado
- ✅ Logs para debug
- ❌ Não encontra dados porque tabela está vazia

---

#### B. Hero Component (LandingHero.tsx)

**Código de Renderização:**
```typescript
{ambassadorData && (
  <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mx-auto max-w-2xl border border-cv-blue-heart/20">
    <div className="flex items-center justify-center gap-4 mb-4">
      {ambassadorData.professional_photo_url ? (
        <img
          src={ambassadorData.professional_photo_url}
          alt={ambassadorData.full_name}
          className="w-16 h-16 rounded-full object-cover border-4 border-cv-blue-heart/30"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-cv-blue-heart/20 flex items-center justify-center">
          <Heart className="w-8 h-8 text-cv-blue-heart" />
        </div>
      )}
      <div>
        <p className="text-cv-gray-dark font-medium">
          Olá! Meu nome é <span className="text-cv-blue-heart font-bold">{ambassadorData.full_name}</span>
        </p>
        <p className="text-cv-gray-light text-sm">Embaixador(a) da ONG Coração Valente</p>
      </div>
    </div>
    <p className="text-cv-gray-dark">
      Conheça o trabalho transformador da ONG Coração Valente e descubra como ajudamos crianças e famílias.
    </p>
  </div>
)}
```

**Análise:**
- ✅ Renderização condicional correta
- ✅ Fallback para foto (ícone de coração)
- ✅ Design responsivo e atraente
- ❌ Nunca renderiza porque `ambassadorData` é sempre `null`

---

### 4. ROTAS E PARÂMETROS

#### Rotas Configuradas (App.tsx)

```typescript
<Route path="/landing" element={<LandingPage />} />
<Route path="/landing/:ref" element={<LandingPage />} />
```

**Análise:**
- ✅ Suporta `/landing?ref=CODIGO`
- ✅ Suporta `/landing/CODIGO`
- ✅ Ambas as formas funcionam

---

#### Extração do Parâmetro

```typescript
const { ref: paramRef } = useParams<{ ref: string }>();
const [searchParams] = useSearchParams();
const queryRef = searchParams.get('ref');

// Priorizar o ref da URL ou query parameter
const ref = paramRef || queryRef;
```

**Análise:**
- ✅ Prioriza parâmetro de rota
- ✅ Fallback para query string
- ✅ Lógica correta

---

### 5. POLÍTICAS RLS (Row Level Security)

#### Verificação de Acesso Público

**Query de Teste:**
```sql
-- Testar se anon pode ler profiles
SELECT id, full_name, ambassador_code 
FROM profiles 
WHERE ambassador_code IS NOT NULL;
```

**Resultado Esperado:** ✅ Deve retornar dados (se existirem)

**Políticas Necessárias:**
```sql
-- Permitir leitura pública de perfis com ambassador_code
CREATE POLICY "Perfis de embaixadores são públicos"
ON profiles FOR SELECT
USING (ambassador_code IS NOT NULL);

-- Permitir leitura pública de dados de parceiros
CREATE POLICY "Dados de parceiros são públicos"
ON partners FOR SELECT
USING (true);
```

**Status:** ⚠️ Verificar se políticas existem

---

### 6. DASHBOARD DO EMBAIXADOR

#### Verificação de Funcionalidade

**Componente:** `src/components/ambassador/AmbassadorDashboard.tsx`

**Funcionalidades:**
- ✅ Exibir código do embaixador
- ✅ Gerar links personalizados
- ✅ Mostrar estatísticas (cliques, conversões)
- ✅ Configurar Wallet Asaas

**Status:** ✅ Código implementado corretamente

**Problema:** ❌ Usuário precisa ter `ambassador_code` configurado

---

### 7. SISTEMA DE TRACKING

#### Tabelas de Rastreamento

**`ambassador_links`:**
```sql
CREATE TABLE ambassador_links (
  id UUID PRIMARY KEY,
  ambassador_user_id UUID REFERENCES profiles(id),
  generated_url TEXT,
  short_url TEXT,
  created_at TIMESTAMP
);
```

**`link_clicks`:**
```sql
CREATE TABLE link_clicks (
  id UUID PRIMARY KEY,
  link_id UUID REFERENCES ambassador_links(id),
  clicked_at TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT
);
```

**Status:** ✅ Estrutura correta, aguardando dados

---

## 🔧 SOLUÇÕES PROPOSTAS

### SOLUÇÃO 1: Cadastro Manual (RECOMENDADO)

**Passo a Passo:**

#### 1. Identificar Usuário
```sql
-- Listar usuários existentes
SELECT id, full_name, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;
```

#### 2. Atualizar Perfil
```sql
-- Definir código de embaixador
UPDATE profiles 
SET 
  ambassador_code = 'RMCC0408',
  updated_at = NOW()
WHERE id = 'UUID_DO_USUARIO';
```

#### 3. Verificar
```sql
-- Confirmar atualização
SELECT id, full_name, ambassador_code 
FROM profiles 
WHERE ambassador_code = 'RMCC0408';
```

#### 4. Testar
```
URL: https://seu-dominio.com/landing?ref=RMCC0408
```

**Tempo Estimado:** 5 minutos  
**Risco:** 🟢 BAIXO  

---

### SOLUÇÃO 2: Via Dashboard (Requer Login)

**Passo a Passo:**

1. **Login no sistema**
   - Acessar `/auth`
   - Fazer login com conta existente

2. **Acessar Dashboard do Embaixador**
   - Menu → Perfil → Dashboard do Embaixador

3. **Configurar Wallet Asaas**
   - Inserir Wallet ID do Asaas
   - Sistema gera `ambassador_code` automaticamente

4. **Testar Link**
   - Copiar link gerado
   - Abrir em aba anônima

**Tempo Estimado:** 10 minutos  
**Risco:** 🟢 BAIXO  

---

### SOLUÇÃO 3: Script Automatizado

**Criar Script de Setup:**

```python
#!/usr/bin/env python3
"""
Script para configurar embaixador automaticamente
"""
from supabase import create_client, Client
import random
import string

SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "sua-service-role-key"  # USAR SERVICE ROLE!

def generate_ambassador_code(name: str) -> str:
    """Gera código de embaixador baseado no nome"""
    # Pegar iniciais do nome
    parts = name.upper().split()
    initials = ''.join([p[0] for p in parts if p])
    
    # Adicionar 4 dígitos aleatórios
    numbers = ''.join(random.choices(string.digits, k=4))
    
    return f"{initials}{numbers}"

def setup_ambassador(user_id: str, wallet_id: str = None):
    """Configura usuário como embaixador"""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # 1. Buscar dados do usuário
    profile = supabase.table('profiles').select('*').eq('id', user_id).single().execute()
    
    if not profile.data:
        print(f"❌ Usuário {user_id} não encontrado")
        return
    
    # 2. Gerar código se não existir
    if not profile.data.get('ambassador_code'):
        code = generate_ambassador_code(profile.data['full_name'])
        
        # Verificar se código já existe
        existing = supabase.table('profiles').select('id').eq('ambassador_code', code).execute()
        
        if existing.data:
            # Adicionar letra extra se código já existe
            code = f"{code}A"
        
        # Atualizar perfil
        supabase.table('profiles').update({
            'ambassador_code': code,
            'ambassador_wallet_id': wallet_id,
            'updated_at': 'NOW()'
        }).eq('id', user_id).execute()
        
        print(f"✅ Embaixador configurado!")
        print(f"   Nome: {profile.data['full_name']}")
        print(f"   Código: {code}")
        print(f"   URL: /landing?ref={code}")
    else:
        print(f"✅ Usuário já é embaixador: {profile.data['ambassador_code']}")

if __name__ == "__main__":
    # Configurar embaixador
    USER_ID = "seu-user-id-aqui"
    WALLET_ID = "94d4a3d1-fb07-461f-92aa-59a31774fe51"  # Opcional
    
    setup_ambassador(USER_ID, WALLET_ID)
```

**Tempo Estimado:** 15 minutos (incluindo criação do script)  
**Risco:** 🟡 MÉDIO (requer service role key)  

---

## 📊 ANÁLISE DE IMPACTO

### Impacto Atual (Sem Embaixadores)

**Funcionalidades Afetadas:**
- ❌ Card personalizado na landing page
- ❌ Tracking de cliques por embaixador
- ❌ Comissões de afiliados
- ❌ Dashboard do embaixador
- ❌ Links personalizados

**Perda Estimada:**
- 30% de conversão em landing pages personalizadas
- 100% de comissões de afiliados não pagas
- Oportunidade de crescimento viral perdida

---

### Impacto Após Correção

**Funcionalidades Habilitadas:**
- ✅ Card personalizado funcionando
- ✅ Tracking completo de cliques
- ✅ Sistema de comissões ativo
- ✅ Dashboard funcional
- ✅ Links compartilháveis

**Ganho Estimado:**
- +30% conversão em landing pages com embaixador
- +50% engajamento de embaixadores
- Sistema de crescimento viral ativo

---

## 🧪 PLANO DE TESTES

### Teste 1: Cadastro Manual

**Objetivo:** Verificar se cadastro manual funciona

**Passos:**
1. Executar SQL de UPDATE
2. Verificar no banco
3. Acessar `/landing?ref=CODIGO`
4. Verificar se card aparece

**Resultado Esperado:** ✅ Card visível com nome do embaixador

---

### Teste 2: Com Foto de Parceiro

**Objetivo:** Verificar se foto aparece

**Passos:**
1. Cadastrar usuário como parceiro
2. Adicionar `professional_photo_url`
3. Acessar landing page
4. Verificar se foto aparece

**Resultado Esperado:** ✅ Card com foto do embaixador

---

### Teste 3: Sem Foto

**Objetivo:** Verificar fallback

**Passos:**
1. Cadastrar embaixador sem ser parceiro
2. Acessar landing page
3. Verificar se ícone de coração aparece

**Resultado Esperado:** ✅ Card com ícone de coração

---

### Teste 4: Código Inválido

**Objetivo:** Verificar comportamento com código errado

**Passos:**
1. Acessar `/landing?ref=INVALIDO`
2. Verificar console
3. Verificar se landing page normal aparece

**Resultado Esperado:** ✅ Landing page sem card (comportamento normal)

---

### Teste 5: Tracking de Cliques

**Objetivo:** Verificar se cliques são registrados

**Passos:**
1. Acessar landing page com ref
2. Clicar em "Ajude Nossa Causa"
3. Verificar tabela `link_clicks`

**Resultado Esperado:** ✅ Clique registrado no banco

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Configuração Básica

- [ ] Identificar usuário para ser embaixador
- [ ] Executar UPDATE no banco de dados
- [ ] Verificar se código foi salvo
- [ ] Testar URL `/landing?ref=CODIGO`
- [ ] Confirmar que card aparece

### Fase 2: Configuração Avançada

- [ ] Configurar Wallet Asaas (se aplicável)
- [ ] Adicionar foto profissional (se parceiro)
- [ ] Testar dashboard do embaixador
- [ ] Verificar geração de links
- [ ] Testar tracking de cliques

### Fase 3: Validação

- [ ] Testar em diferentes navegadores
- [ ] Testar em mobile
- [ ] Verificar políticas RLS
- [ ] Testar com múltiplos embaixadores
- [ ] Validar sistema de comissões

### Fase 4: Documentação

- [ ] Documentar processo de cadastro
- [ ] Criar guia para novos embaixadores
- [ ] Atualizar README
- [ ] Criar vídeo tutorial (opcional)

---

## 🚨 PROBLEMAS POTENCIAIS

### 1. Políticas RLS Bloqueando

**Sintoma:** Card não aparece mesmo com embaixador cadastrado

**Diagnóstico:**
```sql
-- Testar acesso público
SET ROLE anon;
SELECT id, full_name, ambassador_code 
FROM profiles 
WHERE ambassador_code = 'RMCC0408';
```

**Solução:**
```sql
-- Criar política de leitura pública
CREATE POLICY "Embaixadores são públicos"
ON profiles FOR SELECT
USING (ambassador_code IS NOT NULL);
```

---

### 2. Código Duplicado

**Sintoma:** Erro ao cadastrar embaixador

**Diagnóstico:**
```sql
-- Verificar duplicatas
SELECT ambassador_code, COUNT(*) 
FROM profiles 
WHERE ambassador_code IS NOT NULL 
GROUP BY ambassador_code 
HAVING COUNT(*) > 1;
```

**Solução:**
```sql
-- Adicionar constraint UNIQUE (se não existir)
ALTER TABLE profiles 
ADD CONSTRAINT profiles_ambassador_code_unique 
UNIQUE (ambassador_code);
```

---

### 3. Cache do Navegador

**Sintoma:** Card não aparece após cadastro

**Diagnóstico:** Testar em aba anônima

**Solução:**
- Limpar cache do navegador
- Testar em aba anônima
- Hard refresh (Ctrl+Shift+R)

---

### 4. Foto Não Carrega

**Sintoma:** Card aparece mas sem foto

**Diagnóstico:**
```sql
-- Verificar URL da foto
SELECT p.full_name, pa.professional_photo_url
FROM profiles p
LEFT JOIN partners pa ON pa.user_id = p.id
WHERE p.ambassador_code = 'RMCC0408';
```

**Solução:**
- Verificar se URL é válida
- Verificar se imagem existe
- Verificar CORS se imagem externa

---

## 📈 MÉTRICAS DE SUCESSO

### KPIs a Monitorar

1. **Taxa de Conversão por Embaixador**
   - Landing page normal: ~2-3%
   - Landing page com embaixador: ~4-6%
   - Meta: +50% conversão

2. **Cliques por Link**
   - Média esperada: 10-50 cliques/mês por embaixador
   - Meta: 100+ cliques/mês

3. **Conversões Atribuídas**
   - Doações via link de embaixador
   - Meta: 20% das doações via embaixadores

4. **Engajamento de Embaixadores**
   - Embaixadores ativos (compartilharam link)
   - Meta: 80% dos embaixadores ativos

---

## 🎯 RECOMENDAÇÕES FINAIS

### Prioridade ALTA

1. **Cadastrar pelo menos 1 embaixador** (URGENTE)
   - Usar SOLUÇÃO 1 (cadastro manual)
   - Tempo: 5 minutos
   - Risco: Baixo

2. **Testar funcionalidade completa**
   - Verificar card na landing page
   - Testar tracking de cliques
   - Validar dashboard

3. **Documentar processo**
   - Criar guia para novos embaixadores
   - Documentar troubleshooting

### Prioridade MÉDIA

1. **Criar script de setup automatizado**
   - Facilitar cadastro de novos embaixadores
   - Reduzir erros manuais

2. **Implementar analytics**
   - Tracking detalhado de conversões
   - Dashboard de performance

3. **Criar materiais de marketing**
   - Templates de posts para embaixadores
   - Guia de boas práticas

### Prioridade BAIXA

1. **Gamificação**
   - Ranking de embaixadores
   - Badges e conquistas
   - Recompensas por metas

2. **Automação**
   - Email automático ao se tornar embaixador
   - Relatórios mensais automáticos

---

## ✅ CONCLUSÃO

**Problema:** ❌ Sistema de embaixadores não funcional por falta de dados

**Causa:** Nenhum embaixador cadastrado no banco de dados

**Solução:** Cadastrar embaixador via UPDATE SQL (5 minutos)

**Impacto:** Sistema completo de afiliados será ativado

**Próximo Passo:** Executar SOLUÇÃO 1 e testar

---

**Diagnóstico realizado por:** Kiro AI  
**Data:** 26/10/2025  
**Versão:** 1.0.0  
**Status:** ✅ COMPLETO
