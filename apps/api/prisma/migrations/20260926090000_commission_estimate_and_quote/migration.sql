-- AlterTable
ALTER TABLE "CommissionDetail" ADD COLUMN     "estimateHigh" INTEGER,
ADD COLUMN     "estimateLow" INTEGER,
ADD COLUMN     "quoteSentAt" TIMESTAMP(3);
