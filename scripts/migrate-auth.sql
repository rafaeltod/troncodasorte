-- Migrate user table to remove password and add birthDate
-- IMPORTANTE: Fazer backup do banco antes de rodar isso!

-- Adicionar coluna birthDate e phoneConfirmed
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "birthDate" VARCHAR(10);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "phoneConfirmed" BOOLEAN DEFAULT FALSE;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "acceptedTerms" BOOLEAN DEFAULT FALSE;

-- Remover coluna password (se necessário descomentar)
-- ALTER TABLE "user" DROP COLUMN IF EXISTS password;

-- Criar índice para CPF se não existir
CREATE INDEX IF NOT EXISTS idx_user_cpf ON "user"(cpf);

-- Criar índice para phone se não existir
CREATE INDEX IF NOT EXISTS idx_user_phone ON "user"(phone);
