-- Makes the Asset<->Tag many-to-many explicit: Prisma's implicit
-- `_AssetToTag` join table is replaced with a real `AssetTag` model that
-- shows up in schema.prisma. Existing rows are migrated across before the
-- old table is dropped, not just discarded — this table can hold real data
-- (every tag on every uploaded asset) even though local dev's copy is empty.

-- CreateTable
CREATE TABLE IF NOT EXISTS "AssetTag" (
    "assetId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetTag_pkey" PRIMARY KEY ("assetId", "tagId")
);

-- Backfill from the implicit join table, if it still exists (a fresh
-- install that ran this migration's CREATE TABLE already won't have it).
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_AssetToTag') THEN
    INSERT INTO "AssetTag" ("assetId", "tagId")
    SELECT "A", "B" FROM "_AssetToTag"
    ON CONFLICT ("assetId", "tagId") DO NOTHING;
  END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AssetTag_tagId_idx" ON "AssetTag"("tagId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "AssetTag" ADD CONSTRAINT "AssetTag_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AssetTag" ADD CONSTRAINT "AssetTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- DropTable (drops its FKs along with it automatically)
DROP TABLE IF EXISTS "_AssetToTag";
