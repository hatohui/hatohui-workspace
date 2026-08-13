-- CreateTable
CREATE TABLE "AvatarVersion" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvatarVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AvatarVersion_ownerId_createdAt_idx" ON "AvatarVersion"("ownerId", "createdAt");
