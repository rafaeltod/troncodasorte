#!/bin/bash

# Script para atualizar todas as referências de tabelas no código

echo "🔄 Substituindo referências de tabelas no código..."

# Encontrar todos os arquivos TS/TSX/JS e substituir
find src scripts docs -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.sql" -o -name "*.md" \) | while read file; do
  # Fazer backups das mudanças
  cp "$file" "$file.bak"
  
  # FROM raffle → FROM lotes
  sed -i 's/FROM raffle\b/FROM lotes/g' "$file"
  sed -i 's/FROM "raffle"/FROM "lotes"/g' "$file"
  
  # INSERT INTO raffle → INSERT INTO lotes
  sed -i 's/INSERT INTO raffle\b/INSERT INTO lotes/g' "$file"
  sed -i 's/INSERT INTO "raffle"/INSERT INTO "lotes"/g' "$file"
  
  # UPDATE raffle → UPDATE lotes
  sed -i 's/UPDATE raffle\b/UPDATE lotes/g' "$file"
  sed -i 's/UPDATE "raffle"/UPDATE "lotes"/g' "$file"
  
  # DELETE FROM raffle → DELETE FROM lotes
  sed -i 's/DELETE FROM raffle\b/DELETE FROM lotes/g' "$file"
  sed -i 's/DELETE FROM "raffle"/DELETE FROM "lotes"/g' "$file"
  
  # FROM "rafflePurchase" → FROM livros
  sed -i 's/FROM "rafflePurchase"/FROM livros/g' "$file"
  
  # INSERT INTO "rafflePurchase" → INSERT INTO livros
  sed -i 's/INSERT INTO "rafflePurchase"/INSERT INTO livros/g' "$file"
  
  # UPDATE "rafflePurchase" → UPDATE livros
  sed -i 's/UPDATE "rafflePurchase"/UPDATE livros/g' "$file"
  
  # DELETE FROM "rafflePurchase" → DELETE FROM livros
  sed -i 's/DELETE FROM "rafflePurchase"/DELETE FROM livros/g' "$file"
done

echo "✅ Todas as referências foram atualizadas!"
echo "📋 Próximos passos:"
echo "  1. npm run build"
echo "  2. Testar a aplicação"
echo "  3. Se tudo OK: git add -A && git commit"
echo ""
echo "Para reverter as mudanças caso algo quebrou:"
echo "  find src scripts docs -name '*.bak' -exec sh -c 'mv \"\$1\" \"\${1%.bak}\"' _ {} \\;"
