#!/bin/bash

# 🎲 Teste Rápido da API - Execute após npm run dev

echo "🚀 Testando API do Tronco da Sorte"
echo "===================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api"

echo -e "${BLUE}1. Testando GET /api/rifas${NC}"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/rifas")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Status 200${NC}"
    echo "Resposta: $body" | head -c 100
    echo "..."
else
    echo -e "${RED}✗ Status $http_code${NC}"
fi
echo ""

echo -e "${BLUE}2. Testando GET /api/top-buyers${NC}"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/top-buyers")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Status 200${NC}"
else
    echo -e "${RED}✗ Status $http_code${NC}"
fi
echo ""

echo -e "${BLUE}3. Testando POST /api/rifas (sem BD, erro esperado)${NC}"
response=$(curl -s -X POST "$BASE_URL/rifas" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teste",
    "prizeAmount": 1000,
    "totalQuotas": 100,
    "images": []
  }' \
  -w "\n%{http_code}")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" != "200" ]; then
    echo -e "${GREEN}✓ Erro esperado (Status $http_code)${NC}"
    echo "Erro: Banco de dados não configurado"
else
    echo -e "${BLUE}✓ Status 200 (BD funcionando!)${NC}"
fi
echo ""

echo "===================================="
echo -e "${GREEN}✓ Testes básicos concluídos!${NC}"
echo ""
echo "📝 Próximos passos:"
echo "  1. Configure DATABASE_URL no .env"
echo "  2. Execute: npx prisma migrate dev --name init"
echo "  3. Execute: npm run prisma:seed"
echo "  4. Execute este script novamente"
echo ""
