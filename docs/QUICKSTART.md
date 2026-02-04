# ⚡ Guia Rápido de Setup

## 1️⃣ Clone e Instale

```bash
cd /workspaces/troncodasorte
npm install
```

## 2️⃣ Banco de Dados

### Opção A: Banco Local (Recomendado para Dev)

```bash
npx prisma dev
```

Isso abrirá um banco PostgreSQL local. **Copie a URL que aparecer** e adicione ao `.env`:

```env
DATABASE_URL="postgresql://..."
```

### Opção B: Banco Remoto

Crie uma conta em [Railway.app](https://railway.app), [Render.com](https://render.com) ou use seu servidor VPS.

Após criar o banco, adicione ao `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/troncodasorte?schema=public"
```

## 3️⃣ Executar Migrações

```bash
npx prisma migrate dev --name init
```

Isso vai criar as tabelas automaticamente.

## 4️⃣ (Opcional) Popular com Dados de Teste

```bash
npm run prisma:seed
```

Cria usuários e rifas de teste.

## 5️⃣ Iniciar Servidor

```bash
npm run dev
```

Abra `http://localhost:3000` no navegador.

---

## 🛠️ Ferramentas Úteis

### Visualizar Banco de Dados
```bash
npm run prisma:studio
```

Abre interface visual do Prisma em `http://localhost:5555`

### Ver Schema
```bash
cat prisma/schema.prisma
```

### Resetar Banco Completamente
```bash
npx prisma migrate reset
```

⚠️ **CUIDADO**: Deleta TODOS os dados!

---

## 🚀 Deploy Local (Teste)

```bash
npm run build
npm run start
```

Acesse `http://localhost:3000`

---

## 📁 Estrutura Rápida

```
troncodasorte/
├── src/app/            # Páginas Next.js
├── src/components/     # Componentes React
├── src/lib/            # Utilities (DB, validações)
├── prisma/             # Schema do banco
├── docs/               # Documentação
└── .env                # Variáveis de ambiente
```

---

## ✅ Checklist de Primeira Vez

- [ ] `npm install`
- [ ] `npx prisma dev` (e copiar URL)
- [ ] Adicionar `DATABASE_URL` ao `.env`
- [ ] `npx prisma migrate dev --name init`
- [ ] `npm run prisma:seed`
- [ ] `npm run dev`
- [ ] Abrir `http://localhost:3000`
- [ ] Explorar as páginas 🎉

---

## 🆘 Problemas Comuns

### "DATABASE_URL not set"
Verifique se `.env` existe e tem a variável:
```bash
cat .env
```

### "Port 3000 already in use"
Use outra porta:
```bash
npm run dev -- -p 3001
```

### Erro ao conectar ao banco
Verifique se PostgreSQL está rodando:
```bash
pg_isready
```

### Migrações falhando
Tente resetar:
```bash
npx prisma migrate reset
```

---

## 📚 Links Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [Zod Validation](https://zod.dev)

---

**Pronto para começar? Siga o passo 1 acima! 🚀**
