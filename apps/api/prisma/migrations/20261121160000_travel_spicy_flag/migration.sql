-- AlterTable
ALTER TABLE "TravelRecommendation" ADD COLUMN "spicy" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: any spice level above NONE counts as spicy
UPDATE "TravelRecommendation" SET "spicy" = true WHERE "spiceLevel" <> 'NONE';

-- Drop the replaced level
ALTER TABLE "TravelRecommendation" DROP COLUMN "spiceLevel";

DROP TYPE "TravelSpiceLevel";
