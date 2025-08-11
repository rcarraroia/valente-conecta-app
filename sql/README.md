# Instituto Integration Database Migrations

Este diretório contém os scripts SQL para configurar a integração com a API do Instituto Coração Valente no Supabase.

## Ordem de Execução

Execute os scripts na seguinte ordem:

### 1. `001_instituto_integration_tables.sql`
- Cria as tabelas principais para a integração
- Configura índices para performance
- Adiciona triggers para atualização automática de timestamps

**Tabelas criadas:**
- `instituto_integration_config`: Configurações da API
- `instituto_integration_logs`: Logs de todas as tentativas de integração
- `instituto_integration_queue`: Fila para retry de tentativas falhadas

### 2. `002_instituto_integration_rls.sql`
- Configura Row Level Security (RLS) para todas as tabelas
- Define políticas de acesso baseadas em roles
- Cria função helper para verificar se usuário é admin

**Políticas criadas:**
- Admins têm acesso total a todas as tabelas
- Usuários podem ver apenas seus próprios logs
- Service role pode inserir/atualizar logs para operações do sistema

### 3. `003_instituto_integration_functions.sql`
- Cria funções utilitárias para operações da integração
- Funções para estatísticas, limpeza e gerenciamento de logs

**Funções criadas:**
- `get_instituto_integration_stats()`: Retorna estatísticas da integração
- `cleanup_old_integration_logs()`: Remove logs antigos
- `add_integration_log()`: Adiciona entrada de log
- `schedule_integration_retry()`: Agenda retry para tentativas falhadas

### 4. `004_user_consent_table.sql`
- Cria tabela para gerenciamento de consentimento do usuário
- Configura RLS para acesso seguro aos dados de consentimento
- Adiciona funções para consulta de status de consentimento

**Tabela criada:**
- `user_consent`: Armazena registros de consentimento para compartilhamento de dados

**Funções criadas:**
- `get_user_consent_status()`: Retorna status atual do consentimento do usuário
- `get_consent_statistics()`: Retorna estatísticas de consentimento (apenas admin)

## Como Executar

1. Acesse o painel do Supabase
2. Vá para "SQL Editor"
3. Execute cada script na ordem indicada
4. Verifique se não há erros na execução

## Verificação

Após executar todos os scripts, você pode verificar se tudo foi criado corretamente:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE 'instituto_integration%' OR table_name = 'user_consent');

-- Verificar se as funções foram criadas
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND (routine_name LIKE '%instituto%' OR routine_name LIKE '%consent%');

-- Testar função de estatísticas da integração
SELECT get_instituto_integration_stats();

-- Testar função de status de consentimento
SELECT get_user_consent_status();

-- Testar função de estatísticas de consentimento (apenas admin)
SELECT get_consent_statistics();
```

## Notas Importantes

- As credenciais da API são armazenadas criptografadas no campo `encrypted_credentials`
- Os logs são mantidos por 90 dias (sucessos) e 180 dias (falhas)
- A função de limpeza deve ser executada periodicamente via cron job
- As políticas RLS assumem que existe um campo `role` nos metadados do usuário para identificar admins

## Rollback

Se precisar reverter as mudanças:

```sql
-- Remover funções
DROP FUNCTION IF EXISTS get_instituto_integration_stats(INTEGER);
DROP FUNCTION IF EXISTS cleanup_old_integration_logs(INTEGER);
DROP FUNCTION IF EXISTS add_integration_log(UUID, TEXT, JSONB, JSONB, TEXT, INTEGER);
DROP FUNCTION IF EXISTS schedule_integration_retry(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_user_consent_status(UUID);
DROP FUNCTION IF EXISTS get_consent_statistics();
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Remover tabelas (cuidado: isso apagará todos os dados!)
DROP TABLE IF EXISTS instituto_integration_queue;
DROP TABLE IF EXISTS instituto_integration_logs;
DROP TABLE IF EXISTS instituto_integration_config;
DROP TABLE IF EXISTS user_consent;
```