-- CreateTable
CREATE TABLE "TravelRecommendationDish" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "priceMin" INTEGER,
    "priceMax" INTEGER,
    "priceLevel" "TravelPriceLevel",

    CONSTRAINT "TravelRecommendationDish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TravelRecommendationDishAllergens" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TravelRecommendationDishAllergens_AB_pkey" PRIMARY KEY ("A","B")
);

-- MoveData: each existing pick becomes a visit with one dish line
INSERT INTO "TravelRecommendationDish" ("id", "recommendationId", "dishId", "placeId", "position", "priceMin", "priceMax", "priceLevel")
SELECT "id", "id", "dishId", "placeId", 0, "priceMin", "priceMax", "priceLevel"
FROM "TravelRecommendation";

-- MoveData: allergen tags move from the visit to its dish line
INSERT INTO "_TravelRecommendationDishAllergens" ("A", "B")
SELECT link."A", link."B"
FROM "_TravelRecommendationToTravelTag" link
JOIN "TravelTag" tag ON tag."id" = link."B"
WHERE tag."kind" = 'ALLERGEN';

DELETE FROM "_TravelRecommendationToTravelTag" link
USING "TravelTag" tag
WHERE tag."id" = link."B" AND tag."kind" = 'ALLERGEN';

-- DropForeignKey
ALTER TABLE "TravelRecommendation" DROP CONSTRAINT "TravelRecommendation_dishId_fkey";

-- DropIndex
DROP INDEX "TravelRecommendation_dishId_idx";

-- DropIndex
DROP INDEX "TravelRecommendation_placeId_dishId_key";

-- AlterTable
ALTER TABLE "TravelRecommendation" DROP COLUMN "dishId",
DROP COLUMN "priceLevel",
DROP COLUMN "priceMax",
DROP COLUMN "priceMin";

-- CreateIndex
CREATE INDEX "TravelRecommendationDish_dishId_idx" ON "TravelRecommendationDish"("dishId");

-- CreateIndex
CREATE UNIQUE INDEX "TravelRecommendationDish_placeId_dishId_key" ON "TravelRecommendationDish"("placeId", "dishId");

-- CreateIndex
CREATE UNIQUE INDEX "TravelRecommendationDish_recommendationId_dishId_key" ON "TravelRecommendationDish"("recommendationId", "dishId");

-- CreateIndex
CREATE INDEX "_TravelRecommendationDishAllergens_B_index" ON "_TravelRecommendationDishAllergens"("B");

-- CreateIndex
CREATE INDEX "TravelRecommendation_placeId_idx" ON "TravelRecommendation"("placeId");

-- AddForeignKey
ALTER TABLE "TravelRecommendationDish" ADD CONSTRAINT "TravelRecommendationDish_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "TravelRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelRecommendationDish" ADD CONSTRAINT "TravelRecommendationDish_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "TravelDish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelRecommendationDish" ADD CONSTRAINT "TravelRecommendationDish_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "TravelPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelRecommendationDishAllergens" ADD CONSTRAINT "_TravelRecommendationDishAllergens_A_fkey" FOREIGN KEY ("A") REFERENCES "TravelRecommendationDish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelRecommendationDishAllergens" ADD CONSTRAINT "_TravelRecommendationDishAllergens_B_fkey" FOREIGN KEY ("B") REFERENCES "TravelTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
