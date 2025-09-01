# Guia Rápido - Teste do Debugger Webhook

## ✅ Problemas Corrigidos

- **Redirecionamentos automáticos**: Removidos para manter o usuário na página
- **Interceptação de fetch**: Melhorada para ser menos intrusiva
- **Estabilidade do debugger**: Mais robusto e confiável

## 🚀 Como Testar Agora

### 1. Acesse a Aplicação
```
http://localhost:8080/diagnosis/chat
```

### 2. Ative o Debugger
1. Clique no botão **"Debug"** no header do chat (ícone de bug)
2. No painel que abrir, clique em **"Iniciar Captura"**
3. O status deve mostrar "Capturando (0 logs)"

### 3. Teste a Comunicação

#### Opção A: Teste Manual
1. No debugger, clique em **"Testar Webhook"**
2. Observe o log aparecer em tempo real
3. Verifique o payload e a resposta

#### Opção B: Teste Real
1. No chat, clique em **"Iniciar Conversa"**
2. Digite uma mensagem e envie
3. Observe os logs sendo capturados

### 4. Analisar os Resultados

#### No Debugger Visual:
- **Payload**: Veja exatamente o que está sendo enviado
- **Response**: Veja a resposta do n8n
- **Status**: Verde = sucesso, Vermelho = erro
- **Tempo**: Duração da requisição

#### No Console (F12):
Procure por logs com prefixos:
- `🚀 [hook_xxx]` - Logs do hook
- `🚀 [chat_xxx]` - Logs do service  
- `🚀 [req_xxx]` - Logs do proxy

## 🔍 O Que Procurar

### ✅ Funcionamento Normal:
```
Sequência esperada:
1. Usuário envia mensagem
2. Hook processa mensagem
3. Service faz requisição
4. Proxy retransmite para n8n
5. N8n responde
6. Resposta volta para o usuário
```

### ❌ Possíveis Problemas:

#### Mensagem Antiga Sendo Enviada:
```json
// No payload, verificar se chatInput tem a mensagem mais recente
{
  "chatInput": "mensagem antiga", // ❌ Problema aqui
  "user_id": "...",
  "session_id": "...",
  "timestamp": "..."
}
```

#### Proxy Não Responde:
```
Status: ERROR
Error: Failed to fetch
```

#### N8n Não Processa:
```json
// Resposta do n8n
{
  "error": "Workflow could not be started",
  "message": "..."
}
```

## 🛠️ Comandos de Teste Adicional

### Teste via Script:
```bash
# Teste básico
node test-webhook.js

# Teste com mensagem específica
node test-webhook.js --message="Minha mensagem de teste"

# Múltiplos testes
node test-webhook.js --multiple --count=3
```

### Teste via cURL:
```bash
curl -X POST http://localhost:8080/api/webhook-proxy \
  -H "Content-Type: application/json" \
  -d '{"chatInput":"teste manual","user_id":"test","session_id":"test","timestamp":"2025-01-09T12:00:00Z"}'
```

## 📊 Interpretando os Logs

### Log Completo de Sucesso:
```
🚀 [hook_123] useDiagnosisChat: Sending to n8n: {...}
🚀 [chat_456] Making request to n8n: {...}
🚀 [req_789] Proxying request to: https://...
📡 [req_789] Webhook response: {status: 200, ...}
✅ [req_789] Request completed successfully
```

### Identificando o Problema:
- **Para no hook**: Problema no componente React
- **Para no service**: Problema na lógica de envio
- **Para no proxy**: Problema de rede/configuração
- **N8n não responde**: Problema no webhook/workflow

## 🎯 Próximos Passos

1. **Execute o teste** e capture os logs
2. **Identifique onde para** a cadeia de comunicação
3. **Verifique se a mensagem mais recente** está no payload
4. **Reporte os resultados** com screenshots dos logs

---

**Status**: ✅ Debugger estável e pronto para uso
**Objetivo**: Identificar por que n8n não recebe mensagens mais recentes