
-- CreateEnum
CREATE TYPE "PriceMode" AS ENUM ('FIXED', 'STARTING_FROM', 'RANGE');

-- AlterTable
ALTER TABLE "CommissionAddon" ADD COLUMN     "maxPrice" INTEGER,
ADD COLUMN     "priceMode" "PriceMode" NOT NULL DEFAULT 'STARTING_FROM';

