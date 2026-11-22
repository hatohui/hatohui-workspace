-- AlterEnum
ALTER TYPE "ProcessType" ADD VALUE 'TRAVEL_DISH_THUMBNAIL';
ALTER TYPE "ProcessType" ADD VALUE 'TRAVEL_RECOMMENDATION_IMAGE_THUMBNAIL';

-- AlterTable
ALTER TABLE "TravelDish" ADD COLUMN "thumbnailKey" TEXT,
ADD COLUMN "previewKey" TEXT;

-- AlterTable
ALTER TABLE "TravelRecommendationImage" ADD COLUMN "thumbnailKey" TEXT,
ADD COLUMN "previewKey" TEXT;
