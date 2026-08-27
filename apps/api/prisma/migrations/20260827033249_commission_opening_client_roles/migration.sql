-- This migration was hit by a prior partial failure on at least one
-- deployment target: this database's connection does not run the whole
-- migration script as one transaction, so some statements from an earlier
-- failed attempt already committed before it errored out partway through.
-- Every statement below that could plausibly have already run is guarded
-- (IF EXISTS / IF NOT EXISTS / duplicate_object catch) so this file is
-- correct both against a fresh database and against that specific
-- partially-applied state, without needing a one-off resume script.

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "Visibility" AS ENUM ('INTERNAL', 'CLIENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "AuthorRole" AS ENUM ('ARTIST', 'CLIENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "CommissionOpeningEndMode" AS ENUM ('MANUAL', 'SLOT_CAP', 'INDEFINITE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "CommissionOpeningStatus" AS ENUM ('SCHEDULED', 'OPEN', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- Phase 1: create every brand-new table first, so the backfill
-- in Phase 3 has somewhere to write existing data into before
-- the old tables are dropped in Phase 4.
-- ============================================================

-- CreateTable
CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "no" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CommissionOption" (
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
CREATE TABLE IF NOT EXISTS "CommissionAddon" (
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
CREATE TABLE IF NOT EXISTS "CommissionGroup" (
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
CREATE TABLE IF NOT EXISTS "CommissionGroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Client" (
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
CREATE TABLE IF NOT EXISTS "PaymentMethod" (
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
CREATE TABLE IF NOT EXISTS "CommissionDetail" (
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
CREATE TABLE IF NOT EXISTS "CommissionProgress" (
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
CREATE TABLE IF NOT EXISTS "Comment" (
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
CREATE TABLE IF NOT EXISTS "CommissionOpening" (
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
CREATE TABLE IF NOT EXISTS "CommissionFollower" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribeToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionFollower_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- Phase 2: drop the FKs/indexes on tables we're about to alter,
-- and make Commission's shape change (0 rows in every known
-- deployment so far, so this is safe with no backfill needed).
-- ============================================================

-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT IF EXISTS "Commission_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT IF EXISTS "Commission_commissionTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT IF EXISTS "Commission_projectId_fkey";

-- DropForeignKey
ALTER TABLE "CommissionNote" DROP CONSTRAINT IF EXISTS "CommissionNote_authorId_fkey";

-- DropForeignKey
ALTER TABLE "CommissionNote" DROP CONSTRAINT IF EXISTS "CommissionNote_commissionId_fkey";

-- DropForeignKey
ALTER TABLE "CommissionType" DROP CONSTRAINT IF EXISTS "CommissionType_tagId_fkey";

-- DropForeignKey
ALTER TABLE "CommissionTypePricing" DROP CONSTRAINT IF EXISTS "CommissionTypePricing_commissionTypeId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "CommissionType_key_key";

-- DropIndex
DROP INDEX IF EXISTS "CommissionType_tagId_key";

-- AlterTable
ALTER TABLE "Commission" DROP COLUMN IF EXISTS "addonKeys",
DROP COLUMN IF EXISTS "assignedToId",
DROP COLUMN IF EXISTS "clientEmail",
DROP COLUMN IF EXISTS "clientName",
DROP COLUMN IF EXISTS "coloringDoneAt",
DROP COLUMN IF EXISTS "commissionTypeId",
DROP COLUMN IF EXISTS "contactHandle",
DROP COLUMN IF EXISTS "deadline",
DROP COLUMN IF EXISTS "deliverableAssets",
DROP COLUMN IF EXISTS "deliveredAt",
DROP COLUMN IF EXISTS "finishedAt",
DROP COLUMN IF EXISTS "idea",
DROP COLUMN IF EXISTS "ideaConfirmedAt",
DROP COLUMN IF EXISTS "isHidden",
DROP COLUMN IF EXISTS "lineDoneAt",
DROP COLUMN IF EXISTS "optionKey",
DROP COLUMN IF EXISTS "paymentConfirmedAt",
DROP COLUMN IF EXISTS "paymentStatus",
DROP COLUMN IF EXISTS "preferredContactMethod",
DROP COLUMN IF EXISTS "projectId",
DROP COLUMN IF EXISTS "quoteCents",
DROP COLUMN IF EXISTS "referenceAssets",
DROP COLUMN IF EXISTS "sketchConfirmedAt",
ADD COLUMN IF NOT EXISTS "artistId" TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS "clientId" TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS "commissionOpeningId" TEXT,
ADD COLUMN IF NOT EXISTS "groupId" TEXT,
ADD COLUMN IF NOT EXISTS "paymentMethodId" TEXT,
ADD COLUMN IF NOT EXISTS "priority" INTEGER,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- ============================================================
-- Phase 3: add the new artist-scoping columns as NULLABLE first,
-- backfill them (and migrate data out of the tables about to be
-- dropped), then tighten to NOT NULL. Every row being backfilled
-- here is pre-existing catalog config (types/options/addons/rush
-- fee), never client-submitted data — Commission/CommissionNote
-- have 0 rows in every deployment this was verified against.
-- ============================================================

-- AlterTable
ALTER TABLE "CommissionType" ADD COLUMN IF NOT EXISTS "artistId" TEXT,
ADD COLUMN IF NOT EXISTS "basePrice" INTEGER,
ADD COLUMN IF NOT EXISTS "label" TEXT,
ALTER COLUMN "tagId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "artistId" TEXT,
ADD COLUMN IF NOT EXISTS "brief" JSONB,
ALTER COLUMN "isHidden" SET DEFAULT true;

-- Backfill: every pre-existing CommissionType/Project row belongs to
-- whichever user matches the configured admin.email — the only artist
-- that existed before this migration introduced multi-artist support.
UPDATE "CommissionType"
SET "artistId" = (
  SELECT u."id" FROM "User" u
  JOIN "SystemParameters" sp ON sp."type" = 'admin.email' AND sp."scope" = 'ALL'
  WHERE LOWER(u."email") = LOWER(sp."value")
  LIMIT 1
)
WHERE "artistId" IS NULL;

UPDATE "Project"
SET "artistId" = (
  SELECT u."id" FROM "User" u
  JOIN "SystemParameters" sp ON sp."type" = 'admin.email' AND sp."scope" = 'ALL'
  WHERE LOWER(u."email") = LOWER(sp."value")
  LIMIT 1
)
WHERE "artistId" IS NULL;

-- Backfill CommissionType.basePrice from the CommissionTypePricing row
-- it's about to lose, and .label from its key (INITCAP turns e.g.
-- HALF_BODY into "Half Body", matching the old hardcoded i18n labels).
UPDATE "CommissionType" ct
SET "basePrice" = ctp."basePriceCents"
FROM "CommissionTypePricing" ctp
WHERE ctp."commissionTypeId" = ct."id" AND ct."basePrice" IS NULL;

UPDATE "CommissionType" SET "basePrice" = 0 WHERE "basePrice" IS NULL;
UPDATE "CommissionType" SET "label" = INITCAP(REPLACE("key", '_', ' ')) WHERE "label" IS NULL;

-- On a fresh install there is no User yet (the admin account only ever
-- gets created by logging in — nothing seeds it), so any CommissionType/
-- Project row that's still unowned at this point is the hardcoded
-- placeholder data from the older commission_type_tag_refactor migration,
-- never real per-artist data (that concept didn't exist before this
-- migration). Nobody could have used it, so it's safe to drop rather than
-- fail the whole migration over data with no possible owner yet.
DELETE FROM "CommissionType" WHERE "artistId" IS NULL;
DELETE FROM "Project" WHERE "artistId" IS NULL;

ALTER TABLE "CommissionType" ALTER COLUMN "artistId" SET NOT NULL,
ALTER COLUMN "basePrice" SET NOT NULL,
ALTER COLUMN "label" SET NOT NULL;

ALTER TABLE "Project" ALTER COLUMN "artistId" SET NOT NULL;

-- Migrate CommissionOptionPricing / CommissionAddonPricing / the
-- singleton CommissionRushFeeSetting into their replacements, owned by
-- that same artist, before the old tables are dropped below.
INSERT INTO "CommissionOption" ("id", "artistId", "key", "label", "modifierPercent", "no", "active", "createdAt", "updatedAt")
SELECT
  op."id",
  (SELECT u."id" FROM "User" u JOIN "SystemParameters" sp ON sp."type" = 'admin.email' AND sp."scope" = 'ALL' WHERE LOWER(u."email") = LOWER(sp."value") LIMIT 1),
  op."key",
  INITCAP(REPLACE(op."key", '_', ' ')),
  op."modifierPercent",
  0,
  op."active",
  CURRENT_TIMESTAMP,
  op."updatedAt"
FROM "CommissionOptionPricing" op;

-- priceMode/maxPrice don't exist on CommissionAddon yet at this point in
-- migration history (added later by
-- 20260827040008_commission_addon_price_mode, whose DEFAULT
-- 'STARTING_FROM' backfills these rows automatically when that runs).
INSERT INTO "CommissionAddon" ("id", "artistId", "key", "label", "minPrice", "no", "active", "createdAt", "updatedAt")
SELECT
  ap."id",
  (SELECT u."id" FROM "User" u JOIN "SystemParameters" sp ON sp."type" = 'admin.email' AND sp."scope" = 'ALL' WHERE LOWER(u."email") = LOWER(sp."value") LIMIT 1),
  ap."key",
  INITCAP(REPLACE(ap."key", '_', ' ')),
  ap."minPriceCents",
  0,
  ap."active",
  CURRENT_TIMESTAMP,
  ap."updatedAt"
FROM "CommissionAddonPricing" ap;

INSERT INTO "UserSetting" ("id", "userId", "type", "scope", "value", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  (SELECT u."id" FROM "User" u JOIN "SystemParameters" sp ON sp."type" = 'admin.email' AND sp."scope" = 'ALL' WHERE LOWER(u."email") = LOWER(sp."value") LIMIT 1),
  'art.commission.rushfee',
  'ART',
  json_build_object('thresholdDays', rf."thresholdDays", 'feeAmount', rf."feeCents")::text,
  CURRENT_TIMESTAMP,
  rf."updatedAt"
FROM "CommissionRushFeeSetting" rf;

-- ============================================================
-- Phase 4: now safe to drop what's been fully migrated.
-- ============================================================

-- DropTable
DROP TABLE IF EXISTS "CommissionAddonPricing";

-- DropTable
DROP TABLE IF EXISTS "CommissionNote";

-- DropTable
DROP TABLE IF EXISTS "CommissionOptionPricing";

-- DropTable
DROP TABLE IF EXISTS "CommissionRushFeeSetting";

-- DropTable
DROP TABLE IF EXISTS "CommissionTypePricing";

-- DropEnum
DROP TYPE IF EXISTS "CommissionNoteVisibility";

-- ============================================================
-- Phase 5: indexes and foreign keys, unchanged from the original
-- generated migration.
-- ============================================================

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Role_key_key" ON "Role"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CommissionOption_artistId_key_key" ON "CommissionOption"("artistId", "key");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CommissionAddon_artistId_key_key" ON "CommissionAddon"("artistId", "key");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CommissionGroup_accessCode_key" ON "CommissionGroup"("accessCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CommissionGroup_artistId_idx" ON "CommissionGroup"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CommissionGroupMember_groupId_clientId_key" ON "CommissionGroupMember"("groupId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Client_userId_key" ON "Client"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentMethod_key_key" ON "PaymentMethod"("key");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CommissionDetail_commissionId_key" ON "CommissionDetail"("commissionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CommissionProgress_commissionId_createdAt_idx" ON "CommissionProgress"("commissionId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Comment_projectId_createdAt_idx" ON "Comment"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Comment_groupId_createdAt_idx" ON "Comment"("groupId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Comment_commissionId_createdAt_idx" ON "Comment"("commissionId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Comment_progressId_createdAt_idx" ON "Comment"("progressId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CommissionOpening_artistId_status_idx" ON "CommissionOpening"("artistId", "status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CommissionFollower_unsubscribeToken_key" ON "CommissionFollower"("unsubscribeToken");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CommissionFollower_artistId_email_key" ON "CommissionFollower"("artistId", "email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Commission_artistId_status_idx" ON "Commission"("artistId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Commission_clientId_idx" ON "Commission"("clientId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Commission_groupId_idx" ON "Commission"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CommissionType_artistId_key_key" ON "CommissionType"("artistId", "key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Project_artistId_idx" ON "Project"("artistId");

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
