-- AlterEnum
ALTER TYPE "TravelTagKind" RENAME TO "TravelTagKind_old";
CREATE TYPE "TravelTagKind" AS ENUM ('ALLERGEN', 'GENERAL', 'SPECIAL');
ALTER TABLE "TravelTag" ALTER COLUMN "kind" TYPE "TravelTagKind" USING ("kind"::text::"TravelTagKind");
DROP TYPE "TravelTagKind_old";

INSERT INTO "TravelTag" ("id", "key", "name", "kind", "position")
VALUES
  ('travel-tag-spicy', 'spicy', NULL, 'SPECIAL', 0),
  ('travel-tag-vegetarian', 'vegetarian', NULL, 'SPECIAL', 1),
  ('travel-tag-michelin', 'michelin', NULL, 'SPECIAL', 2)
ON CONFLICT ("key") DO UPDATE
SET "kind" = 'SPECIAL', "position" = EXCLUDED."position";

INSERT INTO "_TravelRecommendationToTravelTag" ("A", "B")
SELECT r."id", t."id"
FROM "TravelRecommendation" r
JOIN "TravelTag" t ON t."key" = 'spicy'
WHERE r."spicy" = true
ON CONFLICT DO NOTHING;

INSERT INTO "_TravelRecommendationToTravelTag" ("A", "B")
SELECT r."id", t."id"
FROM "TravelRecommendation" r
JOIN "TravelTag" t ON t."key" = 'vegetarian'
WHERE r."vegetarian" = true
ON CONFLICT DO NOTHING;

-- AlterTable
ALTER TABLE "TravelRecommendation" DROP COLUMN "spicy",
DROP COLUMN "vegetarian";
