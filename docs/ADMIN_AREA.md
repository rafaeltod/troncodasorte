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
  - Total de campanhas criadas
  - Campanhas abertas
  - Total de cotas vendidas
  - Receita total gerada

- **Lista de campanhas**:
  - Visualização em tabela com todas as informações
  - Filtros por status (Todas, Abertas, Fechadas, Finalizadas)
  - Ações rápidas: Ver, Editar, Deletar

- **Gerenciamento de campanhas**:
  - Ver detalhes de cada campanha
  - Editar informações
  - Alterar status (Aberta, Fechada, Finalizada)
  - Deletar campanhas

### Edição de Campanhas (`/admin/campanhas/[id]/editar`)

Na página de edição, você pode:

- ✏️ Atualizar título e descrição
- 💰 Modificar valor do prêmio
- 📸 Alterar imagens da campanha
- 🎯 Mudar o status da campanha
- 🎫 Ver total de cotas (bloqueado após vendas)
- 💵 Ver preço por cota (bloqueado após vendas)
- 🗑️ Deletar a campanha completamente

**Nota**: Alguns campos não podem ser alterados após vendas realizadas para manter a integridade das transações.

## 🔐 Segurança

### Proteção de Rotas

Todas as rotas administrativas são protegidas:

1. **Autenticação**: Usuário precisa estar logado
2. **Autorização**: Usuário precisa ter `isAdmin = true`
3. **Validação de propriedade**: Admin só pode gerenciar suas próprias campanhas

### Rotas Protegidas

- `/admin` - Painel administrativo
- `/admin/campanhas/[id]/editar` - Edição de campanha
- `/api/admin/campanhas` - Listar campanhas do admin
- `/api/admin/campanhas/[id]` - Ver, editar ou deletar campanha

## 🎨 Interface

### Navbar

Usuários administradores verão:
- 🛡️ **Painel Admin** - Botão amarelo destacado
- ➕ **Criar Campanha** - Acesso rápido para criar novas campanhas

### Cores e Ícones

- 👑 Ícone de coroa para área administrativa
- 🟢 Verde para campanhas abertas
- 🟡 Amarelo para campanhas fechadas
- ⚫ Cinza para campanhas finalizadas

## 📊 Estatísticas

O dashboard exibe:
- Total de campanhas
- Campanhas abertas
- Total de cotas vendidas
- Receita total (soma de todas as vendas)
- Número de participantes por campanha

## 🛠️ Estrutura Técnica

### Componentes Criados

1. **AdminRoute** (`src/components/admin-route.tsx`)
   - Componente HOC para proteger rotas administrativas
   - Redireciona não-admins para o dashboard

2. **Páginas**:
   - `src/app/admin/page.tsx` - Dashboard principal
   - `src/app/admin/campanhas/[id]/editar/page.tsx` - Edição de campanhas

3. **APIs**:
   - `src/app/api/admin/campanhas/route.ts` - Listar campanhas
   - `src/app/api/admin/campanhas/[id]/route.ts` - CRUD de campanha específica

4. **Scripts**:
   - `scripts/add-isAdmin-column.js` - Adiciona coluna no BD
   - `scripts/set-admin.js` - Torna usuário admin

## 🧪 Testes

Para testar a área administrativa:

1. Crie um usuário normal (registro)
2. Torne-o admin: `node scripts/set-admin.js seu@email.com`
3. Faça login com esse usuário
4. Acesse `/admin` para ver o painel
5. Crie e gerencie campanhas

## 🚨 Troubleshooting

### "Acesso negado"
- Verifique se o usuário tem `isAdmin = true` no banco
- Verifique se está logado corretamente
- Limpe cookies e faça login novamente

### "Campanha não encontrada"
- Verifique se a campanha pertence ao usuário logado
- Admins só podem gerenciar suas próprias campanhas

### Coluna isAdmin não existe
- Execute o script de migração: `node scripts/add-isAdmin-column.js`
