# Debug de Pagamento PIX - Mercado Pago

## Status da Integração

### ✅ Implementado:
1. **Criação de pagamento PIX**: `/api/payment/pix` (POST)
   - Integra com API do Mercado Pago
   - Retorna QR code EMV válido
   - Salva `payment_id` na compra
   - Envia `metadata.purchase_id` para rastreamento

2. **Webhook do Mercado Pago**: `/api/payment/webhook` (POST)
   - Recebe notificações de pagamento
   - Busca `purchaseId` em `metadata.purchase_id` ou `external_reference`
   - Confirma compra e gera números das cotas

3. **Polling de status**: Hook `usePurchaseStatus`
   - Verifica status a cada 3 segundos
   - Timeout de 240 segundos (80 tentativas)
   - Redireciona para `/meus-bilhetes/resultado` ao confirmar

## Como Testar Localmente

### Opção 1: Confirmação Manual (Para Desenvolvimento)

Se o webhook não estiver funcionando, você pode confirmar pagamentos manualmente:

```bash
# Confirmar uma compra específica
curl "http://localhost:3000/api/payment/confirm-manual?purchaseId=SEU_PURCHASE_ID"
```

Isso vai:
- Gerar números das cotas
- Marcar compra como confirmada
- Atualizar contadores do lote
- Atualizar top buyers

### Opção 2: Simular Webhook do Mercado Pago

```bash
# Simular webhook
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "payment.updated",
    "data": {
      "id": "PAYMENT_ID_DO_MERCADO_PAGO"
    }
  }'
```

### Opção 3: Webhook Real (Produção/Staging)

Para que o webhook funcione em produção:

1. **URL deve estar acessível publicamente**
   - O Mercado Pago precisa conseguir chamar a URL
   - Exemplo: `https://troncodasorte.com.br/api/payment/webhook`

2. **Configurar no Mercado Pago**
   - Acessar: https://www.mercadopago.com.br/developers/panel/app
   - Ir em "Webhooks" → "Configurar notificações"
   - Adicionar URL: `https://seu-dominio.com/api/payment/webhook`
   - Selecionar evento: "Pagamentos"

3. **Variáveis de ambiente necessárias**
   ```env
   MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
   NEXT_PUBLIC_BASE_URL=https://troncodasorte.com.br
   ```

## Fluxo Completo

```
1. Usuário clica em "Comprar"
   ↓
2. Frontend chama /api/lotes/{id}/purchase (POST)
   - Cria registro em `livros` com status="pending"
   - Retorna purchaseId
   ↓
3. Frontend abre modal PIX
   ↓
4. Modal chama /api/payment/pix (POST)
   - Cria pagamento no Mercado Pago
   - Retorna QR code EMV válido
   - Salva payment_id na compra
   ↓
5. Usuário escaneia QR code e paga
   ↓
6. Mercado Pago confirma pagamento (alguns segundos)
   ↓
7. Mercado Pago chama /api/payment/webhook (POST)
   - Verifica payment.status === "approved"
   - Busca purchaseId em metadata
   - Gera números das cotas
   - Atualiza status para "confirmed"
   ↓
8. Hook usePurchaseStatus detecta mudança (polling)
   - status === "confirmed"
   - Chama onPaymentConfirmed()
   ↓
9. Frontend redireciona para /meus-bilhetes/resultado
   ✅ SUCESSO!
```

## Problemas Comuns

### 1. "Webhook não está sendo chamado"
**Causa**: URL não está acessível ou não configurada no Mercado Pago
**Solução**: 
- Verificar se a URL está pública e acessível
- Configurar no painel do Mercado Pago
- Ou usar confirmação manual para desenvolvimento

### 2. "Polling expira antes de confirmar"
**Causa**: Webhook demora ou não funciona
**Solução**:
- Aumentar timeout do polling (atualmente 240s)
- Usar confirmação manual durante desenvolvimento
- Verificar logs do webhook

### 3. "QR code não aparece"
**Causa**: Mercado Pago não retornou código EMV
**Solução**:
- Verificar se MERCADO_PAGO_ACCESS_TOKEN está configurado
- Ver logs em `/api/payment/pix`
- Verificar se a conta do MP está ativa

### 4. "purchaseId não encontrado no webhook"
**Causa**: metadata não está sendo enviado corretamente
**Solução**:
- Já corrigido! Agora envia `metadata.purchase_id`
- Fallback para `external_reference`

## Logs para Debug

### Verificar criação do pagamento:
```
[Payment] Criando pagamento PIX no Mercado Pago...
[Payment] ✅ Pagamento criado no Mercado Pago: { id, status, metadata }
```

### Verificar webhook:
```
[MP Webhook] Recebido evento: { query, body }
[MP Webhook] Análise do evento: { topic, isPaymentEvent, paymentId }
[MP Webhook] Detalhes do pagamento: { id, status, metadata }
[MP Webhook] ✅ Pagamento aprovado! Confirmando compra: xxx
```

### Verificar polling:
```
[usePurchaseStatus] Iniciando polling...
[usePurchaseStatus] Status: pending
[usePurchaseStatus] Status: confirmed
[usePurchaseStatus] ✅ Compra confirmada!
```

## Frontend - Como Adicionar Página de Debug

Adicione um botão temporário no modal PIX para confirmar manualmente:

```tsx
// Em pix-payment-modal.tsx (apenas para desenvolvimento)
<button
  onClick={async () => {
    const res = await fetch(`/api/payment/confirm-manual?purchaseId=${purchaseId}`)
    const data = await res.json()
    if (data.success) {
      alert('Pagamento confirmado manualmente!')
      onPaymentConfirmed?.()
    }
  }}
  className="text-xs text-gray-500 underline"
>
  [DEV] Confirmar Manualmente
</button>
```

## Próximos Passos

1. ✅ Adicionar `metadata.purchase_id` na criação do pagamento
2. ✅ Criar endpoint de confirmação manual
3. ⏳ Testar webhook em produção
4. ⏳ Configurar URL do webhook no painel do Mercado Pago
5. ⏳ Verificar se pagamentos de teste funcionam no sandbox
