# 🗺️ Roadmap do Projeto

## 📋 Fase 1: Base (✅ CONCLUÍDA)

- [x] Estrutura Next.js + TypeScript
- [x] Tailwind CSS responsivo
- [x] Prisma + PostgreSQL
- [x] Schema do banco (User, Raffle, RafflePurchase, TopBuyer)
- [x] Home com estatísticas
- [x] Listar rifas
- [x] Detalhe da rifa com fotos
- [x] Criar rifa com upload de até 20 fotos
- [x] Top 5 compradores
- [x] API REST básica
- [x] Validações com Zod

---

## 🔐 Fase 2: Autenticação

**Priority:** ⭐⭐⭐⭐⭐

- [ ] NextAuth.js setup
- [ ] Login com email + senha
- [ ] Cadastro de usuário
- [ ] Sessão persistente
- [ ] Proteção de rotas
- [ ] Reset de senha
- [ ] Middleware de auth

**Arquivos a criar:**
- `src/auth.ts` - Config NextAuth
- `src/app/auth/login/page.tsx`
- `src/app/auth/signup/page.tsx`
- `src/middleware.ts`

---

## 💳 Fase 3: Pagamento (Mercado Pago)

**Priority:** ⭐⭐⭐⭐⭐

- [ ] Integração Mercado Pago SDK
- [ ] Gerar QR Code Pix
- [ ] Validar pagamento
- [ ] Webhook de confirmação
- [ ] Liberar cotas automaticamente
- [ ] Histórico de transações
- [ ] Reembolso (manual)

**Configuração:**
```env
MERCADO_PAGO_ACCESS_TOKEN="..."
MERCADO_PAGO_PUBLIC_KEY="..."
```

**Rotas:**
- POST `/api/payments/create`
- POST `/api/payments/webhook`
- GET `/api/payments/[id]`

---

## 📧 Fase 4: Emails

**Priority:** ⭐⭐⭐⭐

- [ ] SendGrid integração
- [ ] Email de confirmação de compra
- [ ] Email de aviso de rifa sorteada
- [ ] Email para vencedor
- [ ] Notificação de rifa quase lotada
- [ ] Templates HTML
- [ ] Histórico de emails

**Configuração:**
```env
SENDGRID_API_KEY="..."
SENDGRID_FROM_EMAIL="noreply@tronco.com"
```

---

## 🤖 Fase 5: WhatsApp Automático

**Priority:** ⭐⭐⭐

- [ ] Twilio integração
- [ ] Mensagem de boas-vindas
- [ ] Confirmação de compra via WhatsApp
- [ ] Notificação de sorteio
- [ ] Aviso ao vencedor
- [ ] Link de rastreamento
- [ ] Grupos automáticos

**Configuração:**
```env
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+55..."
```

---

## 👤 Fase 6: Dashboard do Usuário

**Priority:** ⭐⭐⭐⭐

- [ ] Página de perfil
- [ ] Editar dados pessoais
- [ ] Histórico de compras
- [ ] Minhas rifas criadas
- [ ] Estatísticas pessoais
- [ ] Extrato de gastos
- [ ] Prêmios ganhos

**Páginas:**
- `/perfil` - Dados pessoais
- `/minhas-compras` - Histórico
- `/minhas-rifas` - Criadas pelo user
- `/premios` - Prêmios ganhos

---

## 🎲 Fase 7: Sorteio

**Priority:** ⭐⭐⭐

- [ ] Página para sortear rifa
- [ ] Seleção automática do vencedor
- [ ] Validação de integridade
- [ ] Histórico de sorteios
- [ ] Certificado do vencedor
- [ ] Notificação em tempo real

**Admin Routes:**
- POST `/api/admin/raffle/[id]/draw`
- GET `/api/admin/draws`

---

## 📊 Fase 8: Admin Dashboard

**Priority:** ⭐⭐⭐

- [ ] Painel administrativo
- [ ] Gerenciar rifas
- [ ] Gerenciar usuários
- [ ] Relatórios de vendas
- [ ] Gráficos de desempenho
- [ ] Disputas/reclamações
- [ ] Logs de sistema

**Páginas:**
- `/admin/dashboard`
- `/admin/campanhas`
- `/admin/usuarios`
- `/admin/relatorios`

---

## 📚 Fase 9: Legislação & Compliance

**Priority:** ⭐⭐⭐

- [ ] Página de legislação
- [ ] Termos de uso
- [ ] Política de privacidade
- [ ] LGPD compliance
- [ ] Documentação Receita Federal
- [ ] E-book sobre rifas legais
- [ ] FAQ

---

## 🎯 Fase 10: Performance & SEO

**Priority:** ⭐⭐

- [ ] Otimização de imagens
- [ ] Cache de queries
- [ ] CDN para imagens
- [ ] Redis cache
- [ ] SEO meta tags
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Lighthouse score 90+

---

## 🚀 Fase 11: Deploy & DevOps

**Priority:** ⭐⭐⭐⭐

- [ ] GitHub CI/CD
- [ ] Vercel deploy automático
- [ ] Coolify setup (VPS)
- [ ] Backup automático
- [ ] Monitoramento (Sentry)
- [ ] Analytics (Plausible)
- [ ] Alertas de erros

---

## 🔒 Fase 12: Segurança

**Priority:** ⭐⭐⭐⭐

- [ ] HTTPS obrigatório
- [ ] CSRF protection
- [ ] SQL Injection prevention
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] Helmet.js
- [ ] Audit trail
- [ ] 2FA para admin

---

## 📱 Fase 13: Mobile App

**Priority:** ⭐

- [ ] React Native app
- [ ] PWA versão
- [ ] Push notifications
- [ ] Geolocalização
- [ ] Scanner QR integrado

---

## 🎊 Fase 14: Features Extras

- [ ] Sistema de recomendação
- [ ] Wishlist de rifas
- [ ] Chat ao vivo
- [ ] Livestream de sorteio
- [ ] Programa de afiliados
- [ ] Cupons e promoções
- [ ] Programa de pontos

---

## 🔄 Ciclo de Desenvolvimento

1. **Semana 1-2:** Autenticação + Pagamento
2. **Semana 3:** Emails + WhatsApp
3. **Semana 4:** Dashboard do usuário
4. **Semana 5:** Sorteio + Admin
5. **Semana 6:** Legislação + Security
6. **Semana 7:** Deploy + Otimização

---

## 🎯 MVP (Minimum Viable Product)

O site **já está funcional** com:
- ✅ Criar e listar rifas
- ✅ UI responsiva
- ✅ Banco de dados estruturado
- ✅ API REST

**Próximo passo crítico:** Autenticação + Mercado Pago (Fases 2-3)

---

## 📊 Métricas de Sucesso

- [ ] 100+ rifas no mês 1
- [ ] 1000+ usuários no mês 2
- [ ] R$ 50k em volume no mês 3
- [ ] 99.9% uptime
- [ ] Lighthouse score 90+
- [ ] Satisfação do usuário 4.8/5⭐

---

**Última atualização:** 2026-02-04
**Status:** MVP Completo, Prontos para Fase 2
