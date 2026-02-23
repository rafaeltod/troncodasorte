-- Migração: Sistema de Vendedores e Cupons
-- Adiciona isVendedor ao user, cria tabelas cupom, cupom_acesso, e adiciona cupomId em livros

-- 1. Adicionar coluna isVendedor na tabela user
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "isVendedor" BOOLEAN DEFAULT FALSE;

-- 2. Criar tabela de cupons
CREATE TABLE IF NOT EXISTS cupom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  desconto DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "tipoDesconto" VARCHAR(20) NOT NULL DEFAULT 'percentual', -- 'percentual' ou 'fixo'
  "vendedorId" UUID NOT NULL REFERENCES "user"(id),
  "loteId" UUID REFERENCES lotes(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT TRUE,
  comissao DECIMAL(5, 2) NOT NULL DEFAULT 0, -- percentual de comissão do vendedor
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Criar tabela de acessos (tracking de links)
CREATE TABLE IF NOT EXISTS cupom_acesso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "cupomId" UUID NOT NULL REFERENCES cupom(id) ON DELETE CASCADE,
  ip VARCHAR(45),
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Adicionar coluna cupomId na tabela livros (compras)
ALTER TABLE livros ADD COLUMN IF NOT EXISTS "cupomId" UUID REFERENCES cupom(id) ON DELETE SET NULL;

-- 5. Adicionar coluna descontoAplicado na tabela livros
ALTER TABLE livros ADD COLUMN IF NOT EXISTS "descontoAplicado" DECIMAL(10, 2) DEFAULT 0;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cupom_vendedor ON cupom("vendedorId");
CREATE INDEX IF NOT EXISTS idx_cupom_code ON cupom(code);
CREATE INDEX IF NOT EXISTS idx_cupom_lote ON cupom("loteId");
CREATE INDEX IF NOT EXISTS idx_cupom_acesso_cupom ON cupom_acesso("cupomId");
CREATE INDEX IF NOT EXISTS idx_livros_cupom ON livros("cupomId");
CREATE INDEX IF NOT EXISTS idx_user_isvendedor ON "user"("isVendedor");
