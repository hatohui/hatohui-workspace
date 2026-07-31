-- CreateEnum
CREATE TYPE "AppScope" AS ENUM ('ALL', 'WORKSHOP', 'ART', 'FRIENDS', 'WWW', 'TRAVEL');

-- AlterTable: add new columns nullable first so existing rows aren't rejected
ALTER TABLE "AppConfig"
  ADD COLUMN "type" TEXT,
  ADD COLUMN "scope" "AppScope",
  ADD COLUMN "value" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Backfill existing row(s) from the old adminEmail column
UPDATE "AppConfig"
SET
  "type" = 'admin.email',
  "scope" = 'ALL',
  "value" = "adminEmail",
  "updatedAt" = NOW()
WHERE "adminEmail" IS NOT NULL;

-- Drop the old column now that it's been migrated
ALTER TABLE "AppConfig" DROP COLUMN "adminEmail";

-- Enforce NOT NULL now that existing rows are backfilled
ALTER TABLE "AppConfig"
  ALTER COLUMN "type" SET NOT NULL,
  ALTER COLUMN "scope" SET NOT NULL,
  ALTER COLUMN "value" SET NOT NULL,
  ALTER COLUMN "updatedAt" SET NOT NULL;

-- id no longer has a static default; the app generates a cuid() at insert time
ALTER TABLE "AppConfig" ALTER COLUMN "id" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "AppConfig_type_scope_key" ON "AppConfig"("type", "scope");
