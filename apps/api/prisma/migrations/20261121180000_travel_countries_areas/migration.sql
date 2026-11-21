-- AlterTable
ALTER TABLE "TravelPlace" ADD COLUMN     "areaId" TEXT;

-- CreateTable
CREATE TABLE "TravelCountry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelArea" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelArea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TravelCountry_name_key" ON "TravelCountry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TravelArea_countryId_name_key" ON "TravelArea"("countryId", "name");

-- CreateIndex
CREATE INDEX "TravelPlace_areaId_idx" ON "TravelPlace"("areaId");

-- AddForeignKey
ALTER TABLE "TravelPlace" ADD CONSTRAINT "TravelPlace_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "TravelArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelCountry" ADD CONSTRAINT "TravelCountry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelArea" ADD CONSTRAINT "TravelArea_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "TravelCountry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelArea" ADD CONSTRAINT "TravelArea_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

