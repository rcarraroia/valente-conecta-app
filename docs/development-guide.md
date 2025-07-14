
# Guia de Desenvolvimento

## Configuração do Ambiente

### 1. Requisitos do Sistema
```bash
# Ferramentas necessárias
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git >= 2.40.0
- Supabase CLI >= 1.100.0
- Deno >= 1.40.0 (para Edge Functions)
```

### 2. Clone e Instalação
```bash
# Clone do repositório
git clone <repository-url>
cd instituto-coracao-valente

# Instalação de dependências
npm install

# Configuração do Supabase
npx supabase start
npx supabase db reset
```

### 3. Variáveis de Ambiente
```bash
# .env.local (desenvolvimento)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key

# Supabase Secrets (produção)
ASAAS_API_KEY=your-asaas-key
OPENAI_API_KEY=your-openai-key
RESEND_API_KEY=your-resend-key
```

## Estrutura do Projeto

### 1. Organização de Pastas
```
src/
├── components/              # Componentes React
│   ├── ui/                 # Componentes base (shadcn/ui)
│   ├── auth/               # Autenticação
│   ├── donation/           # Sistema de doações
│   ├── professional/       # Dashboard profissional
│   ├── profile/            # Perfil do usuário
│   └── [feature]/          # Outros recursos
├── hooks/                  # Custom hooks
├── lib/                    # Utilitários e helpers
├── pages/                  # Páginas da aplicação
├── types/                  # Definições TypeScript
└── integrations/           # Clientes externos
    └── supabase/           # Cliente Supabase
```

### 2. Padrões de Nomenclatura
```typescript
// Componentes: PascalCase
const UserProfile = () => {};
const DonationForm = () => {};

// Hooks: camelCase com prefixo 'use'
const useUserData = () => {};
const useProfessionalDashboard = () => {};

// Utilitários: camelCase
const formatCurrency = () => {};
const validateEmail = () => {};

// Constantes: UPPER_SNAKE_CASE
const API_ENDPOINTS = {};
const DEFAULT_VALUES = {};

// Tipos: PascalCase
interface UserProfile {}
type PaymentMethod = 'PIX' | 'CREDIT_CARD';
```

## Desenvolvimento Frontend

### 1. Componentes com shadcn/ui
```typescript
// Sempre use componentes shadcn/ui como base
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MyComponent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título do Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Digite aqui..." />
        <Button>Enviar</Button>
      </CardContent>
    </Card>
  );
};
```

### 2. Formulários com React Hook Form + Zod
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  age: z.number().min(1).max(120)
});

type FormData = z.infer<typeof formSchema>;

const MyForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 0
    }
  });

  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Campos do formulário */}
    </form>
  );
};
```

### 3. Custom Hooks Pattern
```typescript
// hooks/useUserProfile.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserProfile = () => {
  // Query para buscar dados
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Mutation para atualizar dados  
  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile?.id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    }
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending
  };
};
```

### 4. Estilização com Tailwind CSS
```typescript
// Use classes semânticas do design system
const Component = () => (
  <div className="bg-cv-off-white text-cv-dark-green">
    <h1 className="text-cv-coral font-bold text-2xl">
      Título Principal
    </h1>
    <p className="text-cv-gray-light text-sm">
      Texto secundário
    </p>
  </div>
);

// Componentes responsivos
const ResponsiveComponent = () => (
  <div className="
    grid 
    grid-cols-1 
    md:grid-cols-2 
    lg:grid-cols-3 
    gap-4 
    p-4 
    md:p-6 
    lg:p-8
  ">
    {/* Conteúdo */}
  </div>
);
```

## Desenvolvimento Backend (Edge Functions)

### 1. Estrutura Base de Function
```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  // Definir interface da requisição
}

interface ResponseBody {
  // Definir interface da resposta
}

const handler = async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Autenticação (se necessária)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Validar entrada
    const body: RequestBody = await req.json();
    
    // Lógica principal
    const result = await processRequest(body);
    
    // Resposta de sucesso
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);
```

### 2. Validação de Dados
```typescript
import { z } from 'https://deno.land/x/zod/mod.ts';

// Schema de validação
const requestSchema = z.object({
  email: z.string().email(),
  amount: z.number().min(500), // R$ 5,00 em centavos
  payment_method: z.enum(['PIX', 'CREDIT_CARD'])
});

// Uso na function
const validateRequest = (body: unknown) => {
  try {
    return requestSchema.parse(body);
  } catch (error) {
    throw new Error(`Dados inválidos: ${error.message}`);
  }
};
```

### 3. Integração com Supabase
```typescript
// Cliente autenticado
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Operações no banco
const createDonation = async (donationData: DonationData) => {
  const { data, error } = await supabase
    .from('donations')
    .insert(donationData)
    .select()
    .single();
    
  if (error) {
    throw new Error(`Erro ao criar doação: ${error.message}`);
  }
  
  return data;
};
```

## Banco de Dados

### 1. Migrations
```sql
-- supabase/migrations/YYYYMMDD_description.sql
-- Sempre documentar o propósito da migration

-- Criar nova tabela
CREATE TABLE public.my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- Política RLS
CREATE POLICY "Users can manage their own data"
  ON public.my_table
  FOR ALL
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_my_table_user_id ON public.my_table(user_id);
CREATE INDEX idx_my_table_created_at ON public.my_table(created_at);
```

### 2. Funções do Banco
```sql
-- Função reutilizável
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para usar a função
CREATE TRIGGER update_my_table_timestamp
  BEFORE UPDATE ON public.my_table
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();
```

### 3. Consultas Otimizadas
```typescript
// Use select específico ao invés de *
const { data } = await supabase
  .from('profiles')
  .select('id, full_name, email')
  .eq('user_type', 'parceiro')
  .eq('is_active', true)
  .order('created_at', { ascending: false })
  .limit(10);

// Use relacionamentos do Supabase
const { data } = await supabase
  .from('appointments')
  .select(`
    id,
    appointment_date,
    status,
    partner:partners(full_name, specialty),
    user:profiles(full_name, phone)
  `)
  .eq('user_id', userId);
```

## Testes

### 1. Configuração de Testes
```bash
# Instalar dependências de teste
npm install -D @testing-library/react @testing-library/jest-dom vitest jsdom

# Configurar Vitest
# vite.config.ts
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    exclude: [...configDefaults.exclude, 'e2e/*']
  }
});
```

### 2. Testes de Componentes
```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Button } from '../ui/button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 3. Testes de Hooks
```typescript
// src/hooks/__tests__/useUserProfile.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserProfile } from '../useUserProfile';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({
          data: { id: '1', name: 'Test User' },
          error: null
        }))
      }))
    }))
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useUserProfile', () => {
  it('loads user profile data', async () => {
    const { result } = renderHook(() => useUserProfile(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.profile).toBeDefined();
    });

    expect(result.current.profile).toEqual({
      id: '1',
      name: 'Test User'
    });
  });
});
```

### 4. Testes de Edge Functions
```typescript
// supabase/functions/process-payment/test.ts
import { assertEquals, assertExists } from "https://deno.land/std@0.190.0/testing/asserts.ts";

Deno.test("Process Payment - Valid PIX Payment", async () => {
  const response = await fetch('http://localhost:8000/functions/v1/process-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    },
    body: JSON.stringify({
      amount: 5000,
      donor_email: 'test@example.com',
      donor_name: 'Test User',
      payment_method: 'PIX'
    })
  });

  assertEquals(response.status, 200);
  
  const result = await response.json();
  assertEquals(result.success, true);
  assertExists(result.payment_id);
  assertExists(result.pix_qr_code);
});
```

## Deploy e CI/CD

### 1. Scripts de Deploy
```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "db:reset": "supabase db reset",
    "db:migrate": "supabase db push",
    "functions:serve": "supabase functions serve",
    "functions:deploy": "supabase functions deploy"
  }
}
```

### 2. GitHub Actions (Exemplo)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase db push --linked
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      - run: supabase functions deploy
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

### 3. Checklist de Deploy
```markdown
## Pre-Deploy Checklist

### Database
- [ ] Migrations testadas em staging
- [ ] Backup realizado
- [ ] Rollback plan documentado

### Frontend  
- [ ] Build sem erros
- [ ] Testes passando
- [ ] Performance verificada

### Backend
- [ ] Edge Functions deployadas
- [ ] Secrets configurados
- [ ] Health checks funcionando

### Monitoring
- [ ] Alerts configurados
- [ ] Logs sendo coletados
- [ ] Métricas disponíveis
```

## Debugging e Troubleshooting

### 1. Debug no Frontend
```typescript
// React Query Devtools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      {/* App components */}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}

// Console logs estruturados
const debugLog = (message: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🐛 ${message}`);
    console.log('Data:', data);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
};
```

### 2. Debug de Edge Functions
```typescript
// Logs estruturados
const logger = {
  debug: (message: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'debug',
      message,
      data,
      timestamp: new Date().toISOString()
    }));
  },
  
  error: (message: string, error: any) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }));
  }
};

// Uso
logger.debug('Processing payment', { amount, method });
```

### 3. Debug de Banco de Dados
```sql
-- Verificar performance de queries
EXPLAIN ANALYZE SELECT * FROM profiles WHERE user_type = 'parceiro';

-- Verificar locks e conexões ativas
SELECT 
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

## Best Practices

### 1. Código Limpo
```typescript
// Use nomes descritivos
const calculateAmbassadorCommission = (amount: number, rate: number) => {
  return Math.round(amount * rate);
};

// Evite magic numbers
const COMMISSION_RATES = {
  AMBASSADOR: 0.1,
  ADMIN: 0.1,
  INSTITUTE: 0.8
} as const;

// Prefira composição
const withAuth = <T extends {}>(Component: React.ComponentType<T>) => {
  return (props: T) => {
    const { user } = useAuth();
    
    if (!user) {
      return <LoginPrompt />;
    }
    
    return <Component {...props} />;
  };
};
```

### 2. Performance
```typescript
// Use React.memo para componentes caros
const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <ComplexVisualization data={data} />;
});

// Use useMemo para cálculos pesados
const processedData = useMemo(() => {
  return expensiveDataTransformation(rawData);
}, [rawData]);

// Use useCallback para funções em props
const handleSubmit = useCallback((data: FormData) => {
  submitData(data);
}, [submitData]);
```

### 3. Segurança
```typescript
// Sempre validar entrada
const validateUserInput = (input: unknown): SafeInput => {
  const schema = z.object({
    email: z.string().email(),
    amount: z.number().positive()
  });
  
  return schema.parse(input);
};

// Sanitizar output
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html);
};

// Use environment variables para secrets
const API_KEY = process.env.VITE_API_KEY;
if (!API_KEY) {
  throw new Error('Missing API_KEY environment variable');
}
```

### 4. Acessibilidade
```typescript
// Use semantic HTML
const Modal = ({ isOpen, onClose, children }) => (
  <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 id="modal-title">Modal Title</h2>
    {children}
    <button onClick={onClose} aria-label="Fechar modal">
      ×
    </button>
  </div>
);

// Forneça alternativas para elementos visuais
const LoadingSpinner = () => (
  <div 
    className="animate-spin rounded-full h-8 w-8 border-b-2"
    aria-label="Carregando..."
    role="status"
  >
    <span className="sr-only">Carregando...</span>
  </div>
);
```

## Recursos e Documentação

### 1. Links Úteis
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev)

### 2. Ferramentas de Desenvolvimento
- **VS Code Extensions**: TypeScript, Tailwind CSS, ES7+ Snippets
- **Browser DevTools**: React DevTools, React Query DevTools
- **Database Tools**: pgAdmin, DBeaver, Supabase Dashboard
- **API Testing**: Postman, Insomnia, Thunder Client

### 3. Comunidade e Suporte
- **Discord**: Lovable Community
- **GitHub Issues**: Para bugs e feature requests
- **Stack Overflow**: Para questões técnicas
- **Documentation**: Este repositório de docs
