-- Adicionar coluna isAdmin na tabela user
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT FALSE;

-- Comentário: Para tornar um usuário admin, execute:
-- UPDATE "user" SET "isAdmin" = TRUE WHERE email = 'email@do.admin';
