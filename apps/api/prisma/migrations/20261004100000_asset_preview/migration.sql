ALTER TABLE "Asset" ADD COLUMN "previewKey" TEXT,
ADD COLUMN "previewUrl" TEXT;

INSERT INTO "ProcessQueue" ("id", "type", "refId", "attempts", "nextAttemptAt", "createdAt", "updatedAt")
SELECT
  md5(random()::text || a."id"),
  'ASSET_THUMBNAIL',
  a."id",
  0,
  now(),
  now(),
  now()
FROM "Asset" a
WHERE a."thumbnailStatus" = 'READY'
ON CONFLICT ("type", "refId") DO NOTHING;
