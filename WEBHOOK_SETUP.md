# Webhook do Mercado Pago - Setup

## O que é?

O webhook permite que o Mercado Pago notifique seu servidor automaticamente quando um pagamento é confirmado, rejeitado, etc.

## Endpoints Implementados

### 1. **POST /api/payment/webhook**
Recebe notificações do Mercado Pago sobre mudanças de pagamento.

**O que faz:**
- Recebe o evento de pagamento do Mercado Pago
- Busca os detalhes do pagamento na API do MP
- Se o pagamento foi **aprovado**: atualiza o status da compra de `pending` → `confirmed`
- Se foi **rejeitado**: apenas loga (pode implementar deleção automática depois)

### 2. **GET /api/rifas/[id]/purchase/[purchaseId]**
Permite que o frontend verifique o status da compra (polling).

**Exemplo:**
```bash
GET /api/rifas/a9cbcfec-e1f4-427b-a672-5e3428e05ae9/purchase/d4dd6d57-fde1-4863-925c-bf18d84d647d
```

**Resposta:**
```json
{
  "purchaseId": "d4dd6d57-fde1-4863-925c-bf18d84d647d",
  "status": "confirmed",
  "quotas": 4,
  "amount": "2.00",
  "createdAt": "2026-02-09T...",
  "updatedAt": "2026-02-09T..."
}
```

## Como Configurar no Mercado Pago

### Passo 1: Acessar Settings do Mercado Pago
1. Ir para: https://www.mercadopago.com.br/settings/account/notifications
2. Login com sua conta

### Passo 2: Adicionar Webhook
- **Tipo de notificação:** Webhooks
- **URL:** `https://seu-dominio.com/api/payment/webhook`
  - Em desenvolvimento local: use `ngrok` ou `localhost.run` para expor a porta
- **Tipos de evento:** Selecione "payment"

### Passo 3: Testes
```bash
# Teste manual do webhook
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": "webhook-id",
    "live_mode": false,
    "type": "payment",
    "data": {
      "id": "145528619352"
    },
    "action": "payment.created"
  }'
```

## Fluxo Implementado

```
Usuário clica "Pagar"
  ↓
Frontend envia requisição POST → /api/payment/pix
  ↓
Backend retorna QR code + transactionId
  ↓
Frontend mostra QR code e inicia polling a cada 3s → /api/rifas/[id]/purchase/[purchaseId]
  ↓
Usuário escaneia QR e realiza pagamento no celular
  ↓
Mercado Pago processa o pagamento
  ↓
Mercado Pago envia webhook → /api/payment/webhook
  ↓ (E/OU)
Frontend detect mudança no polling → status = "confirmed"
  ↓
onPaymentConfirmed() é chamado
  ↓
Redireciona para /historico
```

## Dois Mecanismos de Confirmação

### 1. **Webhook (Recomendado)**
- ✅ Mais rápido (instantâneo quando MP notifica)
- ✅ Não depende do cliente ficar on linha
- ⚠️ Requer configuração manual no Mercado Pago

### 2. **Polling Frontend**
- ✅ Funciona imediatamente, sem configuração
- ✅ Verifica status a cada 3 segundos durante 2 minutos
- ⚠️ Menos eficiente se o usuário fechar a página

## Em Produção

Para expor seu localhost ao Mercado Pago:

### Opção 1: ngrok
```bash
npm install -g ngrok
ngrok http 3000
```

Você receberá uma URL como `https://abc123.ngrok.io`

Configure no Mercado Pago:
- URL do webhook: `https://abc123.ngrok.io/api/payment/webhook`

### Opção 2: localhost.run
```bash
ssh -R 80:localhost:3000 ssh.localhost.run
```

### Opção 3: Deploy Real
Quando fazer deploy no Vercel/servidor real, a URL será algo como:
- URL do webhook: `https://seu-app.vercel.app/api/payment/webhook`

## Logs para Debug

O backend loga tudo em `[MP Webhook]`:

```
[MP Webhook] Recebido evento: { query: {...}, body: {...} }
[MP Webhook] Processando pagamento: 145528619352
[MP Webhook] Detalhes do pagamento: { id, status, purchaseId }
[MP Webhook] ✅ Compra confirmada: { purchaseId, status, quotas, amount }
```

O frontend loga em `[usePurchaseStatus]`:

```
[usePurchaseStatus] Status: confirmed
[usePurchaseStatus] ✅ Compra confirmada!
```

## TODO Futuro

- [ ] Implementar retry automático se webhook falhar
- [ ] Adicionar verificação de assinatura do webhook (X-Signature)
- [ ] Cancelamento automático de compras não pagas após 1 hora
- [ ] Notificação por email quando pagamento for confirmado
