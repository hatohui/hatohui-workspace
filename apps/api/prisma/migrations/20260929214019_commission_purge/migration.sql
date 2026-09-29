-- AlterEnum
ALTER TYPE "ProcessType" ADD VALUE 'COMMISSION_PURGE';

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "commissionId" TEXT;

-- AlterTable
ALTER TABLE "Commission" ADD COLUMN     "allowGalleryPost" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "purgedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Asset_commissionId_idx" ON "Asset"("commissionId");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "Commission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
