-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "seenAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CommissionProgress" ADD COLUMN     "seenByClientAt" TIMESTAMP(3);

-- Backfill: everything that already exists counts as seen
UPDATE "Comment" SET "seenAt" = "createdAt";
UPDATE "CommissionProgress" SET "seenByClientAt" = "createdAt";
