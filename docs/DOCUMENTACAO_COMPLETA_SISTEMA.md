# DOCUMENTAÇÃO COMPLETA DO SISTEMA VALENTE CONECTA

> **Análise Técnica Completa do Aplicativo Web/PWA**
> **Versão:** 1.0
> **Data:** 25 de Outubro de 2025
> **Instituto Coração Valente**

---

## SUMÁRIO EXECUTIVO

O **Valente Conecta** é uma Progressive Web Application (PWA) moderna desenvolvida para o Instituto Coração Valente, oferecendo:

- 🏥 **Triagem comportamental por IA** via chat inteligente
- 💰 **Sistema de doações e mantenedores** com pagamentos PIX/Cartão
- 👥 **Sistema de embaixadores** com links rastreáveis e comissões
- 📅 **Agendamento de consultas** com profissionais parceiros
- 📱 **PWA completo** com suporte offline e instalável
- 🎯 **Mobile-first** com experiência otimizada para smartphones

**Stack Tecnológico Principal:**
- React 18 + TypeScript 5
- Vite + Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- n8n (Workflow de IA)
- Asaas (Processamento de pagamentos)

---

## 1. ESTRUTURA DO PROJETO

### 1.1 Árvore de Diretórios

```
valente-conecta-app/
│
├── src/                                    # Código-fonte principal
│   ├── components/                         # Componentes React
│   │   ├── ui/                            # shadcn/ui design system
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── [40+ componentes]
│   │   │
│   │   ├── auth/                          # Autenticação
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── UserTypeSelector.tsx
│   │   │   └── [form fields]
│   │   │
│   │   ├── donation/                      # Sistema de doações
│   │   │   ├── DonationScreen.tsx
│   │   │   ├── DonationForm.tsx
│   │   │   ├── SupporterForm.tsx
│   │   │   ├── PixCheckout.tsx
│   │   │   ├── CreditCardForm.tsx
│   │   │   ├── PaymentMethodSelector.tsx
│   │   │   └── [selectors e forms]
│   │   │
│   │   ├── diagnosis/                     # Sistema de diagnóstico IA
│   │   │   ├── DiagnosisChat.tsx
│   │   │   ├── AIChatInterface.tsx
│   │   │   ├── AIIntroScreen.tsx
│   │   │   ├── AIResultScreen.tsx
│   │   │   ├── ReportsList.tsx
│   │   │   ├── PDFViewer.tsx
│   │   │   └── [error boundaries, status]
│   │   │
│   │   ├── professional/                  # Dashboard profissionais
│   │   │   ├── ProfessionalDashboard.tsx
│   │   │   ├── ProfessionalProfile.tsx
│   │   │   ├── ProfessionalAppointments.tsx
│   │   │   └── ProfessionalSchedule.tsx
│   │   │
│   │   ├── ambassador/                    # Sistema de embaixadores
│   │   │   ├── AmbassadorDashboard.tsx
│   │   │   ├── LinkGenerator.tsx
│   │   │   └── AmbassadorWalletForm.tsx
│   │   │
│   │   ├── profile/                       # Perfil do usuário
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── MyDataScreen.tsx
│   │   │   ├── MyDonationsScreen.tsx
│   │   │   └── [forms]
│   │   │
│   │   ├── home/                          # Tela inicial
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── HomeHeader.tsx
│   │   │   ├── HomeHero.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── [carousels, sections]
│   │   │
│   │   ├── landing/                       # Landing page
│   │   │   ├── LandingHero.tsx
│   │   │   ├── LandingAbout.tsx
│   │   │   ├── LandingPreDiagnosis.tsx
│   │   │   └── [outros componentes]
│   │   │
│   │   └── [outros]/                      # Monitoring, Debug, Partner
│   │
│   ├── pages/                             # Páginas/Rotas
│   │   ├── Index.tsx                      # Home principal
│   │   ├── Auth.tsx                       # Login/Signup
│   │   ├── DiagnosisChat.tsx             # Chat de diagnóstico
│   │   ├── DiagnosisDashboard.tsx        # Dashboard de diagnóstico
│   │   ├── DiagnosisReports.tsx          # Relatórios
│   │   ├── LandingPage.tsx               # Landing pública
│   │   └── NotFound.tsx                  # 404
│   │
│   ├── hooks/                             # Custom React Hooks (23 arquivos)
│   │   ├── useDiagnosisChat.tsx          # Gerenciamento do chat IA
│   │   ├── useDiagnosisAuth.tsx          # Auth para diagnóstico
│   │   ├── usePixCheckout.tsx            # Checkout PIX
│   │   ├── usePaymentStatus.tsx          # Status de pagamentos
│   │   ├── useReports.tsx                # Gerenciamento de relatórios
│   │   ├── useResponsive.tsx             # Detecção mobile/desktop
│   │   ├── useAmbassadorLinks.tsx        # Links de embaixador
│   │   ├── useProfessionalDashboard.tsx  # Dashboard profissional
│   │   └── [outros hooks]
│   │
│   ├── services/                          # Serviços de negócio
│   │   ├── chat.service.ts               # Webhook n8n para chat IA
│   │   ├── chat.config.ts                # Configuração do chat
│   │   ├── diagnosis-report.service.ts   # Geração de relatórios
│   │   ├── analytics.service.ts          # Tracking de eventos
│   │   ├── logging.service.ts            # Sistema de logs
│   │   ├── pdf.service.ts                # Geração de PDFs
│   │   └── notificationService.ts        # Notificações
│   │
│   ├── contexts/                          # React Context
│   │   └── AuthContext.tsx               # Contexto de autenticação
│   │
│   ├── integrations/supabase/            # Integração Supabase
│   │   ├── client.ts                     # Cliente Supabase
│   │   └── types.ts                      # Tipos auto-gerados (29KB)
│   │
│   ├── schemas/                           # Validação Zod
│   │   └── diagnosis.schema.ts           # Schemas para diagnóstico
│   │
│   ├── utils/                             # Utilitários
│   │   ├── paymentSplit.ts               # Lógica de divisão de pagamentos
│   │   ├── walletValidation.ts           # Validação de carteiras
│   │   ├── diagnosis-utils.ts            # Utilitários do diagnóstico
│   │   └── diagnosis-error-handler.ts
│   │
│   ├── lib/                               # Biblioteca interna
│   │   ├── diagnosis-constants.ts        # Constantes do sistema
│   │   ├── diagnosis-config.ts           # Configurações
│   │   └── utils.ts                      # Utilitários CSS (clsx + tailwind)
│   │
│   ├── types/                             # Definições TypeScript
│   │   ├── payment.ts                    # Tipos de pagamento
│   │   ├── diagnosis.ts                  # Tipos de diagnóstico
│   │   └── diagnosis-services.ts
│   │
│   ├── App.tsx                            # Componente raiz
│   └── main.tsx                           # Entry point React
│
├── supabase/                              # Backend serverless
│   ├── functions/                         # 16 Edge Functions
│   │   ├── asaas-webhook/                # Webhook de pagamentos
│   │   ├── process-payment/              # Processamento de pagamentos
│   │   ├── process-payment-split/        # Processamento com split
│   │   ├── diagnostico-webhook/          # Webhook diagnóstico
│   │   ├── links-generate/               # Geração de links
│   │   └── [outras functions]
│   │
│   ├── migrations/                        # Migrações de BD
│   └── config.toml                        # Configuração Supabase local
│
├── sql/                                   # Scripts SQL
│   ├── add_wallet_unique_validation.sql
│   └── monitoring-tables.sql
│
├── docs/                                  # Documentação
│   ├── architecture.md                   # Arquitetura do sistema
│   ├── api-documentation.md              # Documentação de APIs
│   ├── database.md                       # Schema de BD
│   ├── business-rules.md                 # Regras de negócio
│   ├── PWA_IMPLEMENTATION.md             # Implementação PWA
│   └── asaas_documentacao_completa/      # Docs Asaas
│
├── public/                                # Arquivos estáticos
│   ├── pwa-192x192.png                   # Ícone PWA pequeno
│   ├── pwa-512x512.png                   # Ícone PWA grande
│   ├── apple-touch-icon.png              # Ícone Apple
│   ├── favicon.ico                       # Favicon
│   └── offline.html                      # Fallback offline
│
├── package.json                           # Dependências Node
├── vite.config.ts                         # Configuração Vite + PWA
├── tailwind.config.ts                     # Tema Tailwind
├── tsconfig.json                          # Configuração TypeScript
├── eslint.config.js                       # Linting
└── vercel.json                            # Deploy Vercel
```

---

## 2. STACK TECNOLÓGICO

### 2.1 Frontend Framework

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **React** | 18.3.1 | Framework UI principal |
| **TypeScript** | 5.5.3 | Linguagem tipada |
| **Vite** | 5.4.1 | Build tool moderno e rápido |
| **React Router DOM** | 6.26.2 | Roteamento SPA |

### 2.2 Estilização

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Tailwind CSS** | 3.4.11 | Utility-first CSS framework |
| **shadcn/ui** | - | Design system (Radix UI + Tailwind) |
| **Lucide React** | 0.462.0 | Biblioteca de ícones SVG |
| **Tailwindcss-animate** | 1.0.7 | Animações CSS |
| **Class Variance Authority** | 0.7.1 | Gerenciamento de variações |
| **Clsx** | 2.1.1 | Composição de classes CSS |
| **Tailwind-merge** | 2.5.2 | Merge inteligente de classes |

### 2.3 Componentes UI

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Radix UI** | - | Componentes acessíveis headless |
| **Sonner** | 1.5.0 | Toast notifications |
| **Embla Carousel** | 8.3.0 | Carrossel responsivo |
| **Vaul** | 0.9.3 | Drawer component |
| **Input-otp** | 1.2.4 | Input de código OTP |

### 2.4 Formulários e Validação

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **React Hook Form** | 7.53.0 | Gerenciamento de formulários |
| **Zod** | 3.23.8 | Schema validation TypeScript-first |
| **@hookform/resolvers** | 3.9.0 | Integração RHF + Zod |

### 2.5 Estado e Data Fetching

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **TanStack Query** | 5.56.2 | Cache e sincronização de dados |
| **Supabase JS** | 2.50.0 | Cliente para Supabase |

### 2.6 Utilidades

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Date-fns** | 3.6.0 | Manipulação de datas |
| **Crypto-JS** | 4.2.0 | Criptografia |
| **React PDF** | 10.1.0 | Visualização de PDF |
| **jsPDF** | 3.0.2 | Geração de PDF |
| **html2canvas** | 1.4.1 | HTML para Canvas/Imagem |
| **Sharp** | 0.34.4 | Processamento de imagens |

### 2.7 PWA (Progressive Web App)

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **vite-plugin-pwa** | 1.0.3 | Plugin PWA para Vite |
| **workbox-window** | 7.3.0 | Service worker |
| **next-themes** | 0.3.0 | Suporte dark mode |

### 2.8 Backend e Banco de Dados

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Supabase** | - | Backend-as-a-Service |
| **PostgreSQL** | 15 | Banco de dados relacional |
| **Deno** | - | Runtime para Edge Functions |

### 2.9 Integrações Externas

| Serviço | Função |
|---------|--------|
| **Asaas** | Gateway de pagamentos (PIX, Cartão) |
| **n8n** | Workflow automation (Chat IA) |

### 2.10 Ferramentas de Desenvolvimento

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Vitest** | 3.2.4 | Framework de testes |
| **@testing-library/react** | 16.3.0 | Testes de componentes |
| **ESLint** | 9.9.0 | Linting de código |
| **TSX** | 4.20.3 | Executar TypeScript direto |

---

## 3. COMPONENTES PRINCIPAIS

### 3.1 Componentes de Layout

| Componente | Arquivo | Função |
|-----------|---------|--------|
| **BottomNavigation** | `components/layout/BottomNavigation.tsx` | Navegação inferior mobile-first |
| **HomeScreen** | `components/home/HomeScreen.tsx` | Tela inicial com seções |
| **ErrorBoundary** | `components/ErrorBoundary.tsx` | Tratamento de erros React |
| **PWAInstallPrompt** | `components/PWAInstallPrompt.tsx` | Prompt de instalação PWA |
| **PWAUpdateNotification** | `components/PWAUpdateNotification.tsx` | Notificação de atualização |
| **LoadingSpinner** | `components/ui/LoadingSpinner.tsx` | Indicador de carregamento |

### 3.2 Sistema de Autenticação

**Localização:** `src/components/auth/`

| Componente | Função |
|-----------|--------|
| **LoginForm** | Formulário de login com email/senha |
| **SignupForm** | Formulário de cadastro multi-step |
| **UserTypeSelector** | Seleção de tipo: usuário, parceiro, voluntário |
| **CommonFormFields** | Campos comuns (nome, email, senha) |
| **ProfessionalFormFields** | Campos específicos para profissionais |
| **DiagnosisRouteGuard** | Proteção de rotas de diagnóstico |

**Contexto de Autenticação:**
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
}
```

### 3.3 Sistema de Doações e Pagamentos

**Localização:** `src/components/donation/`

#### Componentes Principais

| Componente | Função |
|-----------|--------|
| **DonationScreen** | Seletor entre Doação Única/Mantenedor |
| **DonationForm** | Formulário de doação única |
| **SupporterForm** | Formulário de assinatura mensal |
| **PixCheckout** | Interface checkout PIX transparente |
| **CreditCardForm** | Formulário de cartão de crédito |
| **PaymentMethodSelector** | Seletor PIX/Cartão |
| **AmountSelector** | Seletor de valores pré-definidos |
| **SupporterAmountSelector** | Valores para assinatura |
| **DonorInformationForm** | Coleta dados do doador |
| **SupporterInformationForm** | Coleta dados do mantenedor |
| **SupporterBenefits** | Exibição de benefícios |
| **AmbassadorCodeInput** | Input para código de embaixador |

#### Hooks de Pagamento

```typescript
// src/hooks/usePixCheckout.tsx
usePixCheckout() → {
  initiateCheckout: (data) => Promise
  qrCode: string
  copyPasteCode: string
  status: 'idle' | 'processing' | 'success' | 'error'
}

// src/hooks/usePaymentStatus.tsx
usePaymentStatus(paymentId) → {
  status: PaymentStatus
  polling: boolean
  error: Error | null
}
```

### 3.4 Sistema de Diagnóstico por IA

**Localização:** `src/components/diagnosis/`

#### Arquitetura

```
Usuário → DiagnosisChat → Webhook n8n → IA/LLM → Análise → PDF
```

#### Componentes

| Componente | Função |
|-----------|--------|
| **DiagnosisChat** | Interface principal do chat |
| **AIChatInterface** | Chat visual com histórico |
| **AIIntroScreen** | Tela de introdução ao diagnóstico |
| **AIResultScreen** | Resultado e análise final |
| **ReportsList** | Lista de relatórios do usuário |
| **ReportItem** | Item individual de relatório |
| **PDFViewer** | Visualizador de PDF integrado |
| **DiagnosisErrorBoundary** | Tratamento de erros específico |
| **SystemStatus** | Status do sistema de diagnóstico |
| **ChatUnavailableFallback** | Fallback quando chat indisponível |

#### Hooks Especializados

```typescript
// src/hooks/useDiagnosisChat.tsx
useDiagnosisChat() → {
  messages: Message[]
  sendMessage: (text: string) => Promise
  isLoading: boolean
  sessionId: string
  diagnosisData: DiagnosisData | null
}

// src/hooks/useDiagnosisAuth.tsx
useDiagnosisAuth() → {
  isAuthenticated: boolean
  canAccessDiagnosis: boolean
  checkAccess: () => Promise
}

// src/hooks/useReports.tsx
useReports() → {
  reports: Report[]
  loading: boolean
  generateReport: (data) => Promise
  downloadReport: (id) => Promise
}
```

#### Serviços

```typescript
// src/services/chat.service.ts
ChatService {
  sendMessage(sessionId, text): Promise<Response>
  startSession(userId): Promise<SessionId>
  getMetrics(): Promise<Metrics>
}

// src/services/diagnosis-report.service.ts
DiagnosisReportService {
  generate(data): Promise<PDFBlob>
  upload(file): Promise<URL>
  retrieve(reportId): Promise<Report>
}
```

### 3.5 Sistema de Profissionais

**Localização:** `src/components/professional/`

| Componente | Função |
|-----------|--------|
| **ProfessionalDashboard** | Dashboard completo com estatísticas |
| **ProfessionalProfile** | Perfil público do profissional |
| **ProfessionalAppointments** | Lista de consultas agendadas |
| **ProfessionalSchedule** | Gerenciamento de agenda |
| **ProfessionalCard** | Card visual do profissional |

```typescript
// src/hooks/useProfessionalDashboard.tsx
useProfessionalDashboard() → {
  appointments: Appointment[]
  stats: Statistics
  updateSchedule: (schedule) => Promise
}
```

### 3.6 Sistema de Embaixadores

**Localização:** `src/components/ambassador/`

| Componente | Função |
|-----------|--------|
| **AmbassadorDashboard** | Dashboard com performance |
| **LinkGenerator** | Gerador de links únicos |
| **AmbassadorWalletForm** | Formulário para Wallet ID Asaas |
| **AmbassadorWalletSetup** | Setup inicial de embaixador |

```typescript
// src/hooks/useAmbassadorLinks.tsx
useAmbassadorLinks() → {
  links: AmbassadorLink[]
  generateLink: (name) => Promise<Link>
  stats: {
    totalClicks: number
    totalDonations: number
    totalAmount: number
  }
}
```

### 3.7 Sistema de Perfil

**Localização:** `src/components/profile/`

| Componente | Função |
|-----------|--------|
| **ProfileScreen** | Tela principal do perfil |
| **MyDataScreen** | Dados pessoais do usuário |
| **MyDonationsScreen** | Histórico de doações |
| **PersonalInformationForm** | Edição de informações pessoais |
| **MedicalInformationForm** | Informações médicas |
| **EmergencyContactForm** | Contato de emergência |

### 3.8 Tela Home

**Localização:** `src/components/home/`

| Componente | Função |
|-----------|--------|
| **HomeHeader** | Header com logo e navegação |
| **HomeHero** | Hero section principal |
| **QuickActions** | Botões de ações rápidas |
| **NewsCarousel** | Carrossel de notícias |
| **PartnersCarousel** | Carrossel de parceiros |
| **QuickAppointment** | CTA de agendamento rápido |
| **ImpactSection** | Seção de impacto social |

### 3.9 Landing Page

**Localização:** `src/components/landing/`

| Componente | Função |
|-----------|--------|
| **LandingHero** | Hero section da landing |
| **LandingAbout** | Sobre a instituição |
| **LandingPreDiagnosis** | CTA para pré-diagnóstico |
| **LandingDonation** | CTA para doação |
| **LandingImpact** | Estatísticas de impacto |
| **LandingTestimonials** | Depoimentos de usuários |
| **LandingFooter** | Footer com links |

---

## 4. FUNCIONALIDADES DO SISTEMA

### 4.1 Autenticação e Autorização

#### Tecnologia
**Supabase Auth** (OAuth + Email/Password)

#### Fluxo de Autenticação

```
1. Usuário acessa /auth
2. Escolhe entre Login ou Signup
3. Preenche credenciais
4. Supabase valida e cria session
5. Session salvo em localStorage
6. AuthContext distribui estado
7. RLS Policies controlam acesso a dados
```

#### Tipos de Usuário

| Tipo | Valor | Permissões |
|------|-------|------------|
| **Usuário** | `usuario` | Acesso a diagnóstico, doações, agendamentos |
| **Profissional** | `parceiro` | Dashboard, agenda, consultas |
| **Embaixador** | `voluntario` | Dashboard, links, comissões |

#### Contexto Global

```typescript
// src/contexts/AuthContext.tsx
const AuthContext = createContext<AuthContextType>({
  user: User | null,
  session: Session | null,
  loading: boolean,
  isAuthenticated: boolean,
  signOut: () => Promise<void>
})
```

#### Segurança

- **RLS (Row Level Security)**: Usuários só acessam seus dados
- **JWT Tokens**: Session tokens seguros
- **Password Hashing**: Senhas hasheadas no banco
- **OAuth**: Suporte futuro para Google/Facebook

---

### 4.2 Sistema de Doações

#### Tipos de Doação

**1. Doação Única**
- Pagamento único
- Valores a partir de R$ 5,00
- PIX ou Cartão de Crédito

**2. Mantenedor (Assinatura)**
- Pagamento recorrente mensal
- Valores a partir de R$ 10,00
- PIX ou Cartão de Crédito
- Benefícios exclusivos

#### Fluxo Completo de Doação

```
1. Usuário clica "Apoiar" → DonationScreen
2. Escolhe tipo: Doação Única OU Mantenedor
3. Seleciona valor (pré-definido ou custom)
4. Preenche dados pessoais (DonorInformationForm)
5. Opcional: Insere código de embaixador
6. Seleciona método de pagamento (PIX/Cartão)
7. Confirma doação
8. Sistema chama Edge Function process-payment(-split)
9. Asaas processa pagamento
10. Webhook asaas-webhook confirma
11. Registro salvo em tabela 'donations'
12. Email de confirmação enviado
13. Histórico atualizado em MyDonationsScreen
```

#### Métodos de Pagamento

**PIX (Checkout Transparente)**
- Geração de QR Code
- Código Copia e Cola
- Confirmação automática em segundos
- Monitoramento via polling

**Cartão de Crédito**
- Tokenização segura (Asaas)
- Sem armazenamento de dados sensíveis
- Suporte a recorrência
- 3D Secure opcional

#### Sistema de Split (Divisão de Receita)

**Sem Embaixador (70% Instituto):**
```
Instituto Coração Valente: 70%
Renum (Administração):    10%
Wallet Especial:          20%
```

**Com Embaixador (70% Instituto):**
```
Instituto Coração Valente: 70%
Embaixador:               20%
Renum (Administração):    10%
```

**Configuração:**
```typescript
// src/utils/paymentSplit.ts
export const SPLIT_CONFIG = {
  instituteWalletId: 'eff311bc-7737-4870-93cd-16080c00d379',
  adminWalletId: 'f9c7d1dd-9e52-4e81-8194-8b666f276405',
  specialWalletId: 'c0c31b6a-2481-4e3f-a6de-91c3ff834d1f',

  adminCommissionPercent: 10,
  ambassadorCommissionPercent: 20,
  specialCommissionPercent: 20
}
```

#### Integração Asaas

**APIs Utilizadas:**
- `POST /customers` - Criar cliente
- `POST /payments` - Criar cobrança
- `GET /payments/{id}` - Consultar status
- `POST /webhook` - Notificações

**Webhook Events:**
- `PAYMENT_RECEIVED` - Pagamento confirmado
- `PAYMENT_CONFIRMED` - Confirmação final
- `PAYMENT_OVERDUE` - Pagamento vencido

---

### 4.3 Sistema de Diagnóstico por IA

#### Visão Geral

Sistema de triagem comportamental usando chat com IA via workflow n8n.

#### Arquitetura

```
┌─────────────┐      ┌──────────┐      ┌─────────┐      ┌────────┐
│ DiagnosisChat│ ───> │ Webhook  │ ───> │   n8n   │ ───> │ IA/LLM │
│  (Frontend)  │      │  Proxy   │      │Workflow │      │        │
└─────────────┘      └──────────┘      └─────────┘      └────────┘
       ↑                                      │
       │                                      ↓
       │              ┌──────────────────────────────────┐
       └──────────────│  Análise Estruturada + PDF       │
                      └──────────────────────────────────┘
```

#### Fluxo Detalhado

```
1. Usuário autentica (useDiagnosisAuth)
2. Acessa /diagnosis/chat
3. Sistema cria diagnosis_session em BD
4. Apresenta AIIntroScreen com instruções
5. Usuário digita mensagem
6. Frontend envia via webhook n8n:
   POST /webhook-proxy {
     user_id: uuid,
     text: string,
     session_id: uuid
   }
7. n8n recebe e processa com IA
8. IA analisa e estrutura dados
9. Retorna resposta:
   {
     response: string,
     is_final: boolean,
     diagnosis_data: DiagnosisData | null
   }
10. Se is_final = true:
    - Frontend extrai diagnosis_data
    - Gera PDF via html2canvas + jsPDF
    - Upload para Supabase Storage
    - Salva metadados em relatorios_diagnostico
11. AIResultScreen mostra análise
12. Usuário pode baixar PDF
```

#### Dados Capturados

```typescript
interface DiagnosisData {
  patient_info: {
    age?: number
    gender?: string
    medical_history?: string[]
  }
  symptoms: Array<{
    description: string
    severity: 1-10  // Escala
    duration?: string
  }>
  analysis: string
  recommendations: string[]
  severity_level: 1-5
  next_steps?: string[]
  generated_at: string  // ISO 8601
}
```

#### Armazenamento

**Supabase Storage:**
- Bucket: `diagnosis-reports`
- Naming: `{user_id}/{session_id}_report.pdf`
- Acesso: URLs assinadas temporárias

**Banco de Dados:**
```sql
-- Tabela: relatorios_diagnostico
{
  id: uuid
  user_id: uuid
  session_id: uuid
  pdf_url: text
  diagnosis_data: jsonb
  created_at: timestamp
}
```

#### Componentes de Suporte

**Error Handling:**
- `DiagnosisErrorBoundary` - Captura erros React
- `useDiagnosisErrorHandler` - Lógica de erro
- `ChatUnavailableFallback` - Fallback quando offline

**Sistema de Status:**
- `SystemStatus` - Monitora saúde do sistema
- Health checks periódicos
- Alertas visuais

---

### 4.4 Sistema de Agendamento

#### Funcionalidades

- Busca de profissionais por especialidade
- Visualização de agenda disponível
- Agendamento de consultas
- Notificações de confirmação
- Gestão de horários (profissionais)

#### Fluxo

```
1. Usuário busca profissional
2. Visualiza perfil e especialidades
3. Consulta agenda disponível
4. Seleciona data e horário
5. Confirma agendamento
6. Sistema salva em 'appointments'
7. Notificação enviada para ambas as partes
8. Integração com calendário (futuro)
```

#### Tabelas

```sql
-- partners: Profissionais cadastrados
-- schedules: Horários disponíveis
-- appointments: Agendamentos confirmados
```

---

### 4.5 Sistema de Embaixadores

#### Visão Geral

Sistema de referência com rastreamento de performance e comissões.

#### Funcionalidades

**1. Geração de Links**
- Links únicos de referência
- Parâmetro `?ref={codigo}`
- Rastreamento de cliques

**2. Dashboard**
- Total de cliques
- Total de doações geradas
- Valor total arrecadado
- Nível/status do embaixador

**3. Wallet ID**
- Configuração de Wallet ID Asaas
- Recebimento automático de comissões (20%)
- Validação de wallet

**4. Performance Tracking**

```typescript
interface AmbassadorStats {
  total_clicks: number
  total_donations: number
  total_amount: number
  active_links: number
  conversion_rate: number
  level: 'bronze' | 'prata' | 'ouro' | 'diamante'
}
```

#### Fluxo de Referência

```
1. Embaixador gera link via LinkGenerator
2. Sistema cria registro em ambassador_links
3. Embaixador compartilha link
4. Pessoa clica → Landing com ref
5. Sistema rastreia em ambassador_performance
6. Pessoa faz doação
7. Sistema aplica split com 20% para embaixador
8. Comissão transferida para Wallet ID
9. Dashboard atualizado em tempo real
```

#### Tabelas

```sql
-- profiles.wallet_id: Wallet Asaas do embaixador
-- ambassador_links: Links gerados
-- ambassador_performance: Estatísticas
```

---

### 4.6 Sistema de Notificações

#### Tipos de Notificação

**1. Email**
- Confirmação de doação
- Confirmação de agendamento
- Relatório de diagnóstico pronto

**2. Toast (In-App)**
- Feedback imediato de ações
- Erros e avisos
- Confirmações

**3. Push (PWA)**
- Notificações nativas (futuro)
- Lembretes de consulta
- Atualizações importantes

#### Serviço

```typescript
// src/services/notificationService.ts
notificationService {
  notifyPaymentReceived(amount, method): void
  notifyAppointmentConfirmed(appointment): void
  notifyReportReady(reportId): void
}
```

---

### 4.7 Geração de Relatórios

#### Tipos de Relatório

**1. Diagnóstico (PDF)**
- Análise comportamental completa
- Recomendações personalizadas
- Gráficos e visualizações
- Branding do Instituto

**2. Doações (Histórico)**
- Lista de contribuições
- Filtros por período
- Total arrecadado
- Exportação CSV (futuro)

**3. Performance (Embaixador)**
- Dashboard visual
- Gráficos de evolução
- Métricas detalhadas

#### Geração de PDF

```typescript
// Fluxo de geração
1. Dados estruturados → HTML template
2. html2canvas → Renderiza HTML em Canvas
3. jsPDF → Converte Canvas em PDF
4. Upload para Supabase Storage
5. Geração de URL assinada temporária
6. Link enviado ao usuário
```

**Serviço:**
```typescript
// src/services/pdf.service.ts
pdfService {
  generate(data: DiagnosisData): Promise<Blob>
  upload(blob: Blob, path: string): Promise<string>
  getSignedUrl(path: string): Promise<string>
}
```

---

## 5. ARQUITETURA E PADRÕES

### 5.1 Padrão de Componentes (Atomic Design)

```
┌─────────────────────────────────────┐
│         Pages (Templates)           │
│  Index, Auth, DiagnosisChat, etc    │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│      Organisms (Complex)            │
│  DonationForm, Dashboard, etc       │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│     Molecules (Composed)            │
│  FormFields, Cards, Dialogs         │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│       Atoms (Base UI)               │
│  Button, Input, Icon, etc           │
└─────────────────────────────────────┘
```

### 5.2 Gerenciamento de Estado

**Abordagem Multi-Camadas:**

```typescript
┌──────────────────────────────────────┐
│       Local State (useState)         │
│    UI state, form inputs, etc        │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│    Global Context (AuthContext)      │
│    User session, auth state          │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│  Server State (TanStack Query)       │
│  Remote data, cache, sync            │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│   Persistence (localStorage)         │
│   Preferences, offline data          │
└──────────────────────────────────────┘
```

**Exemplos:**

```typescript
// Local state
const [isOpen, setIsOpen] = useState(false)

// Global context
const { user, isAuthenticated } = useAuth()

// Server state (TanStack Query)
const { data, isLoading } = useQuery({
  queryKey: ['donations', userId],
  queryFn: fetchDonations
})

// Persistence
localStorage.setItem('theme', 'dark')
```

### 5.3 Custom Hooks Pattern

**Padrão Estabelecido:**

```typescript
// src/hooks/useFeature.tsx
export const useFeature = () => {
  // 1. State
  const [state, setState] = useState<State>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // 2. Side effects
  useEffect(() => {
    // Setup/cleanup
  }, [dependencies])

  // 3. Actions
  const handleAction = useCallback(async () => {
    try {
      setLoading(true)
      // Logic here
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [dependencies])

  // 4. Return interface clara
  return {
    // State
    state,
    loading,
    error,

    // Actions
    actions: {
      handleAction
    }
  }
}
```

### 5.4 Roteamento

**React Router v6:**

```typescript
// src/App.tsx
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/auth" element={<Auth />} />
  <Route path="/landing" element={<LandingPage />} />
  <Route path="/landing/:ref" element={<LandingPage />} />

  {/* Diagnóstico */}
  <Route path="/diagnosis" element={<DiagnosisDashboard />} />
  <Route path="/diagnosis/chat" element={<DiagnosisChat />} />
  <Route path="/diagnosis/reports" element={<DiagnosisReports />} />

  {/* 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

**Navegação Interna (Index):**

O componente `Index` usa um sistema de screens baseado em localStorage:

```typescript
// Navegar internamente
localStorage.setItem('redirect_to', 'profile')
navigate('/')

// Index detecta e renderiza ProfileScreen
```

### 5.5 Integração com Supabase

#### Cliente

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)
```

#### Padrões de Uso

**Query:**
```typescript
const { data, error } = await supabase
  .from('donations')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
```

**Insert:**
```typescript
await supabase
  .from('donations')
  .insert({
    user_id: userId,
    amount: 100,
    type: 'donation'
  })
```

**Update:**
```typescript
await supabase
  .from('profiles')
  .update({ wallet_id: walletId })
  .eq('id', userId)
```

**Realtime:**
```typescript
supabase
  .channel('donations')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'donations'
  }, (payload) => {
    console.log('Nova doação!', payload)
  })
  .subscribe()
```

#### Row Level Security (RLS)

```sql
-- Usuários só veem seus próprios dados
CREATE POLICY "Users can view own data"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Profissionais gerenciam suas agendas
CREATE POLICY "Partners manage schedules"
ON schedules FOR ALL
USING (auth.uid() = partner_id);
```

### 5.6 Integração com n8n

#### Webhook Communication

**Request:**
```typescript
interface N8nWebhookRequest {
  user_id: string  // UUID
  text: string     // Mensagem do usuário
  session_id: string  // UUID da sessão
}
```

**Response:**
```typescript
interface N8nWebhookResponse {
  response: string  // Resposta da IA
  is_final: boolean  // Conversa finalizada?
  diagnosis_data?: DiagnosisData  // Se finalizado
  session_id: string
  error?: string
}
```

**Endpoint:**
```typescript
// Via proxy para evitar CORS
POST /api/webhook-proxy
Content-Type: application/json
```

### 5.7 Validação com Zod

**Schemas:**

```typescript
// src/schemas/diagnosis.schema.ts
export const chatMessageSchema = z.object({
  text: z.string().min(1, 'Mensagem não pode estar vazia'),
  session_id: z.string().uuid()
})

export const diagnosisDataSchema = z.object({
  patient_info: z.object({
    age: z.number().optional(),
    gender: z.string().optional()
  }),
  symptoms: z.array(z.object({
    description: z.string(),
    severity: z.number().min(1).max(10)
  })),
  analysis: z.string(),
  recommendations: z.array(z.string()),
  severity_level: z.number().min(1).max(5)
})

type DiagnosisData = z.infer<typeof diagnosisDataSchema>
```

**Com React Hook Form:**

```typescript
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { ... }
})
```

---

## 6. CONFIGURAÇÕES

### 6.1 Variáveis de Ambiente

```bash
# .env (não versionado)

# Supabase
VITE_SUPABASE_URL=https://corrklfwxfuqusfzwbls.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJh...
VITE_SUPABASE_PROJECT_ID=corrklfwxfuqusfzwbls

# n8n Webhook
VITE_N8N_WEBHOOK_URL=https://slimquality-n8n.wpjtfd.easypanel.host/webhook/...

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DETAILED_LOGGING=true
VITE_ENABLE_MONITORING=false
```

### 6.2 Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 8080
  },

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Coração Valente Conecta',
        short_name: 'Valente Conecta',
        theme_color: '#2563eb',
        display: 'standalone',
        icons: [...]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [...]
      }
    })
  ]
})
```

### 6.3 Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Paleta Coração Valente
        'cv-purple-soft': '#7C529C',
        'cv-blue-heart': '#54B2D8',
        'cv-purple-dark': '#4C2D80',
        'cv-green-mint': '#66CDAA',
        'cv-coral': '#FA8072',
        'cv-yellow-soft': '#F0E68C',
        'cv-off-white': '#F5F5DC',
        'cv-gray-light': '#D3D3D3',
        'cv-gray-dark': '#4F4F4F'
      },
      fontFamily: {
        sans: ['Open Sans', 'Roboto', 'sans-serif']
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-in',
        'slide-up': 'slide-up 0.3s ease-out'
      }
    }
  }
}
```

### 6.4 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 7. BANCO DE DADOS

### 7.1 Principais Tabelas

#### profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  user_type TEXT CHECK (user_type IN ('usuario', 'parceiro', 'voluntario')),
  wallet_id TEXT,  -- Asaas Wallet ID para embaixadores
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

#### donations

```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('donation', 'subscription')),
  frequency TEXT CHECK (frequency IN ('monthly', 'yearly')),
  payment_method TEXT CHECK (payment_method IN ('pix', 'credit_card')),
  payment_id TEXT,  -- Asaas payment ID
  status TEXT,
  ambassador_code TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

#### diagnosis_sessions

```sql
CREATE TABLE diagnosis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
)
```

#### relatorios_diagnostico

```sql
CREATE TABLE relatorios_diagnostico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  session_id UUID REFERENCES diagnosis_sessions(id),
  pdf_url TEXT,
  diagnosis_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
)
```

#### ambassador_links

```sql
CREATE TABLE ambassador_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  code TEXT UNIQUE NOT NULL,
  name TEXT,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
)
```

#### ambassador_performance

```sql
CREATE TABLE ambassador_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  total_clicks INTEGER DEFAULT 0,
  total_donations INTEGER DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  level TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
)
```

#### appointments

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  partner_id UUID REFERENCES profiles(id),
  scheduled_at TIMESTAMP NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

#### partners

```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  specialization TEXT,
  bio TEXT,
  credentials TEXT[],
  rating DECIMAL(3,2),
  active BOOLEAN DEFAULT true
)
```

### 7.2 Storage Buckets

| Bucket | Descrição | Políticas |
|--------|-----------|-----------|
| **diagnosis-reports** | PDFs de diagnóstico | Usuário acessa apenas seus arquivos |
| **user-uploads** | Uploads diversos | Privado por usuário |
| **public-assets** | Imagens públicas | Leitura pública |

### 7.3 Edge Functions

Localização: `supabase/functions/`

| Function | Descrição |
|----------|-----------|
| **process-payment** | Processa pagamento via Asaas |
| **process-payment-split** | Processa com split de comissões |
| **asaas-webhook** | Recebe webhooks do Asaas |
| **diagnostico-webhook** | Proxy para n8n |
| **links-generate** | Gera links de embaixador |

---

## 8. PWA (PROGRESSIVE WEB APP)

### 8.1 Manifest

```json
{
  "name": "Coração Valente Conecta",
  "short_name": "Valente Conecta",
  "description": "Triagem comportamental, serviços e doações",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#2563eb",
  "background_color": "#fefefe",
  "icons": [
    {
      "src": "/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 8.2 Service Worker (Workbox)

**Cache Strategies:**

```typescript
// Estratégias de cache
runtimeCaching: [
  {
    urlPattern: /^https:\/\/fonts\.googleapis\.com/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts-cache',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365  // 1 ano
      }
    }
  },
  {
    urlPattern: /^https:\/\/corrklfwxfuqusfzwbls\.supabase\.co/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'supabase-api-cache',
      expiration: {
        maxAgeSeconds: 5 * 60  // 5 minutos
      }
    }
  }
]
```

### 8.3 Componentes PWA

```typescript
// src/components/PWAInstallPrompt.tsx
// Exibe prompt de instalação quando disponível

// src/components/PWAUpdateNotification.tsx
// Notifica quando há atualização disponível

// src/hooks/usePWA.tsx
// Hook para gerenciar estado PWA
usePWA() → {
  isInstalled: boolean
  canInstall: boolean
  needsUpdate: boolean
  install: () => Promise<void>
  update: () => void
}
```

### 8.4 Offline Support

- Páginas cacheadas ficam disponíveis offline
- `offline.html` como fallback
- Sincronização quando voltar online
- Indicador visual de status de conexão

---

## 9. FLUXOS PRINCIPAIS

### 9.1 Fluxo de Doação Completo

```
┌──────────────────────────────────────────────────────────────┐
│ 1. INÍCIO                                                    │
│    Usuário clica "Apoiar" na home                           │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 2. SELEÇÃO DE TIPO (DonationScreen)                         │
│    □ Doação Única                                            │
│    □ Mantenedor (Assinatura)                                 │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 3. SELEÇÃO DE VALOR (AmountSelector)                        │
│    □ R$ 5  □ R$ 10  □ R$ 20  □ Custom                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 4. DADOS DO DOADOR (DonorInformationForm)                   │
│    - Nome completo                                           │
│    - Email                                                   │
│    - CPF/CNPJ                                                │
│    - Telefone                                                │
│    - Código embaixador (opcional)                           │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 5. MÉTODO DE PAGAMENTO (PaymentMethodSelector)              │
│    □ PIX                                                     │
│    □ Cartão de Crédito                                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐       ┌────────▼────────────┐
│ 6a. PIX        │       │ 6b. CARTÃO          │
│ - QR Code      │       │ - Número            │
│ - Copia/Cola   │       │ - Validade          │
│ - Polling      │       │ - CVV               │
└───────┬────────┘       └────────┬────────────┘
        │                         │
        └────────────┬────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 7. PROCESSAMENTO                                             │
│    POST /supabase/functions/process-payment-split            │
│    - Cria cliente no Asaas                                   │
│    - Cria cobrança com split                                 │
│    - Retorna payment_id                                      │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 8. ASAAS PROCESSA                                            │
│    - Valida pagamento                                        │
│    - Distribui split automaticamente                         │
│    - Envia webhook                                           │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 9. WEBHOOK CONFIRMAÇÃO                                       │
│    POST /supabase/functions/asaas-webhook                    │
│    - Event: PAYMENT_RECEIVED                                 │
│    - Salva em tabela 'donations'                             │
│    - Atualiza ambassador_performance                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 10. FINALIZAÇÃO                                              │
│     - Email de confirmação                                   │
│     - Toast de sucesso                                       │
│     - Histórico atualizado                                   │
│     - Redirecionamento                                       │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 Fluxo de Diagnóstico por IA

```
┌──────────────────────────────────────────────────────────────┐
│ 1. AUTENTICAÇÃO (useDiagnosisAuth)                          │
│    - Verifica se usuário está logado                        │
│    - Valida acesso ao diagnóstico                           │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 2. INICIAR SESSÃO                                            │
│    - Navega para /diagnosis/chat                            │
│    - Sistema cria diagnosis_session em BD                    │
│    - Retorna session_id                                      │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 3. INTRO (AIIntroScreen)                                     │
│    "Olá! Vou fazer algumas perguntas sobre seu              │
│     comportamento para criar um diagnóstico inicial..."      │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 4. CONVERSA (AIChatInterface)                               │
│    ┌──────────────────────────────────────────┐             │
│    │ IA: Qual sua idade?                      │             │
│    │ Usuário: 35 anos                         │             │
│    │ IA: Tem notado algum comportamento...    │             │
│    │ Usuário: Sim, tenho sentido...          │             │
│    └──────────────────────────────────────────┘             │
│                                                              │
│    A cada mensagem:                                          │
│    ┌─────────────────────────────────────┐                  │
│    │ 1. sendMessage(text)                │                  │
│    │ 2. POST /webhook-proxy → n8n        │                  │
│    │ 3. n8n processa com IA              │                  │
│    │ 4. Retorna resposta + is_final      │                  │
│    └─────────────────────────────────────┘                  │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 5. FINALIZAÇÃO (is_final = true)                            │
│    - IA retorna diagnosis_data estruturado                   │
│    - Frontend extrai dados                                   │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 6. GERAÇÃO DE PDF                                            │
│    ┌──────────────────────────────────────┐                 │
│    │ 1. Template HTML com dados           │                 │
│    │ 2. html2canvas → Canvas              │                 │
│    │ 3. jsPDF → PDF blob                  │                 │
│    │ 4. Upload Supabase Storage           │                 │
│    │ 5. Salva URL em relatorios_diagnostico│               │
│    └──────────────────────────────────────┘                 │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 7. RESULTADO (AIResultScreen)                               │
│    - Exibe análise completa                                  │
│    - Recomendações                                           │
│    - Próximos passos                                         │
│    - Botão "Baixar PDF"                                      │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 8. ACESSO POSTERIOR                                          │
│    /diagnosis/reports → ReportsList                          │
│    - Lista todos os relatórios do usuário                    │
│    - Download via URL assinada                               │
└──────────────────────────────────────────────────────────────┘
```

### 9.3 Fluxo de Embaixador

```
┌──────────────────────────────────────────────────────────────┐
│ 1. SETUP EMBAIXADOR                                          │
│    - Usuário tipo 'voluntario'                              │
│    - Acessa AmbassadorDashboard                             │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 2. CONFIGURAR WALLET ID                                      │
│    - AmbassadorWalletForm                                    │
│    - Insere Wallet ID do Asaas                              │
│    - Sistema valida e salva                                  │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 3. GERAR LINK (LinkGenerator)                               │
│    - Nome do link: "Campanha Natal"                         │
│    - Sistema gera código único: ABC123                       │
│    - URL: /landing?ref=ABC123                               │
│    - Salvo em ambassador_links                               │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 4. COMPARTILHAR                                              │
│    - WhatsApp, Instagram, Facebook                          │
│    - Email, SMS                                              │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 5. PESSOA CLICA LINK                                         │
│    - Acessa /landing?ref=ABC123                             │
│    - Sistema rastreia clique                                 │
│    - Incrementa ambassador_links.clicks                      │
│    - Cookie/localStorage salva ref                           │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 6. DOAÇÃO COM REFERÊNCIA                                     │
│    - Pessoa faz doação                                       │
│    - Sistema detecta ref no storage                          │
│    - Aplica split com 20% para embaixador                    │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 7. PROCESSAMENTO SPLIT                                       │
│    ┌──────────────────────────────────────┐                 │
│    │ Instituto: 70%                       │                 │
│    │ Embaixador: 20% → Wallet ID          │                 │
│    │ Admin: 10%                           │                 │
│    └──────────────────────────────────────┘                 │
│    - Asaas distribui automaticamente                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 8. ATUALIZAÇÃO PERFORMANCE                                   │
│    - Incrementa total_donations                              │
│    - Soma total_amount                                       │
│    - Recalcula nível (bronze/prata/ouro)                    │
│    - Atualiza ambassador_performance                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 9. DASHBOARD ATUALIZADO                                      │
│    - Total de cliques                                        │
│    - Total de doações geradas                                │
│    - Valor total arrecadado                                  │
│    - Taxa de conversão                                       │
│    - Gráficos de evolução                                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. SEGURANÇA

### 10.1 Autenticação

- **Supabase Auth** (OAuth 2.0 + JWT)
- Tokens de sessão seguros
- Refresh tokens automáticos
- Password hashing (bcrypt)

### 10.2 Autorização (RLS)

```sql
-- Exemplo de política RLS
CREATE POLICY "users_own_data"
ON donations FOR ALL
USING (auth.uid() = user_id);
```

### 10.3 Proteção de Dados

- **Cartões de crédito**: Tokenizados via Asaas (PCI-DSS)
- **Dados pessoais**: Criptografados em trânsito (HTTPS)
- **Senhas**: Hasheadas (nunca armazenadas em plaintext)
- **APIs**: Rate limiting via Supabase

### 10.4 CORS e CSP

- CORS configurado para domínios permitidos
- CSP headers em produção
- Validação de origem em webhooks

---

## 11. PERFORMANCE

### 11.1 Otimizações

- **Code Splitting**: Lazy loading de rotas
- **Image Optimization**: Sharp para redimensionamento
- **CSS Purging**: Tailwind remove classes não usadas
- **Caching**: Workbox + TanStack Query
- **Bundle Size**: Análise via Vite

### 11.2 Métricas

- **Lighthouse Score**: 90+ (Performance)
- **FCP**: < 1.8s (First Contentful Paint)
- **LCP**: < 2.5s (Largest Contentful Paint)
- **TTI**: < 3.8s (Time to Interactive)

---

## 12. DEPLOY E CI/CD

### 12.1 Build

```bash
npm run build
# Output: dist/
```

### 12.2 Hosting

- **Frontend**: Vercel (via Lovable)
- **Backend**: Supabase (managed)
- **Edge Functions**: Supabase Edge Runtime (Deno)

### 12.3 Ambientes

| Ambiente | URL | Branch |
|----------|-----|--------|
| Produção | valente-conecta.app | main |
| Desenvolvimento | dev.valente-conecta.app | develop |

---

## 13. MONITORAMENTO

### 13.1 Analytics

```typescript
// src/services/analytics.service.ts
analyticsService.track('DONATION_COMPLETED', {
  amount: 100,
  method: 'pix'
})
```

### 13.2 Logging

```typescript
// src/services/logging.service.ts
logger.info('Payment processed', { paymentId })
logger.error('Chat failed', { error })
```

### 13.3 Health Checks

```sql
-- Tabela: monitoring_health_checks
-- Verifica status de sistemas críticos
```

---

## 14. TESTES

### 14.1 Framework

- **Vitest**: Testes unitários
- **Testing Library**: Testes de componentes
- **Playwright**: E2E (futuro)

### 14.2 Cobertura

```bash
npm run test:coverage
# Target: 80%+
```

---

## 15. DOCUMENTAÇÃO ADICIONAL

Veja também:

- `/docs/architecture.md` - Arquitetura detalhada
- `/docs/api-documentation.md` - APIs
- `/docs/database.md` - Schema de BD
- `/docs/business-rules.md` - Regras de negócio
- `/docs/PWA_IMPLEMENTATION.md` - PWA

---

## 16. SCRIPTS ÚTEIS

```json
{
  "dev": "vite",                        // Desenvolvimento
  "build": "tsc && vite build",         // Build produção
  "preview": "vite preview",            // Preview build
  "test": "vitest",                     // Rodar testes
  "lint": "eslint .",                   // Linting
  "validate:integration": "tsx ..."     // Validar integrações
}
```

---

## 17. CONTATOS E SUPORTE

- **Repositório**: GitHub (privado)
- **Supabase Project**: corrklfwxfuqusfzwbls
- **Asaas Account**: Instituto Coração Valente

---

## CONCLUSÃO

O **Valente Conecta** é uma aplicação web moderna, escalável e bem-estruturada que serve o Instituto Coração Valente com funcionalidades completas de:

✅ Triagem comportamental por IA
✅ Sistema de doações com split inteligente
✅ Embaixadores com rastreamento
✅ PWA instalável com suporte offline
✅ Mobile-first design
✅ Arquitetura serverless (Supabase)

A aplicação está em **produção** e pronta para crescimento, com base sólida para futuras expansões.

---

**Documento gerado em:** 25 de Outubro de 2025
**Versão do Sistema:** Produção
**Última atualização do código:** commit `3c0ebef`
