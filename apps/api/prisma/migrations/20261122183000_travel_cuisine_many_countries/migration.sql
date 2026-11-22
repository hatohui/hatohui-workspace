-- CreateTable
CREATE TABLE "_TravelCountryToTravelCuisine" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TravelCountryToTravelCuisine_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TravelCountryToTravelCuisine_B_index" ON "_TravelCountryToTravelCuisine"("B");

-- AddForeignKey
ALTER TABLE "_TravelCountryToTravelCuisine" ADD CONSTRAINT "_TravelCountryToTravelCuisine_A_fkey" FOREIGN KEY ("A") REFERENCES "TravelCountry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelCountryToTravelCuisine" ADD CONSTRAINT "_TravelCountryToTravelCuisine_B_fkey" FOREIGN KEY ("B") REFERENCES "TravelCuisine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- MigrateData
INSERT INTO "_TravelCountryToTravelCuisine" ("A", "B")
SELECT "countryId", "id"
FROM "TravelCuisine"
WHERE "countryId" IS NOT NULL
ON CONFLICT DO NOTHING;

-- DropForeignKey
ALTER TABLE "TravelCuisine" DROP CONSTRAINT "TravelCuisine_countryId_fkey";

-- DropIndex
DROP INDEX "TravelCuisine_countryId_idx";

-- AlterTable
ALTER TABLE "TravelCuisine" DROP COLUMN "countryId";
