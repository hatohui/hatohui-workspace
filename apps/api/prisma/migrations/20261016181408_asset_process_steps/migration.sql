-- CreateTable
CREATE TABLE "AssetProcessStep" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "label" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetProcessStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetProcessStep_key_key" ON "AssetProcessStep"("key");

-- CreateIndex
CREATE INDEX "AssetProcessStep_assetId_position_idx" ON "AssetProcessStep"("assetId", "position");

-- AddForeignKey
ALTER TABLE "AssetProcessStep" ADD CONSTRAINT "AssetProcessStep_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
