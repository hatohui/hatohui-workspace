INSERT INTO "ProcessQueue" ("id", "type", "refId", "attempts", "nextAttemptAt", "createdAt", "updatedAt")
SELECT
  md5(random()::text || c."id"),
  'COMMISSION_PURGE',
  c."id",
  0,
  GREATEST(
    COALESCE(
      (SELECT max(h."createdAt") FROM "CommissionStatusHistory" h
       WHERE h."commissionId" = c."id" AND h."toStatus" = 'COMPLETED'),
      c."updatedAt"
    ) + interval '30 days',
    now()
  ),
  now(),
  now()
FROM "Commission" c
WHERE c."status" = 'COMPLETED' AND c."purgedAt" IS NULL
ON CONFLICT ("type", "refId") DO NOTHING;
