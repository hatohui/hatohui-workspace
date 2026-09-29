INSERT INTO "ProcessQueue" ("id", "type", "refId", "attempts", "nextAttemptAt", "createdAt", "updatedAt")
SELECT md5(random()::text || c."id"), 'COMMISSION_PURGE', c."id", 0, now(), now(), now()
FROM "Commission" c
WHERE c."status" = 'COMPLETED' AND c."purgedAt" IS NULL
ON CONFLICT ("type", "refId") DO NOTHING;
