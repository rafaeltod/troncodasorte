#!/bin/bash

# Script para refatorar campanhas → lotes e cotas → livros

echo "🔄 Iniciando refatoração..."

BRANCH=$1
if [ -z "$BRANCH" ]; then
  BRANCH=$(git branch --show-current)
fi

echo "📍 Branch atual: $BRANCH"

# 1. Conteúdo dos arquivos - replacements em massa
echo "📝 Atualizando conteúdo dos arquivos..."

# Substituições principais (case-sensitive)
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -exec sed -i \
  -e 's/Campanhas/Lotes/g' \
  -e 's/Campanha/Lote/g' \
  -e 's/campanhas/lotes/g' \
  -e 's/campanha/lote/g' \
  -e 's/Cotas/Livros/g' \
  -e 's/Cota/Livro/g' \
  -e 's/quotas/livros/g' \
  -e 's/quota/livro/g' \
  -e 's/Quotas/Livros/g' \
  -e 's/Quota/Livro/g' \
  -e 's/COTAS/LIVROS/g' \
  -e 's/CAMPANHAS/LOTES/g' \
  {} \;

# 2. Comentários e docs
find docs scripts -type f \( -name "*.md" -o -name "*.txt" \) 2>/dev/null -exec sed -i \
  -e 's/Campanhas/Lotes/g' \
  -e 's/Campanha/Lote/g' \
  -e 's/campanhas/lotes/g' \
  -e 's/campanha/lote/g' \
  -e 's/Cotas/Livros/g' \
  -e 's/Cota/Livro/g' \
  -e 's/quotas/livros/g' \
  -e 's/quota/livro/g' \
  {} \;

echo "✅ Conteúdo atualizado"

# 3. Renomear arquivos
echo "📁 Renomeando pastas e arquivos..."

# Renomear pastas
[ -d "src/app/campanhas" ] && mv src/app/campanhas src/app/lotes && echo "  ✓ src/app/campanhas → src/app/lotes"
[ -d "src/app/criar-campanha" ] && mv src/app/criar-campanha src/app/criar-lote && echo "  ✓ src/app/criar-campanha → src/app/criar-lote"
[ -d "src/app/admin/campanhas" ] && mv src/app/admin/campanhas src/app/admin/lotes && echo "  ✓ src/app/admin/campanhas → src/app/admin/lotes"
[ -d "src/app/api/campanhas" ] && mv src/app/api/campanhas src/app/api/lotes && echo "  ✓ src/app/api/campanhas → src/app/api/lotes"
[ -d "src/app/api/admin/campanhas" ] && mv src/app/api/admin/campanhas src/app/api/admin/lotes && echo "  ✓ src/app/api/admin/campanhas → src/app/api/admin/lotes"

echo "✅ Pastas renomeadas"

echo "✨ Refatoração completa!"
echo "📋 Próximos passos:"
echo "   1. Testar a build: npm run build"
echo "   2. Fazer commit: git add -A && git commit -m 'refactor: campanhas → lotes, cotas → livros'"
echo "   3. Ir para próxima branch: git checkout <branch>"
