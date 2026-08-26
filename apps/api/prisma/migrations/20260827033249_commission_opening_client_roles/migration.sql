-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('INTERNAL', 'CLIENT');

-- CreateEnum
CREATE TYPE "AuthorRole" AS ENUM ('ARTIST', 'CLIENT');

-- CreateEnum
CREATE TYPE "CommissionOpeningEndMode" AS ENUM ('MANUAL', 'SLOT_CAP', 'INDEFINITE');

-- CreateEnum
CREATE TYPE "CommissionOpeningStatus" AS ENUM ('SCHEDULED', 'OPEN', 'CLOSED');

-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT "Commission_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT "Commission_commissionTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT "Commission_projectId_fkey";

-- DropForeignKey
ALTER TABLE "CommissionNote" DROP CONSTRAINT "CommissionNote_authorId_fkey";

-- DropForeignKey
ALTER TABLE "CommissionNote" DROP CONSTRAINT "CommissionNote_commissionId_fkey";

-- DropForeignKey
ALTER TABLE "CommissionType" DROP CONSTRAINT "CommissionType_tagId_fkey";

-- DropForeignKey
ALTER TABLE "CommissionTypePricing" DROP CONSTRAINT "CommissionTypePricing_commissionTypeId_fkey";

-- DropIndex
DROP INDEX "CommissionType_key_key";

-- DropIndex
DROP INDEX "CommissionType_tagId_key";

-- AlterTable
ALTER TABLE "Commission" DROP COLUMN "addonKeys",
DROP COLUMN "assignedToId",
DROP COLUMN "clientEmail",
DROP COLUMN "clientName",
DROP COLUMN "coloringDoneAt",
DROP COLUMN "commissionTypeId",
DROP COLUMN "contactHandle",
DROP COLUMN "deadline",
DROP COLUMN "deliverableAssets",
DROP COLUMN "deliveredAt",
DROP COLUMN "finishedAt",
DROP COLUMN "idea",
DROP COLUMN "ideaConfirmedAt",
DROP COLUMN "isHidden",
DROP COLUMN "lineDoneAt",
DROP COLUMN "optionKey",
DROP COLUMN "paymentConfirmedAt",
DROP COLUMN "paymentStatus",
DROP COLUMN "preferredContactMethod",
DROP COLUMN "projectId",
DROP COLUMN "quoteCents",
DROP COLUMN "referenceAssets",
DROP COLUMN "sketchConfirmedAt",
ADD COLUMN     "artistId" TEXT NOT NULL,
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "commissionOpeningId" TEXT,
ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "paymentMethodId" TEXT,
ADD COLUMN     "priority" INTEGER,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "CommissionType" ADD COLUMN     "artistId" TEXT NOT NULL,
ADD COLUMN     "basePrice" INTEGER NOT NULL,
ADD COLUMN     "label" TEXT NOT NULL,
ALTER COLUMN "tagId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "artistId" TEXT NOT NULL,
ADD COLUMN     "brief" JSONB,
ALTER COLUMN "isHidden" SET DEFAULT true;

-- DropTable
DROP TABLE "CommissionAddonPricing";

-- DropTable
DROP TABLE "CommissionNote";

-- DropTable
DROP TABLE "CommissionOptionPricing";

-- DropTable
DROP TABLE "CommissionRushFeeSetting";

-- DropTable
DROP TABLE "CommissionTypePricing";

-- DropEnum
DROP TYPE "CommissionNoteVisibility";

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "no" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionOption" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "modifierPercent" INTEGER NOT NULL,
    "no" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionAddon" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "minPrice" INTEGER NOT NULL,
    "no" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionGroup" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "artistId" TEXT NOT NULL,
    "projectId" TEXT,
    "accessCode" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "quote" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionGroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "preferredContactMethod" "PreferredContactMethod" NOT NULL DEFAULT 'EMAIL',
    "contactHandle" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "no" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionDetail" (
    "id" TEXT NOT NULL,
    "commissionId" TEXT NOT NULL,
    "idea" JSONB NOT NULL,
    "deadline" TIMESTAMP(3),
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_YET',
    "isHiddenInQueue" BOOLEAN NOT NULL DEFAULT false,
    "commissionTypeId" TEXT,
    "optionKey" TEXT,
    "addonKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "quote" INTEGER,
    "originalQuote" INTEGER,
    "referenceAssets" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deliveredAt" TIMESTAMP(3),
    "ideaConfirmedAt" TIMESTAMP(3),
    "sketchConfirmedAt" TIMESTAMP(3),
    "paymentConfirmedAt" TIMESTAMP(3),
    "lineDoneAt" TIMESTAMP(3),
    "coloringDoneAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionProgress" (
    "id" TEXT NOT NULL,
    "commissionId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT,
    "body" JSONB,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "Visibility" NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "groupId" TEXT,
    "commissionId" TEXT,
    "progressId" TEXT,
    "authorRole" "AuthorRole" NOT NULL DEFAULT 'ARTIST',
    "authorClientId" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'INTERNAL',
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionOpening" (
    "id" TEXT NOT NULL,
    "status" "CommissionOpeningStatus" NOT NULL DEFAULT 'SCHEDULED',
    "endMode" "CommissionOpeningEndMode" NOT NULL,
    "artistId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "slotCap" INTEGER,
    "slotCapEndsAt" TIMESTAMP(3),
    "postTitle" TEXT,
    "postBody" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionOpening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionFollower" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribeToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionFollower_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionOption_artistId_key_key" ON "CommissionOption"("artistId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionAddon_artistId_key_key" ON "CommissionAddon"("artistId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionGroup_accessCode_key" ON "CommissionGroup"("accessCode");

-- CreateIndex
CREATE INDEX "CommissionGroup_artistId_idx" ON "CommissionGroup"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionGroupMember_groupId_clientId_key" ON "CommissionGroupMember"("groupId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_key_key" ON "PaymentMethod"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionDetail_commissionId_key" ON "CommissionDetail"("commissionId");

-- CreateIndex
CREATE INDEX "CommissionProgress_commissionId_createdAt_idx" ON "CommissionProgress"("commissionId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_projectId_createdAt_idx" ON "Comment"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_groupId_createdAt_idx" ON "Comment"("groupId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_commissionId_createdAt_idx" ON "Comment"("commissionId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_progressId_createdAt_idx" ON "Comment"("progressId", "createdAt");

-- CreateIndex
CREATE INDEX "CommissionOpening_artistId_status_idx" ON "CommissionOpening"("artistId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionFollower_unsubscribeToken_key" ON "CommissionFollower"("unsubscribeToken");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionFollower_artistId_email_key" ON "CommissionFollower"("artistId", "email");

-- CreateIndex
CREATE INDEX "Commission_artistId_status_idx" ON "Commission"("artistId", "status");

-- CreateIndex
CREATE INDEX "Commission_clientId_idx" ON "Commission"("clientId");

-- CreateIndex
CREATE INDEX "Commission_groupId_idx" ON "Commission"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionType_artistId_key_key" ON "CommissionType"("artistId", "key");

-- CreateIndex
CREATE INDEX "Project_artistId_idx" ON "Project"("artistId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionType" ADD CONSTRAINT "CommissionType_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionType" ADD CONSTRAINT "CommissionType_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionOption" ADD CONSTRAINT "CommissionOption_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionAddon" ADD CONSTRAINT "CommissionAddon_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_commissionOpeningId_fkey" FOREIGN KEY ("commissionOpeningId") REFERENCES "CommissionOpening"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CommissionGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionGroup" ADD CONSTRAINT "CommissionGroup_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionGroup" ADD CONSTRAINT "CommissionGroup_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionGroupMember" ADD CONSTRAINT "CommissionGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CommissionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionGroupMember" ADD CONSTRAINT "CommissionGroupMember_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionDetail" ADD CONSTRAINT "CommissionDetail_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "Commission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionDetail" ADD CONSTRAINT "CommissionDetail_commissionTypeId_fkey" FOREIGN KEY ("commissionTypeId") REFERENCES "CommissionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionProgress" ADD CONSTRAINT "CommissionProgress_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "Commission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionProgress" ADD CONSTRAINT "CommissionProgress_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CommissionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "Commission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "CommissionProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorClientId_fkey" FOREIGN KEY ("authorClientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionOpening" ADD CONSTRAINT "CommissionOpening_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionFollower" ADD CONSTRAINT "CommissionFollower_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

