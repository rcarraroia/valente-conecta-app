# Resumo da Investigação do Webhook N8N

## Problema Identificado
O webhook do n8n não estava recebendo as mensagens mais recentes do frontend, processando apenas mensagens antigas.

## Soluções Implementadas

### 1. Sistema de Logs Detalhados

#### A. Proxy Webhook (`api/webhook-proxy.js`)
```javascript
// ✅ Implementado:
- Request ID único para cada requisição
- Timestamp detalhado em cada log
- Log completo do payload (chatInput, user_id, session_id)
- Log dos headers da requisição
- Log da resposta completa do n8n
- Rastreamento de tempo de resposta
- Tratamento de erros melhorado
```

#### B. Chat Service (`src/services/chat.service.ts`)
```javascript
// ✅ Implementado:
- Request ID correlacionado com o proxy
- Log detalhado do payload antes do envio
- Log da resposta recebida
- Análise de erros específicos
- Timeout e retry com logs
```

#### C. Hook de Chat (`src/hooks/useDiagnosisChat.tsx`)
```javascript
// ✅ Implementado:
- Log da mensagem original vs processada
- Análise detalhada da resposta
- Correlação entre envio e recebimento
- Logs de erro específicos
```

### 2. Debugger Visual

#### Componente WebhookDebugger (`src/components/debug/WebhookDebugger.tsx`)
```javascript
// ✅ Funcionalidades:
- Interceptação de requisições fetch em tempo real
- Visualização do payload enviado
- Visualização da resposta recebida
- Teste manual do webhook
- Interface responsiva
- Histórico de requisições (últimas 50)
- Status codes e tempos de resposta
```

#### Integração no Chat
```javascript
// ✅ Implementado:
- Botão "Debug" no header do chat
- Painel expansível com o debugger
- Não interfere na funcionalidade normal
```

### 3. Scripts de Teste

#### Teste Básico (`test-webhook.js`)
```bash
# Teste simples
node test-webhook.js

# Teste com mensagem customizada
node test-webhook.js --message="Minha mensagem de teste"

# Teste de conectividade
node test-webhook.js --connectivity

# Múltiplos testes
node test-webhook.js --multiple --count=5 --delay=3000
```

## Como Usar para Investigar

### 1. Ativar Logs Detalhados
1. Abra o navegador em `http://localhost:8080`
2. Abra o DevTools (F12)
3. Vá para a aba Console
4. Navegue até a página de diagnóstico

### 2. Usar o Debugger Visual
1. No chat, clique no botão "Debug"
2. Clique em "Iniciar Captura"
3. Envie uma mensagem no chat
4. Observe os logs capturados em tempo real

### 3. Analisar os Logs

#### Sequência Normal de Logs:
```
🚀 [hook_xxx] useDiagnosisChat: Sending to n8n: {...}
🚀 [chat_xxx] Making request to n8n: {...}
🚀 [req_xxx] Proxying request to: https://...
📡 [req_xxx] Webhook response: {...}
✅ [req_xxx] Request completed successfully
```

#### Identificar Problemas:
- **Mensagem não chega ao hook**: Problema no componente
- **Mensagem não chega ao service**: Problema no hook
- **Mensagem não chega ao proxy**: Problema no service
- **Proxy não responde**: Problema de rede/configuração
- **N8N não responde**: Problema no webhook/workflow

### 4. Verificar Pontos Específicos

#### A. Payload Correto?
```javascript
// Verificar nos logs:
📝 [req_xxx] Message content: "mensagem mais recente"
👤 [req_xxx] User ID: "user_123"
🔗 [req_xxx] Session ID: "session_456"
⏰ [req_xxx] Timestamp: "2025-01-09T..."
```

#### B. Proxy Funcionando?
```javascript
// Verificar nos logs:
🔄 [req_xxx] Forwarding to n8n webhook at 1736123456789
📡 [req_xxx] Webhook response: { status: 200, ... }
```

#### C. N8N Respondendo?
```javascript
// Verificar nos logs:
📄 [req_xxx] Webhook response text: {"message": "...", ...}
✅ [req_xxx] Webhook response data: {...}
```

## Possíveis Problemas e Soluções

### 1. Cache/Estado Antigo
**Sintoma**: Logs mostram mensagem antiga sendo enviada
**Investigar**: 
- Estado do React não atualizando
- Closure capturando valor antigo
- Cache do navegador

### 2. Problema de Timing
**Sintoma**: Mensagens enviadas fora de ordem
**Investigar**:
- Timestamps nos logs
- Race conditions
- Múltiplas requisições simultâneas

### 3. Problema no Proxy
**Sintoma**: Requisição não chega ao n8n
**Investigar**:
- Logs do proxy param no meio
- Erro de rede
- Timeout

### 4. Problema no N8N
**Sintoma**: N8N não processa ou responde erro
**Investigar**:
- Status do workflow no n8n
- Logs do n8n
- Configuração do webhook

## Comandos de Teste Rápido

```bash
# Testar conectividade básica
curl -X HEAD http://localhost:8080/api/webhook-proxy

# Testar com payload
curl -X POST http://localhost:8080/api/webhook-proxy \
  -H "Content-Type: application/json" \
  -d '{"chatInput":"teste","user_id":"test","session_id":"test","timestamp":"2025-01-09T12:00:00Z"}'

# Testar múltiplas mensagens
node test-webhook.js --multiple --count=3
```

## Próximos Passos

1. **Execute os testes** usando o debugger visual
2. **Analise os logs** no console do navegador
3. **Identifique onde a cadeia quebra**:
   - Frontend → Hook → Service → Proxy → N8N
4. **Verifique o n8n** se os logs mostrarem que as requisições chegam
5. **Reporte os resultados** com os logs específicos

## Limpeza Pós-Debug

Após resolver o problema, remover:
- [ ] Botão Debug do header do chat
- [ ] Componente WebhookDebugger
- [ ] Logs excessivos (manter apenas os essenciais)
- [ ] Arquivo test-webhook.js

---

**Status**: ✅ Sistema de debug implementado e pronto para uso
**Próximo**: Executar testes e analisar resultados