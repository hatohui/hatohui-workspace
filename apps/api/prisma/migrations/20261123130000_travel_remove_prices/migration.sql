-- AlterTable
ALTER TABLE "TravelRecommendation" DROP COLUMN "currency";

-- AlterTable
ALTER TABLE "TravelRecommendationDish" DROP COLUMN "priceLevel",
DROP COLUMN "priceMax",
DROP COLUMN "priceMin";

-- DropEnum
DROP TYPE "TravelPriceLevel";

