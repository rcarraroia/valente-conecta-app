# Stack Tecnológica e Ferramentas

## Frontend Stack

- **React 18.3.1** - Biblioteca principal para UI
- **TypeScript** - Tipagem estática obrigatória
- **Vite** - Build tool e servidor de desenvolvimento
- **React Router DOM 6.26.2** - Roteamento SPA
- **Tailwind CSS** - Framework CSS utilitário (mobile-first)
- **shadcn/ui (Radix UI)** - Componentes acessíveis
- **TanStack Query 5.56.2** - Gerenciamento de estado servidor
- **React Hook Form 7.53.0** - Formulários performáticos
- **Zod 3.23.8** - Validação de esquemas

## Backend & Database

- **Supabase** - Backend as a Service
- **PostgreSQL 15** - Banco de dados relacional
- **Supabase Auth** - Sistema de autenticação
- **Edge Functions (Deno)** - Serverless functions
- **Row Level Security (RLS)** - Controle de acesso granular

## Integrações Externas

- **Asaas** - Gateway de pagamento brasileiro
- **OpenAI/Gemini** - IA para pré-diagnóstico
- **Resend** - Envio de emails (configurável)

## Comandos Essenciais

### Desenvolvimento
```bash
npm run dev              # Servidor de desenvolvimento (porta 8080)
npm run build           # Build de produção
npm run build:dev       # Build de desenvolvimento
npm run preview         # Preview do build
```

### Testes
```bash
npm run test            # Executar testes unitários
npm run test:ui         # Interface visual dos testes
npm run test:coverage   # Cobertura de testes
npm run test:e2e        # Testes de integração
```

### Validação e Linting
```bash
npm run lint                        # ESLint
npm run validate:integration        # Validar integração
npm run validate:integration:verbose # Validação detalhada
npm run validate:integration:export  # Exportar relatório
```

### Supabase Local
```bash
supabase start          # Iniciar ambiente local
supabase stop           # Parar ambiente local
supabase status         # Status dos serviços
supabase db reset       # Reset do banco local
```

### Acesso ao Banco (quando necessário)
```bash
# Verificar disponibilidade do psycopg2
python -c "import psycopg2; print('psycopg2 available')"

# String de conexão Supabase
postgresql://postgres.corrklfwxfuqusfzwbls:ghJSz3aKXvAfUFgd@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

## Configurações Importantes

### Alias de Importação
```typescript
"@/*": ["./src/*"]  // Alias para imports relativos
```

### TypeScript Config
- `noImplicitAny: false` - Permite any implícito
- `noUnusedParameters: false` - Não força uso de parâmetros
- `strictNullChecks: false` - Null checks relaxados
- `skipLibCheck: true` - Pula verificação de libs

### Tailwind Customizado
- Paleta de cores específica do Instituto Coração Valente
- Fontes: Open Sans, Roboto
- Animações customizadas: fade-in, slide-up, accordion
- Mobile-first approach obrigatório

## Padrões de Desenvolvimento

### Estrutura de Componentes
- Atomic Design (atoms, molecules, organisms)
- Composition over Inheritance
- Custom hooks para lógica reutilizável

### Gerenciamento de Estado
- TanStack Query para estado servidor
- React Hook Form para formulários
- Context API para estado global quando necessário

### Validação
- Zod schemas obrigatórios para todos os formulários
- Validação client-side e server-side
- Mensagens de erro em português brasileiro

## Lições Aprendidas

- **Migrações**: Sempre analisar o estado atual do banco antes de executar scripts de migração para evitar conflitos com objetos já existentes
- **Responsividade**: Mobile-first é obrigatório, não opcional
- **Performance**: Code splitting e lazy loading para componentes pesados
- **Segurança**: RLS policies sempre ativas, nunca bypass de segurança