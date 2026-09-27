-- AlterTable
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "profileId" TEXT;

-- AlterTable
ALTER TABLE "CommissionDetail" ADD COLUMN IF NOT EXISTS "contactPlatform" TEXT,
ADD COLUMN IF NOT EXISTS "contactValue" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Client_profileId_idx" ON "Client"("profileId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Client_profileId_fkey') THEN
    ALTER TABLE "Client" ADD CONSTRAINT "Client_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Backfill: clients already linked to an account use that account's profile
UPDATE "Client" c
SET "profileId" = p."id"
FROM "Profile" p
WHERE c."profileId" IS NULL
  AND c."userId" IS NOT NULL
  AND p."userId" = c."userId";

-- Backfill: snapshot the contact existing commissions were placed with
UPDATE "CommissionDetail" d
SET "contactPlatform" = CASE c."preferredContactMethod"
      WHEN 'EMAIL' THEN 'email'
      WHEN 'DISCORD' THEN 'Discord'
      WHEN 'TELEGRAM' THEN 'Telegram'
      WHEN 'TWITTER' THEN 'X (Twitter)'
      ELSE 'Other'
    END,
    "contactValue" = CASE c."preferredContactMethod"
      WHEN 'EMAIL' THEN c."email"
      ELSE c."contactHandle"
    END
FROM "Commission" m
JOIN "Client" c ON c."id" = m."clientId"
WHERE d."commissionId" = m."id"
  AND d."contactPlatform" IS NULL;
