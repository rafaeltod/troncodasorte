-- Script para dropar e recriar todas as tabelas do zero
-- Isso garante que não há coluna de senha ou dados antigos

-- Dropar tabelas em ordem de dependência reversa
DROP TABLE IF EXISTS "topBuyer" CASCADE;
DROP TABLE IF EXISTS "rafflePurchase" CASCADE;
DROP TABLE IF EXISTS raffle CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- Recriar tabela de usuários (SEM SENHA)
CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf VARCHAR(14) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  "birthDate" VARCHAR(10),
  "phoneConfirmed" BOOLEAN DEFAULT FALSE,
  "acceptedTerms" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recriar tabela de rifas
CREATE TABLE raffle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(500),
  images TEXT[] DEFAULT ARRAY[]::text[],
  "prizeAmount" DECIMAL(10, 2) NOT NULL,
  "totalQuotas" INTEGER NOT NULL,
  "soldQuotas" INTEGER DEFAULT 0,
  "quotaPrice" DECIMAL(10, 2) DEFAULT 0.50,
  status VARCHAR(50) DEFAULT 'open',
  winner UUID,
  "creatorId" UUID NOT NULL REFERENCES "user"(id),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recriar tabela de compras de rifas
CREATE TABLE "rafflePurchase" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "user"(id),
  "raffleId" UUID NOT NULL REFERENCES raffle(id),
  quotas INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  numbers TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userId", "raffleId")
);

-- Recriar tabela de top buyers
CREATE TABLE "topBuyer" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID UNIQUE NOT NULL REFERENCES "user"(id),
  "totalSpent" DECIMAL(10, 2) NOT NULL,
  "totalQuotas" INTEGER NOT NULL,
  "raffleBought" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX idx_raffle_status ON raffle(status);
CREATE INDEX idx_raffle_creator ON raffle("creatorId");
CREATE INDEX idx_purchase_user ON "rafflePurchase"("userId");
CREATE INDEX idx_purchase_raffle ON "rafflePurchase"("raffleId");
CREATE INDEX idx_topbuyer_totalspent ON "topBuyer"("totalSpent" DESC);

-- Mensagem de sucesso
SELECT 'Tabelas recriadas com sucesso!' as message;
