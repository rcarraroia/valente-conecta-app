# 🚨 REGRAS CRÍTICAS DE EXECUÇÃO SUPABASE

## ⚠️ REGRA FUNDAMENTAL - EXECUÇÃO MANUAL OBRIGATÓRIA

### CONTEXTO CRÍTICO
- **Kiro AI NÃO TEM ACESSO ao projeto real do Supabase**
- **Kiro AI NÃO PODE EXECUTAR, CRIAR, ALTERAR ou MODIFICAR nada no banco de dados**
- **Kiro AI APENAS TEM CAPACIDADE DE LEITURA/VERIFICAÇÃO via Python para análise**
- **Todas as migrações e scripts SQL devem ser executados MANUALMENTE pelo usuário**
- **Scripts criados pelo Kiro são apenas preparação - não são executados automaticamente**
- **NUNCA tentar executar operações de INSERT, UPDATE, DELETE, CREATE, ALTER via Python**

### PROTOCOLO OBRIGATÓRIO

#### 0. VERIFICAÇÃO PRÉVIA OBRIGATÓRIA
- **SEMPRE verificar condições atuais do banco ANTES de qualquer implementação**
- **Usar comandos Python, grepSearch, readFile para analisar estado atual**
- **Avaliar se novas implementações podem prejudicar funcionalidades existentes**
- **Identificar dependências e conflitos potenciais**
- **Documentar estado atual antes de propor alterações**

#### 1. CRIAÇÃO DE SCRIPTS
- Kiro cria scripts SQL completos e testados
- Scripts são salvos em arquivos .sql na pasta supabase/migrations/
- Cada script deve ser autocontido e executável
- Scripts devem incluir verificações de compatibilidade

#### 2. EXECUÇÃO MANUAL PELO USUÁRIO
- **USUÁRIO deve copiar o script SQL**
- **USUÁRIO deve colar no Editor SQL do painel do Supabase**
- **USUÁRIO deve executar manualmente cada script**
- **USUÁRIO deve confirmar sucesso da execução**

#### 3. ORDEM DE EXECUÇÃO
- Scripts devem ser executados na ordem específica indicada
- Dependências entre scripts devem ser claramente documentadas
- Verificações de pré-requisitos devem ser incluídas nos scripts

#### 4. VALIDAÇÃO PÓS-EXECUÇÃO
- Cada script deve incluir queries de validação
- Usuário deve confirmar que tabelas/funções foram criadas
- Testes de conectividade devem ser realizados

### COMUNICAÇÃO OBRIGATÓRIA

#### Quando Kiro cria scripts SQL:
```
🚨 ATENÇÃO: EXECUÇÃO MANUAL NECESSÁRIA

Este script foi criado mas NÃO foi executado automaticamente.

VOCÊ DEVE:
1. Copiar o script SQL abaixo
2. Abrir o Editor SQL no painel do Supabase
3. Colar e executar o script manualmente
4. Confirmar que a execução foi bem-sucedida
5. Validar que as tabelas/funções foram criadas

SCRIPT: [nome_do_arquivo.sql]
```

#### Verificação de Status:
- Sempre perguntar ao usuário se o script foi executado
- Solicitar confirmação de sucesso antes de prosseguir
- Não assumir que migrações foram aplicadas

### EXEMPLOS DE COMUNICAÇÃO

❌ **INCORRETO:**
"Migração executada com sucesso"
"Tabelas criadas no Supabase"
"Sistema atualizado"

✅ **CORRETO:**
"Script criado. VOCÊ DEVE executar manualmente no Supabase"
"Após executar o script, confirme se as tabelas foram criadas"
"Aguardando sua confirmação de que o script foi executado"

### CONSEQUÊNCIAS DE NÃO SEGUIR

- Sistema frontend implementado sem backend funcional
- Erros 404/500 em produção
- Funcionalidades quebradas
- Perda de tempo e retrabalho
- Frustração do usuário

### CHECKLIST OBRIGATÓRIO

Antes de qualquer implementação que envolva banco de dados:

**FASE DE ANÁLISE PRÉVIA:**
- [ ] **Conexão real com Supabase testada via Python**
- [ ] Estado atual do banco verificado com dados reais
- [ ] Tabelas existentes identificadas via queries reais
- [ ] Contagem de registros verificada por tabela
- [ ] Estrutura de dados analisada com exemplos reais
- [ ] Políticas RLS atuais mapeadas
- [ ] Dependências e relacionamentos verificados
- [ ] Impacto em funcionalidades existentes avaliado
- [ ] Conflitos potenciais identificados

**FASE DE IMPLEMENTAÇÃO:**
- [ ] Script SQL criado e salvo em arquivo
- [ ] Instruções claras de execução fornecidas
- [ ] Ordem de execução documentada
- [ ] Validações incluídas no script
- [ ] Verificações de compatibilidade incluídas
- [ ] Confirmação do usuário solicitada
- [ ] Status de execução verificado

## 🎯 APLICAÇÃO IMEDIATA

Esta regra se aplica a:
- Criação de tabelas
- Alteração de estruturas
- Criação de funções/triggers
- Políticas RLS
- Índices de performance
- Qualquer operação SQL no Supabase

### COMANDOS DE VERIFICAÇÃO DISPONÍVEIS
- `grepSearch` - Para buscar referências no código
- `readFile` - Para analisar arquivos existentes
- `readMultipleFiles` - Para análise comparativa
- `listDirectory` - Para mapear estrutura de arquivos
- **Scripts Python com supabase-py** - Para acessar dados reais do banco

### MÉTODO CORRETO PARA ACESSAR BANCO REAL
**NUNCA confiar apenas no arquivo `src/integrations/supabase/types.ts`** - ele pode estar desatualizado!

**SEMPRE usar Python com supabase-py APENAS para LEITURA/VERIFICAÇÃO:**

```python
from supabase import create_client, Client

# Configurações do Instituto Coração Valente
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

# Conectar e APENAS LER dados
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
response = supabase.table('nome_tabela').select('*').limit(1).execute()  # APENAS SELECT
```

**⚠️ OPERAÇÕES PROIBIDAS VIA PYTHON:**
- `supabase.table().insert()` - PROIBIDO
- `supabase.table().update()` - PROIBIDO  
- `supabase.table().delete()` - PROIBIDO
- `supabase.rpc()` com operações de escrita - PROIBIDO

**Exemplo de script completo:** `analyze_donations_system.py` (já testado e funcional)

### REGRAS FUNDAMENTAIS
- **NUNCA assumir que scripts foram executados automaticamente**
- **NUNCA tentar executar operações de escrita via Python**
- **SEMPRE usar Python APENAS para leitura e análise**
- **SEMPRE verificar estado atual ANTES de implementar**
- **SEMPRE solicitar execução manual e confirmação**
- **SEMPRE avaliar impacto em funcionalidades existentes**
- **ECONOMIZAR créditos não tentando operações impossíveis**
## 🔗 MÉTODO VALIDADO DE CONEXÃO COM SUPABASE

### DESCOBERTA CRÍTICA - INSTITUTO CORAÇÃO VALENTE
- **O arquivo `types.ts` NÃO reflete a realidade do banco**
- **Única forma confiável é conexão direta via Python**
- **Biblioteca supabase-py funciona perfeitamente**
- **Conexão testada e validada em 30/09/2025**

### TEMPLATE DE SCRIPT DE VERIFICAÇÃO

```python
#!/usr/bin/env python3
from supabase import create_client, Client

# Configurações do Instituto Coração Valente
SUPABASE_URL = "https://corrklfwxfuqusfzwbls.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnJrbGZ3eGZ1cXVzZnp3YmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU0MTUsImV4cCI6MjA2NTMxMTQxNX0.r4nWkV2bnniYUl1wdyNO0dXrATVaRMHjCr4Qaq5Plmw"

def analyze_database():
    """Análise completa do banco de dados - Instituto Coração Valente"""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Lista de tabelas do Instituto Coração Valente
    tables = ['donations', 'ambassador_performance', 'ambassador_links', 
              'profiles', 'link_clicks', 'volunteer_applications',
              'library_resources', 'library_categories', 'services']
    
    results = {}
    for table in tables:
        try:
            # Contar registros
            count_response = supabase.table(table).select('*', count='exact').execute()
            count = count_response.count
            
            # Pegar amostra de dados
            sample_response = supabase.table(table).select('*').limit(3).execute()
            sample = sample_response.data
            
            results[table] = {
                'exists': True,
                'count': count,
                'sample': sample
            }
            print(f"✅ {table}: {count} registros")
            
        except Exception as e:
            results[table] = {
                'exists': False,
                'error': str(e)
            }
            print(f"❌ {table}: {str(e)}")
    
    return results

if __name__ == "__main__":
    analyze_database()
```

### REGRA FUNDAMENTAL ATUALIZADA
**SEMPRE criar e executar script Python ANTES de qualquer análise ou implementação**

### VANTAGENS DO MÉTODO PYTHON
- ✅ Acesso direto aos dados reais
- ✅ Contagem precisa de registros
- ✅ Visualização de estrutura real
- ✅ Teste de conectividade
- ✅ Validação de políticas RLS
- ✅ Identificação de problemas reais

### APLICAÇÃO OBRIGATÓRIA
Este método deve ser usado para:
- Verificação de existência de tabelas
- Análise de dados existentes
- Validação pós-migração
- Diagnóstico de problemas
- Planejamento de implementações

### TABELAS CONFIRMADAS NO PROJETO (30/09/2025)
**✅ SISTEMA DE DOAÇÕES:**
- `donations` - Registros de doações (0 registros)
- `ambassador_performance` - Performance dos embaixadores (0 registros)
- `ambassador_links` - Links de afiliação (0 registros)
- `link_clicks` - Tracking de cliques (0 registros)

**✅ SISTEMA DE USUÁRIOS:**
- `profiles` - Perfis dos usuários (0 registros)
  - Campos confirmados: id, full_name, is_volunteer, ambassador_code, ambassador_wallet_id, phone, city, state, gender
- `volunteer_applications` - Aplicações de voluntários

**✅ SISTEMA DE CONTEÚDO:**
- `library_resources` - Recursos da biblioteca
- `library_categories` - Categorias da biblioteca
- `services` - Serviços oferecidos

**🔧 EDGE FUNCTIONS IMPLEMENTADAS:**
- `process-payment-v2` - Processamento de pagamentos (RECOMENDADA)
- `process-payment` - Versão legada
- `process-payment-debug` - Para testes
- `asaas-webhook` - Webhook do Asaas