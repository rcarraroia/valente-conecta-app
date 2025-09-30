# Sistema de Triagem Comportamental (STC)
## Instituto Coração Valente

**Versão:** 1.0  
**Data:** 30/09/2025  
**Status:** ✅ Implementado com Persistência  

---

## 🎯 Visão Geral

O Sistema de Triagem Comportamental (STC) é uma ferramenta de apoio inicial para identificação de sinais comportamentais relacionados ao neurodesenvolvimento em crianças e adolescentes.

### ⚠️ **IMPORTANTE**
Este é um sistema de **apoio inicial**, **NÃO um diagnóstico médico**. Os resultados devem sempre ser validados por profissionais especializados.

---

## 🏗️ Arquitetura

### **Stack Tecnológico:**
- **Frontend:** React + TypeScript + Vite
- **Backend:** n8n (orquestração) + Supabase (persistência)
- **IA:** OpenAI GPT-4 via n8n
- **Banco:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage (relatórios PDF)

### **Componentes Principais:**
```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   React App     │───▶│     n8n      │───▶│   OpenAI GPT-4  │
│   (Frontend)    │    │ (Orquestração)│    │      (IA)       │
└─────────────────┘    └──────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────┐
│   Supabase      │    │   Webhook    │
│ (Persistência)  │    │    Proxy     │
└─────────────────┘    └──────────────┘
```

---

## 🔄 Fluxo de Dados

### **1. Início da Sessão**
```typescript
// Geração de session_id
const sessionId = `session_${user.id}_${Date.now()}`;

// Exemplo: session_c040b590-f11f-4f05-9504-a50c46afc545_1759258776041
```

### **2. Registro de Consentimento**
```sql
-- Primeira mensagem → Registra consentimento LGPD
INSERT INTO user_consent (
  user_id, 
  consent_type, 
  consent_version, 
  ip_address, 
  accepted_terms
);
```

### **3. Processamento de Mensagens**
```
Usuário digita → Frontend → Webhook Proxy → n8n → OpenAI → Resposta
                     ↓
              Supabase (persistência)
```

### **4. Finalização**
```sql
-- Análise completa → Salva resultado
INSERT INTO diagnostics (
  user_id,
  session_id,
  behavioral_score,
  sub_agent_tea,
  sub_agent_tdah,
  -- ... outros campos
);

-- Gera relatório PDF
INSERT INTO relatorios_diagnostico (...);
```

---

## 📊 Estrutura do Banco de Dados

### **Tabelas Principais:**

#### **`user_consent`** - Consentimentos LGPD
```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles.id)
- consent_type (VARCHAR) -- 'triagem_comportamental'
- consent_version (VARCHAR) -- '1.0'
- consent_date (TIMESTAMP)
- ip_address (INET)
- user_agent (TEXT)
- accepted_terms (JSONB)
```

#### **`diagnosis_chat_sessions`** - Sessões de Chat
```sql
- id (UUID, PK)
- session_id (VARCHAR, UNIQUE) -- session_${user_id}_${timestamp}
- user_id (UUID, FK → profiles.id)
- status (VARCHAR) -- 'active', 'completed', 'ended'
- messages (JSONB) -- Array de mensagens
- consent_recorded (BOOLEAN)
- total_messages (INTEGER)
- last_activity_at (TIMESTAMP)
```

#### **`diagnostics`** - Resultados da Triagem
```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles.id)
- session_id (UUID, FK → diagnosis_chat_sessions.id)
- screening_type (VARCHAR) -- 'comportamental'
- behavioral_score (INTEGER) -- 0-100
- risk_indicators (JSONB) -- Array de indicadores
- sub_agent_tea (JSONB) -- Análise TEA
- sub_agent_tdah (JSONB) -- Análise TDAH
- sub_agent_linguagem (JSONB) -- Análise Linguagem
- sub_agent_sindromes (JSONB) -- Análise Síndromes
- interview_duration_minutes (INTEGER)
- completed_steps (JSONB)
- recommendations (TEXT)
- status (VARCHAR) -- 'concluido'
```

#### **`relatorios_diagnostico`** - Relatórios PDF
```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles.id)
- session_id (UUID, FK → diagnosis_chat_sessions.id)
- title (VARCHAR)
- pdf_url (TEXT) -- URL do Supabase Storage
- sub_agents_analysis (JSONB)
- screening_metadata (JSONB)
- status (VARCHAR)
```

### **View Consolidada:**
```sql
-- v_triagem_completa
-- Junta todas as informações de uma triagem
SELECT 
  session_code,
  user_name,
  behavioral_score,
  recommendations,
  report_title,
  pdf_url
FROM v_triagem_completa 
WHERE user_id = ?;
```

---

## 🔧 Implementação Técnica

### **Serviço de Persistência:**
```typescript
// src/services/screening.persistence.service.ts
export class ScreeningPersistenceService {
  async recordConsent(userId: string): Promise<any>
  async upsertChatSession(sessionData: ChatSessionData): Promise<any>
  async saveDiagnosticResult(diagnosticData: DiagnosticResultData): Promise<any>
  async getUserScreeningHistory(userId: string): Promise<any[]>
}
```

### **Hook Principal:**
```typescript
// src/hooks/useDiagnosisChat.tsx
export const useDiagnosisChat = () => {
  // Mantém nomenclatura "diagnosis" por compatibilidade
  // Interface usa "Sistema de Triagem Comportamental"
}
```

### **Integração n8n:**
```typescript
// Formato da requisição para n8n
const request = {
  chatInput: "mensagem do usuário",
  user_id: "uuid-do-usuario", 
  session_id: "session_uuid_timestamp",
  timestamp: "2025-09-30T19:00:00.000Z"
};

// URL: /api/webhook-proxy → n8n webhook
```

---

## 🎨 Interface do Usuário

### **Nomenclatura:**
- **Título Principal:** "Sistema de Triagem Comportamental (STC)"
- **Botões:** "Iniciar Triagem Comportamental"
- **Mensagens:** "Triagem Comportamental Concluída"
- **Código:** Mantém "diagnosis" por compatibilidade

### **Páginas:**
- `/diagnosis` - Dashboard principal
- `/diagnosis/chat` - Interface de chat
- `/diagnosis/reports` - Relatórios gerados

### **Componentes:**
- `DiagnosisDashboard` - Dashboard principal
- `DiagnosisChat` - Interface de chat
- `useDiagnosisChat` - Hook principal
- `screeningPersistence` - Serviço de persistência

---

## 🔒 Compliance LGPD

### **Consentimento:**
- ✅ Registrado antes da primeira mensagem
- ✅ Versão do termo rastreada
- ✅ IP e User-Agent capturados
- ✅ Timestamp de aceite
- ✅ Detalhes em JSON estruturado

### **Dados Coletados:**
- Mensagens da conversa (anonimizadas nos logs)
- Análises dos sub-agentes (TEA, TDAH, etc.)
- Score comportamental calculado
- Indicadores de risco identificados
- Duração da entrevista
- Relatórios PDF gerados

### **Retenção:**
- Dados mantidos conforme política de privacidade
- Possibilidade de revogação de consentimento
- Anonimização após período legal

---

## 🧠 Sub-Agentes de IA

### **TEA (Transtorno do Espectro Autista):**
- Análise de padrões comportamentais
- Identificação de sinais precoces
- Recomendações específicas

### **TDAH (Transtorno do Déficit de Atenção):**
- Avaliação de atenção e hiperatividade
- Padrões de comportamento escolar
- Estratégias de manejo

### **Linguagem:**
- Desenvolvimento da comunicação
- Marcos do desenvolvimento
- Sinais de atraso

### **Síndromes:**
- Padrões genéticos
- Características físicas
- Comorbidades

---

## 📈 Métricas e Analytics

### **Dados Coletados:**
- Duração das sessões
- Número de mensagens por sessão
- Scores comportamentais médios
- Taxa de conclusão
- Indicadores mais frequentes

### **Relatórios Disponíveis:**
- Histórico individual do usuário
- Estatísticas agregadas (anonimizadas)
- Performance dos sub-agentes
- Tempo de resposta do sistema

---

## 🚀 Deployment e Configuração

### **Variáveis de Ambiente:**
```env
# Supabase
VITE_SUPABASE_URL=https://corrklfwxfuqusfzwbls.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# n8n Webhook
VITE_N8N_WEBHOOK_URL=/api/webhook-proxy
```

### **Configuração n8n:**
- Webhook ativo: `multiagente-ia-diagnostico`
- Timeout: 30 segundos
- Retry: 3 tentativas
- Response format: JSON com `output` ou `mensagem`

### **Supabase Storage:**
- Bucket: `diagnosis-reports`
- Políticas RLS ativas
- Organização: `{user_id}/diagnostico-{timestamp}.pdf`

---

## 🔍 Troubleshooting

### **Problemas Comuns:**

#### **1. Webhook n8n não responde:**
```bash
# Verificar status do workflow
# Deve estar ATIVO no painel n8n
```

#### **2. Erro de persistência:**
```typescript
// Falhas de persistência NÃO bloqueiam o chat
// Logs: "❌ STC: Erro ao persistir (não bloqueia chat)"
```

#### **3. Consentimento não registrado:**
```sql
-- Verificar na tabela user_consent
SELECT * FROM user_consent WHERE user_id = 'uuid';
```

#### **4. Sessão não encontrada:**
```sql
-- Verificar diagnosis_chat_sessions
SELECT * FROM diagnosis_chat_sessions WHERE session_id = 'session_id';
```

---

## 📋 Checklist de Validação

### **Funcionalidades Básicas:**
- [ ] ✅ Usuário consegue iniciar chat
- [ ] ✅ Mensagens são enviadas para n8n
- [ ] ✅ Respostas da IA são exibidas
- [ ] ✅ Consentimento é registrado
- [ ] ✅ Sessões são persistidas
- [ ] ✅ Resultado final é salvo
- [ ] ✅ Relatório PDF é gerado

### **Persistência:**
- [ ] ✅ Tabela `user_consent` populada
- [ ] ✅ Tabela `diagnosis_chat_sessions` populada
- [ ] ✅ Tabela `diagnostics` populada
- [ ] ✅ Tabela `relatorios_diagnostico` populada
- [ ] ✅ View `v_triagem_completa` funcional

### **Compliance:**
- [ ] ✅ Consentimento LGPD registrado
- [ ] ✅ IP e User-Agent capturados
- [ ] ✅ Versão do termo rastreada
- [ ] ✅ Dados estruturados em JSON

---

## 🎯 Próximos Passos

### **Melhorias Planejadas:**
1. **Dashboard Administrativo** - Visualização de métricas
2. **Exportação de Dados** - Compliance LGPD
3. **Notificações** - Alertas para casos urgentes
4. **Integração com Profissionais** - Encaminhamentos automáticos
5. **Análise Preditiva** - ML para melhores triagens

### **Otimizações:**
1. **Cache de Sessões** - Redis para performance
2. **Compressão de Mensagens** - Reduzir tamanho do JSONB
3. **Índices Adicionais** - Queries mais rápidas
4. **Backup Automático** - Proteção de dados

---

**Status:** ✅ **SISTEMA IMPLEMENTADO E FUNCIONAL**  
**Prioridade:** 🟢 **PRODUÇÃO READY**  
**Compliance:** 🔒 **LGPD COMPLIANT**  

---

*Documentação gerada em 30/09/2025 - Sistema de Triagem Comportamental v1.0*