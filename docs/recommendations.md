
# Recomendações e Melhorias

## Visão Geral

Baseado na análise completa do sistema Instituto Coração Valente, este documento apresenta recomendações estratégicas para otimização de performance, segurança, arquitetura e experiência do usuário.

## 1. Performance e Otimização

### 1.1 Otimizações Críticas - Alta Prioridade

#### Cache e Estado
```typescript
// Implementar cache Redis para queries frequentes
const cacheConfig = {
  redis: {
    host: 'redis-cluster-endpoint',
    ttl: {
      userProfiles: 900,      // 15 minutos
      partnersList: 3600,     // 1 hora
      libraryContent: 7200,   // 2 horas
      newsArticles: 1800      // 30 minutos
    }
  }
};

// Cache strategy para React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutos
      cacheTime: 10 * 60 * 1000,   // 10 minutos
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error.status === 404) return false;
        return failureCount < 3;
      }
    }
  }
});
```

#### Otimização de Queries N+1
```sql
-- Problemas identificados e soluções

-- ❌ Problema: Buscar agendamentos + dados do parceiro
SELECT * FROM appointments WHERE user_id = $1;
-- Para cada agendamento: SELECT * FROM partners WHERE id = $2;

-- ✅ Solução: Query única com JOIN
SELECT 
  a.*,
  p.full_name as partner_name,
  p.specialty,
  p.professional_photo_url
FROM appointments a
JOIN partners p ON p.id = a.partner_id
WHERE a.user_id = $1;

-- Implementar no Supabase
const { data } = await supabase
  .from('appointments')
  .select(`
    *,
    partner:partners(full_name, specialty, professional_photo_url)
  `)
  .eq('user_id', userId);
```

#### Lazy Loading e Code Splitting
```typescript
// Implementar lazy loading para páginas pesadas
const ProfessionalDashboard = lazy(() => 
  import('./components/professional/ProfessionalDashboard')
);

const AmbassadorDashboard = lazy(() => 
  import('./components/ambassador/AmbassadorDashboard')
);

// Route-based code splitting
const router = createBrowserRouter([
  {
    path: '/professional',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <ProfessionalDashboard />
      </Suspense>
    )
  }
]);

// Component-level lazy loading
const ExpensiveChart = lazy(() => import('./ExpensiveChart'));

const Dashboard = () => {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowChart(true)}>
        Mostrar Gráfico
      </button>
      
      {showChart && (
        <Suspense fallback={<div>Carregando gráfico...</div>}>
          <ExpensiveChart />
        </Suspense>
      )}
    </div>
  );
};
```

### 1.2 Índices de Banco de Dados Adicionais
```sql
-- Índices críticos para performance

-- Consultas de agendamento por data e profissional
CREATE INDEX CONCURRENTLY idx_appointments_partner_date_status 
ON appointments(partner_id, appointment_date, status) 
WHERE status IN ('pending', 'confirmed');

-- Busca de profissionais por especialidade e região (futuro)
CREATE INDEX CONCURRENTLY idx_partners_specialty_location 
ON partners(specialty, city) 
WHERE is_active = TRUE;

-- Performance de doações por embaixador
CREATE INDEX CONCURRENTLY idx_donations_ambassador_date 
ON donations(ambassador_link_id, donated_at) 
WHERE status = 'completed';

-- Busca de conteúdo por categoria e featured
CREATE INDEX CONCURRENTLY idx_library_resources_category_featured 
ON library_resources(category_id, is_featured, published_at) 
WHERE is_active = TRUE;

-- Diagnósticos por usuário e data
CREATE INDEX CONCURRENTLY idx_diagnostics_user_created 
ON diagnostics(user_id, created_at DESC);

-- Performance de links de embaixador
CREATE INDEX CONCURRENTLY idx_link_clicks_link_date 
ON link_clicks(link_id, clicked_at DESC);
```

### 1.3 Otimização de Assets
```typescript
// Implementar service worker para cache offline
// public/sw.js
const CACHE_NAME = 'instituto-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Image optimization com lazy loading
const OptimizedImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {loaded ? (
        <img 
          src={src} 
          alt={alt}
          loading="lazy"
          className="transition-opacity duration-300"
        />
      ) : (
        <div className="bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};
```

## 2. Segurança - Melhorias Críticas

### 2.1 Rate Limiting Avançado
```typescript
// Implementar rate limiting por usuário e endpoint
const rateLimitConfig = {
  donations: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hora
    message: 'Muitas tentativas de doação. Tente novamente em 1 hora.'
  },
  
  appointments: {
    maxRequests: 10,
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    message: 'Limite de agendamentos diário atingido.'
  },
  
  preDiagnosis: {
    maxRequests: 3,
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    message: 'Limite de pré-diagnósticos diário atingido.'
  },
  
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minuto
    message: 'Muitas requisições. Aguarde um momento.'
  }
};

// Edge Function rate limiter
const createRateLimiter = (config) => {
  const storage = new Map();
  
  return async (identifier: string) => {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    if (!storage.has(identifier)) {
      storage.set(identifier, []);
    }
    
    const requests = storage.get(identifier)
      .filter(timestamp => timestamp > windowStart);
    
    if (requests.length >= config.maxRequests) {
      throw new Error(config.message);
    }
    
    requests.push(now);
    storage.set(identifier, requests);
  };
};
```

### 2.2 Validação de Input Mais Rigorosa
```typescript
// Schemas de validação mais específicos
const medicalDataSchema = z.object({
  symptoms: z.array(z.string())
    .min(1, 'Pelo menos um sintoma é obrigatório')
    .max(10, 'Máximo 10 sintomas por sessão'),
    
  intensity: z.number()
    .int('Intensidade deve ser um número inteiro')
    .min(1, 'Intensidade mínima é 1')
    .max(10, 'Intensidade máxima é 10'),
    
  duration: z.string()
    .regex(/^(\d+)\s*(minutos?|horas?|dias?)$/i, 'Formato de duração inválido'),
    
  medicalHistory: z.string()
    .max(500, 'Histórico médico muito longo')
    .optional()
    .transform(val => val ? DOMPurify.sanitize(val) : val)
});

// Validação de dados financeiros
const paymentSchema = z.object({
  amount: z.number()
    .int('Valor deve ser em centavos')
    .min(500, 'Valor mínimo R$ 5,00')
    .max(100000000, 'Valor máximo R$ 1.000.000,00'),
    
  donor_email: z.string()
    .email('Email inválido')
    .transform(email => email.toLowerCase().trim()),
    
  donor_name: z.string()
    .min(2, 'Nome muito curto')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
    
  payment_method: z.enum(['PIX', 'CREDIT_CARD']),
  
  ambassador_code: z.string()
    .regex(/^[A-Z0-9]{8}$/, 'Código de embaixador inválido')
    .optional()
});
```

### 2.3 Logging e Auditoria Avançados
```sql
-- Tabela de auditoria completa
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para auditoria
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Função de trigger para auditoria automática
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### 2.4 Criptografia de Dados Sensíveis
```sql
-- Extensão para criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função para criptografar dados médicos
CREATE OR REPLACE FUNCTION encrypt_medical_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE 
    WHEN data IS NULL OR data = '' THEN data
    ELSE crypt(data, gen_salt('bf', 8))
  END;
END;
$$ LANGUAGE plpgsql;

-- Função para descriptografar
CREATE OR REPLACE FUNCTION decrypt_medical_data(encrypted_data TEXT, plain_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN encrypted_data = crypt(plain_text, encrypted_data);
END;
$$ LANGUAGE plpgsql;

-- Migração para criptografar dados existentes
ALTER TABLE profiles 
ADD COLUMN medical_conditions_encrypted TEXT,
ADD COLUMN medications_encrypted TEXT;

-- Migrar dados existentes
UPDATE profiles SET 
  medical_conditions_encrypted = encrypt_medical_data(medical_conditions),
  medications_encrypted = encrypt_medical_data(medications)
WHERE medical_conditions IS NOT NULL OR medications IS NOT NULL;
```

## 3. Arquitetura - Modernização

### 3.1 Implementação de Event Sourcing
```typescript
// Event store para auditoria completa
interface DomainEvent {
  id: string;
  aggregateId: string;
  eventType: string;
  eventData: Record<string, any>;
  metadata: {
    userId: string;
    timestamp: string;
    version: number;
  };
}

// Eventos de domínio específicos
interface DonationCreatedEvent extends DomainEvent {
  eventType: 'DONATION_CREATED';
  eventData: {
    amount: number;
    donor_email: string;
    payment_method: string;
    ambassador_code?: string;
  };
}

interface AppointmentScheduledEvent extends DomainEvent {
  eventType: 'APPOINTMENT_SCHEDULED';
  eventData: {
    partner_id: string;
    appointment_date: string;
    appointment_time: string;
  };
}

// Event store implementation
class EventStore {
  async appendEvent(event: DomainEvent): Promise<void> {
    await supabase.from('event_store').insert({
      id: event.id,
      aggregate_id: event.aggregateId,
      event_type: event.eventType,
      event_data: event.eventData,
      metadata: event.metadata,
      created_at: new Date().toISOString()
    });
  }
  
  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    const { data, error } = await supabase
      .from('event_store')
      .select('*')
      .eq('aggregate_id', aggregateId)
      .order('created_at');
      
    if (error) throw error;
    return data;
  }
}
```

### 3.2 Microserviços com Edge Functions
```typescript
// Separação por domínio
const services = {
  // Serviço de pagamentos
  payments: {
    functions: ['process-payment', 'asaas-webhook'],
    responsibilities: ['Processar pagamentos', 'Gerenciar splits', 'Webhooks']
  },
  
  // Serviço médico
  medical: {
    functions: ['diagnostico-iniciar', 'diagnostico-resposta'],
    responsibilities: ['Pré-diagnóstico', 'IA médica', 'Análise de sintomas']
  },
  
  // Serviço de agendamento
  scheduling: {
    functions: ['schedule-appointment', 'manage-appointment'],
    responsibilities: ['Agendar consultas', 'Gerenciar horários']
  },
  
  // Serviço de embaixadores
  ambassadors: {
    functions: ['links-generate', 'link-redirect'],
    responsibilities: ['Gerenciar links', 'Tracking', 'Performance']
  }
};

// Inter-service communication
class ServiceCommunication {
  async callService(service: string, endpoint: string, data: any) {
    const response = await supabase.functions.invoke(`${service}-${endpoint}`, {
      body: data
    });
    
    if (response.error) {
      throw new Error(`Service ${service} error: ${response.error.message}`);
    }
    
    return response.data;
  }
}
```

### 3.3 Database Sharding Strategy
```sql
-- Estratégia de sharding por usuário
CREATE SCHEMA shard_1;
CREATE SCHEMA shard_2;
CREATE SCHEMA shard_3;

-- Função para determinar shard do usuário
CREATE OR REPLACE FUNCTION get_user_shard(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  -- Simple modulo-based sharding
  RETURN 'shard_' || ((hashtext(user_id::text) % 3) + 1);
END;
$$ LANGUAGE plpgsql;

-- View para abstrair sharding
CREATE VIEW all_profiles AS
  SELECT *, 'shard_1' as shard FROM shard_1.profiles
  UNION ALL
  SELECT *, 'shard_2' as shard FROM shard_2.profiles  
  UNION ALL
  SELECT *, 'shard_3' as shard FROM shard_3.profiles;
```

### 3.4 CDN e Edge Computing
```typescript
// Configuração de CDN para assets estáticos
const cdnConfig = {
  images: 'https://cdn.institutovalente.org/images/',
  documents: 'https://cdn.institutovalente.org/docs/',
  videos: 'https://cdn.institutovalente.org/videos/',
  
  // Cache headers
  cacheControl: {
    images: 'public, max-age=31536000', // 1 ano
    documents: 'public, max-age=86400', // 1 dia
    api: 'public, max-age=300'          // 5 minutos
  }
};

// Edge computing para geolocalização
const getClosestProvider = async (userLocation: Location) => {
  const providers = [
    { region: 'us-east-1', latency: 50 },
    { region: 'sa-east-1', latency: 20 }, // Mais próximo do Brasil
    { region: 'eu-west-1', latency: 100 }
  ];
  
  return providers.sort((a, b) => a.latency - b.latency)[0];
};
```

## 4. User Experience (UX)

### 4.1 Progressive Web App (PWA)
```json
// public/manifest.json
{
  "name": "Instituto Coração Valente",
  "short_name": "CoraçãoValente",
  "description": "Plataforma de saúde cardiovascular",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#DC2626",
  "background_color": "#FEF7ED",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "orientation": "portrait",
  "categories": ["health", "medical"],
  "lang": "pt-BR"
}
```

```typescript
// Service Worker para funcionalidade offline
const CACHE_NAME = 'instituto-v1';
const OFFLINE_URLS = [
  '/',
  '/offline.html',
  '/profile',
  '/appointments'
];

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit
        if (response) return response;
        
        // Network request
        return fetch(event.request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone));
            }
            return response;
          })
          .catch(() => {
            // Offline fallback
            return caches.match('/offline.html');
          });
      })
  );
});
```

### 4.2 Acessibilidade Avançada
```typescript
// Hook para detecção de preferências do usuário
const useAccessibilityPreferences = () => {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'normal',
    screenReader: false
  });

  useEffect(() => {
    // Detectar preferências do sistema
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      screenReader: window.navigator.userAgent.includes('NVDA') || 
                   window.navigator.userAgent.includes('JAWS')
    };

    setPreferences({
      reducedMotion: mediaQueries.reducedMotion.matches,
      highContrast: mediaQueries.highContrast.matches,
      screenReader: mediaQueries.screenReader,
      fontSize: localStorage.getItem('fontSize') || 'normal'
    });

    // Listeners para mudanças
    Object.entries(mediaQueries).forEach(([key, query]) => {
      query.addEventListener('change', (e) => {
        setPreferences(prev => ({ ...prev, [key]: e.matches }));
      });
    });
  }, []);

  return preferences;
};

// Componente com suporte completo a acessibilidade
const AccessibleModal = ({ isOpen, onClose, title, children }) => {
  const preferences = useAccessibilityPreferences();
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      modalRef.current?.focus();
      
      // Lock scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus
      previousFocus.current?.focus();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${!preferences.reducedMotion ? 'transition-opacity duration-300' : ''}
        ${preferences.highContrast ? 'bg-black bg-opacity-90' : 'bg-black bg-opacity-50'}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-lg p-6 max-w-md w-full mx-4
          ${preferences.fontSize === 'large' ? 'text-lg' : ''}
          ${preferences.highContrast ? 'border-4 border-white' : ''}
        `}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <h2 id="modal-title" className="text-xl font-bold mb-4">
          {title}
        </h2>
        
        {children}
        
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
          aria-label="Fechar modal"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
```

### 4.3 Internacionalização (i18n)
```typescript
// Configuração de internacionalização
const messages = {
  'pt-BR': {
    'donation.title': 'Fazer Doação',
    'donation.amount': 'Valor da Doação',
    'donation.method': 'Método de Pagamento',
    'appointment.schedule': 'Agendar Consulta',
    'diagnosis.start': 'Iniciar Pré-diagnóstico'
  },
  'en-US': {
    'donation.title': 'Make Donation',
    'donation.amount': 'Donation Amount',
    'donation.method': 'Payment Method',
    'appointment.schedule': 'Schedule Appointment',
    'diagnosis.start': 'Start Pre-diagnosis'
  },
  'es-ES': {
    'donation.title': 'Hacer Donación',
    'donation.amount': 'Cantidad de Donación',
    'donation.method': 'Método de Pago',
    'appointment.schedule': 'Programar Cita',
    'diagnosis.start': 'Iniciar Pre-diagnóstico'
  }
};

// Hook para tradução
const useTranslation = () => {
  const [locale, setLocale] = useState('pt-BR');
  
  const t = useCallback((key: string, params?: Record<string, any>) => {
    let message = messages[locale]?.[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        message = message.replace(`{{${param}}}`, String(value));
      });
    }
    
    return message;
  }, [locale]);
  
  return { t, locale, setLocale };
};
```

## 5. Monitoramento e Observabilidade

### 5.1 APM (Application Performance Monitoring)
```typescript
// Performance monitoring
const performanceMonitor = {
  // Core Web Vitals
  measureCoreWebVitals: () => {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1];
      
      analytics.track('core_web_vitals', {
        metric: 'LCP',
        value: lcp.startTime,
        rating: lcp.startTime < 2500 ? 'good' : lcp.startTime < 4000 ? 'needs-improvement' : 'poor'
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        analytics.track('core_web_vitals', {
          metric: 'FID',
          value: entry.processingStart - entry.startTime,
          rating: entry.processingStart - entry.startTime < 100 ? 'good' : 'needs-improvement'
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      analytics.track('core_web_vitals', {
        metric: 'CLS',
        value: clsValue,
        rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
      });
    }).observe({ entryTypes: ['layout-shift'] });
  },

  // Custom metrics
  trackUserActions: (action: string, data: Record<string, any>) => {
    analytics.track('user_action', {
      action,
      ...data,
      timestamp: Date.now(),
      session_id: sessionStorage.getItem('session_id'),
      user_agent: navigator.userAgent
    });
  },

  // Error tracking
  trackError: (error: Error, context?: Record<string, any>) => {
    analytics.track('error', {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: Date.now(),
      ...context
    });
  }
};
```

### 5.2 Real-time Alerts
```typescript
// Sistema de alertas em tempo real
const alertingSystem = {
  thresholds: {
    errorRate: 0.05,        // 5% error rate
    responseTime: 2000,     // 2 seconds
    activeUsers: 1000,      // Concurrent users
    donationFailure: 0.02   // 2% donation failure rate
  },

  checkMetrics: async () => {
    const metrics = await getSystemMetrics();
    
    // Check error rate
    if (metrics.errorRate > alertingSystem.thresholds.errorRate) {
      await sendAlert('high_error_rate', {
        current: metrics.errorRate,
        threshold: alertingSystem.thresholds.errorRate,
        severity: 'critical'
      });
    }

    // Check response time
    if (metrics.avgResponseTime > alertingSystem.thresholds.responseTime) {
      await sendAlert('slow_response_time', {
        current: metrics.avgResponseTime,
        threshold: alertingSystem.thresholds.responseTime,
        severity: 'warning'
      });
    }

    // Check donation failures
    if (metrics.donationFailureRate > alertingSystem.thresholds.donationFailure) {
      await sendAlert('donation_failures', {
        current: metrics.donationFailureRate,
        threshold: alertingSystem.thresholds.donationFailure,
        severity: 'critical'
      });
    }
  }
};
```

### 5.3 Business Intelligence Dashboard
```sql
-- Views para BI e analytics
CREATE VIEW analytics_donations AS
SELECT 
  DATE_TRUNC('day', donated_at) as date,
  COUNT(*) as total_donations,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount,
  COUNT(CASE WHEN ambassador_link_id IS NOT NULL THEN 1 END) as ambassador_donations,
  COUNT(CASE WHEN payment_method = 'PIX' THEN 1 END) as pix_payments,
  COUNT(CASE WHEN payment_method = 'CREDIT_CARD' THEN 1 END) as credit_card_payments
FROM donations 
WHERE status = 'completed'
GROUP BY DATE_TRUNC('day', donated_at)
ORDER BY date DESC;

CREATE VIEW analytics_appointments AS
SELECT 
  DATE_TRUNC('month', appointment_date) as month,
  COUNT(*) as total_appointments,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
  COUNT(DISTINCT user_id) as unique_patients,
  COUNT(DISTINCT partner_id) as active_professionals
FROM appointments
GROUP BY DATE_TRUNC('month', appointment_date)
ORDER BY month DESC;

CREATE VIEW analytics_ambassador_performance AS
SELECT 
  p.full_name,
  p.ambassador_code,
  ap.total_clicks,
  ap.total_donations_count,
  ap.total_donations_amount,
  ap.current_level,
  CASE 
    WHEN ap.total_clicks > 0 
    THEN (ap.total_donations_count::float / ap.total_clicks * 100)::decimal(5,2) 
    ELSE 0 
  END as conversion_rate
FROM ambassador_performance ap
JOIN profiles p ON p.id = ap.ambassador_user_id
WHERE p.is_volunteer = true
ORDER BY ap.total_donations_amount DESC;
```

## 6. Compliance e Governança

### 6.1 LGPD - Implementação Completa
```typescript
// Sistema de consentimento granular
interface ConsentRecord {
  user_id: string;
  consent_type: 'medical_data' | 'marketing' | 'analytics' | 'cookies';
  granted: boolean;
  granted_at: string;
  expires_at?: string;
  ip_address: string;
  user_agent: string;
}

const consentManager = {
  async recordConsent(consent: ConsentRecord): Promise<void> {
    await supabase.from('user_consents').insert(consent);
  },

  async checkConsent(userId: string, consentType: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_consents')
      .select('granted, expires_at')
      .eq('user_id', userId)
      .eq('consent_type', consentType)
      .order('granted_at', { ascending: false })
      .limit(1)
      .single();

    if (!data) return false;
    
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return false;
    }

    return data.granted;
  },

  async revokeConsent(userId: string, consentType: string): Promise<void> {
    await supabase.from('user_consents').insert({
      user_id: userId,
      consent_type: consentType,
      granted: false,
      granted_at: new Date().toISOString(),
      ip_address: 'system',
      user_agent: 'system'
    });
  }
};

// Right to be forgotten (direito ao esquecimento)
const dataSubjectRights = {
  async exportUserData(userId: string): Promise<UserDataExport> {
    const [profile, appointments, donations, diagnostics] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('appointments').select('*').eq('user_id', userId),
      supabase.from('donations').select('*').eq('user_id', userId),
      supabase.from('diagnostics').select('*').eq('user_id', userId)
    ]);

    return {
      profile: profile.data,
      appointments: appointments.data,
      donations: donations.data,
      diagnostics: diagnostics.data,
      exported_at: new Date().toISOString()
    };
  },

  async anonymizeUserData(userId: string): Promise<void> {
    const anonymizedData = {
      full_name: 'Usuário Anonimizado',
      email: `anonymized_${Date.now()}@example.com`,
      phone: null,
      date_of_birth: null,
      medical_conditions: null,
      medications: null,
      emergency_contact_name: null,
      emergency_contact_phone: null
    };

    await supabase
      .from('profiles')
      .update(anonymizedData)
      .eq('id', userId);

    // Log the anonymization
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'USER_DATA_ANONYMIZED',
      details: 'User exercised right to be forgotten',
      created_at: new Date().toISOString()
    });
  }
};
```

### 6.2 Auditoria e Compliance Médico
```sql
-- Tabela para tracking de access a dados médicos sensíveis
CREATE TABLE medical_data_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_user_id UUID REFERENCES auth.users(id),
  accessing_user_id UUID REFERENCES auth.users(id),
  data_type TEXT NOT NULL, -- 'diagnosis', 'medical_history', 'appointment_notes'
  access_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para log automático de acesso a dados médicos
CREATE OR REPLACE FUNCTION log_medical_data_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO medical_data_access_log (
    accessed_user_id,
    accessing_user_id,
    data_type,
    access_reason
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    auth.uid(),
    CASE 
      WHEN TG_TABLE_NAME = 'diagnostics' THEN 'diagnosis'
      WHEN TG_TABLE_NAME = 'pre_diagnosis_sessions' THEN 'pre_diagnosis'
      WHEN TG_TABLE_NAME = 'appointments' THEN 'appointment'
      ELSE TG_TABLE_NAME
    END,
    'Data access via ' || TG_OP
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas sensíveis
CREATE TRIGGER log_diagnostics_access
  AFTER SELECT ON diagnostics
  FOR EACH ROW EXECUTE FUNCTION log_medical_data_access();
```

## 7. Roadmap de Implementação

### 7.1 Fase 1 - Otimizações Críticas (1-2 meses)
- [ ] Implementar cache Redis
- [ ] Adicionar índices de performance críticos
- [ ] Implementar rate limiting avançado
- [ ] Melhorar logging e auditoria
- [ ] Otimizar queries N+1

### 7.2 Fase 2 - Segurança e Compliance (2-3 meses)
- [ ] Criptografia de dados sensíveis
- [ ] Sistema de consentimento LGPD
- [ ] Auditoria médica completa
- [ ] Two-factor authentication
- [ ] Advanced threat detection

### 7.3 Fase 3 - Arquitetura e Escala (3-4 meses)
- [ ] Event sourcing implementation
- [ ] Microserviços com Edge Functions
- [ ] Database sharding
- [ ] CDN e edge computing
- [ ] Multi-region deployment

### 7.4 Fase 4 - UX e Acessibilidade (4-5 meses)
- [ ] Progressive Web App
- [ ] Funcionalidade offline
- [ ] Acessibilidade avançada
- [ ] Internacionalização
- [ ] Mobile app nativo

### 7.5 Fase 5 - Analytics e BI (5-6 meses)
- [ ] Sistema de métricas avançado
- [ ] Dashboard de business intelligence
- [ ] Alertas em tempo real
- [ ] Machine learning para insights
- [ ] Relatórios automatizados

## 8. Estimativa de Custos e ROI

### 8.1 Investimento Estimado
```typescript
const investmentEstimate = {
  infrastructure: {
    redis: '$200/month',
    cdn: '$150/month', 
    monitoring: '$300/month',
    backup: '$100/month'
  },
  
  development: {
    phase1: '$15,000',
    phase2: '$25,000',
    phase3: '$35,000',
    phase4: '$20,000',
    phase5: '$15,000'
  },
  
  maintenance: {
    monthly: '$2,000',
    annual: '$24,000'
  },
  
  total: {
    initial: '$110,000',
    monthly: '$750',
    annual: '$33,000'
  }
};
```

### 8.2 ROI Esperado
```typescript
const roiProjection = {
  performanceImprovements: {
    loadTimeReduction: '40%',
    bounceRateReduction: '25%',
    conversionRateIncrease: '15%'
  },
  
  operationalBenefits: {
    developmentSpeedIncrease: '30%',
    bugReduction: '50%',
    maintenanceTimeReduction: '35%'
  },
  
  businessImpact: {
    userSatisfactionIncrease: '20%',
    donationConversionIncrease: '18%',
    professionalRetention: '25%'
  }
};
```

## Conclusão

As recomendações apresentadas foram priorizadas com base no impacto e na viabilidade de implementação. O sistema atual já possui uma base sólida, e estas melhorias irão garantir sua escalabilidade, segurança e usabilidade a longo prazo.

**Próximos Passos Imediatos**:
1. Revisar e aprovar o roadmap de implementação
2. Definir prioridades baseadas no orçamento disponível
3. Iniciar com as otimizações de performance (Fase 1)
4. Estabelecer métricas para acompanhar o progresso
5. Formar equipe técnica para execução das melhorias

**Indicadores de Sucesso**:
- Redução de 40% no tempo de carregamento
- Aumento de 15% na taxa de conversão de doações
- Melhoria de 20% na satisfação do usuário
- Redução de 50% nos bugs reportados
- Conformidade 100% com LGPD

Este documento deve ser revisado trimestralmente e atualizado conforme a evolução das necessidades do negócio e mudanças tecnológicas.
