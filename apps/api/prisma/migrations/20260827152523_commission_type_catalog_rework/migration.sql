-- Commission type catalog rework:
--   * CommissionType goes from per-artist rows to a global admin-curated catalog.
--   * ArtistCommissionType is a new join row an artist uses to enable/disable a type.
--   * CommissionOption moves from a flat per-artist list to being scoped under a
--     (artistId, commissionTypeId) pair, and gets its own priceMode/price
--     (replacing the old modifierPercent-on-type-basePrice model).
--   * CommissionAddon gains a PERCENTAGE priceMode + percent column, computed
--     against whichever CommissionOption the client picked.
--
-- NOTE for whoever deploys this to production: unlike the artistId/basePrice
-- columns being dropped here, there is NO reliable way to backfill old
-- CommissionOption rows into the new (artistId, commissionTypeId) shape --
-- the old model never related an option to a specific type. Decide with the
-- artist how their existing options should be re-created before deploying,
-- same as the CommissionType rows below (which DO map 1:1 by key since they
-- were already unique per artist and there is currently only one artist).

-- AlterEnum
DO $$ BEGIN
  ALTER TYPE "PriceMode" ADD VALUE IF NOT EXISTS 'PERCENTAGE';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- DropForeignKey
ALTER TABLE "CommissionType" DROP CONSTRAINT IF EXISTS "CommissionType_artistId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "CommissionOption_artistId_key_key";
DROP INDEX IF EXISTS "CommissionType_artistId_key_key";

-- AlterTable CommissionAddon
ALTER TABLE "CommissionAddon"
  ADD COLUMN IF NOT EXISTS "percent" INTEGER,
  ALTER COLUMN "minPrice" DROP NOT NULL;

-- AlterTable CommissionOption
ALTER TABLE "CommissionOption"
  DROP COLUMN IF EXISTS "modifierPercent",
  ADD COLUMN IF NOT EXISTS "commissionTypeId" TEXT,
  ADD COLUMN IF NOT EXISTS "maxPrice" INTEGER,
  ADD COLUMN IF NOT EXISTS "priceMode" "PriceMode" NOT NULL DEFAULT 'FIXED';

ALTER TABLE "CommissionOption" ADD COLUMN IF NOT EXISTS "minPrice" INTEGER;
UPDATE "CommissionOption" SET "minPrice" = 0 WHERE "minPrice" IS NULL;
ALTER TABLE "CommissionOption" ALTER COLUMN "minPrice" SET NOT NULL;

-- AlterTable CommissionType
ALTER TABLE "CommissionType"
  DROP COLUMN IF EXISTS "artistId",
  DROP COLUMN IF EXISTS "basePrice";

-- CreateTable ArtistCommissionType
CREATE TABLE IF NOT EXISTS "ArtistCommissionType" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "commissionTypeId" TEXT NOT NULL,
    "no" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtistCommissionType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ArtistCommissionType_artistId_commissionTypeId_key" ON "ArtistCommissionType"("artistId", "commissionTypeId");
CREATE UNIQUE INDEX IF NOT EXISTS "CommissionOption_artistId_commissionTypeId_key_key" ON "CommissionOption"("artistId", "commissionTypeId", "key");
CREATE UNIQUE INDEX IF NOT EXISTS "CommissionType_key_key" ON "CommissionType"("key");

-- CommissionOption.commissionTypeId only becomes NOT NULL once every row has
-- one; on a fresh install there are no rows yet so this is a no-op guard.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM "CommissionOption" WHERE "commissionTypeId" IS NULL) THEN
    ALTER TABLE "CommissionOption" ALTER COLUMN "commissionTypeId" SET NOT NULL;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "ArtistCommissionType" ADD CONSTRAINT "ArtistCommissionType_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ArtistCommissionType" ADD CONSTRAINT "ArtistCommissionType_commissionTypeId_fkey" FOREIGN KEY ("commissionTypeId") REFERENCES "CommissionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CommissionOption" ADD CONSTRAINT "CommissionOption_commissionTypeId_fkey" FOREIGN KEY ("commissionTypeId") REFERENCES "CommissionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
