👋 Bem-vindo ao **Tronco da Sorte**!

Esta é a mensagem que você vê ao abrir o projeto pela primeira vez.

---

## 🚀 COMECE AQUI EM 5 MINUTOS

### 1. Abra o terminal e execute:

```bash
npm install
```

### 2. Inicie o banco de dados local:

```bash
npx prisma dev
```

**⚠️ IMPORTANTE:** Copie a URL que aparecer (começa com `postgresql://`)

### 3. Abra `.env` e adicione:

```env
DATABASE_URL="cola-a-url-aqui"
```

### 4. Crie as tabelas:

```bash
npx prisma migrate dev --name init
```

### 5. Inicie o servidor:

```bash
npm run dev
```

### 6. Abra no navegador:

```
http://localhost:3000
```

---

## 📚 O QUE FOI CRIADO

✅ **Home** - Dashboard com estatísticas
✅ **Listar Rifas** - Grade de rifas ativas
✅ **Criar Rifa** - Formulário com upload de fotos
✅ **Top 5 Compradores** - Ranking
✅ **API REST** - Endpoints prontos
✅ **Banco de Dados** - PostgreSQL + Prisma
✅ **UI Responsiva** - Mobile/Desktop

---

## 📖 DOCUMENTAÇÃO

Leia nesta ordem:

1. **docs/QUICKSTART.md** - Setup mais detalhado
2. **docs/API.md** - Como usar a API
3. **docs/ROADMAP.md** - Futuro do projeto
4. **README.md** - Visão geral completa

---

## ❓ DÚVIDAS FREQUENTES

**P: Onde coloco a URL do banco?**
R: No arquivo `.env`

**P: Como resetar o banco?**
R: `npx prisma migrate reset`

**P: Como ver os dados?**
R: `npm run prisma:studio`

**P: Posso rodar sem PostgreSQL?**
R: Sim, `npx prisma dev` cria um local

---

## 🎯 PRÓXIMOS PASSOS

Após confirmar que tudo funciona:

1. **Implementar autenticação** (NextAuth.js)
2. **Integrar Mercado Pago** (Pix)
3. **Criar dashboard do usuário**
4. **Sistema de emails**

---

## 🎨 PERSONALIZAÇÕES

### Mudar cores
Edite: `tailwind.config.ts`

### Mudar logo
Edite: `src/components/navbar.tsx`

### Mudar nome
Pesquise por "Tronco da Sorte" e substitua

---

## 💡 DICAS

- Use `npm run dev` para desenvolvimento
- Instale [Prisma Extension](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma) no VS Code
- Ative o dark mode do Prisma Studio
- Faça commits frequentes

---

## 📞 SUPORTE

Se tiver problemas:

1. Veja `docs/QUICKSTART.md` - Troubleshooting
2. Verifique se PostgreSQL está rodando
3. Confira se DATABASE_URL está correto
4. Faça um `npx prisma migrate reset`

---

**🎊 Você está pronto para começar!**

Execute agora:
```bash
npm install && npx prisma dev
```

Boa sorte! 🚀
