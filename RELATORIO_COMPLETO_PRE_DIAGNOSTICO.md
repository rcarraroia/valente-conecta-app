# 📋 RELATÓRIO COMPLETO - SISTEMA DE PRÉ-DIAGNÓSTICO COMPORTAMENTAL
## Instituto Coração Valente

**Data da Análise:** 30/09/2025  
**Método:** Análise direta do banco de dados + código fonte  
**Solicitante:** Kiro Dev  

---

## 🎯 RESUMO EXECUTIVO

O sistema possui **DUAS IMPLEMENTAÇÕES PARALELAS** de pré-diagnóstico:
1. **Sistema N8N** (ativo no frontend) - Usado nas rotas `/diagnosis/*`
2. **Sistema Edge Functions** (implementado mas não usado) - Functions `diagnostico-*`

**Status Atual:** Sistema funcional mas com duplicação de código e tabelas vazias.

---

## 📊 1. USO ATUAL DA TABELA `diagnostics`

### ✅ **TABELA EXISTE E ESTÁ CONFIGURADA**
- **Localização:** Banco Supabase real
- **Registros:** 0 (nunca foi usada em produção)
- **Estrutura confirmada:**
  - `id` (UUID, PK)
  - `user_id` (FK para auth.users)
  - `status` (TEXT)
  - `created_at` (TIMESTAMP)

### 🔍 **USO NO CÓDIGO:**

#### **Edge Functions (NÃO USADAS ATUALMENTE):**
```typescript
// supabase/functions/diagnostico-resposta/index.ts (linha 147)
await supabase.from('diagnostics').insert({
  user_id: user.id,
  symptoms: generateSymptomsText(updatedAnswers, questions),
  ai_response: result.analysis,
  severity_level: result.severity_level,
  recommendations: result.recommendations,
  status: 'pendente'
})
```

#### **Frontend (NÃO USA DIRETAMENTE):**
- ❌ Nenhuma referência direta à tabela `diagnostics` no frontend
- ✅ Sistema atual usa n8n via webhook
- ✅ Dados são processados via `useDiagnosisChat` hook

### 📋 **CONCLUSÃO - TABELA `diagnostics`:**
**A tabela existe mas NÃO está sendo usada pelo sistema ativo.** Apenas as Edge Functions `diagnostico-*` (que não são chamadas) tentam gravar nela.

---

## 🔄 2. FLUXO DE SESSÕES E `session_id`

### 🎯 **GERAÇÃO DE `session_id` NO FRONTEND:**

#### **Localização:** `src/hooks/useDiagnosisChat.tsx` (linha 126)
```typescript
const sessionId = `session_${user.id}_${Date.now()}`;
```

#### **Padrão Gerado:**
```
session_c040b590-f11f-4f05-9504-a50c46afc545_1759258776041
```

### 📡 **ENVIO PARA N8N:**

#### **Formato da Requisição:** `src/services/chat.service.ts` (linha 200)
```typescript
const request = {
  chatInput: content.trim(),
  user_id: user.id,
  session_id: session.id,
  timestamp: new Date().toISOString(),
};
```

#### **URL do Webhook:**
```
/api/webhook-proxy → https://slimquality-n8n.wpjtfd.easypanel.host/webhook/multiagente-ia-diagnostico
```

### 🔗 **INTEGRAÇÃO ENTRE TABELAS:**

#### **`diagnosis_chat_sessions` vs `pre_diagnosis_sessions`:**

**`diagnosis_chat_sessions`:**
- ✅ **Existe no banco** (0 registros)
- ✅ **Campos confirmados:** `id`, `user_id`, `session_id`, `status`, `messages`, `updated_at`, `completed_at`
- ❌ **NÃO é usada pelo sistema atual**

**`pre_diagnosis_sessions`:**
- ✅ **Existe no banco** (0 registros)  
- ✅ **Campos confirmados:** `id`, `user_id`
- ❌ **Usada apenas pelas Edge Functions não ativas**

### 📋 **CONCLUSÃO - FLUXO DE SESSÕES:**
**O `session_id` é gerado corretamente e enviado para n8n, mas NÃO é salvo em nenhuma tabela do banco.** O sistema funciona apenas em memória via hooks React.

---

## 💾 3. ESTRUTURA DE DADOS ATUAL

### 🔍 **COMO OS DADOS SÃO ARMAZENADOS:**

#### **Sistema Ativo (N8N):**
- ✅ **Dados em memória:** Via `useDiagnosisChat` hook
- ✅ **Mensagens:** Array de `ChatMessage[]` no estado React
- ❌ **Persistência:** Nenhuma no banco Supabase
- ✅ **Sessão:** Objeto `DiagnosisChatSession` temporário

#### **Estrutura em Memória:**
```typescript
interface DiagnosisChatSession {
  id: string;           // session_${user_id}_${timestamp}
  user_id: string;      // UUID do usuário
  status: string;       // 'active' | 'completed' | 'ended'
  started_at: string;   // ISO timestamp
  completed_at?: string;
}

interface ChatMessage {
  id: string;           // msg_${timestamp}_${type}
  type: 'user' | 'ai' | 'system';
  content: string;      // Conteúdo da mensagem
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
}
```

### 📊 **DADOS COLETADOS DURANTE A ENTREVISTA:**

#### **Fluxo Atual:**
1. **Usuário digita mensagem** → Salva no estado React
2. **Envia para n8n** → Processa via IA
3. **Recebe resposta** → Adiciona ao estado React
4. **Diagnóstico completo** → Gera relatório PDF

#### **Lógica de Gravação:**
```typescript
// src/hooks/useDiagnosisChat.tsx (linha 200+)
// Adiciona mensagem ao estado
setMessages(prev => [...prev, userMessage]);

// Envia para n8n
const response = await chatService.sendMessage(request);

// Adiciona resposta ao estado  
setMessages(prev => [...prev, aiMessage]);
```

### 📋 **CONCLUSÃO - ESTRUTURA DE DADOS:**
**Todos os dados ficam apenas em memória (React state). Nada é gravado no banco durante a entrevista.** Apenas relatórios PDF são salvos no Supabase Storage.

---

## 📄 4. GERAÇÃO DE RELATÓRIOS

### 🔍 **TABELA `relatorios_diagnostico`:**

#### **Status no Banco:**
- ✅ **Existe:** Confirmada no banco real
- ✅ **Registros:** 0 (nunca foi usada)
- ✅ **Campos confirmados:** `id`, `user_id`, `session_id`, `created_at`, `updated_at`, `status`, `pdf_url`

#### **Uso no Código:**
```typescript
// src/hooks/useDiagnosisChat.tsx (linha 400+)
const result = await diagnosisReportService.generateAndSaveReport(
  user.id,
  session.id,
  diagnosisData,
  options
);
```

### 📊 **QUANDO É POPULADA:**

#### **Trigger:** Quando n8n retorna `diagnosis_complete: true`
```typescript
// src/hooks/useDiagnosisChat.tsx (linha 350+)
if (responseData.diagnosis_complete && responseData.diagnosis_data) {
  setDiagnosisResult(responseData.diagnosis_data);
  await generatePDFReport(responseData.diagnosis_data);
}
```

#### **Dados Salvos:**
- ✅ **PDF:** Salvo no Supabase Storage (`diagnosis-reports` bucket)
- ✅ **Metadados:** Salvos na tabela `relatorios_diagnostico`
- ✅ **URL assinada:** Para download do PDF

### 📋 **CONCLUSÃO - RELATÓRIOS:**
**A tabela `relatorios_diagnostico` está configurada para ser populada automaticamente quando o diagnóstico é concluído, mas nunca foi testada em produção.**

---

## ✅ 5. SISTEMA DE CONSENTIMENTO

### 🔍 **TABELA `user_consent`:**

#### **Status no Banco:**
- ✅ **Existe:** Confirmada no banco real
- ✅ **Registros:** 0 (nunca foi usada)
- ✅ **Campos confirmados:** `id`, `user_id`, `created_at`, `updated_at`, `consent_date`

### 🔍 **USO NO CÓDIGO:**

#### **Busca no Código:**
- ❌ **Nenhuma referência** à tabela `user_consent` encontrada
- ❌ **Nenhum fluxo de aceite** de termos implementado
- ❌ **Nenhuma validação** de consentimento

### 📋 **CONCLUSÃO - CONSENTIMENTO:**
**A tabela `user_consent` existe mas NÃO há nenhum fluxo de aceite de termos implementado no sistema atual.**

---

## 🔗 6. RELACIONAMENTOS E FOREIGN KEYS

### 📊 **MAPEAMENTO DE RELACIONAMENTOS:**

#### **Relacionamentos Identificados:**

```sql
-- Relacionamentos confirmados por análise de campos
profiles.id ← FK ← diagnostics.user_id
profiles.id ← FK ← diagnosis_chat_sessions.user_id  
profiles.id ← FK ← pre_diagnosis_sessions.user_id
profiles.id ← FK ← relatorios_diagnostico.user_id
profiles.id ← FK ← user_consent.user_id

-- Relacionamentos por session_id (não são FK formais)
diagnosis_chat_sessions.session_id ↔ relatorios_diagnostico.session_id
```

#### **Estrutura de Dependências:**
```
auth.users (Supabase Auth)
    ↓
profiles (user_id)
    ↓
├── diagnostics (user_id)
├── diagnosis_chat_sessions (user_id, session_id)
├── pre_diagnosis_sessions (user_id)  
├── relatorios_diagnostico (user_id, session_id)
└── user_consent (user_id)
```

### 📋 **CONCLUSÃO - RELACIONAMENTOS:**
**Todos os relacionamentos apontam para `profiles.id` (que referencia `auth.users.id`). O `session_id` conecta sessões com relatórios, mas não há FK formal.**

---

## 🚨 7. PROBLEMAS IDENTIFICADOS

### ⚠️ **DUPLICAÇÃO DE SISTEMAS:**
1. **Sistema N8N** (ativo) - Rotas `/diagnosis/*`
2. **Edge Functions** (inativo) - `diagnostico-iniciar`, `diagnostico-resposta`

### ⚠️ **TABELAS ÓRFÃS:**
- `diagnostics` - Existe mas não é usada
- `pre_diagnosis_sessions` - Existe mas não é usada  
- `pre_diagnosis_questions` - Existe mas vazia
- `user_consent` - Existe mas sem fluxo implementado

### ⚠️ **FALTA DE PERSISTÊNCIA:**
- Dados da entrevista não são salvos no banco
- Perda de dados se usuário fechar o navegador
- Impossível recuperar sessões anteriores

### ⚠️ **INCONSISTÊNCIAS:**
- Frontend espera tabelas que não usa
- Edge Functions esperam dados que não existem
- Dois sistemas de sessão diferentes

---

## 🎯 8. RECOMENDAÇÕES PARA TRIAGEM COMPORTAMENTAL

### 🔄 **OPÇÃO 1: CONSOLIDAÇÃO (RECOMENDADA)**

#### **Ações:**
1. **Manter sistema N8N** como principal
2. **Usar tabelas existentes** para persistência
3. **Remover Edge Functions** não utilizadas
4. **Implementar fluxo de consentimento**

#### **Implementação:**
```sql
-- Usar diagnosis_chat_sessions para persistir sessões
-- Usar diagnostics para resultados finais  
-- Usar relatorios_diagnostico para PDFs
-- Implementar user_consent para termos
```

### 🔄 **OPÇÃO 2: REFATORAÇÃO COMPLETA**

#### **Ações:**
1. **Renomear tabelas** para triagem comportamental
2. **Consolidar em um único sistema**
3. **Criar nova estrutura** específica

#### **Implementação:**
```sql
-- Renomear diagnostics → behavioral_screenings
-- Renomear diagnosis_chat_sessions → screening_sessions
-- Adicionar campos específicos para triagem comportamental
```

### 🔄 **OPÇÃO 3: SISTEMA HÍBRIDO**

#### **Ações:**
1. **Manter sistema atual** funcionando
2. **Adicionar persistência** gradualmente
3. **Implementar triagem comportamental** como módulo adicional

---

## 📈 9. CONCLUSÕES FINAIS

### ✅ **SISTEMA FUNCIONAL:**
- N8N integrado e operacional
- Interface de chat implementada
- Geração de relatórios configurada

### ⚠️ **MELHORIAS NECESSÁRIAS:**
- Implementar persistência de dados
- Consolidar sistemas duplicados
- Adicionar fluxo de consentimento
- Usar tabelas existentes

### 🎯 **PRÓXIMOS PASSOS:**
1. **Decidir arquitetura** (consolidação vs refatoração)
2. **Implementar persistência** de sessões
3. **Ativar tabelas órfãs** ou removê-las
4. **Testar sistema** em produção real

---

**Status:** ✅ ANÁLISE COMPLETA  
**Recomendação:** 🔄 CONSOLIDAÇÃO DO SISTEMA  
**Prioridade:** 🟡 MÉDIA (sistema funciona, mas pode ser otimizado)

---

*Relatório gerado via análise direta do banco de dados Supabase + código fonte completo*