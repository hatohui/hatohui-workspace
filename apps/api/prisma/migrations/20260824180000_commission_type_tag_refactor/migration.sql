-- Converts CommissionType from a fixed enum into an admin-manageable table,
-- introduces a real Tag model (1:1 with CommissionType, m2m with Asset,
-- replacing the free-text Asset.tags array), drops Commission.title, and
-- renames/converts Commission.description into a required rich-text
-- Commission.idea (Tiptap/ProseMirror JSON document).
--
-- The new `CommissionType` table shares its name with the old enum type, so
-- every column typed with that enum must be moved off it (captured as text)
-- and the enum itself dropped before the table can be created.

-- ============================================================
-- 1. Capture old enum values as text, then drop the enum
-- ============================================================

ALTER TABLE "CommissionTypePricing" ADD COLUMN "type_old" TEXT;
UPDATE "CommissionTypePricing" SET "type_old" = "type"::text;
DROP INDEX "CommissionTypePricing_type_key";
ALTER TABLE "CommissionTypePricing" DROP COLUMN "type";

ALTER TABLE "Commission" ADD COLUMN "commissionType_old" TEXT;
UPDATE "Commission" SET "commissionType_old" = "commissionType"::text;
ALTER TABLE "Commission" DROP COLUMN "commissionType";

DROP TYPE "CommissionType";

-- ============================================================
-- 2. New tables: Tag, CommissionType, and the Asset<->Tag join
-- ============================================================

CREATE TABLE "Tag" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

CREATE TABLE "CommissionType" (
    "id"        TEXT NOT NULL,
    "key"       TEXT NOT NULL,
    "no"        INTEGER NOT NULL DEFAULT 0,
    "active"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tagId"     TEXT NOT NULL,

    CONSTRAINT "CommissionType_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommissionType_key_key" ON "CommissionType"("key");
CREATE UNIQUE INDEX "CommissionType_tagId_key" ON "CommissionType"("tagId");

ALTER TABLE "CommissionType"
  ADD CONSTRAINT "CommissionType_tagId_fkey"
  FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "_AssetToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AssetToTag_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE INDEX "_AssetToTag_B_index" ON "_AssetToTag"("B");

ALTER TABLE "_AssetToTag"
  ADD CONSTRAINT "_AssetToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "_AssetToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- 3. Seed the 4 former enum values as Tag + CommissionType rows
-- ============================================================

INSERT INTO "Tag" (id, name, "createdAt", "updatedAt") VALUES
  ('tag_icon', 'icon', now(), now()),
  ('tag_half_body', 'half_body', now(), now()),
  ('tag_full_body', 'full_body', now(), now()),
  ('tag_sketch_page', 'sketch_page', now(), now());

INSERT INTO "CommissionType" (id, key, "no", active, "createdAt", "updatedAt", "tagId") VALUES
  ('ctype_icon', 'ICON', 0, true, now(), now(), 'tag_icon'),
  ('ctype_half_body', 'HALF_BODY', 1, true, now(), now(), 'tag_half_body'),
  ('ctype_full_body', 'FULL_BODY', 2, true, now(), now(), 'tag_full_body'),
  ('ctype_sketch_page', 'SKETCH_PAGE', 3, true, now(), now(), 'tag_sketch_page');

-- ============================================================
-- 4. Migrate Asset.tags (String[]) into Tag rows + join rows
-- ============================================================

INSERT INTO "Tag" (id, name, "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, t, now(), now()
FROM (SELECT DISTINCT unnest("tags") AS t FROM "Asset") s
WHERE t IS NOT NULL AND length(trim(t)) > 0
ON CONFLICT (name) DO NOTHING;

INSERT INTO "_AssetToTag" ("A", "B")
SELECT DISTINCT a.id, tag.id
FROM "Asset" a
CROSS JOIN LATERAL unnest(a."tags") AS t(tag_name)
JOIN "Tag" tag ON tag.name = t.tag_name
WHERE t.tag_name IS NOT NULL AND length(trim(t.tag_name)) > 0;

ALTER TABLE "Asset" DROP COLUMN "tags";

-- ============================================================
-- 5. CommissionTypePricing: old `type_old` text -> `commissionTypeId` FK
-- ============================================================

ALTER TABLE "CommissionTypePricing" ADD COLUMN "commissionTypeId" TEXT;

UPDATE "CommissionTypePricing" p
SET "commissionTypeId" = ct.id
FROM "CommissionType" ct
WHERE ct.key = p."type_old";

ALTER TABLE "CommissionTypePricing" ALTER COLUMN "commissionTypeId" SET NOT NULL;
ALTER TABLE "CommissionTypePricing" DROP COLUMN "type_old";

CREATE UNIQUE INDEX "CommissionTypePricing_commissionTypeId_key" ON "CommissionTypePricing"("commissionTypeId");

ALTER TABLE "CommissionTypePricing"
  ADD CONSTRAINT "CommissionTypePricing_commissionTypeId_fkey"
  FOREIGN KEY ("commissionTypeId") REFERENCES "CommissionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- 6. Commission: old `commissionType_old` text -> FK, drop title,
--    `description` (text) -> `idea` (rich-text JSON)
-- ============================================================

ALTER TABLE "Commission" ADD COLUMN "commissionTypeId" TEXT;
ALTER TABLE "Commission" ADD COLUMN "idea" JSONB;

UPDATE "Commission" c
SET "commissionTypeId" = ct.id
FROM "CommissionType" ct
WHERE c."commissionType_old" IS NOT NULL AND ct.key = c."commissionType_old";

UPDATE "Commission"
SET "idea" = CASE
  WHEN "description" IS NULL OR length(trim("description")) = 0
    THEN jsonb_build_object(
      'type', 'doc',
      'content', jsonb_build_array(jsonb_build_object('type', 'paragraph'))
    )
  ELSE jsonb_build_object(
      'type', 'doc',
      'content', jsonb_build_array(jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "description"))
      ))
    )
END;

ALTER TABLE "Commission" ALTER COLUMN "idea" SET NOT NULL;

ALTER TABLE "Commission"
  ADD CONSTRAINT "Commission_commissionTypeId_fkey"
  FOREIGN KEY ("commissionTypeId") REFERENCES "CommissionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Commission" DROP COLUMN "commissionType_old";
ALTER TABLE "Commission" DROP COLUMN "description";
ALTER TABLE "Commission" DROP COLUMN "title";
