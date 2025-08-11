# Integração Instituto Coração Valente

Este documento descreve a implementação completa da integração com a API do Instituto Coração Valente para o envio automático de dados de cadastro do Projeto Visão Itinerante.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Configuração](#configuração)
- [Uso](#uso)
- [Testes](#testes)
- [Monitoramento](#monitoramento)
- [Segurança](#segurança)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

A integração permite o envio automático de dados de usuários cadastrados no Projeto Visão Itinerante para o Instituto Coração Valente, facilitando campanhas de captação de recursos direcionadas.

### Funcionalidades Principais

- ✅ Envio automático de dados de cadastro
- ✅ Sistema de consentimento do usuário
- ✅ Validação e sanitização de dados
- ✅ Sistema de retry com backoff exponencial
- ✅ Rate limiting para proteção
- ✅ Monitoramento e logs detalhados
- ✅ Ambiente de teste/sandbox
- ✅ Dashboard administrativo
- ✅ Tratamento robusto de erros

## 🏗️ Arquitetura

### Componentes Principais

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Formulário    │───▶│   Validação &    │───▶│   API Service   │
│   de Cadastro   │    │   Sanitização    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Dashboard     │◀───│   Logs &         │◀───│   Instituto     │
│   Admin         │    │   Monitoramento  │    │   API           │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │   Retry Queue   │
                                               │   System        │
                                               └─────────────────┘
```

### Fluxo de Dados

1. **Cadastro**: Usuário preenche formulário com consentimento
2. **Validação**: Dados são validados e sanitizados
3. **Envio**: Tentativa de envio para API do Instituto
4. **Retry**: Em caso de falha, item vai para fila de retry
5. **Monitoramento**: Logs e métricas são coletados
6. **Dashboard**: Administradores podem monitorar status

## ⚙️ Configuração

### 1. Banco de Dados

Execute os scripts SQL na seguinte ordem:

```bash
# 1. Tabelas principais
sql/migrations/001_instituto_integration_tables.sql

# 2. Políticas RLS
sql/migrations/002_instituto_integration_rls.sql

# 3. Funções utilitárias
sql/migrations/003_instituto_integration_functions.sql

# 4. Tabela de consentimento
sql/migrations/004_user_consent_table.sql
```

### 2. Variáveis de Ambiente

```bash
# .env
VITE_ENCRYPTION_KEY=your-strong-encryption-key-here
```

### 3. Configuração da API

Acesse o painel administrativo e configure:

- **Endpoint**: URL da API do Instituto
- **Método**: POST ou PUT
- **Autenticação**: API Key, Bearer Token ou Basic Auth
- **Sandbox**: URL do ambiente de teste
- **Retry**: Número de tentativas e delay

## 🚀 Uso

### Integração com Formulários

```typescript
import { useInstitutoIntegrationRegistration } from '@/hooks/useInstitutoIntegration';
import { ConsentCheckbox } from '@/components/consent/ConsentCheckbox';

const SignupForm = () => {
  const { sendRegistrationData, isSending } = useInstitutoIntegrationRegistration();
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (data) => {
    if (consent) {
      await sendRegistrationData.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        consent_data_sharing: true
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário */}
      
      <ConsentCheckbox
        checked={consent}
        onCheckedChange={setConsent}
        required={true}
      />
      
      <button type="submit" disabled={isSending}>
        {isSending ? 'Enviando...' : 'Cadastrar'}
      </button>
    </form>
  );
};
```

### Dashboard Administrativo

```typescript
import { IntegrationDashboard } from '@/components/admin/IntegrationDashboard';
import { InstitutoConfigForm } from '@/components/admin/InstitutoConfigForm';

const AdminPanel = () => {
  return (
    <div>
      <IntegrationDashboard />
      <InstitutoConfigForm />
    </div>
  );
};
```

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:e2e

# Validação completa
npm run validate:integration

# Validação com detalhes
npm run validate:integration:verbose

# Exportar relatório
npm run validate:integration:export
```

### Ambiente de Teste

```typescript
import { TestEnvironment } from '@/utils/test-environment';

// Configurar ambiente de teste
TestEnvironment.configure({
  enabled: true,
  mockResponses: true,
  delayMs: 1000,
  failureRate: 0.1 // 10% de falhas
});

// Gerar dados de teste
const testData = TestEnvironment.generateTestUserData();

// Simular resposta da API
const result = await TestEnvironment.simulateApiResponse(testData);
```

### Controles de Teste (Desenvolvimento)

Acesse `?mock=true` na URL para habilitar respostas simuladas:

```
http://localhost:3000?mock=true&test_delay=500&failure_rate=0.2
```

## 📊 Monitoramento

### Métricas Disponíveis

- **Total de tentativas**: Número total de envios
- **Taxa de sucesso**: Percentual de envios bem-sucedidos
- **Envios pendentes**: Itens na fila de retry
- **Tempo médio**: Tempo médio de resposta
- **Erros por tipo**: Distribuição de tipos de erro

### Dashboard

O dashboard administrativo fornece:

- 📈 Métricas em tempo real
- 📋 Logs detalhados de integração
- ⚙️ Configuração da API
- 🧪 Controles de teste
- 🔄 Processamento manual da fila

### Logs

```typescript
import { ErrorHandler } from '@/utils/error-handler';

// Logs são automaticamente coletados
const stats = ErrorHandler.getStats();
const reports = ErrorHandler.getReports(50);
```

## 🔒 Segurança

### Criptografia

- **Credenciais**: Armazenadas criptografadas no banco
- **Logs**: Dados sensíveis são mascarados
- **Transmissão**: HTTPS obrigatório

### Validação

- **Input Sanitization**: Prevenção de XSS
- **CPF**: Validação com algoritmo oficial
- **Email/Telefone**: Validação de formato
- **Rate Limiting**: Proteção contra abuso

### Consentimento

- **LGPD Compliant**: Sistema de consentimento explícito
- **Rastreabilidade**: Logs de consentimento com timestamp
- **Revogação**: Usuário pode revogar a qualquer momento

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Configuração

```
Erro: Configuração da integração não encontrada
```

**Solução**: Configure a integração no painel administrativo.

#### 2. Erro de Autenticação

```
Erro: Credenciais inválidas
```

**Solução**: Verifique as credenciais da API no painel de configuração.

#### 3. Rate Limit Excedido

```
Erro: Limite de tentativas excedido
```

**Solução**: Aguarde o tempo de reset ou ajuste os limites de rate limiting.

#### 4. Dados Inválidos

```
Erro: CPF inválido
```

**Solução**: Verifique a validação de dados no frontend.

### Logs de Debug

```typescript
// Habilitar logs detalhados
TestEnvironment.configure({ logRequests: true });

// Ver logs de erro
const errorReports = ErrorHandler.getReports();
console.log(errorReports);

// Exportar relatório de validação
npm run validate:integration:export
```

### Verificação de Saúde

```typescript
import { IntegrationValidator } from '@/utils/integration-validator';

const validator = new IntegrationValidator();
const report = await validator.validateIntegration();

if (report.overallStatus !== 'PASS') {
  console.log('Issues found:', report.results.filter(r => !r.passed));
}
```

## 📚 Referências

### Arquivos Principais

- `src/services/instituto-integration.service.ts` - Serviço principal
- `src/hooks/useInstitutoIntegration.tsx` - Hook React
- `src/components/consent/` - Componentes de consentimento
- `src/components/admin/` - Dashboard administrativo
- `src/utils/test-environment.ts` - Ambiente de teste
- `sql/migrations/` - Scripts de banco de dados

### Tipos TypeScript

```typescript
interface InstitutoUserData {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  origem_cadastro: 'visao_itinerante';
  consentimento_data_sharing: boolean;
  created_at: string;
}

interface IntegrationResult {
  success: boolean;
  data?: any;
  error?: string;
  log_id?: string;
}
```

### Scripts Úteis

```bash
# Validar integração
npm run validate:integration

# Executar testes
npm run test:e2e

# Limpar logs antigos (via SQL)
SELECT cleanup_old_integration_logs(90);

# Ver estatísticas
SELECT get_instituto_integration_stats();
```

## 🤝 Suporte

Para dúvidas ou problemas:

1. Verifique os logs no dashboard administrativo
2. Execute a validação da integração
3. Consulte este documento
4. Entre em contato com a equipe de desenvolvimento

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2025  
**Autor**: Equipe de Desenvolvimento