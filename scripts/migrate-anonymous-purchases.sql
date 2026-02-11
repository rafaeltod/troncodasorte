-- Migration: Allow anonymous purchases by making userId nullable
-- This allows users to purchase without being logged in

-- Drop the NOT NULL constraint on userId in rafflePurchase table
-- First, we need to drop the constraint if it exists

-- For PostgreSQL, alter the column to allow NULL
ALTER TABLE "rafflePurchase" 
ALTER COLUMN "userId" DROP NOT NULL;

-- The foreign key constraint can remain - PostgreSQL allows NULL values for foreign keys
-- and they won't violate the constraint

COMMIT;
