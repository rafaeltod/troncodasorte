# 🎲 Tronco da Sorte

Plataforma de rifas online com sorteios premiados. Base do projeto criada em Next.js.

## 📋 Tecnologias

- **Next.js 14+** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilos responsivos
- **Prisma ORM** - Gerenciamento do banco de dados
- **PostgreSQL** - Banco de dados
- **Zod** - Validação de dados

## 🚀 Como Começar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados

#### Opção A: PostgreSQL Local (com Prisma Dev)
```bash
npx prisma dev
```

Isso vai criar um banco PostgreSQL localmente. Copie a `DATABASE_URL` que aparecerá no terminal para o arquivo `.env`.

#### Opção B: PostgreSQL Remoto (Hostinger/Railway/Render)
No arquivo `.env`, adicione sua `DATABASE_URL`:
```
DATABASE_URL="postgresql://user:password@host:5432/troncodasorte?schema=public"
```

### 3. Executar Migrações
```bash
npx prisma migrate dev --name init
```

### 4. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/              # Rotas da API
│   ├── rifas/            # Página de rifas
│   ├── criar-rifa/       # Formulário para criar rifa
│   ├── top-compradores/  # Ranking de compradores
│   ├── layout.tsx        # Layout principal
│   ├── page.tsx          # Home
│   └── globals.css       # Estilos globais
├── components/           # Componentes React
│   ├── navbar.tsx
│   ├── raffle-card.tsx
│   └── image-upload.tsx
├── lib/
│   ├── db.ts            # Cliente Prisma
│   ├── validations.ts   # Schemas Zod
│   ├── queries.ts       # Queries do BD
│   └── actions.ts       # Ações/mutations
└── prisma/
    └── schema.prisma     # Schema do banco
```

## 🛠️ Funcionalidades Implementadas

✅ **Home** - Dashboard com estatísticas
✅ **Listar Rifas** - Grade de rifas ativas
✅ **Detalhes da Rifa** - Página individual com fotos
✅ **Top 5 Compradores** - Ranking de compradores
✅ **Criar Rifa** - Formulário com upload de até 20 fotos
✅ **API** - Endpoints REST prontos
✅ **Responsivo** - Mobile-first design
✅ **Validações** - Zod schemas

## 📝 Banco de Dados

### Tabelas

1. **User** - Usuários (CPF, nome, email)
2. **Raffle** - Rifas (título, prêmio, cotas, status)
3. **RafflePurchase** - Compras de cotas
4. **TopBuyer** - Cache de top compradores

Ver schema completo em `prisma/schema.prisma`

## 🔄 Próximos Passos

- [ ] Sistema de autenticação (NextAuth)
- [ ] Integração Mercado Pago/Pix
- [ ] Sistema de emails
- [ ] Whatsapp automático
- [ ] Dashboard do criador
- [ ] Histórico do usuário
- [ ] Sistema de sorteio automático
- [ ] Legislação/Ebook
- [ ] Deploy (Coolify/Vercel)

## 🌐 Deploy (Hostinger - Via Coolify)

1. **VPS KVM 1** (4GB RAM) - Ubuntu 24.04

2. **Instalar Swap**:
```bash
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

3. **Instalar Coolify**:
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

4. **No Coolify** (http://IP:8000):
   - Criar PostgreSQL
   - Copiar CONNECTION_STRING
   - Add Resource → Git Repository → Seu GitHub
   - Environment Variables → DATABASE_URL

5. **Domínio**:
   - Entrada A apontando para IP da VPS
   - Coolify → Configurar HTTPS

---

**Feito com ❤️ para sorteios justos e transparentes.**

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
