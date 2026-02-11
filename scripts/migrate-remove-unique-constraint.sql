-- Migration: Remove unique constraint on rafflePurchase to allow multiple purchases per user per raffle
-- This allows users to buy quotas multiple times for the same raffle

-- Drop the unique constraint
ALTER TABLE "rafflePurchase" DROP CONSTRAINT IF EXISTS "rafflePurchase_userId_raffleId_key";

-- Verify the constraint was removed
SELECT conname, contype, conrelid::regclass
FROM pg_constraint
WHERE conrelid = '"rafflePurchase"'::regclass;

SELECT 'Migration completed successfully! Users can now make multiple purchases for the same raffle.' as message;
