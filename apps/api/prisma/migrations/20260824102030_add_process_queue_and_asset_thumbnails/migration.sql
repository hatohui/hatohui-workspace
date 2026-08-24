-- CreateEnum
CREATE TYPE "AssetSource" AS ENUM ('UPLOAD', 'EXTERNAL_URL');

-- CreateEnum
CREATE TYPE "AssetThumbnailStatus" AS ENUM ('PENDING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "ProcessType" AS ENUM ('ASSET_THUMBNAIL');

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "source" "AssetSource" NOT NULL DEFAULT 'UPLOAD',
ADD COLUMN     "thumbnailKey" TEXT,
ADD COLUMN     "thumbnailStatus" "AssetThumbnailStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "thumbnailUrl" TEXT,
ALTER COLUMN "key" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ProcessQueue" (
    "id" TEXT NOT NULL,
    "type" "ProcessType" NOT NULL,
    "refId" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcessQueue_nextAttemptAt_idx" ON "ProcessQueue"("nextAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessQueue_type_refId_key" ON "ProcessQueue"("type", "refId");
