-- CreateEnum
CREATE TYPE "TravelSpiceLevel" AS ENUM ('NONE', 'MILD', 'MEDIUM', 'HOT');

-- CreateEnum
CREATE TYPE "TravelTagKind" AS ENUM ('DIET', 'ALLERGEN');

-- CreateEnum
CREATE TYPE "TravelPriceLevel" AS ENUM ('LOW', 'MID', 'HIGH');

-- AlterTable
ALTER TABLE "TravelRecommendation"
ADD COLUMN     "priceLevel" "TravelPriceLevel",
ADD COLUMN     "priceMax" INTEGER,
ADD COLUMN     "priceMin" INTEGER,
ADD COLUMN     "spiceLevel" "TravelSpiceLevel" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "TravelCuisine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelCuisine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelTag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "kind" "TravelTagKind" NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "TravelTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TravelCuisineToTravelDish" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TravelCuisineToTravelDish_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TravelRecommendationToTravelTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TravelRecommendationToTravelTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "TravelCuisine_name_key" ON "TravelCuisine"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TravelTag_key_key" ON "TravelTag"("key");

-- CreateIndex
CREATE INDEX "TravelTag_kind_position_idx" ON "TravelTag"("kind", "position");

-- CreateIndex
CREATE INDEX "_TravelCuisineToTravelDish_B_index" ON "_TravelCuisineToTravelDish"("B");

-- CreateIndex
CREATE INDEX "_TravelRecommendationToTravelTag_B_index" ON "_TravelRecommendationToTravelTag"("B");

-- AddForeignKey
ALTER TABLE "TravelCuisine" ADD CONSTRAINT "TravelCuisine_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelCuisineToTravelDish" ADD CONSTRAINT "_TravelCuisineToTravelDish_A_fkey" FOREIGN KEY ("A") REFERENCES "TravelCuisine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelCuisineToTravelDish" ADD CONSTRAINT "_TravelCuisineToTravelDish_B_fkey" FOREIGN KEY ("B") REFERENCES "TravelDish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelRecommendationToTravelTag" ADD CONSTRAINT "_TravelRecommendationToTravelTag_A_fkey" FOREIGN KEY ("A") REFERENCES "TravelRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelRecommendationToTravelTag" ADD CONSTRAINT "_TravelRecommendationToTravelTag_B_fkey" FOREIGN KEY ("B") REFERENCES "TravelTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preset diet and allergen tags
INSERT INTO "TravelTag" ("id", "key", "kind", "position") VALUES
  ('travel-tag-vegetarian', 'vegetarian', 'DIET', 0),
  ('travel-tag-vegan', 'vegan', 'DIET', 1),
  ('travel-tag-pescatarian', 'pescatarian', 'DIET', 2),
  ('travel-tag-halal', 'halal', 'DIET', 3),
  ('travel-tag-kosher', 'kosher', 'DIET', 4),
  ('travel-tag-gluten-free', 'gluten-free', 'DIET', 5),
  ('travel-tag-dairy-free', 'dairy-free', 'DIET', 6),
  ('travel-tag-peanuts', 'peanuts', 'ALLERGEN', 0),
  ('travel-tag-tree-nuts', 'tree-nuts', 'ALLERGEN', 1),
  ('travel-tag-shellfish', 'shellfish', 'ALLERGEN', 2),
  ('travel-tag-fish', 'fish', 'ALLERGEN', 3),
  ('travel-tag-egg', 'egg', 'ALLERGEN', 4),
  ('travel-tag-dairy', 'dairy', 'ALLERGEN', 5),
  ('travel-tag-gluten', 'gluten', 'ALLERGEN', 6),
  ('travel-tag-soy', 'soy', 'ALLERGEN', 7),
  ('travel-tag-sesame', 'sesame', 'ALLERGEN', 8);

-- Backfill: free-text cuisine becomes cuisine tags (comma separated)
WITH parts AS (
  SELECT d."id" AS dish_id, d."createdById", btrim(part) AS name
  FROM "TravelDish" d, unnest(string_to_array(d."cuisine", ',')) AS part
  WHERE d."cuisine" IS NOT NULL AND btrim(part) <> ''
),
names AS (
  SELECT DISTINCT ON (lower(name)) name, "createdById"
  FROM parts
  ORDER BY lower(name), name
)
INSERT INTO "TravelCuisine" ("id", "name", "createdById")
SELECT gen_random_uuid()::text, name, "createdById" FROM names;

INSERT INTO "_TravelCuisineToTravelDish" ("A", "B")
SELECT DISTINCT c."id", d."id"
FROM "TravelDish" d
CROSS JOIN LATERAL unnest(string_to_array(d."cuisine", ',')) AS part
JOIN "TravelCuisine" c ON lower(c."name") = lower(btrim(part))
WHERE d."cuisine" IS NOT NULL;

-- Backfill: one estimate becomes a one-value range, flags become tags/levels
UPDATE "TravelRecommendation"
SET "priceMin" = "estimate", "priceMax" = "estimate"
WHERE "estimate" IS NOT NULL;

UPDATE "TravelRecommendation" SET "spiceLevel" = 'MEDIUM' WHERE "spicy";

INSERT INTO "_TravelRecommendationToTravelTag" ("A", "B")
SELECT "id", 'travel-tag-vegetarian' FROM "TravelRecommendation" WHERE "vegetarian";

-- Drop the replaced columns
DROP INDEX "TravelDish_cuisine_idx";

ALTER TABLE "TravelDish" DROP COLUMN "cuisine";

ALTER TABLE "TravelRecommendation" DROP COLUMN "estimate",
DROP COLUMN "spicy",
DROP COLUMN "vegetarian";
