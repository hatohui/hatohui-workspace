-- AlterTable
ALTER TABLE "TravelCuisine" ADD COLUMN "countryId" TEXT,
ADD COLUMN "areaId" TEXT;

-- CreateIndex
CREATE INDEX "TravelCuisine_countryId_idx" ON "TravelCuisine"("countryId");

-- CreateIndex
CREATE INDEX "TravelCuisine_areaId_idx" ON "TravelCuisine"("areaId");

-- AddForeignKey
ALTER TABLE "TravelCuisine" ADD CONSTRAINT "TravelCuisine_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "TravelCountry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelCuisine" ADD CONSTRAINT "TravelCuisine_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "TravelArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "TravelCuisine" c
SET "countryId" = s."countryId"
FROM (
  SELECT cd."A" AS "cuisineId", MIN(d."countryId") AS "countryId"
  FROM "_TravelCuisineToTravelDish" cd
  JOIN "TravelDish" d ON d."id" = cd."B"
  WHERE d."countryId" IS NOT NULL
  GROUP BY cd."A"
  HAVING COUNT(DISTINCT d."countryId") = 1
) s
WHERE c."id" = s."cuisineId";

-- DropForeignKey
ALTER TABLE "TravelDish" DROP CONSTRAINT "TravelDish_countryId_fkey";

-- DropIndex
DROP INDEX "TravelDish_countryId_idx";

-- AlterTable
ALTER TABLE "TravelDish" DROP COLUMN "countryId";

UPDATE "TravelPlace" p
SET "areaId" = m."areaId"
FROM (
  SELECT p2."id" AS "placeId", MIN(a."id") AS "areaId"
  FROM "TravelPlace" p2
  JOIN "TravelArea" a ON lower(a."name") = lower(trim(p2."city"))
  WHERE p2."areaId" IS NULL AND p2."city" IS NOT NULL
  GROUP BY p2."id"
  HAVING COUNT(*) = 1
) m
WHERE p."id" = m."placeId";

UPDATE "TravelPlace"
SET "address" = trim("city")
WHERE "areaId" IS NULL AND "address" IS NULL AND trim(coalesce("city", '')) <> '';

-- DropIndex
DROP INDEX "TravelPlace_city_idx";

-- AlterTable
ALTER TABLE "TravelPlace" DROP COLUMN "city";

-- AlterTable
ALTER TABLE "TravelRecommendation" ADD COLUMN "vegetarian" BOOLEAN NOT NULL DEFAULT false;

UPDATE "TravelRecommendation" r
SET "vegetarian" = true
WHERE EXISTS (
  SELECT 1
  FROM "_TravelRecommendationToTravelTag" rt
  JOIN "TravelTag" t ON t."id" = rt."B"
  WHERE rt."A" = r."id" AND t."key" = 'vegetarian'
);

DELETE FROM "TravelTag" WHERE "kind" = 'DIET';

-- AlterEnum
ALTER TYPE "TravelTagKind" RENAME TO "TravelTagKind_old";
CREATE TYPE "TravelTagKind" AS ENUM ('ALLERGEN', 'GENERAL');
ALTER TABLE "TravelTag" ALTER COLUMN "kind" TYPE "TravelTagKind" USING ("kind"::text::"TravelTagKind");
DROP TYPE "TravelTagKind_old";
