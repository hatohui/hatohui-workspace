-- AlterTable
ALTER TABLE "TravelDish" ADD COLUMN     "countryId" TEXT;

-- CreateIndex
CREATE INDEX "TravelDish_countryId_idx" ON "TravelDish"("countryId");

-- AddForeignKey
ALTER TABLE "TravelDish" ADD CONSTRAINT "TravelDish_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "TravelCountry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "TravelDish" d
SET "countryId" = s."countryId"
FROM (
  SELECT r."dishId", MIN(a."countryId") AS "countryId"
  FROM "TravelRecommendation" r
  JOIN "TravelPlace" p ON p."id" = r."placeId"
  JOIN "TravelArea" a ON a."id" = p."areaId"
  GROUP BY r."dishId"
  HAVING COUNT(DISTINCT a."countryId") = 1
) s
WHERE d."id" = s."dishId";
