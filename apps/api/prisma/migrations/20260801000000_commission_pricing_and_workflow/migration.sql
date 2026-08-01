-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('ICON', 'HALF_BODY', 'FULL_BODY', 'SKETCH_PAGE');

-- CreateEnum
CREATE TYPE "PreferredContactMethod" AS ENUM ('EMAIL', 'DISCORD', 'TELEGRAM', 'TWITTER', 'OTHER');

-- DropForeignKey
ALTER TABLE "CommissionNote" DROP CONSTRAINT "CommissionNote_authorId_fkey";

-- AlterTable
ALTER TABLE "Commission" DROP COLUMN "attachments",
DROP COLUMN "budget",
ADD COLUMN     "accessCode" TEXT NOT NULL,
ADD COLUMN     "addonKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "coloringDoneAt" TIMESTAMP(3),
ADD COLUMN     "commissionType" "CommissionType",
ADD COLUMN     "contactHandle" TEXT,
ADD COLUMN     "deliverableAssets" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "ideaConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lineDoneAt" TIMESTAMP(3),
ADD COLUMN     "optionKey" TEXT,
ADD COLUMN     "paymentConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "preferredContactMethod" "PreferredContactMethod" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN     "quoteCents" INTEGER,
ADD COLUMN     "referenceAssets" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sketchConfirmedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CommissionNote" ALTER COLUMN "authorId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CommissionTypePricing" (
    "id" TEXT NOT NULL,
    "type" "CommissionType" NOT NULL,
    "label" TEXT NOT NULL,
    "basePriceCents" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionTypePricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionOptionPricing" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "modifierPercent" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionOptionPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionAddonPricing" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "minPriceCents" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionAddonPricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommissionTypePricing_type_key" ON "CommissionTypePricing"("type");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionOptionPricing_key_key" ON "CommissionOptionPricing"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionAddonPricing_key_key" ON "CommissionAddonPricing"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Commission_accessCode_key" ON "Commission"("accessCode");

-- AddForeignKey
ALTER TABLE "CommissionNote" ADD CONSTRAINT "CommissionNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

