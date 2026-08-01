
-- CreateTable
CREATE TABLE "CommissionRushFeeSetting" (
    "id" TEXT NOT NULL,
    "thresholdDays" INTEGER NOT NULL DEFAULT 10,
    "feeCents" INTEGER NOT NULL DEFAULT 2500,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionRushFeeSetting_pkey" PRIMARY KEY ("id")
);

