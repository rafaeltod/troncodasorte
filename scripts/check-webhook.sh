#!/bin/bash

# Script para verificar e configurar webhook do Mercado Pago

echo "🔍 Verificando configuração do webhook..."
echo ""

# Verificar se há variáveis de ambiente
echo "📋 Variáveis de ambiente:"
echo "MERCADO_PAGO_ACCESS_TOKEN: ${MERCADO_PAGO_ACCESS_TOKEN:0:20}..."
echo "NEXT_PUBLIC_BASE_URL: $NEXT_PUBLIC_BASE_URL"
echo ""

# Verificar se o servidor está rodando
echo "🌐 Verificando se o servidor está acessível..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✅ Servidor está rodando"
else
  echo "❌ Servidor não está acessível"
fi
echo ""

# Listar últimas compras
echo "📦 Últimas compras:"
curl -s "http://localhost:3000/api/debug/test-payment" | jq '.purchases[] | {id, status, livros, amount, payment_id}'
echo ""

echo "💡 Para testar o webhook:"
echo "1. Acesse http://localhost:3000/api/debug/add-payment-id-column para criar coluna"
echo "2. Faça uma compra"
echo "3. Use o botão 🔧 [DEV] no modal PIX"
echo "4. Ou acesse: http://localhost:3000/api/payment/confirm-manual?purchaseId=SEU_ID"
echo ""

echo "🔗 URL do webhook para configurar no Mercado Pago:"
echo "$NEXT_PUBLIC_BASE_URL/api/payment/webhook"
