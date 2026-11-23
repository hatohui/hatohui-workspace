-- AlterEnum
ALTER TYPE "ProcessType" ADD VALUE 'TRAVEL_SPOT_IMAGE_THUMBNAIL';

-- AlterTable
ALTER TABLE "TravelActivity" ADD COLUMN     "spotId" TEXT;

-- CreateTable
CREATE TABLE "TravelSpot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "areaId" TEXT,
    "address" TEXT,
    "mapsUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelSpot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelSpotCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelSpotCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelSpotImage" (
    "id" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "thumbnailKey" TEXT,
    "previewKey" TEXT,
    "position" INTEGER NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelSpotImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TravelSpotToTravelSpotCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TravelSpotToTravelSpotCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TravelSpotToTravelTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TravelSpotToTravelTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "TravelSpot_areaId_idx" ON "TravelSpot"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "TravelSpotCategory_name_key" ON "TravelSpotCategory"("name");

-- CreateIndex
CREATE INDEX "TravelSpotImage_spotId_position_idx" ON "TravelSpotImage"("spotId", "position");

-- CreateIndex
CREATE INDEX "_TravelSpotToTravelSpotCategory_B_index" ON "_TravelSpotToTravelSpotCategory"("B");

-- CreateIndex
CREATE INDEX "_TravelSpotToTravelTag_B_index" ON "_TravelSpotToTravelTag"("B");

-- CreateIndex
CREATE INDEX "TravelActivity_spotId_idx" ON "TravelActivity"("spotId");

-- AddForeignKey
ALTER TABLE "TravelSpot" ADD CONSTRAINT "TravelSpot_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "TravelArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelSpot" ADD CONSTRAINT "TravelSpot_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelSpotCategory" ADD CONSTRAINT "TravelSpotCategory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelSpotImage" ADD CONSTRAINT "TravelSpotImage_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "TravelSpot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelSpotImage" ADD CONSTRAINT "TravelSpotImage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelActivity" ADD CONSTRAINT "TravelActivity_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "TravelSpot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelSpotToTravelSpotCategory" ADD CONSTRAINT "_TravelSpotToTravelSpotCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "TravelSpot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelSpotToTravelSpotCategory" ADD CONSTRAINT "_TravelSpotToTravelSpotCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "TravelSpotCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelSpotToTravelTag" ADD CONSTRAINT "_TravelSpotToTravelTag_A_fkey" FOREIGN KEY ("A") REFERENCES "TravelSpot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelSpotToTravelTag" ADD CONSTRAINT "_TravelSpotToTravelTag_B_fkey" FOREIGN KEY ("B") REFERENCES "TravelTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
