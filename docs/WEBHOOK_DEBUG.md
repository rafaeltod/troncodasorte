# 🔧 Configuração do Webhook do Mercado Pago

## ❌ Problema Identificado

O webhook de pagamento não está funcionando quando o usuário envia PIX. As causas podem ser:

1. **Webhook URL não registrada no Mercado Pago**
2. **Incompatibilidade de formato na metadata** ✅ CORRIGIDA
3. **Token de acesso expirado ou inválido**
4. **Firewall/Network bloqueando webhooks**

## ✅ Correções Aplicadas

### 1. Metadata - Padronizado para `snake_case`
**Arquivo**: `/src/app/api/payment/pix/route.ts`

**Antes**:
```json
{
  "metadata": {
    "purchaseId": "xyz",   // camelCase
    "raffleId": "abc"
  }
}
```

**Depois**:
```json
{
  "metadata": {
    "purchase_id": "xyz",  // snake_case (padrão MP)
    "raffle_id": "abc"
  }
}
```

### 2. Extração do purchaseId - Mais Robusta
**Arquivo**: `/src/app/api/payment/webhook/route.ts`

Agora tenta múltiplos formatos:
```javascript
let purchaseId = 
  payment.metadata?.purchase_id ||      // snake_case (padrão MP)
  payment.metadata?.purchaseId ||       // camelCase (fallback)
  payment.external_reference;           // último recurso
```

## 🚀 Como Configurar no Mercado Pago

### Passo 1: Acessar Dashboard do Mercado Pago

1. Vá para: https://www.mercadopago.com.br/business
2. Faça login com sua conta
3. Navegue para: **Configurações** (⚙️) → **Webhooks**

### Passo 2: Registrar URL do Webhook

**Para Produção (Vercel)**:
```
https://seu-dominio.vercel.app/api/payment/webhook
```

**Para Desenvolvimento (ngrok)**:
```
https://seu-ngrok-id.ngrok.io/api/payment/webhook
```

### Passo 3: Configurar Eventos

Selecione **APENAS estes eventos**:
- ✅ `payment.created`
- ✅ `payment.updated`

### Passo 4: Adicionar Versão da API

Certifique-se de usar a versão correta (geralmente é automático).

### Passo 5: Testar

1. Clique em "Test" ou use o endpoint de teste
2. Verifique os logs em: **Configurações** → **Webhooks** → **Últimas Respostas**

## 🧪 Testes Locais

### Teste 1: Verificar se Endpoint Responde

```bash
curl -X POST "http://localhost:3000/api/payment/webhook?topic=payment&id=12345" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Esperado**: `{"error":"Erro ao buscar pagamento"}` (porque ID 12345 não existe no MP)

### Teste 2: Usar Endpoint de Debug

1. Acesse: `http://localhost:3000/api/debug/webhook-test`
2. Ele vai mostrar as instruções de teste
3. Ou faça um POST para simular um webhook

```bash
curl -X POST "http://localhost:3000/api/debug/webhook-test" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Teste 3: Verificar Logs

No seu servidor Next.js, procure por logs como:
```
[MP Webhook] Recebido evento: {...}
[MP Webhook] Detalhes do pagamento: {...}
[MP Webhook] Pagamento aprovado! Confirmando compra: xyz123
```

## 📞 Se Ainda Não Funcionar

### 1. Verificar Credenciais

```bash
# No seu .env, confirme que tem:
echo $MERCADO_PAGO_ACCESS_TOKEN      # Não deve estar vazio
echo $MERCADO_PAGO_WEBHOOK_SECRET    # Não deve estar vazio
```

### 2. Simular Webhook Real com Curl

Criar um arquivo `test-webhook.sh`:

```bash
#!/bin/bash

# Simular webhook do Mercado Pago via curl
WEBHOOK_URL="http://localhost:3000/api/payment/webhook"
PAYMENT_ID="999999999"
PURCHASE_ID="some-purchase-id"

curl -X POST "$WEBHOOK_URL?topic=payment&id=$PAYMENT_ID" \
  -H "Content-Type: application/json" \
  -d "{
    \"data\": {
      \"id\": \"$PAYMENT_ID\"
    },
    \"type\": \"payment\",
    \"action\": \"payment.created\"
  }"
```

### 3. Usar Ngrok para Desenvolvimento

Se estiver testando com PIX de verdade:

```bash
# Terminal 1: Iniciar ngrok
ngrok http 3000

# Terminal 2: Iniciar servidor
npm run dev

# Ir para o Dashboard do MP e registrar webhook:
# https://seu-ngrok-id.ngrok.io/api/payment/webhook
```

### 4. Verificar Eventos Recebidos

No Mercado Pago Dashboard:
1. Vá para **Configurações** → **Webhooks**
2. Clique no webhook registrado
3. Em "Últimas Respostas", você vê os eventos recebidos e as respostas

## 🔍 Checkpoints de Sucesso

- [ ] Metadata usa `purchase_id` (snake_case)
- [ ] Webhook URL registrada no Mercado Pago
- [ ] Endpoint `/api/payment/webhook` responde com 200 OK
- [ ] Logs mostram "[MP Webhook] ✅ Pagamento aprovado"
- [ ] Purchase status muda para 'confirmed' no banco
- [ ] Números BILHETES são gerados
- [ ] Frontend redireciona para `/compra/[purchaseId]`

## 🐛 Debugging Avançado

Se ainda não está funcionando:

1. **Verificar status HTTP do webhook**:
   - Deve retornar `200 OK`
   - Se retornar erro, MP vai fazer retry por 72h

2. **Verificar logs no Vercel**:
   ```bash
   vercel logs --tail
   ```

3. **Adicionar console.log extra** no webhook:
   - Linha antes de buscar pagamento do MP
   - Linha ao encontrar purchaseId
   - Linha antes de confirmar compra

4. **Simular webhook com dados reais**:
   - Fazer PIX de teste (se MP oferece)
   - Ou usar simulated payment no Postman/Insomnia

## 📋 Checklist Final

```
METADATA
- [ ] PIX route envia purchase_id (snake_case)
- [ ] Webhook extrai purchase_id corretamente
- [ ] Logs mostram purchaseId encontrado

WEBHOOK REGISTRATION
- [ ] URL registrada em Settings → Webhooks
- [ ] Apenas eventos 'payment.created' e 'payment.updated' habilitados
- [ ] Webhook respondendo com 200 OK

DATABASE UPDATES
- [ ] Purchase status muda para 'confirmed' (verificar DB)
- [ ] Números BILHETES são gerados no campo 'numbers'
- [ ] LivroCount incrementado em lotes
- [ ] TopBuyer atualizado

FRONTEND
- [ ] Modal PIX fecha automaticamente
- [ ] Pagina redireciona para /compra/[purchaseId]
- [ ] Números aparecem na página de compra
- [ ] Polling para após receber status confirmado
```

## 💡 Próximos Passos

1. Confirmar webhook registrada no MP
2. Testar com `/api/debug/webhook-test`
3. Se funcionar localmente, fazer PIX de teste
4. Se não funcionar, verificar logs do Vercel
5. Contatar suporte MP com payload de webhook que não funcionou
