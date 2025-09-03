
# Regras de Negócio Implementadas

## Visão Geral

Este documento detalha todas as regras de negócio implementadas no sistema do Instituto Coração Valente, organizadas por domínio funcional.

## 1. Sistema de Autenticação e Usuários

### 1.1 Tipos de Usuário
```typescript
enum UserType {
  COMUM = 'comum',
  PARCEIRO = 'parceiro'
}
```

**Regras**:
- Todo usuário inicia como tipo `comum`
- Para se tornar `parceiro`, deve preencher dados profissionais específicos
- Usuários `parceiro` têm acesso ao dashboard profissional
- Transição de tipos é unidirecional (comum → parceiro)

### 1.2 Criação Automática de Perfil
```sql
-- Trigger que executa na criação de usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Regras**:
- Perfil criado automaticamente ao registrar conta
- Nome padrão extraído do email se não fornecido
- Profile ID sempre igual ao Auth User ID
- Falha na criação do perfil bloqueia registro

### 1.3 Validações de Perfil
```typescript
const profileSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido"),
  date_of_birth: z.date().max(new Date(), "Data não pode ser futura"),
  gender: z.enum(['masculino', 'feminino', 'outro', 'prefiro_nao_dizer']),
  // ... outras validações
});
```

**Regras**:
- Nome obrigatório (mínimo 2 caracteres)
- Telefone deve seguir formato brasileiro
- Data de nascimento não pode ser futura
- Campos médicos opcionais mas recomendados

## 2. Sistema de Profissionais (Parceiros)

### 2.1 Cadastro Profissional
```typescript
const professionalSchema = z.object({
  crm_crp_register: z.string().min(5, "Registro profissional obrigatório"),
  specialty: z.string().min(1, "Especialidade obrigatória"),
  specialties: z.array(z.string()),
  contact_email: z.string().email(),
  // ... outras validações
});
```

**Regras**:
- Registro profissional (CRM/CRP) obrigatório
- Pelo menos uma especialidade deve ser informada
- Email de contato pode ser diferente do login
- Bio limitada a 500 caracteres
- Foto profissional opcional mas recomendada

### 2.2 Status do Profissional
```typescript
enum PartnerStatus {
  ACTIVE = true,
  INACTIVE = false
}
```

**Regras**:
- Profissional inicia como `ativo` por padrão
- Apenas profissionais ativos aparecem nas buscas públicas
- Profissional pode desativar próprio perfil
- Agendamentos existentes mantidos se desativado
- Reativação automática permitida

### 2.3 Especialidades
```json
{
  "specialties": [
    "Cardiologia",
    "Cardiologia Pediátrica", 
    "Cirurgia Cardiovascular",
    "Arritmologia",
    "Hemodinâmica",
    "Ecocardiografia"
  ]
}
```

**Regras**:
- Lista pré-definida de especialidades válidas
- Profissional pode ter múltiplas especialidades
- Especialidade principal obrigatória
- Especialidades secundárias opcionais

## 3. Sistema de Agendamento

### 3.1 Horários Disponíveis (Schedules)
```typescript
const scheduleSchema = z.object({
  day_of_week: z.enum(['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']),
  start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  max_appointments: z.number().min(1).max(10)
});
```

**Regras**:
- Horário início deve ser anterior ao fim
- Máximo 10 agendamentos por horário
- Horários em intervalos de 30 minutos
- Profissional pode ter múltiplos horários por dia
- Horários inativos não aparecem para agendamento

### 3.2 Criação de Agendamentos
```typescript
enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed', 
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}
```

**Regras**:
- Agendamento inicia como `pending`
- Data deve ser futura (mínimo 1 dia)
- Horário deve estar dentro do schedule do profissional
- Não pode exceder `max_appointments` do horário
- Usuário pode ter apenas 1 agendamento pendente por profissional

### 3.3 Confirmação e Cancelamento
```typescript
// Regras de transição de status
const statusTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  cancelled: [], // Status final
  completed: []  // Status final
};
```

**Regras**:
- Apenas profissional pode confirmar agendamento
- Cancelamento possível até 2 horas antes
- Usuário e profissional podem cancelar
- Status `completed` apenas após data/hora do agendamento
- Reagendamento = cancelar + criar novo

## 4. Sistema de Pré-Diagnóstico com IA

### 4.1 Sessões de Diagnóstico
```typescript
enum SessionStatus {
  STARTED = 'started',
  COMPLETED = 'completed', 
  ABANDONED = 'abandoned'
}
```

**Regras**:
- Uma sessão ativa por usuário
- Abandono automático após 30 minutos inatividade
- Progresso salvo a cada resposta
- Resultados gerados apenas em sessões completas
- Histórico mantido para acompanhamento

### 4.2 Questões Adaptativas
```json
{
  "next_question_logic": {
    "if_answer": "sim_dor_peito",
    "next_question": "intensidade_dor",
    "else_next": "outros_sintomas"
  }
}
```

**Regras**:
- Fluxo baseado em respostas anteriores
- Questões categorizadas por especialidade
- Máximo 20 questões por sessão
- Questões obrigatórias vs opcionais
- Validação de consistência entre respostas

### 4.3 Análise por IA
```typescript
const aiAnalysisRules = {
  maxTokens: 1000,
  temperature: 0.3, // Respostas consistentes
  model: 'gpt-4-turbo', // Modelo atual
  systemPrompt: 'Você é um assistente médico...'
};
```

**Regras**:
- Análise baseada apenas em sintomas relatados
- Nunca diagnóstico definitivo, apenas orientação
- Sempre recomenda consulta médica presencial
- Nível de severidade de 1-5
- Respostas em português brasileiro

### 4.4 Níveis de Severidade
```typescript
enum SeverityLevel {
  BAIXO = 1,      // Sintomas leves, observação
  MODERADO = 2,   // Acompanhamento recomendado
  MEDIO = 3,      // Consulta em 7-15 dias
  ALTO = 4,       // Consulta em 24-48 horas
  CRITICO = 5     // Buscar atendimento imediato
}
```

**Regras**:
- Classificação automática pela IA
- Recomendações específicas por nível
- Níveis 4-5 geram alertas especiais
- Histórico de severidade por usuário

## 5. Sistema de Doações

### 5.1 Valores e Validações
```typescript
const donationRules = {
  minAmount: 500, // R$ 5,00 em centavos
  maxAmount: 100000000, // R$ 1.000.000,00
  defaultAmounts: [2500, 5000, 10000], // R$ 25, 50, 100
  currency: 'BRL'
};
```

**Regras**:
- Valor mínimo R$ 5,00
- Valor máximo R$ 1.000.000,00
- Valores sugeridos: R$ 25, R$ 50, R$ 100
- Apenas moeda brasileira (BRL)
- Valores armazenados em centavos

### 5.2 Métodos de Pagamento
```typescript
enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  PIX = 'PIX'
  // BOLETO removido conforme solicitação
}
```

**Regras**:
- Cartão de crédito via Asaas
- PIX com QR Code automático
- Boleto bancário removido
- Processamento em tempo real
- Confirmação via webhook

### 5.3 Split de Pagamento
```typescript
const splitConfiguration = {
  institutePercentage: 70,    // 70% para o instituto (sempre)
  adminPercentage: 10,        // 10% para Renum (sempre fixo)
  ambassadorPercentage: 20,   // 20% para embaixador (quando houver)
  specialPercentage: 20       // 20% para wallet especial (quando não há embaixador)
};
```

**Regras**:
- Split automático em todas doações
- Instituto sempre recebe 70%
- Renum sempre recebe 10% fixo
- Embaixador recebe 20% quando aplicável
- Wallet especial recebe 20% quando não há embaixador
- Split processado pelo Asaas

## 6. Sistema de Embaixadores

### 6.1 Cadastro de Embaixador
```typescript
const ambassadorRules = {
  codeLength: 8,
  codePattern: /^[A-Z0-9]{8}$/,
  minWalletId: 36, // UUID length
  maxLinksPerAmbassador: 10
};
```

**Regras**:
- Código único de 8 caracteres (A-Z, 0-9)
- Wallet ID do Asaas obrigatório
- Máximo 10 links por embaixador
- Opt-in explícito necessário
- Dados bancários validados

### 6.2 Geração de Links
```typescript
const linkRules = {
  baseUrl: 'https://app.institutovalente.org',
  shortUrlService: 'internal', // Futuro: bit.ly
  expirationDays: 365,
  trackingEnabled: true
};
```

**Regras**:
- Link único por campanha por embaixador
- Tracking completo de cliques
- Validade de 1 ano
- Geração automática de short URL
- Analytics em tempo real

### 6.3 Sistema de Performance
```typescript
const performanceRules = {
  levels: ['Iniciante', 'Bronze', 'Prata', 'Ouro', 'Diamante'],
  pointsPerDonation: 10,
  pointsPerClick: 1,
  levelThresholds: [0, 100, 500, 1000, 5000] // pontos
};
```

**Regras**:
- Pontuação por cliques (1 ponto) e doações (10 pontos)
- 5 níveis de embaixador
- Promoção automática baseada em pontos
- Relatórios mensais de performance
- Comissões baseadas no nível

## 7. Sistema de Biblioteca e Conteúdo

### 7.1 Categorização
```typescript
const contentCategories = [
  'Prevenção',
  'Diagnóstico', 
  'Tratamento',
  'Reabilitação',
  'Pesquisa',
  'Lifestyle'
];
```

**Regras**:
- Conteúdo deve ter categoria
- Aprovação necessária antes de publicar
- Autor identificado em cada recurso
- Versionamento de conteúdo médico
- Revisão periódica obrigatória

### 7.2 Tipos de Recurso
```typescript
enum ResourceType {
  ARTICLE = 'article',
  VIDEO = 'video',
  PDF = 'pdf',
  INFOGRAPHIC = 'infographic',
  WEBINAR = 'webinar'
}
```

**Regras**:
- Diferentes tipos têm validações específicas
- Tamanho máximo de arquivo: 50MB
- Formatos aceitos: PDF, MP4, JPG, PNG
- Thumbnails gerados automaticamente
- Controle de acesso por tipo de usuário

## 8. Validações Gerais do Sistema

### 8.1 Segurança de Dados
```typescript
const securityRules = {
  passwordMinLength: 8,
  passwordRequirements: ['uppercase', 'lowercase', 'number'],
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
  maxLoginAttempts: 5
};
```

**Regras**:
- Senhas com mínimo 8 caracteres
- Complexidade obrigatória
- Sessão expira em 24h de inatividade
- Bloqueio após 5 tentativas de login
- Dados pessoais criptografados

### 8.2 Rate Limiting
```typescript
const rateLimits = {
  api: '100/minute',
  donations: '5/hour',
  appointments: '10/day', 
  preDiagnosis: '3/day'
};
```

**Regras**:
- API limitada a 100 req/min por IP
- Máximo 5 doações por hora
- Máximo 10 agendamentos por dia
- Máximo 3 pré-diagnósticos por dia
- Limites específicos por endpoint

### 8.3 Auditoria e Logs
```typescript
const auditRules = {
  logRetention: 90, // dias
  criticalActions: ['donation', 'appointment', 'user_creation'],
  piiEncryption: true,
  complianceLevel: 'LGPD'
};
```

**Regras**:
- Logs mantidos por 90 dias
- Ações críticas sempre auditadas
- Dados pessoais anonimizados em logs
- Conformidade com LGPD
- Acesso aos logs restrito

## 9. Integrações Externas

### 9.1 Asaas (Pagamentos)
```typescript
const asaasRules = {
  environment: 'production', // ou 'sandbox'
  webhookTimeout: 30000, // 30 segundos
  retryAttempts: 3,
  splitEnabled: true
};
```

**Regras**:
- Webhook deve responder em 30s
- Máximo 3 tentativas de entrega
- Split configurado em todas transações
- Reconciliação diária automática
- Fallback para consulta manual

### 9.2 IA (OpenAI/Gemini)
```typescript
const aiRules = {
  maxPromptLength: 2000,
  responseTimeout: 30000,
  fallbackModel: 'gemini-pro',
  cacheResults: true
};
```

**Regras**:
- Prompt limitado a 2000 caracteres
- Timeout de 30 segundos
- Fallback automático entre modelos
- Cache de respostas similares
- Moderação de conteúdo ativada

## 10. Conformidade e Regulamentações

### 10.1 LGPD (Lei Geral de Proteção de Dados)
- Consentimento explícito para dados sensíveis
- Direito ao esquecimento implementado
- Portabilidade de dados disponível
- Logs de acesso e modificação
- DPO (Data Protection Officer) designado

### 10.2 Regulamentações Médicas
- Não fornece diagnósticos definitivos
- Sempre recomenda consulta presencial
- Profissionais verificados por registro
- Responsabilidade médica clara
- Documentação de disclaimers

### 10.3 Regulamentações Financeiras
- Conformidade com BC (Banco Central)
- Anti-lavagem de dinheiro
- Limites de transação
- Relatórios obrigatórios
- Auditoria financeira anual
