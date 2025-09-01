# Configuração do Webhook N8N para Pré-Diagnóstico

## Status Atual

✅ **Webhook URL configurada:** `https://primary-production-b7fe.up.railway.app/webhook/multiagente-ia-diagnostico`
✅ **Railway funcionando:** O serviço está acessível e respondendo
❌ **Workflow N8N inativo:** O workflow não está publicado ou ativo

## Diagnóstico Realizado

O teste de conectividade mostrou que:

1. **Conectividade OK**: O webhook responde às requisições
2. **Tempo de resposta**: ~1000-1300ms (aceitável)
3. **Erro específico**: "Workflow could not be started!"

## Próximos Passos

### 1. Verificar o Workflow N8N

No painel do N8N, verifique:

- [ ] O workflow está **salvo**
- [ ] O workflow está **publicado** (botão "Activate")
- [ ] O nó Webhook está configurado corretamente
- [ ] A URL do webhook corresponde à configurada

### 2. Configuração do Nó Webhook

O nó Webhook no N8N deve estar configurado com:

```json
{
  "httpMethod": "POST",
  "path": "multiagente-ia-diagnostico",
  "responseMode": "responseNode"
}
```

### 3. Estrutura de Dados Esperada

O sistema enviará dados no formato:

```json
{
  "user_id": "string",
  "session_id": "string", 
  "message": "string",
  "timestamp": "ISO string",
  "message_history": [
    {
      "sender": "user|ai",
      "content": "string",
      "timestamp": "ISO string"
    }
  ]
}
```

### 4. Resposta Esperada

O workflow deve retornar:

```json
{
  "message": "Resposta da IA",
  "session_id": "mesmo session_id recebido",
  "diagnosis_complete": false,
  "diagnosis_data": {
    // Dados do diagnóstico quando completo
    "severity_level": 1-5,
    "recommendations": ["..."],
    "summary": "..."
  }
}
```

## Testando a Configuração

### Opção 1: Usar o Sistema de Diagnóstico

1. Acesse: `http://localhost:8080/system-diagnostic`
2. Clique em "Verificar Conectividade"
3. Verifique o status do webhook

### Opção 2: Usar o Script de Teste

```bash
node test-webhook.js
```

### Opção 3: Teste Manual

```bash
curl -X POST https://primary-production-b7fe.up.railway.app/webhook/multiagente-ia-diagnostico \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "session_id": "test-session",
    "message": "Olá",
    "timestamp": "2025-09-01T01:00:00.000Z",
    "message_history": []
  }'
```

## Configuração no Sistema

O webhook já está configurado no arquivo `.env`:

```env
VITE_N8N_WEBHOOK_URL=https://primary-production-b7fe.up.railway.app/webhook/multiagente-ia-diagnostico
```

## Tratamento de Erros

O sistema já está preparado para:

- ✅ Detectar quando o webhook está inacessível
- ✅ Identificar quando o workflow não está ativo
- ✅ Mostrar mensagens de erro específicas para o usuário
- ✅ Permitir tentativas de reconexão
- ✅ Funcionar em modo degradado quando necessário

## Monitoramento

Para monitorar o status do webhook:

1. **Dashboard de Diagnóstico**: `/system-diagnostic`
2. **Logs do Console**: Ativar `VITE_ENABLE_DETAILED_LOGGING=true`
3. **Métricas do Chat Service**: Disponíveis via `chatService.getMetrics()`

## Solução de Problemas

### Erro: "Workflow could not be started"

**Causa**: Workflow N8N não está ativo
**Solução**: 
1. Abrir o N8N
2. Localizar o workflow
3. Clicar em "Activate" 
4. Testar novamente

### Erro: "Network error"

**Causa**: Problema de conectividade
**Solução**:
1. Verificar se o Railway está funcionando
2. Testar a URL manualmente
3. Verificar configuração de proxy/firewall

### Erro: "Invalid response format"

**Causa**: Resposta do workflow não está no formato esperado
**Solução**:
1. Verificar estrutura de resposta do workflow
2. Adicionar nó de formatação de resposta
3. Testar com dados de exemplo

## Próximas Melhorias

- [ ] Implementar retry automático com backoff exponencial
- [ ] Adicionar cache de respostas para modo offline
- [ ] Implementar fallback para quando o webhook estiver indisponível
- [ ] Adicionar métricas de performance e disponibilidade
- [ ] Implementar notificações automáticas de status