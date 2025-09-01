# Teste de Debug do Webhook N8N

## Situação Atual
O webhook do n8n não está recebendo as mensagens mais recentes do frontend. Implementamos logs detalhados para identificar onde está a falha na comunicação.

## Melhorias Implementadas

### 1. Logs Detalhados no Proxy (`api/webhook-proxy.js`)
- ✅ Request ID único para cada requisição
- ✅ Timestamp detalhado
- ✅ Log do conteúdo da mensagem (`chatInput`)
- ✅ Log dos headers da requisição
- ✅ Log da resposta completa do n8n
- ✅ Rastreamento de tempo de resposta

### 2. Logs Detalhados no Chat Service (`src/services/chat.service.ts`)
- ✅ Request ID único para correlação
- ✅ Log detalhado do payload enviado
- ✅ Log da resposta recebida
- ✅ Tratamento de erros melhorado

### 3. Logs Detalhados no Hook (`src/hooks/useDiagnosisChat.tsx`)
- ✅ Log da mensagem original e processada
- ✅ Análise da resposta recebida
- ✅ Correlação entre envio e recebimento

### 4. Debugger Visual (`src/components/debug/WebhookDebugger.tsx`)
- ✅ Interceptação de requisições fetch em tempo real
- ✅ Visualização do payload enviado
- ✅ Visualização da resposta recebida
- ✅ Teste manual do webhook
- ✅ Interface responsiva

## Como Testar

### 1. Acessar a Aplicação
1. Abra o navegador em `http://localhost:8080`
2. Navegue até a página de diagnóstico
3. Clique no botão "Debug" no header do chat

### 2. Ativar o Debugger
1. No painel de debug, clique em "Iniciar Captura"
2. O debugger começará a interceptar todas as requisições para `/api/webhook-proxy`

### 3. Testar Comunicação
1. **Teste Manual**: Clique em "Testar Webhook" no debugger
2. **Teste Real**: Inicie uma sessão de chat e envie uma mensagem
3. **Monitorar Logs**: Observe os logs no console do navegador (F12)

### 4. Analisar os Logs

#### No Console do Navegador (F12 > Console)
Procure por logs com os seguintes prefixos:
- `🚀 [hook_xxx]` - Logs do hook de chat
- `🚀 [chat_xxx]` - Logs do serviço de chat
- `🚀 [req_xxx]` - Logs do proxy

#### No Debugger Visual
- Veja o payload exato enviado
- Veja a resposta recebida
- Monitore status codes e tempos de resposta

### 5. Verificar o N8N
1. Acesse o dashboard do N8N
2. Verifique se o workflow está ativo
3. Monitore os logs de execução

## Pontos de Investigação

### 1. Verificar se o Payload Chega ao Proxy
- ✅ Implementado: Logs detalhados no proxy
- 🔍 **Verificar**: Se o `chatInput` contém a mensagem mais recente
- 🔍 **Verificar**: Se o `timestamp` está correto

### 2. Verificar se o Proxy Envia para o N8N
- ✅ Implementado: Log da requisição para o n8n
- 🔍 **Verificar**: Se a requisição é enviada com sucesso
- 🔍 **Verificar**: Se a resposta do n8n é recebida

### 3. Verificar se o N8N Processa a Mensagem
- 🔍 **Verificar**: Logs no dashboard do N8N
- 🔍 **Verificar**: Se o workflow está ativo e funcionando
- 🔍 **Verificar**: Se há erros na execução

## Possíveis Problemas Identificados

### 1. Cache do Proxy
- **Sintoma**: Mensagens antigas sendo reenviadas
- **Solução**: Logs implementados para verificar

### 2. Problema de Timing
- **Sintoma**: Mensagens enviadas muito rapidamente
- **Solução**: Logs com timestamp para verificar ordem

### 3. Problema no N8N
- **Sintoma**: Webhook não recebe ou não processa
- **Solução**: Verificar logs do n8n e status do workflow

### 4. Problema de Serialização
- **Sintoma**: Payload corrompido ou incompleto
- **Solução**: Logs detalhados do JSON enviado

## Próximos Passos

1. **Executar Testes**: Use o debugger para capturar requisições
2. **Analisar Logs**: Verifique se as mensagens estão sendo enviadas corretamente
3. **Verificar N8N**: Confirme se o webhook está recebendo as requisições
4. **Identificar Gargalo**: Determine onde exatamente a comunicação falha

## Comandos Úteis

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Verificar logs do servidor (se aplicável)
npm run logs

# Testar webhook manualmente
node test-webhook.js
```

## Informações Técnicas

- **URL do Webhook**: `https://primary-production-b7fe.up.railway.app/webhook/multiagente-ia-diagnostico`
- **Proxy Local**: `/api/webhook-proxy`
- **Timeout**: 30 segundos
- **Retry**: 3 tentativas com backoff exponencial

## Resultados Esperados

Após implementar esses logs, você deve conseguir:
1. Ver exatamente qual mensagem está sendo enviada
2. Confirmar se o proxy está funcionando
3. Verificar se o n8n está recebendo as requisições
4. Identificar onde está o problema na cadeia de comunicação

---

**Nota**: Lembre-se de remover o debugger visual da produção após resolver o problema.