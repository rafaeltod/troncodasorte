# Área Administrativa - Tronco da Sorte

Este guia explica como configurar e usar a área administrativa do sistema.

## 🚀 Configuração Inicial

### 1. Adicionar a coluna isAdmin no banco de dados

Execute o script de migração para adicionar a coluna `isAdmin` na tabela de usuários:

```bash
node scripts/add-isAdmin-column.js
```

Ou execute manualmente o SQL:

```bash
node -e "require('dotenv').config(); const { Pool } = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}}); pool.query('ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS \"isAdmin\" BOOLEAN DEFAULT FALSE;').then(() => {console.log('✅ Coluna adicionada'); pool.end()});"
```

### 2. Tornar um usuário administrador

Para tornar um usuário existente administrador, execute:

```bash
node scripts/set-admin.js email@do.usuario.com
```

Ou manualmente no banco de dados:

```sql
UPDATE "user" SET "isAdmin" = TRUE WHERE email = 'email@do.usuario.com';
```

## 📋 Funcionalidades da Área Administrativa

### Painel Administrativo (`/admin`)

O painel administrativo oferece:

- **Dashboard com estatísticas**:
  - Total de lotes criadas
  - Lotes abertas
  - Total de cotas vendidas
  - Receita total gerada

- **Lista de lotes**:
  - Visualização em tabela com todas as informações
  - Filtros por status (Todas, Abertas, Fechadas, Finalizadas)
  - Ações rápidas: Ver, Editar, Deletar

- **Gerenciamento de lotes**:
  - Ver detalhes de cada lote
  - Editar informações
  - Alterar status (Aberta, Fechada, Finalizada)
  - Deletar lotes

### Edição de Lotes (`/admin/lotes/[id]/editar`)

Na página de edição, você pode:

- ✏️ Atualizar título e descrição
- 💰 Modificar valor do prêmio
- 📸 Alterar imagens da lote
- 🎯 Mudar o status da lote
- 🎫 Ver total de cotas (bloqueado após vendas)
- 💵 Ver preço por cota (bloqueado após vendas)
- 🗑️ Deletar a lote completamente

**Nota**: Alguns campos não podem ser alterados após vendas realizadas para manter a integridade das transações.

## 🔐 Segurança

### Proteção de Rotas

Todas as rotas administrativas são protegidas:

1. **Autenticação**: Usuário precisa estar logado
2. **Autorização**: Usuário precisa ter `isAdmin = true`
3. **Validação de propriedade**: Admin só pode gerenciar suas próprias lotes

### Rotas Protegidas

- `/admin` - Painel administrativo
- `/admin/lotes/[id]/editar` - Edição de lote
- `/api/admin/lotes` - Listar lotes do admin
- `/api/admin/lotes/[id]` - Ver, editar ou deletar lote

## 🎨 Interface

### Navbar

Usuários administradores verão:
- 🛡️ **Painel Admin** - Botão amarelo destacado
- ➕ **Criar Lote** - Acesso rápido para criar novas lotes

### Cores e Ícones

- 👑 Ícone de coroa para área administrativa
- 🟢 Verde para lotes abertas
- 🟡 Amarelo para lotes fechadas
- ⚫ Cinza para lotes finalizadas

## 📊 Estatísticas

O dashboard exibe:
- Total de lotes
- Lotes abertas
- Total de cotas vendidas
- Receita total (soma de todas as vendas)
- Número de participantes por lote

## 🛠️ Estrutura Técnica

### Componentes Criados

1. **AdminRoute** (`src/components/admin-route.tsx`)
   - Componente HOC para proteger rotas administrativas
   - Redireciona não-admins para o dashboard

2. **Páginas**:
   - `src/app/admin/page.tsx` - Dashboard principal
   - `src/app/admin/lotes/[id]/editar/page.tsx` - Edição de lotes

3. **APIs**:
   - `src/app/api/admin/lotes/route.ts` - Listar lotes
   - `src/app/api/admin/lotes/[id]/route.ts` - CRUD de lote específica

4. **Scripts**:
   - `scripts/add-isAdmin-column.js` - Adiciona coluna no BD
   - `scripts/set-admin.js` - Torna usuário admin

## 🧪 Testes

Para testar a área administrativa:

1. Crie um usuário normal (registro)
2. Torne-o admin: `node scripts/set-admin.js seu@email.com`
3. Faça login com esse usuário
4. Acesse `/admin` para ver o painel
5. Crie e gerencie lotes

## 🚨 Troubleshooting

### "Acesso negado"
- Verifique se o usuário tem `isAdmin = true` no banco
- Verifique se está logado corretamente
- Limpe cookies e faça login novamente

### "Lote não encontrada"
- Verifique se a lote pertence ao usuário logado
- Admins só podem gerenciar suas próprias lotes

### Coluna isAdmin não existe
- Execute o script de migração: `node scripts/add-isAdmin-column.js`
