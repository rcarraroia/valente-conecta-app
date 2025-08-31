# Estrutura do Projeto e Organização

## Estrutura de Pastas Principal

```
├── docs/                    # Documentação técnica completa
├── src/                     # Código fonte da aplicação
├── supabase/               # Configurações e migrações do Supabase
├── sql/                    # Scripts SQL e migrações
├── scripts/                # Scripts de automação e validação
├── reports/                # Relatórios gerados automaticamente
└── public/                 # Assets estáticos
```

## Organização do Código Fonte (src/)

```
src/
├── components/             # Componentes React organizados por funcionalidade
│   ├── ui/                # Componentes base (shadcn/ui)
│   ├── auth/              # Autenticação e autorização
│   ├── donation/          # Sistema de doações
│   ├── professional/      # Dashboard profissional
│   ├── profile/           # Perfil do usuário
│   └── [feature]/         # Outros componentes por funcionalidade
├── hooks/                 # Custom hooks reutilizáveis
├── pages/                 # Páginas principais da aplicação
├── lib/                   # Utilitários e configurações
├── types/                 # Definições TypeScript
├── schemas/               # Schemas Zod para validação
├── services/              # Serviços e APIs
├── utils/                 # Funções utilitárias
├── workers/               # Web Workers (se aplicável)
├── integrations/          # Integrações externas
│   └── supabase/         # Cliente e tipos do Supabase
└── __tests__/            # Testes organizados por tipo
    ├── unit/             # Testes unitários
    ├── integration/      # Testes de integração
    └── e2e/              # Testes end-to-end
```

## Convenções de Nomenclatura

### Arquivos e Pastas
- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useUserProfile.ts`)
- **Utilitários**: camelCase (`formatCurrency.ts`)
- **Tipos**: PascalCase (`UserProfile.types.ts`)
- **Schemas**: camelCase com sufixo `.schema` (`userProfile.schema.ts`)
- **Pastas**: kebab-case (`user-profile/`)

### Componentes React
```typescript
// Estrutura padrão de componente
interface ComponentProps {
  // Props tipadas
}

export const ComponentName = ({ prop }: ComponentProps) => {
  // Hooks no topo
  // Lógica do componente
  // Return JSX
};
```

### Custom Hooks
```typescript
// Padrão de custom hook
export const useFeatureName = () => {
  // Estado e lógica
  // Return interface limpa
  return {
    data,
    isLoading,
    error,
    actions: { create, update, delete }
  };
};
```

## Organização por Domínio

### Autenticação (`auth/`)
- Login/Register components
- Profile management
- User type handling (comum/parceiro)

### Sistema Médico (`professional/`)
- Professional dashboard
- Appointment scheduling
- Schedule management
- Patient interaction

### Pré-Diagnóstico (`diagnosis/`)
- AI chat interface
- Question flow management
- Results display
- Session management

### Doações (`donation/`)
- Payment forms
- Asaas integration
- Split payment logic
- Ambassador tracking

### Biblioteca (`library/`)
- Content categorization
- Resource management
- Search functionality

## Configurações e Setup

### Supabase (`supabase/`)
```
supabase/
├── config.toml           # Configuração local
├── functions/            # Edge Functions
├── migrations/           # Migrações do banco
└── storage_setup_instructions.md
```

### SQL Scripts (`sql/`)
```
sql/
├── migrations/           # Migrações organizadas
└── README.md            # Documentação das migrações
```

## Padrões de Importação

### Ordem de Imports
1. React e bibliotecas externas
2. Componentes internos (usando alias @/)
3. Tipos e interfaces
4. Utilitários e constantes

```typescript
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';

import type { UserProfile } from '@/types/user';
import { formatCurrency } from '@/utils/currency';
```

### Alias de Importação
- `@/` - Raiz do src/
- `@/components` - Componentes
- `@/hooks` - Custom hooks
- `@/lib` - Utilitários
- `@/types` - Tipos TypeScript

## Organização de Testes

### Estrutura de Testes
```
src/__tests__/
├── unit/                 # Testes unitários por componente
├── integration/          # Testes de fluxo completo
├── e2e/                 # Testes end-to-end
└── __mocks__/           # Mocks compartilhados
```

### Convenções de Teste
- Arquivos de teste: `ComponentName.test.tsx`
- Mocks: `ComponentName.mock.ts`
- Fixtures: `ComponentName.fixture.ts`

## Documentação (`docs/`)

### Estrutura da Documentação
- `README.md` - Visão geral do sistema
- `architecture.md` - Arquitetura técnica
- `business-rules.md` - Regras de negócio
- `database.md` - Estrutura do banco
- `security.md` - Políticas de segurança
- `api-documentation.md` - APIs e Edge Functions
- `development-guide.md` - Guia de desenvolvimento

## Regras de Organização

### Componentes
- Um componente por arquivo
- Componentes complexos em pastas próprias
- Index.ts para exports limpos
- Props interface sempre tipada

### Hooks
- Lógica reutilizável extraída em hooks
- Hooks específicos por funcionalidade
- Interface de retorno consistente

### Tipos
- Tipos compartilhados em `/types`
- Tipos específicos junto ao componente
- Enums para valores fixos

### Utilitários
- Funções puras em `/utils`
- Configurações em `/lib`
- Constantes em arquivos dedicados

## Assets e Recursos

### Public (`public/`)
```
public/
├── favicon.ico           # Ícone do site
├── placeholder.svg       # Placeholder padrão
├── robots.txt           # SEO
└── lovable-uploads/     # Uploads do Lovable
```

### Convenções de Assets
- Imagens: formato otimizado (WebP preferível)
- Ícones: usar Lucide React
- Fontes: Open Sans, Roboto (via CDN)
- Cores: usar variáveis CSS customizadas